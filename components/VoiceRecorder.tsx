'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, RotateCcw, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
  onTranscript: (text: string) => void;
  onRecordingChange?: (isRecording: boolean) => void;
  maxSeconds?: number;
  placeholder?: string;
  autoStart?: boolean;
}

export default function VoiceRecorder({
  onTranscript,
  onRecordingChange,
  maxSeconds = 300,
  placeholder = 'Press the microphone to start speaking...',
  autoStart = false,
}: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [supported, setSupported] = useState(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-AU';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = '';
      let final = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + ' ';
        } else {
          interim += result[0].transcript;
        }
      }

      finalTranscriptRef.current = final;
      const combined = (final + interim).trim();
      setTranscript(combined);
      onTranscript(combined);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') {
        setError(`Microphone error: ${event.error}`);
        stopRecording();
      }
    };

    recognitionRef.current = recognition;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = useCallback(() => {
    if (!recognitionRef.current) return;
    setError('');
    setElapsed(0);
    finalTranscriptRef.current = '';
    setTranscript('');

    try {
      recognitionRef.current.start();
      setIsRecording(true);
      onRecordingChange?.(true);

      timerRef.current = setInterval(() => {
        setElapsed(prev => {
          if (prev >= maxSeconds - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      setError('Could not start microphone. Please check permissions.');
    }
  }, [maxSeconds, onRecordingChange]); // eslint-disable-line react-hooks/exhaustive-deps

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
    onRecordingChange?.(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [onRecordingChange]);

  const reset = useCallback(() => {
    stopRecording();
    setTranscript('');
    setElapsed(0);
    finalTranscriptRef.current = '';
    onTranscript('');
  }, [stopRecording, onTranscript]);

  useEffect(() => {
    if (autoStart) startRecording();
    return () => {
      stopRecording();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (secs: number) =>
    `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;

  const progress = Math.min((elapsed / maxSeconds) * 100, 100);

  if (!supported) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <strong>Voice recording not supported in this browser.</strong> Please use Chrome or Edge.
        You can type your response below instead.
        <textarea
          className="mt-3 w-full rounded-lg border border-gray-200 p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-clinic-accent"
          rows={4}
          placeholder="Type your response here..."
          onChange={e => { setTranscript(e.target.value); onTranscript(e.target.value); }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={clsx(
            'flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm',
            isRecording
              ? 'bg-red-500 hover:bg-red-600 text-white animate-recording'
              : 'bg-clinic-primary hover:bg-blue-800 text-white'
          )}
        >
          {isRecording ? (
            <>
              <Square size={16} fill="white" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic size={16} />
              {transcript ? 'Record Again' : 'Start Speaking'}
            </>
          )}
        </button>

        {transcript && !isRecording && (
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <RotateCcw size={15} />
            Clear
          </button>
        )}

        {isRecording && (
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-600 font-medium tabular-nums">{formatTime(elapsed)}</span>
            <span className="text-gray-400">/ {formatTime(maxSeconds)}</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {isRecording && (
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Transcript display */}
      <div
        className={clsx(
          'min-h-[120px] rounded-xl border p-4 text-sm transition-colors',
          isRecording
            ? 'border-red-200 bg-red-50'
            : transcript
            ? 'border-blue-100 bg-blue-50/40'
            : 'border-gray-100 bg-gray-50'
        )}
      >
        {transcript ? (
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{transcript}</p>
        ) : (
          <p className="text-gray-400 italic">{isRecording ? 'Listening...' : placeholder}</p>
        )}
      </div>

      {transcript && !isRecording && (
        <div className="flex items-center gap-2 text-sm text-emerald-600">
          <CheckCircle size={15} />
          <span>{transcript.split(/\s+/).filter(Boolean).length} words recorded</span>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}
    </div>
  );
}
