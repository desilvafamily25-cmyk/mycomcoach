'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import AppShell from '@/components/AppShell';
import VoiceRecorder from '@/components/VoiceRecorder';
import ScoreDisplay from '@/components/ScoreDisplay';
import AIPatientChat from '@/components/AIPatientChat';
import { getDailyContent, CONSULTATION_SCENARIOS } from '@/lib/scenarios';
import type { FeedbackResult, ChatMessage } from '@/types';
import { Loader2, ChevronRight, CheckCircle, Target, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

type Phase = 1 | 2 | 3 | 4 | 5;

const today = new Date().toISOString().split('T')[0];
const dailyContent = getDailyContent(today);
const todayScenario = CONSULTATION_SCENARIOS[parseInt(today.replace(/-/g, '')) % CONSULTATION_SCENARIOS.length];

const PHASE_META = [
  { num: 1 as Phase, label: 'Warm-up', mins: 3, desc: 'Voice & articulation drill' },
  { num: 2 as Phase, label: 'Thought Stream', mins: 5, desc: 'Structured speaking practice' },
  { num: 3 as Phase, label: 'General Comms', mins: 7, desc: 'Everyday role-play' },
  { num: 4 as Phase, label: 'Consultation', mins: 12, desc: 'AI patient simulation' },
  { num: 5 as Phase, label: 'Review & Redo', mins: 3, desc: 'Feedback + targeted repeat' },
];

export default function DailyPage() {
  const [activePhase, setActivePhase] = useState<Phase>(1);
  const [phaseState, setPhaseState] = useState<'idle' | 'active' | 'feedback' | 'done'>('idle');
  const [completedPhases, setCompletedPhases] = useState<Set<Phase>>(new Set());
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedPhrases, setSavedPhrases] = useState<string[]>([]);

  const getFeedback = useCallback(async (text: string, phaseType: string) => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: text,
          phaseType,
          scenarioId: activePhase === 4 ? todayScenario.id : undefined,
          framework: activePhase === 2 ? dailyContent.thoughtDrill.framework : undefined,
        }),
      });
      const data = await res.json();
      if (data.scores) setFeedback(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [activePhase]);

  async function completePhase() {
    setCompletedPhases(prev => new Set([...prev, activePhase]));
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('sessions').upsert({
        user_id: user.id,
        date: today,
        [`phase_${activePhase}_completed`]: true,
        total_score: feedback?.scores?.overall ?? null,
      }, { onConflict: 'user_id,date' });
    }
  }

  async function handleSavePhrase(phrase: string) {
    setSavedPhrases(prev => [...prev, phrase]);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('phrases').insert({
        user_id: user.id,
        text: phrase,
        category: activePhase === 4 ? 'consultation' : 'general',
        context: PHASE_META[activePhase - 1].label,
      });
    }
  }

  function moveToPhase(phase: Phase) {
    setActivePhase(phase);
    setPhaseState('idle');
    setTranscript('');
    setFeedback(null);
  }

  function goNext() {
    const next = (activePhase + 1) as Phase;
    if (next <= 5) moveToPhase(next);
  }

  const allDone = completedPhases.size === 5;

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-navy-900">Daily Session</h1>
          <p className="text-gray-500 text-sm mt-1">30-minute communication workout · {today}</p>
        </div>

        {allDone && (
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-white text-center mb-8">
            <CheckCircle size={48} className="mx-auto mb-4" />
            <h2 className="text-2xl font-black mb-2">Session Complete!</h2>
            <p className="text-white/80 mb-4">Excellent work. All 5 phases done.</p>
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-sm font-semibold mb-1">Real-World Mission:</p>
              <p className="text-sm">{dailyContent.mission.text}</p>
            </div>
          </div>
        )}

        {/* Phase tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {PHASE_META.map(p => (
            <button
              key={p.num}
              onClick={() => moveToPhase(p.num)}
              className={clsx(
                'shrink-0 flex flex-col items-center px-4 py-2 rounded-xl border text-xs font-medium transition-colors',
                activePhase === p.num ? 'bg-clinic-primary text-white border-clinic-primary'
                  : completedPhases.has(p.num) ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              )}
            >
              {completedPhases.has(p.num) ? <CheckCircle size={14} className="mb-0.5" /> : <span className="mb-0.5">{p.num}</span>}
              <span>{p.label}</span>
              <span className="text-[10px] opacity-60">{p.mins}m</span>
            </button>
          ))}
        </div>

        {/* Active phase */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-navy-900">Phase {activePhase}: {PHASE_META[activePhase - 1].label}</h2>
              <p className="text-sm text-gray-500">{PHASE_META[activePhase - 1].desc}</p>
            </div>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{PHASE_META[activePhase - 1].mins} min</span>
          </div>

          {/* Phase 1: Warm-up */}
          {activePhase === 1 && phaseState !== 'feedback' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-2">Today&apos;s Drill Sentence</p>
                <p className="text-xl font-bold text-navy-900 leading-relaxed">&ldquo;{dailyContent.warmup.sentence}&rdquo;</p>
                <p className="text-sm text-blue-700 mt-3">{dailyContent.warmup.instruction}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {dailyContent.warmup.focus.map(f => (
                    <span key={f} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">{f}</span>
                  ))}
                </div>
              </div>
              <VoiceRecorder onTranscript={setTranscript} maxSeconds={180} placeholder="Read the sentence aloud at 70% speed, then again at full speed..." />
              {transcript && (
                <button onClick={() => { setPhaseState('feedback'); getFeedback(transcript, 'warmup'); }} className="w-full bg-clinic-primary text-white font-semibold py-3 rounded-xl text-sm hover:bg-blue-800">Get Feedback</button>
              )}
            </div>
          )}

          {/* Phase 2: Thought Stream */}
          {activePhase === 2 && phaseState !== 'feedback' && (
            <div className="space-y-6">
              <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5">
                <p className="text-xs font-semibold text-purple-500 uppercase tracking-wide mb-2">Framework: {dailyContent.thoughtDrill.framework}</p>
                <p className="text-lg font-bold text-navy-900 mb-3">Topic: &ldquo;{dailyContent.thoughtDrill.topic}&rdquo;</p>
                <div className="flex gap-2 flex-wrap mb-3">
                  {dailyContent.thoughtDrill.frameworkSteps.map((step, i) => (
                    <span key={i} className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">{i + 1}. {step}</span>
                  ))}
                </div>
              </div>
              <details className="bg-gray-50 border border-gray-100 rounded-2xl">
                <summary className="px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer">See example</summary>
                <p className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">{dailyContent.thoughtDrill.example}</p>
              </details>
              <VoiceRecorder onTranscript={setTranscript} maxSeconds={dailyContent.thoughtDrill.timeSeconds + 30} placeholder="Follow the framework. End with a strong closing sentence." />
              {transcript && (
                <button onClick={() => { setPhaseState('feedback'); getFeedback(transcript, 'thought'); }} className="w-full bg-clinic-primary text-white font-semibold py-3 rounded-xl text-sm hover:bg-blue-800">Get Feedback</button>
              )}
            </div>
          )}

          {/* Phase 3: General Comms */}
          {activePhase === 3 && phaseState !== 'feedback' && (
            <GeneralCommsPhase
              scenario={dailyContent.generalComm}
              onComplete={(text) => { setTranscript(text); setPhaseState('feedback'); getFeedback(text, 'general'); }}
            />
          )}

          {/* Phase 4: Consultation */}
          {activePhase === 4 && phaseState !== 'feedback' && (
            <div>
              <div className="mb-4 bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-600 mb-1">Today&apos;s Patient</p>
                <p className="font-bold text-navy-900">{todayScenario.title}</p>
                <p className="text-sm text-amber-700 mt-1">{todayScenario.description}</p>
              </div>
              <div className="h-[500px] border border-gray-100 rounded-xl overflow-hidden">
                <AIPatientChat
                  scenario={todayScenario}
                  maxTurns={8}
                  onComplete={(text, _msgs) => {
                    setTranscript(text);
                    setPhaseState('feedback');
                    getFeedback(text, 'consultation');
                    setActivePhase(5);
                  }}
                />
              </div>
            </div>
          )}

          {/* Phase 5: Feedback */}
          {activePhase === 5 && (
            feedback ? (
              <div className="space-y-6">
                <ScoreDisplay feedback={feedback} onRedo={() => { setPhaseState('active'); setTranscript(''); setFeedback(null); }} onSavePhrase={handleSavePhrase} />
                {savedPhrases.length > 0 && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                    <p className="text-sm font-semibold text-emerald-800 mb-2">Saved to Phrase Bank ({savedPhrases.length})</p>
                  </div>
                )}
                <button onClick={completePhase} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl">
                  Complete Session ✓
                </button>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 text-sm">
                Complete Phase 4 (Consultation) to unlock your detailed feedback here.
              </div>
            )
          )}

          {/* Feedback panel for phases 1-3 */}
          {phaseState === 'feedback' && activePhase < 4 && (
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 size={32} className="animate-spin text-clinic-accent mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Analysing your response...</p>
                </div>
              ) : feedback ? (
                <>
                  <ScoreDisplay feedback={feedback} showFullScores={false} onRedo={() => { setPhaseState('active'); setTranscript(''); setFeedback(null); }} onSavePhrase={handleSavePhrase} />
                  <div className="flex gap-3">
                    <button onClick={() => { setPhaseState('active'); setTranscript(''); setFeedback(null); }} className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
                      <RefreshCw size={14} /> Redo
                    </button>
                    <button onClick={() => { completePhase(); goNext(); }} className="flex-1 flex items-center justify-center gap-2 bg-clinic-primary text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-blue-800">
                      Next Phase <ChevronRight size={16} />
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>

        <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target size={15} className="text-amber-600" />
            <span className="text-xs font-bold text-amber-800">Real-World Mission</span>
          </div>
          <p className="text-sm text-amber-900">{dailyContent.mission.text}</p>
        </div>
      </div>
    </AppShell>
  );
}

function GeneralCommsPhase({
  scenario,
  onComplete,
}: {
  scenario: { title: string; context: string; otherPerson: string; difficulty: number; systemPrompt: string };
  onComplete: (transcript: string) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: `*${scenario.context}*\n\n${scenario.otherPerson} is waiting.` },
  ]);
  const [currentMsg, setCurrentMsg] = useState('');
  const [gcLoading, setGcLoading] = useState(false);
  const allSpeech = messages.filter(m => m.role === 'user').map(m => m.content).join('\n\n');

  async function send() {
    if (!currentMsg.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: currentMsg };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setCurrentMsg('');
    setGcLoading(true);
    try {
      const res = await fetch('/api/patient-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs.map(m => ({ role: m.role, content: m.content })), generalCommSystemPrompt: scenario.systemPrompt }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } finally { setGcLoading(false); }
  }

  return (
    <div className="space-y-4">
      <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4">
        <p className="font-bold text-navy-900">{scenario.title}</p>
        <p className="text-sm text-teal-700 mt-1">{scenario.context}</p>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3 min-h-[200px] max-h-[280px] overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={clsx('text-sm rounded-xl px-3 py-2', m.role === 'user' ? 'bg-clinic-primary text-white ml-8' : 'bg-gray-50 text-gray-800 mr-8')}>
            <span className="text-xs font-semibold opacity-70 block mb-0.5">{m.role === 'user' ? 'You' : scenario.otherPerson}</span>
            {m.content}
          </div>
        ))}
        {gcLoading && <div className="text-gray-400 text-sm italic">Responding...</div>}
      </div>
      <VoiceRecorder onTranscript={setCurrentMsg} maxSeconds={60} placeholder="Speak your response..." />
      <div className="flex gap-2">
        {currentMsg && <button onClick={send} disabled={gcLoading} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50">Send</button>}
        {messages.length > 2 && <button onClick={() => onComplete(allSpeech)} className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-2.5 rounded-xl text-sm">Finish & Get Feedback</button>}
      </div>
    </div>
  );
}
