import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { Mic2, Stethoscope, ArrowRight, Target, Flame, Star, Clock } from 'lucide-react';
import { getDailyContent } from '@/lib/scenarios';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    redirect('/login');
  }

  const user = session!.user;
  const today = new Date().toISOString().split('T')[0];
  const dailyContent = getDailyContent(today);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const safeQuery = async <T,>(query: any, fallback: T): Promise<T> => {
    try {
      const result = await query;
      return (result?.data ?? fallback) as T;
    } catch {
      return fallback;
    }
  };

  const [todaySession, recentSessions] = await Promise.all([
    safeQuery(supabase.from('sessions').select('*').eq('user_id', user.id).eq('date', today).single(), null),
    safeQuery(supabase.from('sessions').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(7), []),
  ]);

  const sessions = (recentSessions as Array<{ date: string; total_score?: number }> | null) ?? [];
  const streak = sessions.length;
  const avgScore = sessions.length > 0
    ? Math.round(sessions.reduce((s: number, r: { total_score?: number }) => s + (r.total_score ?? 0), 0) / sessions.length)
    : 0;

  const completedPhases = todaySession
    ? [1, 2, 3, 4, 5].filter(p => (todaySession as Record<string, unknown>)[`phase_${p}_completed`]).length
    : 0;
  const sessionProgress = Math.round((completedPhases / 5) * 100);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    return {
      day: dayNames[d.getDay()],
      active: sessions.some((s: { date: string }) => s.date === dateStr),
    };
  });

  return (
    <AppShell>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-navy-900">
            {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            {today} · Your daily training session {todaySession ? 'is in progress' : 'is ready to begin'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <Flame size={22} className="text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-black text-navy-900">{streak}</p>
            <p className="text-xs text-gray-500 mt-0.5">Day streak</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <Star size={22} className="text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-black text-navy-900">{avgScore || '—'}</p>
            <p className="text-xs text-gray-500 mt-0.5">Avg score</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <Clock size={22} className="text-clinic-accent mx-auto mb-2" />
            <p className="text-2xl font-black text-navy-900">{completedPhases}/5</p>
            <p className="text-xs text-gray-500 mt-0.5">Today&apos;s phases</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">This week</p>
          <div className="flex gap-2">
            {last7.map((d, i) => (
              <div key={i} className="flex-1 text-center">
                <div className={`w-full aspect-square rounded-lg mb-1 ${d.active ? 'bg-clinic-accent' : 'bg-gray-100'}`} />
                <span className="text-[10px] text-gray-400">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">Today&apos;s session</p>
            <span className="text-sm font-bold text-clinic-accent">{sessionProgress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-clinic-accent rounded-full transition-all" style={{ width: `${sessionProgress}%` }} />
          </div>
          <div className="flex gap-2">
            {['Warm-up', 'Thought', 'Comms', 'Consult', 'Feedback'].map((phase, i) => {
              const done = i < completedPhases;
              return (
                <div key={i} className="flex-1 text-center">
                  <div className={`text-xs py-1 rounded-lg font-medium ${done ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-50 text-gray-400'}`}>
                    {done ? '✓' : i + 1}
                  </div>
                  <p className="text-[9px] text-gray-400 mt-1">{phase}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Link href="/daily" className="group bg-gradient-to-br from-clinic-primary to-blue-800 text-white rounded-2xl p-6 hover:shadow-lg hover:shadow-blue-900/20 transition-all">
            <Mic2 size={28} className="mb-4 text-clinic-accent" />
            <h3 className="font-black text-lg mb-1">Daily Communication</h3>
            <p className="text-white/60 text-sm mb-4">30-minute structured workout</p>
            <div className="flex items-center gap-2 text-sm font-semibold text-clinic-accent group-hover:gap-3 transition-all">
              {sessionProgress > 0 ? 'Continue session' : 'Start today\'s session'}
              <ArrowRight size={16} />
            </div>
          </Link>
          <Link href="/consultation" className="group bg-gradient-to-br from-clinic-teal to-teal-700 text-white rounded-2xl p-6 hover:shadow-lg hover:shadow-teal-900/20 transition-all">
            <Stethoscope size={28} className="mb-4 text-teal-300" />
            <h3 className="font-black text-lg mb-1">Patient Consultation</h3>
            <p className="text-white/60 text-sm mb-4">12 AI patient simulations</p>
            <div className="flex items-center gap-2 text-sm font-semibold text-teal-300 group-hover:gap-3 transition-all">
              Choose a scenario
              <ArrowRight size={16} />
            </div>
          </Link>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} className="text-amber-600" />
            <span className="text-sm font-bold text-amber-800">Today&apos;s Real-World Mission</span>
          </div>
          <p className="text-amber-900 text-sm leading-relaxed">{dailyContent.mission.text}</p>
        </div>
      </div>
    </AppShell>
  );
}
