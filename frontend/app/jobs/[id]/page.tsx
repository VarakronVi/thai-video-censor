import JobStatus from '@/components/JobStatus';

interface PageProps {
  params: {
    id: string;
  };
}

export default function JobPage({ params }: PageProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4">
      <JobStatus jobId={params.id} />
    </main>
  );
}