-- SpeakClinic Coach — Supabase Schema
-- Run this in your Supabase SQL editor

-- Enable RLS
alter table if exists public.sessions enable row level security;
alter table if exists public.consultation_attempts enable row level security;
alter table if exists public.phrases enable row level security;
alter table if exists public.daily_missions enable row level security;

-- ── SESSIONS ─────────────────────────────────────────────────────

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  phase_1_completed boolean default false,
  phase_2_completed boolean default false,
  phase_3_completed boolean default false,
  phase_4_completed boolean default false,
  phase_5_completed boolean default false,
  total_score numeric(4,1),
  mission_text text,
  mission_completed boolean default false,
  created_at timestamptz default now(),
  unique(user_id, date)
);

create index if not exists sessions_user_date on public.sessions(user_id, date desc);

create policy "Users can manage their own sessions"
  on public.sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── CONSULTATION ATTEMPTS ────────────────────────────────────────

create table if not exists public.consultation_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  session_id uuid references public.sessions(id) on delete set null,
  scenario_id text not null,
  transcript text,
  score_rapport numeric(3,1),
  score_clarity numeric(3,1),
  score_empathy numeric(3,1),
  score_structure numeric(3,1),
  score_safety numeric(3,1),
  score_shared_decision numeric(3,1),
  score_teach_back numeric(3,1),
  score_closing numeric(3,1),
  score_overall numeric(3,1),
  ai_feedback text,
  strong_moments text[],
  weak_moments text[],
  missed_cues text[],
  phrases_saved text[],
  filler_word_count integer,
  word_count integer,
  created_at timestamptz default now()
);

create index if not exists consultation_attempts_user on public.consultation_attempts(user_id, created_at desc);
create index if not exists consultation_attempts_scenario on public.consultation_attempts(scenario_id);

create policy "Users can manage their own consultation attempts"
  on public.consultation_attempts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── PHRASE BANK ──────────────────────────────────────────────────

create table if not exists public.phrases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  text text not null,
  category text default 'general',
  context text,
  created_at timestamptz default now()
);

create index if not exists phrases_user on public.phrases(user_id, created_at desc);

create policy "Users can manage their own phrases"
  on public.phrases for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── DAILY MISSIONS ───────────────────────────────────────────────

create table if not exists public.daily_missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  mission_text text not null,
  category text,
  completed boolean default false,
  created_at timestamptz default now(),
  unique(user_id, date)
);

create policy "Users can manage their own daily missions"
  on public.daily_missions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── SAMPLE DATA (optional, for testing) ─────────────────────────
-- You can run the above without the sample data.
-- Insert test phrases for a specific user:
-- insert into public.phrases (user_id, text, category, context)
-- values ('<your-user-id>', 'This is not about willpower — it is about biology.', 'weight-loss', 'Weight loss consultation');
