from pydantic import BaseModel, Field
from typing import Literal

class SegmentBase(BaseModel):
    job_id: str
    start_ms: int
    end_ms: int
    word: str
    confidence: float = Field(ge=0.0, le=1.0)
    reason: Literal["lexicon", "fuzzy"]
    active: bool = True

class SegmentCreate(SegmentBase):
    pass

class SegmentInDB(SegmentBase):
    id: str = Field(alias="_id")
    
    class Config:
        populate_by_name = True

class SegmentResponse(BaseModel):
    _id: str
    job_id: str
    start_ms: int
    end_ms: int
    word: str
    confidence: float
    reason: Literal["lexicon", "fuzzy"]
    active: bool