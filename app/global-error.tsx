'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ minHeight: '100vh', background: '#F0F4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 480, width: '100%' }}>
            <h2 style={{ color: '#DC2626', fontWeight: 700, marginBottom: 8 }}>Application error</h2>
            <pre style={{ background: '#FEF2F2', padding: 12, borderRadius: 8, fontSize: 12, overflowX: 'auto', color: '#7F1D1D', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {error?.message || 'Unknown error'}{'\n'}{error?.digest ? `digest: ${error.digest}` : ''}
            </pre>
            <button
              onClick={reset}
              style={{ marginTop: 16, background: '#0EA5E9', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
