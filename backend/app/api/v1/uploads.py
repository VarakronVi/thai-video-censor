from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.storage import storage_service

router = APIRouter()

class PresignedURLResponse(BaseModel):
    upload_url: str
    file_key: str

@router.post("/presign", response_model=PresignedURLResponse)
async def get_presigned_upload_url():
    """
    สร้าง presigned URL สำหรับอัปโหลดวิดีโอ
    """
    try:
        result = storage_service.generate_presigned_upload_url()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))