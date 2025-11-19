from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.core.database import get_database

router = APIRouter()

# Pydantic model สำหรับรับข้อมูลสร้าง job ใหม่
class JobCreate(BaseModel):
    user_id: str
    file_key: str
    mode: Optional[str] = "beep"
    language: Optional[str] = "th"

# helper แปลง ObjectId -> str และ datetime -> ISO
def serialize_doc(doc: dict) -> dict:
    if not doc:
        return doc
    out = dict(doc)
    _id = out.get("_id")
    if _id is not None:
        out["id"] = str(_id)
        out.pop("_id", None)
    # ถ้ามี datetime แบบ BSON ให้แปลง (บางครั้งเป็น datetime)
    for k, v in list(out.items()):
        if hasattr(v, "isoformat"):
            out[k] = v.isoformat()
    return out

@router.get("/", response_model=dict)
async def list_jobs(limit: int = 10):
    db = get_database()
    cursor = db.jobs.find().sort("created_at", -1).limit(limit)
    docs = await cursor.to_list(length=limit)
    return {"jobs": [serialize_doc(d) for d in docs]}

@router.post("/", response_model=dict, status_code=201)
async def create_job(payload: JobCreate):
    db = get_database()
    now = datetime.utcnow()
    doc = {
        "user_id": payload.user_id,
        "file_key": payload.file_key,
        "mode": payload.mode,
        "language": payload.language,
        "status": "queued",
        "created_at": now,
        "updated_at": now,
        "error_message": None,
    }
    result = await db.jobs.insert_one(doc)
    created = await db.jobs.find_one({"_id": result.inserted_id})
    return {"job": serialize_doc(created)}

@router.get("/{job_id}", response_model=dict)
async def get_job(job_id: str):
    from bson import ObjectId
    db = get_database()
    try:
        oid = ObjectId(job_id)
    except Exception:
        raise HTTPException(status_code=400, detail="invalid job id")
    doc = await db.jobs.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="job not found")
    return {"job": serialize_doc(doc)}
