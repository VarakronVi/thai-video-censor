from fastapi import APIRouter
from ..core.database import get_database

router = APIRouter()

@router.get("/")
async def video_censor():
    db = get_database()  # คืนค่า database instance
    # ดึง 10 รายการจาก collection "videos"
    videos = await db.videos.find().to_list(10)
    return {"videos": videos}
