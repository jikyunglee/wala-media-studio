import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlmodel import Session, select

from app.services.video_generation import VideoService
from app.api.endpoints.templates import get_session # 세션 의존성 재사용
from app.models import Job

router = APIRouter()

# --- 모델 정의 ---
class GenerateVideoRequest(BaseModel):
    asset_image_path: str
    user_template_text: str
    include_music: bool = False

# --- 백그라운드 작업 함수 ---
async def run_video_generation(job_id: str, image_path: str, prompt: str, music_prompt: str = None):
    """
    실제 비디오 생성을 담당하고 DB 상태를 업데이트하는 함수.
    """
    from app.core.database import get_engine
    from app.services.video_generation import VideoService
    
    print(f"백그라운드 작업 시작: Job ID {job_id}")
    video_service = VideoService()
    
    with Session(get_engine()) as session:
        try:
            job = session.get(Job, job_id)
            if not job:
                return
            
            job.status = "processing"
            session.add(job)
            session.commit()
            session.refresh(job)

            # 비디오 생성
            gcs_path, public_url = await video_service.generate_video_from_image(
                asset_gcs_uri=image_path,
                prompt=prompt
            )
            
            job.status = "completed"
            job.result_gcs_path = gcs_path
            job.result_public_url = public_url
            if music_prompt:
                job.music_prompt = music_prompt
                # 여기서 실제 MusicLM API 등을 호출하여 music_url을 설정할 수 있습니다.
                # 현재는 시뮬레이션을 위해 프롬프트만 저장합니다.
            
            session.add(job)
            session.commit()

        except Exception as e:
            print(f"백그라운드 작업 실패: {e}")
            job.status = "failed"
            job.error_message = str(e)
            session.add(job)
            session.commit()

# --- 엔드포인트 ---
@router.post("/generate", response_model=Job)
async def generate_video(
    request: GenerateVideoRequest, 
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session)
):
    """ 비디오 생성 작업을 DB에 기록하고 백그라운드 실행을 예약합니다. """
    try:
        video_service = VideoService()
        refined_prompt = await video_service.generate_refined_prompt(request.user_template_text)
        
        music_prompt = None
        if request.include_music:
            music_prompt = await video_service.generate_music_prompt(refined_prompt)

        new_job = Job(
            id=str(uuid.uuid4()),
            status="queued",
            request_image_path=request.asset_image_path,
            request_prompt=refined_prompt,
            include_music=request.include_music,
            music_prompt=music_prompt
        )
        session.add(new_job)
        session.commit()
        session.refresh(new_job)
        
        background_tasks.add_task(
            run_video_generation, 
            job_id=new_job.id,
            image_path=request.asset_image_path, 
            prompt=refined_prompt,
            music_prompt=music_prompt
        )
        
        return new_job

    except Exception as e:
        print(f"ERROR IN HANDLER: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/jobs", response_model=List[Job])
def get_jobs(session: Session = Depends(get_session)):
    """ 모든 비디오 생성 작업 목록을 조회합니다. """
    jobs = session.exec(select(Job).order_by(Job.created_at.desc())).all()
    return jobs

@router.get("/jobs/{job_id}", response_model=Job)
def get_job(job_id: str, session: Session = Depends(get_session)):
    """ 특정 비디오 생성 작업의 상태를 조회합니다. """
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
