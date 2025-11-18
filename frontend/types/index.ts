export type JobStatus = 'queued' | 'processing' | 'rendering' | 'ready' | 'error';

export type CensorMode = 'mute' | 'beep';

export interface Segment {
  _id?: string;
  job_id: string;
  start_ms: number;
  end_ms: number;
  word: string;
  confidence: number;
  reason: 'lexicon' | 'fuzzy';
  active: boolean;
}

export interface Job {
  _id: string;
  user_id?: string;
  status: JobStatus;
  file_key: string;
  result_key?: string;
  mode: CensorMode;
  language: string;
  created_at: string;
  updated_at: string;
  error_message?: string;
}

export interface PresignedUpload {
  upload_url: string;
  file_key: string;
}
