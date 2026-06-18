'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { Mic2, LayoutDashboard, Stethoscope, BarChart2, BookOpen, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/daily', label: 'Daily Session', icon: Mic2 },
  { href: '/consultation', label: 'Consultations', icon: Stethoscope },
  { href: '/scores', label: 'My Progress', icon: BarChart2 },
  { href: '/phrases', label: 'Phrase Bank', icon: BookOpen },
];

export default function Nav() {
  const pathname = usePathname();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-navy-900 text-white fixed left-0 top-0 z-40 border-r border-navy-800">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-clinic-accent flex items-center justify-center">
              <Mic2 size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">SpeakClinic</p>
              <p className="text-xs text-white/50 leading-tight">Coach</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname.startsWith(href)
                  ? 'bg-clinic-accent text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 w-full transition-colors"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-navy-900 border-t border-white/10 z-40 flex">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors',
              pathname.startsWith(href) ? 'text-clinic-accent' : 'text-white/50'
            )}
          >
            <Icon size={20} />
            <span className="text-[10px]">{label.split(' ')[0]}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
