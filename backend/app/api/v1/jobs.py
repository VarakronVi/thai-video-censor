from fastapi import APIRouter, HTTPException, status
from typing import List
from datetime import datetime
from bson import ObjectId

from app.models.job import JobCreate, JobResponse, JobStatus, JobInDB
from app.models.segment import SegmentResponse, SegmentBase
from app.core.database import get_database
from app.services.queue import queue_service

router = APIRouter()


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(job: JobCreate):
    """
    สร้างงานใหม่และเพิ่มเข้าคิวจริง
    """
    db = get_database()

    job_doc = {
        "file_key": job.file_key,
        "mode": job.mode,
        "language": job.language,
        "status": "queued",
        "user_id": None,          # จะใส่ทีหลังถ้ามีระบบ auth
        "result_key": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "error_message": None
    }

    # insert ลง MongoDB collection jobs
    result = await db.jobs.insert_one(job_doc)
    job_id = str(result.inserted_id)

    # push queue
    try:
        queue_service.push_job({
            "job_id": job_id,
            "file_key": job.file_key,
            "mode": job.mode,
            "language": job.language
        })
    except Exception as e:
        print(f"⚠️ Queue push error: {e}")

    # ใส่ _id ให้ Pydantic อ่านถูก
    job_doc["_id"] = job_id

    return JobResponse(**job_doc)


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str):
    """
    ดึงงานตาม id
    """
    db = get_database()

    try:
        job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid job ID")

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    job["_id"] = str(job["_id"])
    return JobResponse(**job)


@router.get("/{job_id}/segments", response_model=List[SegmentResponse])
async def get_job_segments(job_id: str):
    db = get_database()

    try:
        ObjectId(job_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid job ID")

    segments = []
    async for segment in db.segments.find({"job_id": job_id}):
        segment["_id"] = str(segment["_id"])
        segments.append(SegmentResponse(**segment))

    return segments


@router.patch("/{job_id}/segments")
async def update_segments(job_id: str, segments: List[SegmentBase]):
    db = get_database()

    try:
        ObjectId(job_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid job ID")

    for seg in segments:
        if seg._id:
            await db.segments.update_one(
                {"_id": ObjectId(seg._id)},
                {"$set": {"active": seg.active}}
            )

    return {"message": "Segments updated"}


@router.post("/{job_id}/render")
async def re_render(job_id: str):
    db = get_database()

    try:
        job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid job ID")

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    await db.jobs.update_one(
        {"_id": ObjectId(job_id)},
        {"$set": {"status": "rendering", "updated_at": datetime.utcnow()}}
    )

    try:
        queue_service.push_job({
            "job_id": job_id,
            "file_key": job["file_key"],
            "mode": job["mode"],
            "language": job["language"],
            "re_render": True
        })
    except Exception as e:
        print(f"Queue error: {e}")

    return {"message": "Re-render queued"}

from pydantic import BaseModel

class JobStatusUpdate(BaseModel):
    status: str  # หรือใช้ Enum ถ้าต้องการจำกัดค่า

@router.patch("/{job_id}")
async def update_job_status(job_id: str, status_update: JobStatusUpdate):
    """
    อัปเดต status ของ job
    """
    db = get_database()

    try:
        job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid job ID")

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    await db.jobs.update_one(
        {"_id": ObjectId(job_id)},
        {"$set": {"status": status_update.status, "updated_at": datetime.utcnow()}}
    )

    return {"message": f"Job status updated to {status_update.status}"}

