import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Mic2, Stethoscope, BarChart2, BookOpen, CheckCircle, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

const features = [
  {
    icon: Mic2,
    title: 'Voice-First Training',
    desc: 'Every session is spoken out loud. Your articulation, pace, filler words, and tone are all tracked.',
  },
  {
    icon: Stethoscope,
    title: 'AI Patient Simulator',
    desc: 'GPT-4 plays real patients — anxious, angry, demanding, emotional. They respond, interrupt, and push back.',
  },
  {
    icon: BarChart2,
    title: 'Performance Scored',
    desc: 'Every consultation is scored on rapport, empathy, structure, safety, teach-back, and closing.',
  },
  {
    icon: BookOpen,
    title: 'Your Phrase Bank',
    desc: 'Build a personal library of your best clinical phrases. Save the lines that work.',
  },
];

const pillars = [
  { label: 'Warm-up', mins: '3 min', desc: 'Voice and articulation drill' },
  { label: 'Thought Stream', mins: '5 min', desc: 'Structured speaking framework' },
  { label: 'General Comms', mins: '7 min', desc: 'Everyday role-play' },
  { label: 'Consultation Sim', mins: '12 min', desc: 'AI patient interaction' },
  { label: 'Feedback + Redo', mins: '3 min', desc: 'Score + targeted repeat' },
];

const scenarioCategories = [
  { emoji: '💉', label: 'Weight Loss' },
  { emoji: '🌡️', label: 'Menopause' },
  { emoji: '😔', label: 'Mental Health' },
  { emoji: '🤒', label: 'Respiratory' },
  { emoji: '🧴', label: 'Skin & Rash' },
  { emoji: '⚠️', label: 'Difficult Patients' },
  { emoji: '📋', label: 'Breaking Bad News' },
  { emoji: '👫', label: 'Relationship' },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) redirect('/dashboard');
  return (
    <main className="min-h-screen bg-navy-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-clinic-accent flex items-center justify-center">
              <Mic2 size={18} />
            </div>
            <span className="font-bold text-lg">SpeakClinic Coach</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-clinic-accent hover:bg-sky-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-white/70 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Built for GPs. Tested in real consultations.
          </div>

          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
            Practise the conversation{' '}
            <span className="text-clinic-accent">before it matters.</span>
          </h1>

          <p className="text-lg text-white/60 mb-10 leading-relaxed max-w-2xl mx-auto">
            A 30-minute daily communication gym for doctors. AI patient simulations, structured
            voice drills, performance scoring, and a personal phrase bank — built around real
            GP consultations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="flex items-center justify-center gap-2 bg-clinic-accent hover:bg-sky-400 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all shadow-lg shadow-sky-500/25"
            >
              Start Your Daily Session
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-white/80 hover:text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Daily 30-min structure */}
      <section className="px-6 py-16 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-3">Your Daily 30-Minute Workout</h2>
          <p className="text-center text-white/50 mb-12">Five phases. Every day. Deliberate practice.</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {pillars.map((p, i) => (
              <div key={i} className="bg-white/10 border border-white/10 rounded-2xl p-4 text-center">
                <div className="w-8 h-8 rounded-full bg-clinic-accent/20 text-clinic-accent text-sm font-bold flex items-center justify-center mx-auto mb-3">
                  {i + 1}
                </div>
                <p className="font-bold text-sm mb-1">{p.label}</p>
                <p className="text-clinic-accent text-xs font-semibold mb-1">{p.mins}</p>
                <p className="text-white/40 text-xs">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12">Not a learning app. A training gym.</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-clinic-accent/20 flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-clinic-accent" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation scenarios */}
      <section className="px-6 py-16 bg-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-black mb-3">Real GP Consultation Types</h2>
          <p className="text-white/50 mb-10">20 simulation scenarios. 5 difficulty levels. Real patient behaviour.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {scenarioCategories.map((s, i) => (
              <span
                key={i}
                className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm"
              >
                <span>{s.emoji}</span>
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof / value */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-clinic-primary to-blue-900 rounded-3xl p-8 text-center">
            <h2 className="text-2xl font-black mb-4">Start with just two buttons.</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-8 mt-6">
              <div className="bg-white/10 rounded-2xl p-5">
                <Mic2 size={28} className="mx-auto mb-3 text-clinic-accent" />
                <p className="font-bold">Daily Communication Practice</p>
                <p className="text-sm text-white/50 mt-1">Articulation, structure, confidence</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-5">
                <Stethoscope size={28} className="mx-auto mb-3 text-clinic-accent" />
                <p className="font-bold">Patient Consultation Practice</p>
                <p className="text-sm text-white/50 mt-1">20 clinical scenarios, AI patients</p>
              </div>
            </div>

            <ul className="text-sm text-white/60 space-y-2 mb-8 text-left max-w-sm mx-auto">
              {[
                'Scored on Calgary-Cambridge criteria',
                'Motivational interviewing trained',
                'Teach-back tracked automatically',
                'Personal phrase bank built over time',
                'Daily real-world missions',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-white text-clinic-primary font-bold px-8 py-4 rounded-2xl text-base hover:bg-gray-50 transition-colors"
            >
              Start Today — Free
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-white/30">
        <p>SpeakClinic Coach — The consultation simulator for better doctors.</p>
      </footer>
    </main>
  );
}
