from sqlmodel import Session, create_engine, select
from app.models import Template
import os

DATABASE_URL = "sqlite:///./media_studio.db"
engine = create_engine(DATABASE_URL)

def seed_templates():
    from app.models import SQLModel
    SQLModel.metadata.create_all(engine)
    
    templates = [
        {
            "name": "시네마틱 제품 홍보",
            "description": "제품 이미지를 활용하여 웅장하고 시네마틱한 광고 영상을 제작합니다.",
            "user_template_text": "A macro cinematic shot of {{product}}, bathed in dramatic golden hour lighting, rotating slowly. The background is a soft bokeh of a modern laboratory. 8K, highly detailed, professional product commercial style."
        },
        {
            "name": "미래지향적 도시 배경",
            "description": "이미지 속의 피사체를 미래 도시 배경에 배치하여 역동적인 영상을 만듭니다.",
            "user_template_text": "The subject from the image is now standing in the middle of a neon-lit cyberpunk city in the year 2077. Flying cars are zooming by in the sky. Rain is falling, creating beautiful reflections on the ground. 8K, cinematic lighting."
        },
        {
            "name": "자연의 신비 - 타임랩스",
            "description": "정적인 이미지를 생동감 넘치는 자연의 타임랩스 영상으로 변환합니다.",
            "user_template_text": "A beautiful time-lapse of the scene in the image, showing the transition from a clear sunny day to a starlit night. Clouds move rapidly across the sky. The lighting changes dynamically. Photorealistic, 8K."
        }
    ]

    with Session(engine) as session:
        for t_data in templates:
            # Check if template already exists
            existing = session.exec(select(Template).where(Template.name == t_data["name"])).first()
            if not existing:
                template = Template(**t_data)
                session.add(template)
                print(f"Added template: {t_data['name']}")
        session.commit()

if __name__ == "__main__":
    seed_templates()
