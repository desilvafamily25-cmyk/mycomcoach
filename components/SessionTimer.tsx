'use client';

import { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';

interface Props {
  targetSeconds: number;
  running: boolean;
  onComplete?: () => void;
}

export default function SessionTimer({ targetSeconds, running, onComplete }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1;
        if (next >= targetSeconds) {
          clearInterval(interval);
          onComplete?.();
          return targetSeconds;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, targetSeconds, onComplete]);

  const pct = Math.min((elapsed / targetSeconds) * 100, 100);
  const remaining = targetSeconds - elapsed;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div className="flex items-center gap-3">
      <Timer size={15} className="text-gray-400" />
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-clinic-accent transition-all duration-1000"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm tabular-nums text-gray-500 font-medium">
        {mins}:{String(secs).padStart(2, '0')}
      </span>
    </div>
  );
}
