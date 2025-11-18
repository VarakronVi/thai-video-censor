from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Project
    PROJECT_NAME: str = "Thai Video Censor API"
    API_V1_PREFIX: str = "/v1"
    DEBUG: bool = True
    
    # Database
    MONGODB_URL: str
    DATABASE_NAME: str
    
    # Redis
    REDIS_URL: str
    
    # Storage (S3/R2)
    S3_ENDPOINT_URL: str
    S3_ACCESS_KEY_ID: str
    S3_SECRET_ACCESS_KEY: str
    S3_BUCKET_NAME: str
    S3_REGION: str = "auto"
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000"
    
    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()