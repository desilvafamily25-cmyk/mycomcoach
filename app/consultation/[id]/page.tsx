'use client';

import { use, useState } from 'react';
import { notFound } from 'next/navigation';
import { getScenarioById } from '@/lib/scenarios';
import AppShell from '@/components/AppShell';
import AIPatientChat from '@/components/AIPatientChat';
import ScoreDisplay from '@/components/ScoreDisplay';
import { createClient } from '@/lib/supabase/client';
import type { ChatMessage, FeedbackResult } from '@/types';
import { ArrowLeft, Loader2, Info, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ConsultationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const scenarioOrUndefined = getScenarioById(id);

  const [phase, setPhase] = useState<'brief' | 'consultation' | 'feedback'>('brief');
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedPhrases, setSavedPhrases] = useState<string[]>([]);

  if (!scenarioOrUndefined) notFound();
  const scenario = scenarioOrUndefined!;

  async function handleComplete(transcript: string, _messages: ChatMessage[]) {
    setPhase('feedback');
    setLoading(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, scenarioId: scenario.id, phaseType: 'consultation' }),
      });
      const data = await res.json();
      if (data.scores) {
        setFeedback(data);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('consultation_attempts').insert({
            user_id: user.id,
            scenario_id: scenario.id,
            transcript,
            score_rapport: data.scores.rapport,
            score_clarity: data.scores.clarity,
            score_empathy: data.scores.empathy,
            score_structure: data.scores.structure,
            score_safety: data.scores.safety,
            score_overall: data.scores.overall,
            ai_feedback: data.summary,
            strong_moments: data.strongMoments,
            weak_moments: data.weakMoments,
          });
        }
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleSavePhrase(phrase: string) {
    setSavedPhrases(prev => [...prev, phrase]);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('phrases').insert({ user_id: user.id, text: phrase, category: scenario.category, context: scenario.title });
    }
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto p-6">
        <Link href="/consultation" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
          <ArrowLeft size={16} /> All Scenarios
        </Link>

        <div className="flex items-start gap-4 mb-6">
          <span className="text-4xl">{scenario.emoji}</span>
          <div>
            <h1 className="text-2xl font-black text-navy-900">{scenario.title}</h1>
            <p className="text-gray-500 text-sm mt-1">{scenario.description}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs bg-red-50 border border-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                Difficulty: {'★'.repeat(scenario.difficulty)}{'☆'.repeat(5 - scenario.difficulty)}
              </span>
              <span className="text-xs text-gray-400">{scenario.patientName}, {scenario.patientAge}yo</span>
            </div>
          </div>
        </div>

        {phase === 'brief' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-navy-900 mb-4 flex items-center gap-2"><Info size={16} className="text-clinic-accent" />Patient Brief</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Patient</p>
                  <p className="text-sm text-gray-800">{scenario.patientName}, {scenario.patientAge} years old</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Chief Complaint</p>
                  <p className="text-sm text-gray-800">{scenario.chiefComplaint}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Background</p>
                  <p className="text-sm text-gray-800 leading-relaxed">{scenario.patientBackground}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-2">Skills Trained</p>
              <div className="flex flex-wrap gap-2">
                {scenario.expectedSkills.map(skill => (
                  <span key={skill} className="text-xs bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-medium">{skill}</span>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-3">Clinical Tips</p>
              <ul className="space-y-2">
                {scenario.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                    <span className="text-amber-400 mt-0.5">•</span>{tip}
                  </li>
                ))}
              </ul>
            </div>

            <button onClick={() => setPhase('consultation')} className="w-full bg-clinic-primary hover:bg-blue-800 text-white font-bold py-4 rounded-2xl text-base transition-colors">
              Begin Consultation →
            </button>
            <p className="text-center text-xs text-gray-400">The patient will speak first. Respond by voice.</p>
          </div>
        )}

        {phase === 'consultation' && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden" style={{ height: '70vh' }}>
            <AIPatientChat scenario={scenario} maxTurns={10} onComplete={handleComplete} />
          </div>
        )}

        {phase === 'feedback' && (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle size={20} className="text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold text-emerald-800 text-sm">Consultation Complete</p>
                <p className="text-xs text-emerald-600">{scenario.title} · {scenario.patientName}</p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <Loader2 size={36} className="animate-spin text-clinic-accent mx-auto mb-4" />
                <p className="text-gray-500">Analysing your consultation...</p>
                <p className="text-xs text-gray-400 mt-1">About 15 seconds</p>
              </div>
            ) : feedback ? (
              <ScoreDisplay feedback={feedback} onRedo={() => setPhase('consultation')} onSavePhrase={handleSavePhrase} />
            ) : null}

            {savedPhrases.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                <p className="text-sm font-bold text-emerald-800 mb-2">Saved to Phrase Bank</p>
                {savedPhrases.map((p, i) => <p key={i} className="text-sm text-emerald-700 italic">&ldquo;{p}&rdquo;</p>)}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setPhase('brief'); setFeedback(null); setSavedPhrases([]); }} className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-xl">
                Try Again
              </button>
              <Link href="/consultation" className="flex-1 text-center bg-clinic-primary hover:bg-blue-800 text-white font-semibold py-3 rounded-xl">
                Next Scenario
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
