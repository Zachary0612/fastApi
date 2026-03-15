import os
import cv2
import numpy as np
from PIL import Image
import io
import re
from typing import Optional
from pathlib import Path

# Lazy-load OCR engines to avoid slow startup
_easyocr_reader = None
_rapidocr_reader = None

# EasyOCR 模型目录
MODEL_DIR = Path.home() / ".EasyOCR" / "model"
REQUIRED_MODELS = ["craft_mlt_25k.pth", "chinese_sim_g2.pth"]

# 药品名称识别辅助词
NAME_SUFFIXES = ["片", "胶囊", "颗粒", "口服液", "滴眼液", "注射液", "软膏", "丸", "膏", "栓", "散", "冲剂", "糖浆", "胶丸", "口服溶液"]
NAME_FORBIDDEN = ["国药准字", "请仔细", "OTC", "有限公司", "使用", "指导", "福建", "用于"]
ENGLISH_SUFFIXES = ["TABLET", "TABLETS", "CAPSULE", "CAPSULES", "GRANULES", "SYRUP", "IBUPROFEN"]
CHINESE_REGEX = re.compile(r"[\u4e00-\u9fff]")


def check_ocr_models() -> list:
    """检查 EasyOCR 模型是否已下载，返回缺失的模型列表"""
    missing = []
    for m in REQUIRED_MODELS:
        if not (MODEL_DIR / m).exists():
            missing.append(m)
    return missing


def get_easyocr_reader():
    global _easyocr_reader
    if _easyocr_reader is None:
        missing = check_ocr_models()
        if missing:
            model_dir_str = str(MODEL_DIR)
            raise RuntimeError(
                f"OCR 模型文件未就绪，缺少: {', '.join(missing)}。"
                f"请手动下载模型到 {model_dir_str} 目录。"
                f"下载地址: craft_mlt_25k.pth → https://github.com/JaidedAI/EasyOCR/releases/download/v1.3/craft_mlt_25k.zip , "
                f"chinese_sim_g2.pth → https://github.com/JaidedAI/EasyOCR/releases/download/v1.4/chinese_sim_g2.zip "
                f"（下载 zip 解压后放入上述目录）"
            )
        import easyocr
        _easyocr_reader = easyocr.Reader(['ch_sim', 'en'], gpu=False)
    return _easyocr_reader


def get_rapidocr_reader():
    global _rapidocr_reader
    if _rapidocr_reader is None:
        try:
            from rapidocr_onnxruntime import RapidOCR
        except Exception:
            _rapidocr_reader = None
        else:
            _rapidocr_reader = RapidOCR()
    return _rapidocr_reader


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """图像预处理：去噪、增强、二值化"""
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("无法解析上传的图片")

    # 转灰度
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 高斯去噪
    denoised = cv2.GaussianBlur(gray, (3, 3), 0)

    # CLAHE 自适应直方图均衡化增强对比度
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(denoised)

    # 自适应二值化
    binary = cv2.adaptiveThreshold(
        enhanced, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )

    return binary


def perform_ocr(image_bytes: bytes) -> str:
    """执行 OCR 识别，返回识别的原始文本"""
    nparr = np.frombuffer(image_bytes, np.uint8)
    original = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if original is None:
        raise ValueError("无法解析上传的图片")

    processed = preprocess_image(image_bytes)
    processed_bgr = cv2.cvtColor(processed, cv2.COLOR_GRAY2BGR)

    collected = []

    def add_result(text: str, conf: float, bbox=None):
        text = (text or "").strip()
        if not text:
            return
        if conf is None:
            conf = 0.0
        y_center = 0.0
        if bbox is not None:
            try:
                points = bbox.tolist() if hasattr(bbox, "tolist") else bbox
                if isinstance(points, (list, tuple)) and len(points) > 0:
                    y_center = sum(p[1] for p in points) / len(points)
            except Exception:
                pass
        collected.append({"text": text, "conf": float(conf), "y": y_center})

    # EasyOCR 原图 + 预处理图
    try:
        easy_reader = get_easyocr_reader()
    except RuntimeError:
        easy_reader = None

    def run_easy(img: np.ndarray):
        if easy_reader is None:
            return
        try:
            ocr_results = easy_reader.readtext(img, detail=1, paragraph=False)
        except Exception:
            return
        for bbox, text, conf in ocr_results:
            if conf is None or conf < 0.15:
                continue
            add_result(text, conf, bbox)

    run_easy(original)
    run_easy(processed_bgr)

    # RapidOCR （如可用）
    rapid_reader = get_rapidocr_reader()
    if rapid_reader is not None:
        try:
            rapid_results, _ = rapid_reader(original)
        except Exception:
            rapid_results = None
        if rapid_results:
            for item in rapid_results:
                if not isinstance(item, (list, tuple)) or len(item) < 3:
                    continue
                box, text, score = item[0], item[1], item[2]
                add_result(text, score, box)

    if not collected:
        return ""

    # 按 y 坐标排序，再按置信度
    collected.sort(key=lambda r: (r["y"], -r["conf"]))

    seen = set()
    merged_lines = []
    for item in collected:
        normalized = re.sub(r"\s+", "", item["text"])
        if not normalized:
            continue
        if normalized in seen:
            continue
        seen.add(normalized)
        merged_lines.append(item["text"])

    return "\n".join(merged_lines)


def extract_drug_info(raw_text: str) -> dict:
    """从 OCR 原始文本中提取药品结构化信息"""
    info = {
        "drug_name": None,
        "specification": None,
        "efficacy": None,
        "usage_dosage": None,
        "frequency": None,
        "caution": None,
    }

    text = raw_text.replace(" ", "")
    lines = [l.strip() for l in raw_text.split("\n") if l.strip()]

    # 药品名称提取
    name_patterns = [
        r"(?:通用名称|药品名称|品名)[：:]\s*(.+?)(?:\n|$)",
        r"(?:商品名称|商品名)[：:]\s*(.+?)(?:\n|$)",
    ]
    for p in name_patterns:
        m = re.search(p, text)
        if m:
            info["drug_name"] = m.group(1).strip()
            break

    # 如果没匹配到，取第一行非空文本作为药名
    if not info["drug_name"] and lines:
        def clean_line(line: str) -> str:
            return re.sub(r"[：:，,。.·\-_/\\|]", "", line).strip()

        # 先寻找包含常见剂型后缀的中文
        for line in lines:
            normalized = clean_line(line)
            if not normalized or any(f in normalized for f in NAME_FORBIDDEN):
                continue
            if any(suffix in normalized for suffix in NAME_SUFFIXES) and 2 <= len(normalized) <= 20:
                info["drug_name"] = normalized
                break

        # 再尝试英文药名
        if not info["drug_name"]:
            for line in lines:
                upper_line = line.upper().strip()
                if any(word in upper_line for word in ENGLISH_SUFFIXES) and len(upper_line) <= 30:
                    info["drug_name"] = upper_line.title()
                    break

        # 最后退回原来的粗略策略
        if not info["drug_name"]:
            for line in lines[:5]:
                normalized = clean_line(line)
                if 2 <= len(normalized) <= 30 and not any(k in normalized for k in ["说明", "批准", "生产", "有效", "国药准字"]):
                    info["drug_name"] = normalized
                    break

    # 规格
    spec_patterns = [
        r"(?:规格|规　格)[：:]\s*(.+?)(?:\n|$)",
        r"(\d+(?:\.\d+)?(?:mg|g|ml|片|粒|袋|支)(?:/(?:片|粒|袋|支|瓶))?)",
    ]
    for p in spec_patterns:
        m = re.search(p, text)
        if m:
            info["specification"] = m.group(1).strip()
            break

    # 功效 / 适应症
    efficacy_patterns = [
        r"(?:功能主治|适应症|功效)[：:]\s*(.+?)(?:(?:用法|用量|注意|不良|禁忌|规格|贮藏|包装|批准)|$)",
        r"(?:作用类别|功能与主治)[：:]\s*(.+?)(?:(?:用法|用量|注意|不良|禁忌)|$)",
    ]
    for p in efficacy_patterns:
        m = re.search(p, text, re.DOTALL)
        if m:
            info["efficacy"] = m.group(1).strip().replace("\n", "")
            break

    # 用法用量
    usage_patterns = [
        r"(?:用法用量|用法与用量|用法和用量)[：:]\s*(.+?)(?:(?:注意|不良|禁忌|贮藏|包装|有效|批准|功能|适应)|$)",
        r"(?:用法)[：:]\s*(.+?)(?:\n|$)",
    ]
    for p in usage_patterns:
        m = re.search(p, text, re.DOTALL)
        if m:
            usage_text = m.group(1).strip().replace("\n", "")
            info["usage_dosage"] = usage_text
            break

    # 频率提取
    freq_patterns = [
        r"(?:一日|每日|每天)\s*(\d+)\s*次",
        r"(\d+)\s*次\s*/\s*(?:日|天)",
        r"(?:每|一)\s*(\d+)\s*小时",
    ]
    for p in freq_patterns:
        m = re.search(p, text)
        if m:
            info["frequency"] = m.group(0)
            break

    # 注意事项
    caution_patterns = [
        r"(?:注意事项|禁忌)[：:]\s*(.+?)(?:(?:贮藏|包装|有效|批准|生产)|$)",
        r"(?:不良反应)[：:]\s*(.+?)(?:(?:注意|禁忌|贮藏|包装)|$)",
    ]
    for p in caution_patterns:
        m = re.search(p, text, re.DOTALL)
        if m:
            info["caution"] = m.group(1).strip().replace("\n", "")
            break

    return info
