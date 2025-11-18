from fastapi import APIRouter, HTTPException, status
from typing import List
from datetime import datetime
from bson import ObjectId
from app.models.job import JobCreate, JobResponse, JobStatus
from app.models.segment import SegmentResponse, SegmentBase
from app.core.database import get_database
from app.services.queue import queue_service

router = APIRouter()

@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(job: JobCreate):
    """
    สร้างงานใหม่และเพิ่มเข้าคิว
    """
    try:
        db = get_database()
        
        # สร้าง job document
        job_doc = {
            "file_key": job.file_key,
            "mode": job.mode,
            "language": job.language,
            "status": "queued",
            "result_key": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "error_message": None
        }
        
        # บันทึกลง MongoDB
        result = await db.jobs.insert_one(job_doc)
        job_id = str(result.inserted_id)
        
        # Push เข้า Redis queue (ถ้ามี error ก็ข้ามไป)
        try:
            queue_service.push_job({
                "job_id": job_id,
                "file_key": job.file_key,
                "mode": job.mode,
                "language": job.language
            })
            print(f"✅ Job {job_id} pushed to queue")
        except Exception as queue_error:
            print(f"⚠️  Queue error (non-fatal): {queue_error}")
        
        # Return response
        job_doc["_id"] = job_id
        return JobResponse(**job_doc)
        
    except Exception as e:
        print(f"❌ Error creating job: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to create job: {str(e)}"
        )

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str):
    """
    ดึงข้อมูลงานตาม ID
    """
    db = get_database()
    
    try:
        job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    except Exception as e:
        print(f"❌ Error getting job: {e}")
        raise HTTPException(status_code=400, detail="Invalid job ID format")
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job["_id"] = str(job["_id"])
    return JobResponse(**job)

@router.get("/{job_id}/segments", response_model=List[SegmentResponse])
async def get_job_segments(job_id: str):
    """
    ดึง segments ทั้งหมดของงาน
    """
    db = get_database()
    
    try:
        ObjectId(job_id)  # Validate job_id format
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job ID format")
    
    segments = []
    async for segment in db.segments.find({"job_id": job_id}):
        segment["_id"] = str(segment["_id"])
        segments.append(SegmentResponse(**segment))
    
    return segments

@router.patch("/{job_id}/segments")
async def update_job_segments(job_id: str, segments: List[SegmentBase]):
    """
    อัปเดต segments (toggle on/off)
    """
    db = get_database()
    
    try:
        ObjectId(job_id)  # Validate
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job ID format")
    
    # อัปเดตแต่ละ segment
    for segment in segments:
        if hasattr(segment, '_id') and segment._id:
            await db.segments.update_one(
                {"_id": ObjectId(segment._id)},
                {"$set": {"active": segment.active}}
            )
    
    return {"message": "Segments updated successfully"}

@router.post("/{job_id}/render")
async def re_render_job(job_id: str):
    """
    สั่ง re-render วิดีโอใหม่ (ตาม segments ที่แก้ไข)
    """
    db = get_database()
    
    try:
        job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job ID format")
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # อัปเดตสถานะเป็น rendering
    await db.jobs.update_one(
        {"_id": ObjectId(job_id)},
        {
            "$set": {
                "status": "rendering",
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Push งานกลับเข้าคิวใหม่
    try:
        queue_service.push_job({
            "job_id": job_id,
            "file_key": job["file_key"],
            "mode": job["mode"],
            "language": job["language"],
            "re_render": True
        })
    except Exception as e:
        print(f"⚠️  Queue error: {e}")
    
    return {"message": "Re-render job queued successfully"}