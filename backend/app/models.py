from typing import Optional
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship

class Job(SQLModel, table=True):
    id: str = Field(primary_key=True) # UUID로 생성된 작업 ID
    status: str = Field(default="queued", index=True) # "queued", "processing", "completed", "failed"
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    
    # 작업 결과물
    result_gcs_path: Optional[str] = None
    result_public_url: Optional[str] = None
    error_message: Optional[str] = None
    
    # 입력 정보
    request_image_path: str
    request_prompt: str
    
    # 음악 관련 정보
    music_prompt: Optional[str] = None
    music_url: Optional[str] = None
    include_music: bool = Field(default=False)
    
    # 나중에 User 모델이 생기면 연결할 수 있습니다.
    # user_id: Optional[int] = Field(default=None, foreign_key="user.id")

class TemplateBase(SQLModel):
    name: str = Field(index=True)
    description: str = Field(default="")
    user_template_text: str

class Template(TemplateBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
