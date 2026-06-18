'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Volume2, VolumeX, Send, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import type { ChatMessage, Scenario } from '@/types';
import VoiceRecorder from './VoiceRecorder';

interface Props {
  scenario: Scenario;
  onComplete: (transcript: string, messages: ChatMessage[]) => void;
  maxTurns?: number;
}

export default function AIPatientChat({ scenario, onComplete, maxTurns = 8 }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: scenario.openingLine,
      timestamp: Date.now(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [turnCount, setTurnCount] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const allDoctorSpeech = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join('\n\n');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Play opening line on mount
  useEffect(() => {
    if (audioEnabled) {
      playAudio(scenario.openingLine);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function playAudio(text: string) {
    if (!audioEnabled || !text) return;
    try {
      setIsPlayingAudio(true);
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 400), voice: 'nova' }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setIsPlayingAudio(false);
      audio.play().catch(() => setIsPlayingAudio(false));
    } catch {
      setIsPlayingAudio(false);
    }
  }

  async function sendMessage() {
    if (!currentTranscript.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: currentTranscript.trim(),
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setCurrentTranscript('');
    setIsLoading(true);

    const newTurn = turnCount + 1;
    setTurnCount(newTurn);

    if (newTurn >= maxTurns) {
      setIsLoading(false);
      onComplete(allDoctorSpeech + '\n' + userMsg.content, newMessages);
      return;
    }

    try {
      const res = await fetch('/api/patient-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: scenario.id,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      const patientReply = data.content || "I'm not sure what to say to that.";

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: patientReply,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMsg]);
      if (audioEnabled) playAudio(patientReply);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '(The patient pauses and waits.)', timestamp: Date.now() },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleEnd() {
    onComplete(allDoctorSpeech, messages);
  }

  const turnsLeft = maxTurns - turnCount;

  return (
    <div className="flex flex-col h-full">
      {/* Patient info header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
            {scenario.patientName[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{scenario.patientName}</p>
            <p className="text-xs text-gray-500">{scenario.patientAge} years old — {scenario.chiefComplaint.slice(0, 40)}{scenario.chiefComplaint.length > 40 ? '...' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAudioEnabled(v => !v)}
            className="p-2 rounded-lg hover:bg-gray-50 text-gray-500"
            title={audioEnabled ? 'Mute patient voice' : 'Enable patient voice'}
          >
            {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <span className="text-xs text-gray-400">{turnsLeft} turns left</span>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={clsx(
              'flex',
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={clsx(
                'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-clinic-primary text-white rounded-br-sm'
                  : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
              )}
            >
              {msg.role === 'assistant' && (
                <span className="text-xs font-semibold text-blue-500 block mb-1">{scenario.patientName}</span>
              )}
              {msg.role === 'user' && (
                <span className="text-xs font-semibold text-white/70 block mb-1">You (Doctor)</span>
              )}
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <span className="text-xs font-semibold text-blue-500 block mb-1">{scenario.patientName}</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {isPlayingAudio && (
          <div className="text-center">
            <span className="text-xs text-blue-500 bg-blue-50 px-3 py-1 rounded-full">Patient speaking...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="p-4 bg-white border-t border-gray-100 space-y-3">
        <VoiceRecorder
          onTranscript={setCurrentTranscript}
          placeholder="Press the microphone and speak your response..."
          maxSeconds={120}
        />

        {currentTranscript && (
          <div className="flex gap-2">
            <button
              onClick={sendMessage}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-clinic-primary hover:bg-blue-800 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              Send Response
            </button>
          </div>
        )}

        <button
          onClick={handleEnd}
          className="w-full text-sm text-gray-500 hover:text-gray-700 py-1"
        >
          End consultation and get feedback →
        </button>
      </div>
    </div>
  );
}
