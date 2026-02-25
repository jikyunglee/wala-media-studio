import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    PROJECT_ID: str = "wala-media-studio-7890" # 실제 GCP 프로젝트 ID 또는 번호
    LOCATION: str = "us-central1"
    GCS_BUCKET_NAME: str = "wala-media-assets-7890" # 실제 GCS 버킷 이름으로 변경 필요
    
    # Vertex AI 모델
    GEMINI_MODEL_NAME: str = "gemini-1.5-flash-002"
    VEO_MODEL_NAME: str = "veo-large" # 실제 Veo 모델 이름으로 변경 필요

settings = Settings()
