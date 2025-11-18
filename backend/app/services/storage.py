import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from app.core.config import settings
from typing import Dict
import uuid

class StorageService:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            endpoint_url=settings.S3_ENDPOINT_URL,
            aws_access_key_id=settings.S3_ACCESS_KEY_ID,
            aws_secret_access_key=settings.S3_SECRET_ACCESS_KEY,
            region_name=settings.S3_REGION,
            config=Config(signature_version='s3v4')
        )
        self.bucket_name = settings.S3_BUCKET_NAME
    
    def generate_presigned_upload_url(self, file_extension: str = "mp4") -> Dict[str, str]:
        """สร้าง presigned URL สำหรับอัปโหลดไฟล์"""
        file_key = f"uploads/{uuid.uuid4()}.{file_extension}"
        
        try:
            upload_url = self.s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': file_key,
                    'ContentType': f'video/{file_extension}'
                },
                ExpiresIn=900  # 15 นาที
            )
            
            return {
                "upload_url": upload_url,
                "file_key": file_key
            }
        except ClientError as e:
            raise Exception(f"Error generating presigned URL: {str(e)}")
    
    def generate_presigned_download_url(self, file_key: str) -> str:
        """สร้าง presigned URL สำหรับดาวน์โหลดไฟล์"""
        try:
            download_url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': file_key
                },
                ExpiresIn=3600  # 1 ชั่วโมง
            )
            return download_url
        except ClientError as e:
            raise Exception(f"Error generating download URL: {str(e)}")
    
    def upload_file(self, file_path: str, file_key: str) -> str:
        """อัปโหลดไฟล์จาก worker (สำหรับ result video)"""
        try:
            self.s3_client.upload_file(file_path, self.bucket_name, file_key)
            return file_key
        except ClientError as e:
            raise Exception(f"Error uploading file: {str(e)}")
    
    def download_file(self, file_key: str, local_path: str) -> str:
        """ดาวน์โหลดไฟล์มาเก็บใน worker"""
        try:
            self.s3_client.download_file(self.bucket_name, file_key, local_path)
            return local_path
        except ClientError as e:
            raise Exception(f"Error downloading file: {str(e)}")

# Singleton instance
storage_service = StorageService()