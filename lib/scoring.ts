import type { SessionScore, FeedbackResult } from '@/types';

export function parseScoresFromText(text: string): Partial<SessionScore> {
  const scores: Partial<SessionScore> = {};
  const patterns: [keyof SessionScore, RegExp][] = [
    ['rapport', /rapport[:\s]+(\d+)/i],
    ['clarity', /clarity[:\s]+(\d+)/i],
    ['empathy', /empathy[:\s]+(\d+)/i],
    ['structure', /structure[:\s]+(\d+)/i],
    ['safety', /safety[:\s]+(\d+)/i],
    ['sharedDecision', /shared\s*decision[:\s]+(\d+)/i],
    ['teachBack', /teach[\s-]*back[:\s]+(\d+)/i],
    ['closing', /closing[:\s]+(\d+)/i],
    ['overall', /overall[:\s]+(\d+)/i],
  ];
  for (const [key, pattern] of patterns) {
    const match = text.match(pattern);
    if (match) scores[key] = parseInt(match[1]);
  }
  return scores;
}

export function calculateOverall(scores: Omit<SessionScore, 'overall'>): number {
  const weights = {
    rapport: 0.15,
    clarity: 0.15,
    empathy: 0.20,
    structure: 0.10,
    safety: 0.15,
    sharedDecision: 0.10,
    teachBack: 0.10,
    closing: 0.05,
  };
  let total = 0;
  let weightSum = 0;
  for (const [key, weight] of Object.entries(weights)) {
    const score = scores[key as keyof typeof scores];
    if (score !== undefined) {
      total += score * weight;
      weightSum += weight;
    }
  }
  return weightSum > 0 ? Math.round(total / weightSum * 10) / 10 : 0;
}

export function getScoreLabel(score: number): string {
  if (score >= 8.5) return 'Excellent';
  if (score >= 7) return 'Good';
  if (score >= 5.5) return 'Developing';
  if (score >= 4) return 'Needs Work';
  return 'Practice More';
}

export function getScoreColor(score: number): string {
  if (score >= 8.5) return 'text-emerald-600';
  if (score >= 7) return 'text-blue-600';
  if (score >= 5.5) return 'text-amber-600';
  return 'text-red-500';
}

export function getScoreBg(score: number): string {
  if (score >= 8.5) return 'bg-emerald-50 border-emerald-200';
  if (score >= 7) return 'bg-blue-50 border-blue-200';
  if (score >= 5.5) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

export function countFillerWords(transcript: string): number {
  const fillers = /\b(um|uh|like|you know|sort of|kind of|basically|actually|literally|right\?|yeah|okay so)\b/gi;
  return (transcript.match(fillers) || []).length;
}

export function mockFeedback(transcript: string, scenarioTitle: string): FeedbackResult {
  const fillerCount = countFillerWords(transcript);
  const wordCount = transcript.split(/\s+/).filter(Boolean).length;
  return {
    scores: {
      rapport: 7,
      clarity: 6.5,
      empathy: 7.5,
      structure: 6,
      safety: 8,
      sharedDecision: 6.5,
      teachBack: 5,
      closing: 7,
      overall: 6.8,
    },
    strongMoments: [
      'You validated the patient\'s concern without dismissing it.',
      'Your explanation was jargon-free and patient-friendly.',
    ],
    weakMoments: [
      'You moved to treatment options before fully exploring the patient\'s ideas and concerns.',
      'The closing was vague — no clear next step was given.',
    ],
    bestSentence: transcript.split('.')[0] + '.',
    worstMoment: 'When you said "let me just explain the treatment" before checking understanding.',
    redoPrompt: 'Redo from the moment the patient became defensive. Focus on validation first.',
    suggestedPhrases: [
      'That\'s a really important question — let me answer it carefully.',
      'Before I explain what I\'d recommend, can I check — what matters most to you right now?',
      'Just so I know I\'ve explained this clearly — could you tell me what the main plan is in your own words?',
    ],
    summary: `This was a solid first attempt on ${scenarioTitle}. Your empathy was your strongest quality. Work on structure and closing clarity.`,
    missedCues: ['Patient mentioned worry about cost — not followed up.'],
    fillerWordCount: fillerCount,
    wordCount,
  };
}
