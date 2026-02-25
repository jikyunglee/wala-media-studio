'use client';

import Link from 'next/link';
import { Home, Layers, Video, Palette, BrainCircuit, Languages } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import clsx from 'clsx';

const Sidebar = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 glass-panel text-white p-6 flex flex-col z-50">
      <div className="mb-10 font-bold text-2xl flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg animate-glow">
          <Video className="w-6 h-6 text-white" />
        </div>
        <span className="glow-text tracking-tight uppercase">WALA AREA</span>
      </div>

      <nav className="flex-1 space-y-3">
        <NavLink href="/" icon={Home} label={t('dashboard')} />
        <NavLink href="/studio" icon={Video} label={t('studio')} />
        <NavLink href="/assets" icon={Layers} label={t('assets')} />
        <NavLink href="/templates" icon={Palette} label={t('templates')} />
        <NavLink href="/training" icon={BrainCircuit} label={t('training')} />
        <NavLink href="/jobs" icon={BrainCircuit} label={t('history')} />
      </nav>

      {/* Language Toggle */}
      <div className="mt-auto mb-8 flex flex-col gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
          <Languages className="w-4 h-4 text-blue-400" />
          <div className="flex flex-1 justify-around">
            <button
              onClick={() => setLanguage('ko')}
              className={clsx(
                "text-xs font-bold transition-all px-2 py-1 rounded-md",
                language === 'ko' ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-white"
              )}
            >
              KO
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={clsx(
                "text-xs font-bold transition-all px-2 py-1 rounded-md",
                language === 'en' ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-white"
              )}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-gray-400 font-bold tracking-widest opacity-50">
        &copy; 2026 WALA ANTIGRAVITY
      </div>
    </aside>
  );
};

interface NavLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
}

const NavLink = ({ href, icon: Icon, label }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
        isActive ? "bg-blue-600/20 shadow-[0_0_15px_rgba(37,99,235,0.1)] border border-blue-500/20" : "hover:bg-white/5"
      )}
    >
      <Icon className={clsx(
        "w-5 h-5 transition-colors",
        isActive ? "text-blue-400" : "text-gray-400 group-hover:text-blue-400"
      )} />
      <span className={clsx(
        "font-bold transition-colors",
        isActive ? "text-white" : "text-gray-300 group-hover:text-white"
      )}>{label}</span>
    </Link>
  );
};

export default Sidebar;
