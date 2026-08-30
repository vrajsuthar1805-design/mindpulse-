import os
import uuid
from app.config import settings

def get_firebase_audio_url(file_name: str) -> str:
    """
    Returns Firebase Storage URL format for given audio filename.
    """
    bucket = settings.FIREBASE_STORAGE_BUCKET or "healthcare-ai.appspot.com"
    return f"https://firebasestorage.googleapis.com/v0/b/{bucket}/o/consultations%2F{file_name}?alt=media"

def save_uploaded_audio_file(file_bytes: bytes, original_filename: str) -> tuple[str, str]:
    """
    Saves audio file locally or uploads to Firebase Storage.
    Returns (local_file_path, firebase_url)
    """
    ext = os.path.splitext(original_filename)[1] or ".wav"
    unique_name = f"{uuid.uuid4()}{ext}"
    
    upload_dir = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, unique_name)
    with open(file_path, "wb") as f:
        f.write(file_bytes)

    firebase_url = get_firebase_audio_url(unique_name)
    return file_path, firebase_url
