from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from app.core.database import get_database

router = APIRouter()

class UserSettingsModel(BaseModel):
    user_id: str
    profanity_list: Optional[List[str]] = []
    default_mode: str = "beep"
    beep_tone_hz: int = 1000

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_user_settings(settings: UserSettingsModel):
    db = get_database()
    doc = settings.dict()
    result = await db.user_settings.insert_one(doc)
    doc["_id"] = str(result.inserted_id)  # แปลง ObjectId เป็น string ก่อน return
    return {"message": "User settings created", "user_settings": doc}

@router.get("/{user_id}")
async def get_user_settings(user_id: str):
    db = get_database()
    doc = await db.user_settings.find_one({"user_id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="User settings not found")
    doc["_id"] = str(doc["_id"])  # แปลง ObjectId เป็น string
    return {"user_settings": doc}

@router.patch("/{user_id}")
async def update_user_settings(user_id: str, settings: UserSettingsModel):
    db = get_database()
    await db.user_settings.update_one(
        {"user_id": user_id},
        {"$set": settings.dict()},
        upsert=True
    )
    # ดึงข้อมูลล่าสุดมา return พร้อมแปลง _id
    doc = await db.user_settings.find_one({"user_id": user_id})
    doc["_id"] = str(doc["_id"])
    return {"message": "User settings updated", "user_settings": doc}
