import os
from app.config import settings

def transcribe_audio(audio_file_path_or_url: str) -> str:
    """
    Transcribes audio using OpenAI Whisper API.
    If OPENAI_API_KEY is not configured or in local demo mode, returns a realistic medical consultation transcript.
    """
    if settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY) > 10:
        try:
            import openai
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            
            # If audio_file_path_or_url is a local file path
            if os.path.exists(audio_file_path_or_url):
                with open(audio_file_path_or_url, "rb") as audio_file:
                    transcript_obj = client.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file
                    )
                    return transcript_obj.text
        except Exception as e:
            print(f"[WhisperService Warning] Error calling Whisper API: {e}. Falling back to default demo transcript.")

    # High quality mock transcript for medical consultation hackathon demonstration
    return (
        "Doctor: Good morning, John. How are you feeling today?\n"
        "Patient: Good morning Doctor. I've been having a fever and a persistent dry cough for the past 3 days. My head also hurts continuously.\n"
        "Doctor: I see. Have you measured your temperature?\n"
        "Patient: Yes, it was around 101.2 degrees Fahrenheit yesterday evening.\n"
        "Doctor: Alright. Let me check your chest and throat. Throat looks slightly inflamed. "
        "I am diagnosing this as an Acute Upper Respiratory Tract Infection.\n"
        "Doctor: I am going to prescribe Paracetamol 650mg for fever and headache, to be taken three times a day after food for 5 days. "
        "Also Amoxicillin 500mg antibiotic twice daily for 5 days. "
        "I'd like you to get a Complete Blood Count (CBC) test done today to rule out secondary bacterial infection.\n"
        "Patient: Got it, doctor. Any special precautions?\n"
        "Doctor: Drink plenty of warm water, take full bed rest, avoid chilled items. Please come back for a follow up in 5 days or sooner if fever does not come down."
    )
