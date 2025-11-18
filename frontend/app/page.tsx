import VideoUploader from '@/components/VideoUploader';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden py-12 px-4">
      {/* Abstract Background with Diagonal Stripes */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-white"></div>
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              #e0f2fe 0px,
              #e0f2fe 100px,
              #ffffff 100px,
              #ffffff 200px
            )`
          }}
        ></div>
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              #bae6fd 0px,
              #bae6fd 150px,
              #ffffff 150px,
              #ffffff 300px
            )`
          }}
        ></div>
      </div>
      <VideoUploader />
    </main>
  );
}