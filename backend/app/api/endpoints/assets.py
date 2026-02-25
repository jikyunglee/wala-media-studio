import os
import shutil
from typing import List
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import FileResponse

from app.core.config import settings

router = APIRouter()

# --- 로컬 저장소 설정 (GCS 테스트용 임시 대체) ---
UPLOAD_DIR = "uploads/assets"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/")
async def list_assets():
    """
    로컬 폴더에 저장된 에셋 목록을 반환합니다.
    """
    try:
        assets = []
        if os.path.exists(UPLOAD_DIR):
            for filename in os.listdir(UPLOAD_DIR):
                filepath = os.path.join(UPLOAD_DIR, filename)
                if os.path.isfile(filepath):
                    assets.append({
                        "id": filename,
                        "name": filename,
                        "url": f"http://localhost:8002/assets/download/{filename}", # 로컬 다운로드 URL
                        "gcs_uri": f"local://{filename}", # 임시 URI
                        "size": os.path.getsize(filepath),
                        "type": filename.split('.')[-1] if '.' in filename else "unknown"
                    })
        return assets
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"로컬 에셋 목록 조회 중 오류 발생: {e}")

@router.post("/upload")
async def upload_asset(file: UploadFile = File(...)):
    """
    새로운 에셋을 로컬 폴더에 저장합니다.
    """
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return {
            "status": "success",
            "message": f"'{file.filename}' 에셋이 로컬에 임시 업로드되었습니다.",
            "filename": file.filename,
            "gcs_uri": f"local://{file.filename}",
            "public_url": f"http://localhost:8002/assets/download/{file.filename}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"에셋 로컬 업로드 중 오류 발생: {e}")

@router.get("/download/{filename}")
async def download_asset(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="File not found")
