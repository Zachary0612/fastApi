"""
TTS 语音合成服务：将文字转换为语音文件
使用 gTTS (Google Text-to-Speech) 生成中文语音
"""
import os
import hashlib
from gtts import gTTS
from app.config import AUDIO_DIR


def text_to_speech(text: str) -> str:
    """
    将文本转换为语音文件，返回文件名
    使用文本 hash 做缓存，避免重复生成
    """
    text_hash = hashlib.md5(text.encode('utf-8')).hexdigest()
    filename = f"{text_hash}.mp3"
    filepath = os.path.join(AUDIO_DIR, filename)

    if os.path.exists(filepath):
        return filename

    tts = gTTS(text=text, lang='zh-cn', slow=False)
    tts.save(filepath)

    return filename


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
