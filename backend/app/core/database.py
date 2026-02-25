from sqlmodel import create_engine, SQLModel

# 데이터베이스 파일 이름
sqlite_file_name = "media_studio.db"
# 데이터베이스 URL
sqlite_url = f"sqlite:///{sqlite_file_name}"

# 재사용 가능한 엔진 인스턴스
engine = create_engine(sqlite_url, echo=True, connect_args={"check_same_thread": False})

def get_engine():
    """애플리케이션에서 사용할 데이터베이스 엔진을 반환합니다."""
    return engine

def create_db_and_tables():
    """데이터베이스와 테이블을 생성합니다."""
    SQLModel.metadata.create_all(engine)
