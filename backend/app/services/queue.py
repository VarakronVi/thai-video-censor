import redis
import json
from app.core.config import settings
from typing import Dict, Any, Optional

class QueueService:
    def __init__(self):
        self.redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        self.queue_name = "video_processing_queue"
    
    def push_job(self, job_data: Dict[str, Any]) -> bool:
        """เพิ่มงานเข้าคิว"""
        try:
            self.redis_client.rpush(self.queue_name, json.dumps(job_data))
            return True
        except Exception as e:
            print(f"Error pushing job to queue: {e}")
            return False
    
    def pop_job(self) -> Optional[Dict[str, Any]]:
        """ดึงงานจากคิว (สำหรับ worker)"""
        try:
            job_json = self.redis_client.blpop(self.queue_name, timeout=5)
            if job_json:
                return json.loads(job_json[1])
            return None
        except Exception as e:
            print(f"Error popping job from queue: {e}")
            return None
    
    def get_queue_length(self) -> int:
        """เช็คจำนวนงานในคิว"""
        try:
            return self.redis_client.llen(self.queue_name)
        except Exception as e:
            print(f"Error getting queue length: {e}")
            return 0

# Singleton instance
queue_service = QueueService()