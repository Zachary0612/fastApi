"""
TTS 语音合成服务：将文字转换为语音文件
优先使用 pyttsx3 离线合成，gTTS 作为备选（需联网访问 Google）
"""
import os
import logging
import hashlib
from app.config import AUDIO_DIR

logger = logging.getLogger(__name__)


def _tts_pyttsx3(text: str, filepath: str) -> bool:
    """离线 TTS（pyttsx3），成功返回 True"""
    try:
        import pyttsx3
        engine = pyttsx3.init()
        engine.setProperty('rate', 150)
        engine.setProperty('volume', 1.0)
        for voice in engine.getProperty('voices'):
            if 'chinese' in voice.name.lower() or 'zh' in voice.id.lower():
                engine.setProperty('voice', voice.id)
                break
        engine.save_to_file(text, filepath)
        engine.runAndWait()
        if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
            return True
    except Exception as e:
        logger.warning(f"pyttsx3 合成失败: {e}")
    return False


def _tts_gtts(text: str, filepath: str) -> bool:
    """在线 TTS（gTTS），成功返回 True"""
    try:
        from gtts import gTTS
        tts = gTTS(text=text, lang='zh-cn', slow=False)
        tts.save(filepath)
        if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
            return True
    except Exception as e:
        logger.warning(f"gTTS 合成失败（可能无法连接 Google）: {e}")
    return False


def text_to_speech(text: str) -> str:
    """
    将文本转换为语音文件，返回文件名
    使用文本 hash 做缓存，避免重复生成
    优先 pyttsx3（离线），失败则 gTTS（在线）
    """
    text_hash = hashlib.md5(text.encode('utf-8')).hexdigest()
    filename = f"{text_hash}.mp3"
    filepath = os.path.join(AUDIO_DIR, filename)

    if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
        return filename

    if _tts_pyttsx3(text, filepath):
        logger.info(f"pyttsx3 合成成功: {filename}")
        return filename

    if _tts_gtts(text, filepath):
        logger.info(f"gTTS 合成成功: {filename}")
        return filename

    raise RuntimeError(f"语音合成失败，pyttsx3 和 gTTS 均不可用")


def generate_drug_audio(drug_name: str, efficacy_simple: str = None,
                        usage_simple: str = None, caution_simple: str = None) -> str:
    """生成药品完整语音说明"""
    parts = [f"药品名称：{drug_name}。"]

    if efficacy_simple:
        parts.append(efficacy_simple)
    if usage_simple:
        parts.append(f"用法：{usage_simple}")
    if caution_simple:
        parts.append(caution_simple)

    full_text = " ".join(parts)
    return text_to_speech(full_text)


def generate_reminder_audio(drug_name: str, dosage: str, meal_relation: str = None) -> str:
    """生成提醒语音"""
    meal_text = ""
    if meal_relation == "before_meal":
        meal_text = "饭前"
    elif meal_relation == "after_meal":
        meal_text = "饭后"
    elif meal_relation == "empty_stomach":
        meal_text = "空腹"
    elif meal_relation == "before_sleep":
        meal_text = "睡前"

    text = f"吃药提醒：请{meal_text}服用{drug_name}，{dosage}。"
    return text_to_speech(text)
