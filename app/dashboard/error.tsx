'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-clinic-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-bold text-navy-900 mb-2">Something went wrong</h2>
        <p className="text-gray-500 text-sm mb-2">{error.message}</p>
        {error.digest && <p className="text-gray-400 text-xs mb-6">Ref: {error.digest}</p>}
        <button
          onClick={reset}
          className="bg-clinic-accent text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-sky-400 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
