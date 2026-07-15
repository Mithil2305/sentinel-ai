from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

def get_engine():
    if settings.DATABASE_URL.startswith("postgresql"):
        try:
            # Check if Postgres port is actually listening
            pg_engine = create_engine(settings.DATABASE_URL, connect_args={"connect_timeout": 2})
            with pg_engine.connect() as conn:
                pass
            return pg_engine
        except Exception:
            # Automatic resilient fallback to SQLite for local development & testing
            return create_engine(settings.SQLITE_FALLBACK_URL, connect_args={"check_same_thread": False})
    else:
        return create_engine(settings.DATABASE_URL)

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
