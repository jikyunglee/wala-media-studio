'use client';

import { Video, Layers, ListChecks, Sparkles, LayoutDashboard, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Link from 'next/link';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto space-y-16">
      <header className="relative py-12">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="flex items-center gap-3 mb-4">
          <LayoutDashboard className="w-8 h-8 text-blue-400" />
          <h1 className="text-4xl font-black tracking-tighter glow-text uppercase">{t('system_command')}</h1>
        </div>
        <h2 className="text-6xl font-black mb-6 leading-tight text-white">
          {t('next_gen_engine').split(' AI ')[0]} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{t('next_gen_engine').split(' AI ')[1]}</span>
        </h2>
        <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
          {t('description_main')}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <DashboardCard
          title={t('creative_central')}
          subtitle={t('generate_new')}
          value={t('studio')}
          icon={Video}
          href="/studio"
          color="blue"
        />
        <DashboardCard
          title={t('resource_node')}
          subtitle={t('manage_assets')}
          value={t('assets')}
          icon={Layers}
          href="/assets"
          color="purple"
        />
        <DashboardCard
          title={t('network_registry')}
          subtitle={t('track_jobs')}
          value={t('history')}
          icon={ListChecks}
          href="/jobs"
          color="emerald"
        />
      </div>

      <section className="gradient-border p-12 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h3 className="text-2xl font-bold uppercase tracking-widest text-white">{t('ready_to_launch')}</h3>
            </div>
            <p className="text-gray-300 max-w-xl leading-relaxed">
              {t('system_status_ok')}
            </p>
          </div>
          <Link href="/studio" className="group/btn bg-white text-black px-10 py-5 rounded-2xl font-black flex items-center gap-3 hover:bg-blue-500 hover:text-white transition-all transform hover:-translate-y-1 shadow-2xl">
            {t('launch_studio')}
            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <footer className="pt-20 pb-10 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
        <div>System Version: 1.2.0-Alpha / Build 2026.02</div>
        <div>WALA Antigravity x Google Vertex AI</div>
      </footer>
    </div>
  );
}

const DashboardCard = ({ title, subtitle, value, icon: Icon, href, color }: any) => {
  const colorMap: any = {
    blue: "text-blue-400 bg-blue-400/10",
    purple: "text-purple-400 bg-purple-400/10",
    emerald: "text-emerald-400 bg-emerald-400/10"
  };

  return (
    <Link href={href} className="glass-card p-10 rounded-3xl group flex flex-col justify-between min-h-[220px]">
      <div>
        <div className="flex justify-between items-start mb-6">
          <div className={`${colorMap[color]} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
            <Icon className="w-7 h-7" />
          </div>
          <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
        </div>
        <div>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{title}</p>
          <p className="text-2xl font-black tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">{value}</p>
        </div>
      </div>
      <p className="text-xs text-gray-400 font-bold mt-4">{subtitle}</p>
    </Link>
  );
};
