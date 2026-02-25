from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.endpoints import video, assets, templates, training
from app.core.database import create_db_and_tables
from app.models import Template, Job # SQLModel이 테이블을 인식하도록 임포트
from contextlib import asynccontextmanager
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Lifespan: 서버 시작, DB 및 테이블 생성")
    create_db_and_tables()
    yield
    print("Lifespan: 서버 종료")

app = FastAPI(
    title="WALA Antigravity Media Studio API",
    lifespan=lifespan
)

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost:3002",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files serving (for uploaded images/videos)
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(video.router, prefix="/video", tags=["video"])
app.include_router(assets.router, prefix="/assets", tags=["assets"])
app.include_router(templates.router, prefix="/templates", tags=["templates"])
app.include_router(training.router, prefix="/training", tags=["training"])

@app.get("/")
async def root():
    return {"message": "Welcome to WALA Antigravity Media Studio API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
