import os

try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseModel as BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "SentinelAI")
    VERSION: str = os.getenv("VERSION", "1.0.0")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-sentinel-key-change-in-production-98124")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

    # Databases
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://sentinel_user:SentinelPass123!@localhost:5432/sentinel_db")
    SQLITE_FALLBACK_URL: str = os.getenv("SQLITE_FALLBACK_URL", "sqlite:///./sentinel.db")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # LLM Models & Endpoints
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "local") # local | gemini | openai
    LOCAL_LLM_BASE_URL: str = os.getenv("LOCAL_LLM_BASE_URL", "http://localhost:11434/v1")
    MODEL_TRIAGE_SEVERITY: str = os.getenv("MODEL_TRIAGE_SEVERITY", "phi-4-mini:Q4_K_M")
    MODEL_FORENSICS_MITIGATION: str = os.getenv("MODEL_FORENSICS_MITIGATION", "qwen2.5-coder:3b-instruct")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    # Alerts, Notifications & Email
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "sec_admin@sentinelai.local")
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.sendgrid.net")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SLACK_WEBHOOK_URL: str = os.getenv("SLACK_WEBHOOK_URL", "")

    # Security & Monitoring
    ENABLE_PROMETHEUS_METRICS: bool = os.getenv("ENABLE_PROMETHEUS_METRICS", "true").lower() == "true"
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
