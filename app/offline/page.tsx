'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-clinic-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-clinic-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M6.343 6.343a9 9 0 000 12.728M9.172 9.172a5 5 0 000 7.07M12 12h.01" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">You&apos;re offline</h1>
        <p className="text-slate-400 mb-8">
          SpeakClinic needs a connection for AI responses and voice scoring.
          Come back when you&apos;re online — your progress is saved.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-clinic-accent hover:bg-sky-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
