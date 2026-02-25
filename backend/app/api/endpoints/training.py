import os
import shutil
from typing import List
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from pydantic import BaseModel

router = APIRouter()

# 임시 저장소 경로 설정 (나중에는 클라우드 스토리지로 변경 가능)
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.post("/start")
async def start_training(
    model_name: str = Form(...),
    files: List[UploadFile] = File(...)
):
    """
    사용자가 업로드한 이미지를 받고 학습 작업을 시작합니다.
    """
    try:
        # 모델별 디렉토리 생성
        model_dir = os.path.join(UPLOAD_DIR, model_name.replace(" ", "_"))
        if not os.path.exists(model_dir):
            os.makedirs(model_dir)

        saved_files = []
        for file in files:
            file_path = os.path.join(model_dir, file.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            saved_files.append(file.filename)

        # TODO: 여기서 실제 학습 작업(Google Vertex AI, Cloud Tasks 등)을 트리거합니다.
        # 지금은 성공했다는 응답만 보냅니다.

        return {
            "status": "success",
            "message": f"'{model_name}' 모델 학습이 시작되었습니다.",
            "file_count": len(saved_files),
            "job_id": f"job_{model_name}_{len(saved_files)}"
        }

    except Exception as e:
        print(f"Error during upload: {e}")
        raise HTTPException(status_code=500, detail="이미지 업로드 중 오류가 발생했습니다.")
