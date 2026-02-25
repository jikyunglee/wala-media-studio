from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.database import get_engine
from app.models import Template, TemplateBase

router = APIRouter()

# --- DB 세션 의존성 ---
def get_session():
    with Session(get_engine()) as session:
        yield session

# --- Pydantic 모델 (API 입출력용) ---
class TemplateCreate(TemplateBase):
    pass

class TemplateUpdate(TemplateBase):
    # 모든 필드가 선택적(Optional)이 되도록 설정할 수도 있습니다.
    pass

# --- API 엔드포인트 ---
@router.post("/", response_model=Template)
def create_template(template: TemplateCreate, session: Session = Depends(get_session)):
    db_template = Template.from_orm(template)
    session.add(db_template)
    session.commit()
    session.refresh(db_template)
    return db_template

@router.get("/", response_model=List[Template])
def read_templates(session: Session = Depends(get_session)):
    templates = session.exec(select(Template)).all()
    return templates

@router.get("/{template_id}", response_model=Template)
def read_template(template_id: int, session: Session = Depends(get_session)):
    template = session.get(Template, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

@router.put("/{template_id}", response_model=Template)
def update_template(template_id: int, template_update: TemplateUpdate, session: Session = Depends(get_session)):
    db_template = session.get(Template, template_id)
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # 받은 데이터로 필드 업데이트
    template_data = template_update.dict(exclude_unset=True)
    for key, value in template_data.items():
        setattr(db_template, key, value)
    
    session.add(db_template)
    session.commit()
    session.refresh(db_template)
    return db_template

@router.delete("/{template_id}")
def delete_template(template_id: int, session: Session = Depends(get_session)):
    template = session.get(Template, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    session.delete(template)
    session.commit()
    return {"status": "deleted", "id": template_id}
