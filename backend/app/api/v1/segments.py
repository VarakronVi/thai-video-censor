from fastapi import APIRouter, HTTPException, status
from typing import List
from bson import ObjectId
from datetime import datetime

from app.models.segment import SegmentBase, SegmentCreate, SegmentResponse
from app.core.database import get_database

router = APIRouter()

# POST: สร้าง segment ใหม่
@router.post("/{job_id}/segments", response_model=SegmentResponse, status_code=status.HTTP_201_CREATED)
async def create_segment(job_id: str, segment: SegmentCreate):
    db = get_database()
    
    # แปลง job_id เป็น field ใน segment
    segment_doc = segment.dict()
    segment_doc["job_id"] = job_id
    segment_doc["created_at"] = datetime.utcnow()
    segment_doc["updated_at"] = datetime.utcnow()
    
    result = await db.segments.insert_one(segment_doc)
    segment_doc["_id"] = str(result.inserted_id)
    
    return SegmentResponse(**segment_doc)

# GET: ดึง segments ของ job
@router.get("/{job_id}/segments", response_model=List[SegmentResponse])
async def get_segments(job_id: str):
    db = get_database()
    segments = []
    async for seg in db.segments.find({"job_id": job_id}):
        seg["_id"] = str(seg["_id"])
        segments.append(SegmentResponse(**seg))
    return segments

# PATCH: อัปเดต active ของ segment
@router.patch("/{job_id}/segments")
async def update_segments(job_id: str, segments: List[SegmentBase]):
    db = get_database()
    
    for seg in segments:
        if hasattr(seg, "_id") and seg._id:
            await db.segments.update_one(
                {"_id": ObjectId(seg._id)},
                {"$set": {"active": seg.active, "updated_at": datetime.utcnow()}}
            )
    return {"message": "Segments updated successfully"}
