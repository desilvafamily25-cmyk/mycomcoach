export type ScenarioCategory =
  | 'weight-loss'
  | 'menopause'
  | 'skin-rash'
  | 'respiratory'
  | 'mental-health'
  | 'relationship'
  | 'difficult-patient'
  | 'bad-news'
  | 'general-comm';

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface ScoringCriteria {
  rapport: string;
  clarity: string;
  empathy: string;
  structure: string;
  safety: string;
  sharedDecision: string;
  teachBack: string;
  closing: string;
}

export interface Scenario {
  id: string;
  title: string;
  category: ScenarioCategory;
  difficulty: Difficulty;
  emoji: string;
  description: string;
  patientName: string;
  patientAge: number;
  patientPersonality: string;
  patientBackground: string;
  chiefComplaint: string;
  hiddenConcerns: string[];
  expectedSkills: string[];
  systemPrompt: string;
  openingLine: string;
  scoringFocus: string[];
  tips: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface SessionScore {
  rapport: number;
  clarity: number;
  empathy: number;
  structure: number;
  safety: number;
  sharedDecision: number;
  teachBack: number;
  closing: number;
  overall: number;
}

export interface FeedbackResult {
  scores: SessionScore;
  strongMoments: string[];
  weakMoments: string[];
  bestSentence: string;
  worstMoment: string;
  redoPrompt: string;
  suggestedPhrases: string[];
  summary: string;
  missedCues: string[];
  fillerWordCount: number;
  wordCount: number;
}

export interface DailyMission {
  id: string;
  text: string;
  category: string;
  completed?: boolean;
  date?: string;
}

export interface ThoughtDrill {
  topic: string;
  framework: string;
  frameworkSteps: string[];
  timeSeconds: number;
  example: string;
}

export interface WarmupDrill {
  sentence: string;
  instruction: string;
  focus: string[];
}

export interface GeneralCommScenario {
  id: string;
  title: string;
  context: string;
  otherPerson: string;
  difficulty: Difficulty;
  systemPrompt: string;
  scoringFocus: string[];
}

export type SessionPhase = 1 | 2 | 3 | 4 | 5;

export interface PhaseResult {
  phase: SessionPhase;
  completed: boolean;
  score?: number;
  transcript?: string;
  feedback?: string;
  duration?: number;
}

export interface DailySession {
  id: string;
  date: string;
  phases: PhaseResult[];
  totalScore?: number;
  missionText?: string;
  missionCompleted?: boolean;
}

export interface PhraseEntry {
  id: string;
  text: string;
  category: string;
  context: string;
  createdAt: string;
}

export interface WeeklyStats {
  avgScore: number;
  sessionsCompleted: number;
  topStrength: string;
  topWeakness: string;
  fillerTrend: number;
  streak: number;
}
