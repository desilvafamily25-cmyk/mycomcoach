'use client';

import { getScoreColor, getScoreLabel } from '@/lib/scoring';
import type { FeedbackResult } from '@/types';
import { CheckCircle, AlertCircle, RefreshCw, Lightbulb, Star } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
  feedback: FeedbackResult;
  onRedo?: () => void;
  onSavePhrase?: (phrase: string) => void;
  showFullScores?: boolean;
}

const SCORE_LABELS: { key: keyof FeedbackResult['scores']; label: string }[] = [
  { key: 'rapport', label: 'Rapport' },
  { key: 'empathy', label: 'Empathy' },
  { key: 'clarity', label: 'Clarity' },
  { key: 'structure', label: 'Structure' },
  { key: 'safety', label: 'Safety' },
  { key: 'sharedDecision', label: 'Shared Decision' },
  { key: 'teachBack', label: 'Teach-back' },
  { key: 'closing', label: 'Closing' },
];

function ScoreBar({ value, label }: { value: number; label: string }) {
  const pct = Math.min(Math.max(value * 10, 0), 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className={clsx('font-bold', getScoreColor(value))}>{value}/10</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-700', {
            'bg-emerald-500': value >= 8.5,
            'bg-blue-500': value >= 7 && value < 8.5,
            'bg-amber-400': value >= 5.5 && value < 7,
            'bg-red-400': value < 5.5,
          })}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function ScoreDisplay({ feedback, onRedo, onSavePhrase, showFullScores = true }: Props) {
  const overall = feedback.scores.overall;

  return (
    <div className="space-y-6">
      {/* Overall score */}
      <div className="text-center py-6 bg-gradient-to-br from-navy-900 to-blue-900 rounded-2xl text-white">
        <p className="text-sm font-medium text-white/60 mb-1">Overall Score</p>
        <p className={clsx('text-6xl font-black mb-1', overall >= 7 ? 'text-emerald-400' : overall >= 5.5 ? 'text-amber-400' : 'text-red-400')}>
          {overall}
        </p>
        <p className="text-white/80 text-sm font-semibold">{getScoreLabel(overall)}</p>
        <div className="flex justify-center gap-6 mt-4 text-xs text-white/50">
          <span>{feedback.wordCount} words</span>
          <span>{feedback.fillerWordCount} filler words</span>
        </div>
      </div>

      {/* Score grid */}
      {showFullScores && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Detailed Scores</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SCORE_LABELS.map(({ key, label }) => {
              const val = feedback.scores[key];
              if (val === undefined) return null;
              return <ScoreBar key={key} value={val} label={label} />;
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <p className="text-blue-900 leading-relaxed text-sm">{feedback.summary}</p>
      </div>

      {/* Strong / Weak moments */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={16} className="text-emerald-600" />
            <h4 className="font-semibold text-emerald-800 text-sm">Strong Moments</h4>
          </div>
          <ul className="space-y-2">
            {feedback.strongMoments.map((m, i) => (
              <li key={i} className="text-sm text-emerald-700 flex items-start gap-2">
                <span className="mt-0.5 shrink-0">•</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-red-600" />
            <h4 className="font-semibold text-red-800 text-sm">Areas to Improve</h4>
          </div>
          <ul className="space-y-2">
            {feedback.weakMoments.map((m, i) => (
              <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                <span className="mt-0.5 shrink-0">•</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Best sentence */}
      {feedback.bestSentence && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star size={15} className="text-amber-500 fill-amber-500" />
            <span className="text-sm font-semibold text-amber-800">Your Best Sentence</span>
          </div>
          <p className="text-sm text-amber-900 italic">&ldquo;{feedback.bestSentence}&rdquo;</p>
        </div>
      )}

      {/* Suggested phrases */}
      {feedback.suggestedPhrases?.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={16} className="text-clinic-accent" />
            <h4 className="font-semibold text-gray-800 text-sm">Phrases to Try Next Time</h4>
          </div>
          <ul className="space-y-2">
            {feedback.suggestedPhrases.map((phrase, i) => (
              <li key={i} className="flex items-start justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                <p className="text-sm text-gray-700 italic">&ldquo;{phrase}&rdquo;</p>
                {onSavePhrase && (
                  <button
                    onClick={() => onSavePhrase(phrase)}
                    className="shrink-0 text-xs text-clinic-accent hover:text-blue-700 font-medium"
                  >
                    Save
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missed cues */}
      {feedback.missedCues?.length > 0 && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
          <h4 className="text-sm font-semibold text-orange-800 mb-2">Missed Patient Cues</h4>
          <ul className="space-y-1">
            {feedback.missedCues.map((cue, i) => (
              <li key={i} className="text-sm text-orange-700">• {cue}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Redo button */}
      {onRedo && feedback.redoPrompt && (
        <div className="bg-navy-900 rounded-2xl p-5 text-white">
          <p className="text-sm text-white/60 mb-2">Targeted Practice</p>
          <p className="text-sm mb-4">{feedback.redoPrompt}</p>
          <button
            onClick={onRedo}
            className="flex items-center gap-2 bg-clinic-accent hover:bg-sky-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <RefreshCw size={15} />
            Redo This Section
          </button>
        </div>
      )}
    </div>
  );
}
