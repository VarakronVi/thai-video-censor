import axios from 'axios';
import type { Job, Segment, PresignedUpload, CensorMode } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ขอ Presigned URL สำหรับอัปโหลด
export async function getPresignedUrl(): Promise<PresignedUpload> {
  const { data } = await api.post('/uploads/presign');
  return data;
}

// อัปโหลดไฟล์ไปที่ S3/R2
export async function uploadVideo(url: string, file: File): Promise<void> {
  await axios.put(url, file, {
    headers: {
      'Content-Type': file.type,
    },
  });
}

// สร้าง Job ใหม่
export async function createJob(
  file_key: string,
  mode: CensorMode = 'beep',
  language: string = 'th'
): Promise<Job> {
  const { data } = await api.post('/jobs', {
    file_key,
    mode,
    language,
  });
  return data;
}

// ดึงข้อมูล Job
export async function getJob(id: string): Promise<Job> {
  const { data } = await api.get(`/jobs/${id}`);
  return data;
}

// ดึง Segments ของ Job
export async function getSegments(jobId: string): Promise<Segment[]> {
  const { data } = await api.get(`/jobs/${jobId}/segments`);
  return data;
}

// อัปเดต Segments
export async function updateSegments(
  jobId: string,
  segments: Segment[]
): Promise<void> {
  await api.patch(`/jobs/${jobId}/segments`, { segments });
}

// สั่ง Re-render
export async function reRenderJob(jobId: string): Promise<void> {
  await api.post(`/jobs/${jobId}/render`);
}