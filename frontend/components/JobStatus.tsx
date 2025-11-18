'use client';

import { useState, useEffect } from 'react';
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Download,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { getJob, getSegments, updateSegments, reRenderJob } from '@/lib/api';
import type { Job, Segment, JobStatus as JobStatusType } from '@/types';

interface JobStatusProps {
  jobId: string;
}

export default function JobStatus({ jobId }: JobStatusProps) {
  const [job, setJob] = useState<Job | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reRendering, setReRendering] = useState(false);

  // ดึงข้อมูล Job ทุก 3 วินาที (polling)
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobData = await getJob(jobId);
        setJob(jobData);
        
        // ถ้า ready แล้ว ดึง segments
        if (jobData.status === 'ready') {
          const segmentsData = await getSegments(jobId);
          setSegments(segmentsData);
        }
        
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้');
        setLoading(false);
      }
    };

    fetchJob();
    
    // Polling ทุก 3 วินาที ถ้ายังไม่เสร็จ
    const interval = setInterval(() => {
      if (!job || (job.status !== 'ready' && job.status !== 'error')) {
        fetchJob();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [jobId, job?.status]);

  // Toggle segment on/off
  const toggleSegment = (segmentId: string) => {
    setSegments(prev =>
      prev.map(seg =>
        seg._id === segmentId ? { ...seg, active: !seg.active } : seg
      )
    );
  };

  // บันทึกและ Re-render
  const handleReRender = async () => {
    if (!job) return;
    
    setReRendering(true);
    try {
      await updateSegments(jobId, segments);
      await reRenderJob(jobId);
      
      // Reset status เป็น processing
      setJob({ ...job, status: 'processing' });
      setReRendering(false);
    } catch (err: any) {
      setError('ไม่สามารถ Re-render ได้');
      setReRendering(false);
    }
  };

  // แสดง Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // แสดง Error
  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800 text-center mb-2">
            เกิดข้อผิดพลาด
          </h2>
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Status Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
        <StatusHeader status={job.status} />
        
        <div className="p-8">
          {/* Progress Status */}
          {job.status === 'queued' && <QueuedStatus />}
          {job.status === 'processing' && <ProcessingStatus />}
          {job.status === 'rendering' && <RenderingStatus />}
          {job.status === 'error' && <ErrorStatus message={job.error_message} />}
          
          {/* Video Player & Timeline (แสดงเมื่อ ready) */}
          {job.status === 'ready' && job.result_key && (
            <div className="space-y-6">
              {/* Video Player */}
              <VideoPlayer resultUrl={job.result_key} />
              
              {/* Segments Timeline */}
              <SegmentsTimeline 
                segments={segments}
                onToggle={toggleSegment}
              />
              
              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleReRender}
                  disabled={reRendering}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-400 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {reRendering ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      กำลัง Re-render...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-5 h-5" />
                      บันทึกและ Re-render
                    </>
                  )}
                </button>
                
                
                  href={job.result_key}
                  download
                  className="flex-1 bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  ดาวน์โหลดวิดีโอ
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Status Header Component
function StatusHeader({ status }: { status: JobStatusType }) {
  const statusConfig = {
    queued: {
      color: 'from-gray-500 to-gray-600',
      icon: Clock,
      text: 'รอคิว',
    },
    processing: {
      color: 'from-blue-500 to-cyan-400',
      icon: Loader2,
      text: 'กำลังประมวลผล',
    },
    rendering: {
      color: 'from-purple-500 to-pink-400',
      icon: Loader2,
      text: 'กำลัง Render',
    },
    ready: {
      color: 'from-green-500 to-emerald-400',
      icon: CheckCircle,
      text: 'เสร็จสมบูรณ์',
    },
    error: {
      color: 'from-red-500 to-orange-400',
      icon: AlertCircle,
      text: 'เกิดข้อผิดพลาด',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`bg-gradient-to-r ${config.color} p-6 text-white`}>
      <div className="flex items-center gap-3">
        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
          <Icon className={`w-8 h-8 ${status === 'processing' || status === 'rendering' ? 'animate-spin' : ''}`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{config.text}</h2>
          <p className="text-white/80 text-sm">Job ID: {status.substring(0, 8)}...</p>
        </div>
      </div>
    </div>
  );
}

// Queued Status
function QueuedStatus() {
  return (
    <div className="text-center py-12">
      <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        งานของคุณอยู่ในคิว
      </h3>
      <p className="text-gray-500">
        กรุณารอสักครู่ ระบบจะเริ่มประมวลผลในไม่ช้า
      </p>
    </div>
  );
}

// Processing Status
function ProcessingStatus() {
  return (
    <div className="text-center py-12">
      <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        กำลังวิเคราะห์วิดีโอ
      </h3>
      <p className="text-gray-500 mb-6">
        ระบบกำลังถอดเสียงและตรวจจับคำหยาบ
      </p>
      <div className="max-w-md mx-auto">
        <div className="bg-gray-200 rounded-full h-2">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
      </div>
    </div>
  );
}

// Rendering Status
function RenderingStatus() {
  return (
    <div className="text-center py-12">
      <Loader2 className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        กำลัง Render วิดีโอ
      </h3>
      <p className="text-gray-500">
        กำลังสร้างวิดีโอที่เซนเซอร์แล้ว กรุณารอสักครู่...
      </p>
    </div>
  );
}

// Error Status
function ErrorStatus({ message }: { message?: string }) {
  return (
    <div className="text-center py-12">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-red-700 mb-2">
        เกิดข้อผิดพลาด
      </h3>
      <p className="text-red-600">
        {message || 'ไม่สามารถประมวลผลได้ กรุณาลองใหม่อีกครั้ง'}
      </p>
    </div>
  );
}

// Video Player Component
function VideoPlayer({ resultUrl }: { resultUrl: string }) {
  return (
    <div className="bg-black rounded-xl overflow-hidden">
      <video
        src={resultUrl}
        controls
        className="w-full"
        controlsList="nodownload"
      >
        เบราว์เซอร์ของคุณไม่รองรับ video tag
      </video>
    </div>
  );
}

// Segments Timeline Component
function SegmentsTimeline({ 
  segments, 
  onToggle 
}: { 
  segments: Segment[]; 
  onToggle: (id: string) => void;
}) {
  if (segments.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-green-800 mb-1">
          ไม่พบคำหยาบในวิดีโอ
        </h3>
        <p className="text-green-600 text-sm">
          วิดีโอของคุณสะอาด ไม่ต้องเซนเซอร์!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-orange-500" />
        ตรวจพบคำหยาบ {segments.length} จุด
      </h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {segments.map((segment, index) => (
          <div
            key={segment._id || index}
            className={`p-4 rounded-lg border-2 transition-all ${
              segment.active
                ? 'bg-red-50 border-red-300'
                : 'bg-gray-100 border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-mono text-gray-600 bg-white px-3 py-1 rounded">
                    {formatTime(segment.start_ms)} - {formatTime(segment.end_ms)}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    segment.reason === 'lexicon' 
                      ? 'bg-red-100 text-red-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {segment.reason === 'lexicon' ? 'แน่ใจ' : 'คาดการณ์'} ({Math.round(segment.confidence * 100)}%)
                  </span>
                </div>
                <p className="text-gray-700 font-medium">
                  คำที่ตรวจพบ: <span className="text-red-600">"{segment.word}"</span>
                </p>
              </div>
              
              <button
                onClick={() => onToggle(segment._id!)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  segment.active
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                }`}
              >
                {segment.active ? 'เปิดอยู่' : 'ปิด'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper: แปลง milliseconds เป็น mm:ss
function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}