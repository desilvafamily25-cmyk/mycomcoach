import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { getScoreColor, getScoreLabel } from '@/lib/scoring';
import { clsx } from 'clsx';
import { BarChart2, TrendingUp, Stethoscope } from 'lucide-react';

export default async function ScoresPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: attempts } = await supabase
    .from('consultation_attempts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(14);

  type Attempt = { id: string; created_at: string; scenario_id: string; score_overall: number; score_empathy: number; score_clarity: number; score_rapport: number; score_structure: number; score_safety: number; ai_feedback: string };
  type Session = { date: string; total_score: number; phase_1_completed: boolean; phase_2_completed: boolean; phase_3_completed: boolean; phase_4_completed: boolean; phase_5_completed: boolean };

  const typedAttempts = (attempts ?? []) as Attempt[];
  const typedSessions = (sessions ?? []) as Session[];

  const avg = (field: keyof Attempt) =>
    typedAttempts.length > 0
      ? (typedAttempts.reduce((s, a) => s + ((a[field] as number) ?? 0), 0) / typedAttempts.length).toFixed(1)
      : '—';

  const dims = [
    { label: 'Rapport', key: 'score_rapport' as keyof Attempt },
    { label: 'Empathy', key: 'score_empathy' as keyof Attempt },
    { label: 'Clarity', key: 'score_clarity' as keyof Attempt },
    { label: 'Structure', key: 'score_structure' as keyof Attempt },
    { label: 'Safety', key: 'score_safety' as keyof Attempt },
  ];

  return (
    <AppShell>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-navy-900">My Progress</h1>
          <p className="text-gray-500 text-sm mt-1">{typedAttempts.length} consultations · {typedSessions.length} sessions</p>
        </div>

        {typedAttempts.length === 0 ? (
          <div className="text-center py-20">
            <BarChart2 size={48} className="text-gray-200 mx-auto mb-4" />
            <h3 className="font-bold text-gray-800 mb-2">No data yet</h3>
            <p className="text-gray-400 text-sm">Complete your first session to see scores here.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Avg Score', val: avg('score_overall'), color: getScoreColor(parseFloat(avg('score_overall') as string)) },
                { label: 'Avg Empathy', val: avg('score_empathy'), color: 'text-blue-600' },
                { label: 'Avg Clarity', val: avg('score_clarity'), color: 'text-teal-600' },
                { label: 'Consultations', val: String(typedAttempts.length), color: 'text-purple-600' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                  <p className={clsx('text-3xl font-black', s.color)}>{s.val}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-clinic-accent" />
                <h2 className="font-bold text-gray-800">Average by Dimension</h2>
              </div>
              {dims.map(d => {
                const val = parseFloat(avg(d.key) as string) || 0;
                return (
                  <div key={d.label} className="mb-4 last:mb-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 font-medium">{d.label}</span>
                      <span className={clsx('font-bold', getScoreColor(val))}>{val.toFixed(1)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={clsx('h-full rounded-full', { 'bg-emerald-500': val >= 8.5, 'bg-blue-500': val >= 7 && val < 8.5, 'bg-amber-400': val >= 5.5 && val < 7, 'bg-red-400': val < 5.5 })} style={{ width: `${Math.min(val * 10, 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Stethoscope size={16} className="text-clinic-accent" />
                <h2 className="font-bold text-gray-800">Recent Consultations</h2>
              </div>
              <div className="space-y-3">
                {typedAttempts.slice(0, 10).map((a, i) => (
                  <div key={i} className="border border-gray-50 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{a.scenario_id}</p>
                        <p className="text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={clsx('text-xl font-black', getScoreColor(a.score_overall))}>{a.score_overall}</p>
                        <p className={clsx('text-xs', getScoreColor(a.score_overall))}>{getScoreLabel(a.score_overall)}</p>
                      </div>
                    </div>
                    {a.ai_feedback && <p className="text-xs text-gray-500 italic line-clamp-2">{a.ai_feedback}</p>}
                    <div className="flex gap-2 mt-2">
                      {[['E', a.score_empathy], ['C', a.score_clarity], ['R', a.score_rapport], ['S', a.score_safety]].map(([l, sc]) => (
                        <span key={l as string} className={clsx('text-xs px-2 py-0.5 rounded-full border font-medium', (sc as number) >= 8 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : (sc as number) >= 6 ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-amber-50 border-amber-200 text-amber-700')}>
                          {l}: {sc}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
