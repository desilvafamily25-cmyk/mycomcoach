import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { CONSULTATION_SCENARIOS } from '@/lib/scenarios';
import { clsx } from 'clsx';

const CATEGORY_LABELS: Record<string, string> = {
  'weight-loss': 'Weight Loss', 'menopause': 'Menopause', 'skin-rash': 'Skin & Rash',
  'respiratory': 'Respiratory', 'mental-health': 'Mental Health', 'relationship': 'Relationship',
  'difficult-patient': 'Difficult Patients', 'bad-news': 'Breaking Bad News',
};

const CATEGORY_COLORS: Record<string, string> = {
  'weight-loss': 'bg-green-50 border-green-200 text-green-700',
  'menopause': 'bg-pink-50 border-pink-200 text-pink-700',
  'skin-rash': 'bg-orange-50 border-orange-200 text-orange-700',
  'respiratory': 'bg-blue-50 border-blue-200 text-blue-700',
  'mental-health': 'bg-purple-50 border-purple-200 text-purple-700',
  'relationship': 'bg-rose-50 border-rose-200 text-rose-700',
  'difficult-patient': 'bg-red-50 border-red-200 text-red-700',
  'bad-news': 'bg-gray-50 border-gray-200 text-gray-700',
};

const categories = [...new Set(CONSULTATION_SCENARIOS.map(s => s.category))];

export default function ConsultationPage() {
  return (
    <AppShell>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-navy-900">Patient Consultation Simulator</h1>
          <p className="text-gray-500 text-sm mt-1">{CONSULTATION_SCENARIOS.length} scenarios · AI patients scored on Calgary-Cambridge criteria</p>
        </div>

        <div className="bg-clinic-primary/5 border border-clinic-primary/20 rounded-2xl p-4 mb-8">
          <p className="text-sm text-clinic-primary font-medium">
            Scored on <strong>rapport, empathy, clarity, structure, safety, shared decision-making, teach-back, and closing.</strong>
          </p>
        </div>

        {categories.map(cat => {
          const scenarios = CONSULTATION_SCENARIOS.filter(s => s.category === cat);
          return (
            <section key={cat} className="mb-10">
              <h2 className="text-base font-black text-navy-900 mb-4 flex items-center gap-2">
                <span>{scenarios[0]?.emoji}</span>
                {CATEGORY_LABELS[cat] ?? cat}
                <span className="text-xs font-normal text-gray-400">({scenarios.length})</span>
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {scenarios.map(s => (
                  <Link key={s.id} href={`/consultation/${s.id}`} className="group bg-white border border-gray-100 rounded-2xl p-5 hover:border-clinic-accent hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl">{s.emoji}</span>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(i => <div key={i} className={clsx('w-1.5 h-1.5 rounded-full', i <= s.difficulty ? 'bg-clinic-primary' : 'bg-gray-200')} />)}
                      </div>
                    </div>
                    <h3 className="font-bold text-navy-900 text-sm mb-1 group-hover:text-clinic-primary transition-colors">{s.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{s.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full border font-medium', CATEGORY_COLORS[s.category])}>{CATEGORY_LABELS[s.category]}</span>
                      <span className="text-xs text-gray-400">{s.patientName}, {s.patientAge}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}
