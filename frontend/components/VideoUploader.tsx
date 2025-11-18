'use client';

import { useState } from 'react';
import { Upload, Loader2, AlertCircle, CheckCircle, FileVideo, X } from 'lucide-react';
import { getPresignedUrl, uploadVideo, createJob } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
}

export default function VideoUploader() {
  const router = useRouter();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // จัดการ Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // จัดการเมื่อเลือกไฟล์
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // ตรวจสอบและเริ่มอัปโหลด
  const handleFile = async (file: File) => {
    setError(null);

    // ตรวจสอบว่าเป็นไฟล์วิดีโอ
    if (!file.type.startsWith('video/')) {
      setError('กรุณาเลือกไฟล์วิดีโอเท่านั้น');
      return;
    }

    // ตรวจสอบขนาดไฟล์ (จำกัดที่ 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('ไฟล์ใหญ่เกิน 500MB');
      return;
    }

    const fileId = Date.now().toString();
    const newFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0,
    };

    setFiles((prev) => [...prev, newFile]);
    await uploadFile(file, fileId);
  };

  // อัปโหลดไฟล์
  const uploadFile = async (file: File, fileId: string) => {
    try {
      // 1. ขอ Presigned URL
      updateFileProgress(fileId, 10);
      const { upload_url, file_key } = await getPresignedUrl();

      // 2. อัปโหลดไฟล์
      updateFileProgress(fileId, 30);
      // await uploadVideo(upload_url, file);
      console.log('🔄 MOCK: Skipping file upload');
      console.log('📁 File key:', file_key);

      // 3. สร้าง Job (ใช้ beep เป็นค่าเริ่มต้น)
      updateFileProgress(fileId, 70);
      const job = await createJob(file_key, 'beep', 'th');

      // 4. เสร็จสิ้น
      updateFileProgress(fileId, 100);
      updateFileStatus(fileId, 'completed');

      // 5. รอ 1 วินาทีแล้วไปหน้า Job Status
      setTimeout(() => {
        router.push(`/jobs/${job._id}`);
      }, 1000);
    } catch (err: any) {
      console.error('Upload error:', err);
      const errorMessage = err.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปโหลด';
      updateFileStatus(fileId, 'error', errorMessage);
    }
  };

  // อัปเดต Progress
  const updateFileProgress = (fileId: string, progress: number) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, progress } : f))
    );
  };

  // อัปเดต Status
  const updateFileStatus = (
    fileId: string,
    status: 'uploading' | 'completed' | 'error',
    error?: string
  ) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, status, error } : f))
    );
  };

  // ลบไฟล์จากรายการ
  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-10 md:p-12">
          {/* Title Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Upload your video
            </h1>
            <p className="text-xl md:text-2xl font-medium text-gray-600">
              you want to convert to AVI
            </p>
          </div>

          {/* Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 ${
              dragActive
                ? 'border-blue-400 bg-blue-50/50'
                : 'border-gray-300 bg-gray-50/50 hover:border-blue-300 hover:bg-blue-50/30'
            }`}
          >
            <label
              htmlFor="video-upload"
              className="flex flex-col items-center justify-center py-20 cursor-pointer"
            >
              {/* Film Clapperboard Icon */}
              <div className="mb-6">
                <FileVideo 
                  className={`w-16 h-16 transition-colors ${
                    dragActive ? 'text-blue-500' : 'text-gray-400'
                  }`}
                />
              </div>
              
              <p className="text-lg font-medium text-gray-700 mb-3">
                Drag and drop video file
              </p>
              
              <p className="text-sm text-gray-500
               mb-5">or</p>
              
              {/* Browse Button */}
              <button
                type="button"
                className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('video-upload')?.click();
                }}
              >
                Browse
              </button>
            </label>
            <input
              id="video-upload"
              type="file"
              className="hidden"
              accept="video/*"
              onChange={handleFileChange}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Uploaded Files List */}
          {files.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Uploaded Files
              </h3>
              <div className="space-y-3">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={`p-5 rounded-xl border-2 transition-all shadow-sm ${
                      file.status === 'completed'
                        ? 'bg-green-50/50 border-green-200'
                        : file.status === 'error'
                        ? 'bg-red-50/50 border-red-200'
                        : 'bg-blue-50/50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                          file.status === 'completed'
                            ? 'bg-green-100'
                            : file.status === 'error'
                            ? 'bg-red-100'
                            : 'bg-blue-100'
                        }`}
                      >
                        {file.status === 'completed' ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : file.status === 'error' ? (
                          <AlertCircle className="w-6 h-6 text-red-600" />
                        ) : (
                          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-800 truncate">
                            {file.name}
                          </p>
                          <span className="text-sm text-gray-500 ml-2 whitespace-nowrap">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>

                        {/* Progress Bar */}
                        {file.status === 'uploading' && (
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
                              <span>Uploading...</span>
                              <span className="font-medium">{file.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Status Text */}
                        {file.status === 'completed' && (
                          <p className="text-sm text-green-600 font-medium">
                            ✓ Completed
                          </p>
                        )}
                        {file.status === 'error' && (
                          <p className="text-sm text-red-600">{file.error}</p>
                        )}
                      </div>

                      {/* Remove Button */}
                      {file.status !== 'uploading' && (
                        <button
                          onClick={() => removeFile(file.id)}
                          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 leading-relaxed text-center">
              You can convert to AVI from a variety of source formats including MKV to AVI, MP4 to AVI, FLV to AVI, MPEG to AVI, MOV to AVI, WMV to AVI and many more. Just give a try and tell us if it's not working.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}