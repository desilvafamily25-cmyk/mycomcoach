'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import AppShell from '@/components/AppShell';
import { BookOpen, Plus, Trash2, Search, Copy, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface Phrase { id: string; text: string; category: string; context: string; created_at: string; }

const STARTER_PHRASES = [
  { text: "This is not about willpower. It's about biology, environment, hormones, sleep, stress, and habits.", category: 'weight-loss', context: 'Weight loss' },
  { text: "You are not imagining this. Hormonal change can affect sleep, mood, temperature control, weight, and confidence.", category: 'menopause', context: 'Menopause' },
  { text: "The safest treatment is not always the strongest-sounding treatment.", category: 'respiratory', context: 'Antibiotic discussion' },
  { text: "Before I tell you what I think, I want to make sure I understand what matters most to you.", category: 'general', context: 'Agenda setting' },
  { text: "Just so I know I explained it clearly — can you tell me in your own words what the plan is?", category: 'general', context: 'Teach-back' },
  { text: "Thank you for telling me. It takes courage to bring this up.", category: 'mental-health', context: 'Sensitive disclosure' },
  { text: "If any of these symptoms happen before we next meet, I want you to call us straight away.", category: 'general', context: 'Safety-netting' },
];

const CAT_COLORS: Record<string, string> = {
  'weight-loss': 'bg-green-50 text-green-700 border-green-200',
  'menopause': 'bg-pink-50 text-pink-700 border-pink-200',
  'mental-health': 'bg-purple-50 text-purple-700 border-purple-200',
  'respiratory': 'bg-blue-50 text-blue-700 border-blue-200',
  'difficult-patient': 'bg-red-50 text-red-700 border-red-200',
  'general': 'bg-gray-50 text-gray-700 border-gray-200',
  'consultation': 'bg-teal-50 text-teal-700 border-teal-200',
};

export default function PhrasesPage() {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [newContext, setNewContext] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => { loadPhrases(); }, []);

  async function loadPhrases() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('phrases').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setPhrases(data ?? []);
    setLoading(false);
  }

  async function addPhrase() {
    if (!newText.trim()) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('phrases').insert({ user_id: user.id, text: newText.trim(), category: newCategory, context: newContext.trim() || 'General' }).select().single();
    if (data) setPhrases(prev => [data, ...prev]);
    setNewText(''); setNewContext(''); setShowForm(false);
  }

  async function addStarter(s: typeof STARTER_PHRASES[0]) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('phrases').insert({ user_id: user.id, text: s.text, category: s.category, context: s.context }).select().single();
    if (data) setPhrases(prev => [data, ...prev]);
  }

  async function deletePhrase(id: string) {
    const supabase = createClient();
    await supabase.from('phrases').delete().eq('id', id);
    setPhrases(prev => prev.filter(p => p.id !== id));
  }

  async function copy(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const filtered = phrases.filter(p =>
    p.text.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-navy-900">Phrase Bank</h1>
          <p className="text-gray-500 text-sm mt-1">Your personal library of clinical phrases.</p>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search phrases..." className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-clinic-accent" />
          </div>
          <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 bg-clinic-primary hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold">
            <Plus size={16} /> Add
          </button>
        </div>

        {showForm && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-6 space-y-4">
            <h3 className="font-bold text-gray-800">Add a Phrase</h3>
            <textarea value={newText} onChange={e => setNewText(e.target.value)} placeholder="Enter your phrase..." rows={3} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-clinic-accent resize-none" />
            <div className="grid grid-cols-2 gap-3">
              <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clinic-accent">
                {['general', 'weight-loss', 'menopause', 'mental-health', 'respiratory', 'difficult-patient', 'consultation'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input value={newContext} onChange={e => setNewContext(e.target.value)} placeholder="Context" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clinic-accent" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={addPhrase} disabled={!newText.trim()} className="flex-1 bg-clinic-primary hover:bg-blue-800 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold">Save</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : phrases.length === 0 ? (
          <div className="space-y-6">
            <div className="text-center py-8">
              <BookOpen size={40} className="text-gray-200 mx-auto mb-3" />
              <h3 className="font-bold text-gray-700 mb-2">Your phrase bank is empty</h3>
              <p className="text-sm text-gray-400">Start with these recommended phrases:</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 space-y-3">
              {STARTER_PHRASES.map((p, i) => (
                <div key={i} className="bg-white border border-amber-100 rounded-xl p-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-800 italic mb-1">&ldquo;{p.text}&rdquo;</p>
                    <span className="text-xs text-amber-600">{p.context}</span>
                  </div>
                  <button onClick={() => addStarter(p)} className="shrink-0 text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full hover:bg-amber-200 font-medium">Add</button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(phrase => (
              <div key={phrase.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm group">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-gray-800 leading-relaxed italic flex-1">&ldquo;{phrase.text}&rdquo;</p>
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => copy(phrase.text, phrase.id)} className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600">
                      {copied === phrase.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                    <button onClick={() => deletePhrase(phrase.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full border font-medium', CAT_COLORS[phrase.category] ?? 'bg-gray-50 text-gray-600 border-gray-200')}>{phrase.category}</span>
                  {phrase.context && <span className="text-xs text-gray-400">{phrase.context}</span>}
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">No phrases matching &ldquo;{search}&rdquo;</div>}
          </div>
        )}
      </div>
    </AppShell>
  );
}
