from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

JobStatus = Literal["queued", "processing", "rendering", "ready", "error"]
CensorMode = Literal["mute", "beep"]

class JobBase(BaseModel):
    file_key: str
    mode: CensorMode = "beep"
    language: str = "th"

class JobCreate(JobBase):
    pass

class JobInDB(JobBase):
    id: str = Field(alias="_id")
    user_id: Optional[str] = None
    status: JobStatus = "queued"
    result_key: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    error_message: Optional[str] = None
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "file_key": "uploads/video.mp4",
                "mode": "beep",
                "language": "th",
                "status": "queued"
            }
        }

class JobResponse(BaseModel):
    _id: str
    file_key: str
    mode: CensorMode
    language: str
    status: JobStatus
    result_key: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    error_message: Optional[str] = None