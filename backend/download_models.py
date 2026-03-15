"""
EasyOCR 模型下载脚本
使用 GitHub 镜像解决国内下载慢的问题
"""
import os
import zipfile
import urllib.request
from pathlib import Path

MODEL_DIR = Path.home() / ".EasyOCR" / "model"

MODELS = [
    {
        "name": "craft_mlt_25k.pth",
        "urls": [
            "https://ghfast.top/https://github.com/JaidedAI/EasyOCR/releases/download/v1.3/craft_mlt_25k.zip",
            "https://mirror.ghproxy.com/https://github.com/JaidedAI/EasyOCR/releases/download/v1.3/craft_mlt_25k.zip",
            "https://github.com/JaidedAI/EasyOCR/releases/download/v1.3/craft_mlt_25k.zip",
        ],
    },
    {
        "name": "chinese_sim_g2.pth",
        "urls": [
            "https://hf-mirror.com/datasets/mrzhu/EasyOCR-Chinese/resolve/main/chinese_sim_G2.zip",
            "https://download.fastgit.org/JaidedAI/EasyOCR/releases/download/v1.4/chinese_sim_g2.zip",
            "https://ghfast.top/https://github.com/JaidedAI/EasyOCR/releases/download/v1.4/chinese_sim_g2.zip",
            "https://mirror.ghproxy.com/https://github.com/JaidedAI/EasyOCR/releases/download/v1.4/chinese_sim_g2.zip",
            "https://github.com/JaidedAI/EasyOCR/releases/download/v1.4/chinese_sim_g2.zip",
            "https://ghfast.top/https://github.com/JaidedAI/EasyOCR/releases/download/v1.3/chinese_sim_g2.zip",
            "https://mirror.ghproxy.com/https://github.com/JaidedAI/EasyOCR/releases/download/v1.3/chinese_sim_g2.zip",
            "https://github.com/JaidedAI/EasyOCR/releases/download/v1.3/chinese_sim_g2.zip",
        ],
    },
]


def download_file(url, dest, desc=""):
    print(f"  下载: {url}")
    try:
        def progress(count, block_size, total_size):
            pct = count * block_size * 100 // total_size if total_size > 0 else 0
            print(f"\r  进度: {min(pct, 100)}%", end="", flush=True)

        urllib.request.urlretrieve(url, dest, reporthook=progress)
        print()
        return True
    except Exception as e:
        print(f"\n  失败: {e}")
        if os.path.exists(dest):
            os.remove(dest)
        return False


def main():
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    print(f"模型目录: {MODEL_DIR}\n")

    for model in MODELS:
        pth_path = MODEL_DIR / model["name"]
        if pth_path.exists():
            print(f"✓ {model['name']} 已存在，跳过")
            continue

        print(f"▶ 下载 {model['name']} ...")
        zip_path = MODEL_DIR / (model["name"] + ".zip")

        downloaded = False
        for url in model["urls"]:
            if download_file(url, str(zip_path), model["name"]):
                downloaded = True
                break

        if not downloaded:
            print(f"✗ {model['name']} 所有下载源均失败!")
            print(f"  请手动下载并放到: {MODEL_DIR}")
            continue

        # 解压
        print(f"  解压中...")
        try:
            with zipfile.ZipFile(str(zip_path), 'r') as zf:
                zf.extractall(str(MODEL_DIR))
            os.remove(str(zip_path))
            print(f"✓ {model['name']} 下载完成!")
        except Exception as e:
            print(f"✗ 解压失败: {e}")
            if os.path.exists(str(zip_path)):
                os.remove(str(zip_path))

    print("\n检查模型:")
    all_ok = True
    for model in MODELS:
        exists = (MODEL_DIR / model["name"]).exists()
        status = "✓" if exists else "✗ 缺失"
        print(f"  {status} {model['name']}")
        if not exists:
            all_ok = False

    if all_ok:
        print("\n全部模型就绪! 可以正常使用 OCR 识别功能了。")
    else:
        print("\n部分模型缺失，请手动下载。")


if __name__ == "__main__":
    main()
