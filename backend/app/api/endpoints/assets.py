import os
from typing import List
from fastapi import APIRouter, File, UploadFile, HTTPException
from google.cloud import storage

from app.core.config import settings # 설정 파일 임포트

router = APIRouter()

# --- GCS 설정 ---
# config.py에서 설정 가져오기
GCS_BUCKET_NAME = settings.GCS_BUCKET_NAME

storage_client = storage.Client(project=settings.PROJECT_ID) # project 인자 명시
gcs_bucket = storage_client.bucket(GCS_BUCKET_NAME)

@router.get("/")
async def list_assets():
    """
    GCS 버킷에 저장된 에셋 목록을 반환합니다.
    """
    try:
        # GCS 버킷 이름도 settings에서 가져옵니다.
        blobs = storage_client.list_blobs(settings.GCS_BUCKET_NAME, prefix="assets/")
        assets = []
        for blob in blobs:
            if blob.name.endswith('/'): # 폴더는 건너뜀
                continue
            assets.append({
                "id": blob.name,
                "name": os.path.basename(blob.name),
                "url": blob.public_url, # 공개 URL
                "gcs_uri": f"gs://{settings.GCS_BUCKET_NAME}/{blob.name}",
                "size": blob.size,
                "type": blob.name.split('.')[-1]
            })
        return assets
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GCS 에셋 목록 조회 중 오류 발생: {e}")

@router.post("/upload")
async def upload_asset(file: UploadFile = File(...)):
    """
    새로운 에셋(이미지, 영상 등)을 GCS에 업로드합니다.
    """
    try:
        # 파일 이름을 GCS 경로에 맞게 조정 (예: assets/image.png)
        gcs_filepath = f"assets/{file.filename}"
        blob = gcs_bucket.blob(gcs_filepath)

        # 파일 스트림을 GCS에 직접 업로드
        contents = await file.read()
        blob.upload_from_string(contents, content_type=file.content_type)
        
        # 파일 공개 (선택 사항이며, 버킷 권한 설정에 따라 달라질 수 있음)
        blob.make_public() # 기본적으로 공개 처리하여 프론트엔드에서 바로 접근 가능하게 함

        return {
            "status": "success",
            "message": f"'{file.filename}' 에셋이 GCS에 업로드되었습니다.",
            "filename": file.filename,
            "gcs_uri": f"gs://{settings.GCS_BUCKET_NAME}/{gcs_filepath}",
            "public_url": blob.public_url
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"에셋 GCS 업로드 중 오류 발생: {e}")
