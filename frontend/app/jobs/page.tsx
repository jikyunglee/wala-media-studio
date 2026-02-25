'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, Loader2, ExternalLink, RefreshCw, LayoutList } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

interface Job {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  created_at: string;
  updated_at: string;
  request_image_path: string;
  request_prompt: string;
  music_prompt: string | null;
  result_gcs_path: string | null;
  result_public_url: string | null;
  error_message: string | null;
}

export default function JobsPage() {
  const { language, t } = useLanguage();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusConfig = {
    queued: { color: "text-gray-400", bg: "bg-gray-400/10", icon: Clock, label: t('queuing') },
    processing: { color: "text-blue-400", bg: "bg-blue-400/10", icon: Loader2, label: t('processing') },
    completed: { color: "text-emerald-400", bg: "bg-emerald-400/10", icon: CheckCircle2, label: t('completed') },
    failed: { color: "text-rose-400", bg: "bg-rose-400/10", icon: AlertCircle, label: t('failed') },
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:8002/video/jobs');
      if (!response.ok) throw new Error('List load failed');
      const data: Job[] = await response.json();
      setJobs(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <header className="flex justify-between items-end mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <LayoutList className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-black tracking-tight glow-text uppercase text-white">{t('history')}</h1>
          </div>
          <p className="text-gray-300 text-lg">{t('track_jobs')}</p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchJobs(); }}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl glass-card text-sm font-black uppercase tracking-widest hover:bg-white/10 transition-all shadow-xl text-white border border-white/10"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {language === 'ko' ? '기록 새로고침' : 'Refresh Registry'}
        </button>
      </header>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl flex items-center gap-4 text-rose-400 mb-8 font-black uppercase text-sm">
          <AlertCircle className="w-6 h-6" />
          {t('failed')}: {error}
        </div>
      )}

      <div className="glass-panel rounded-[40px] overflow-hidden border border-white/5 shadow-2xl mb-20 shadow-inner">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 uppercase text-[10px] tracking-[0.3em] font-black bg-white/[0.02]">
                <th className="px-10 py-8">{t('status')}</th>
                <th className="px-8 py-8 font-mono">{t('job_id')}</th>
                <th className="px-8 py-8">{language === 'ko' ? '참조 이미지' : 'Asset Context'}</th>
                <th className="px-8 py-8">{language === 'ko' ? '오디오 분석' : 'Audio Design'}</th>
                <th className="px-8 py-8">{t('timestamp')}</th>
                <th className="px-10 py-8 text-right">{t('result')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {jobs.length > 0 ? (
                jobs.map((job) => {
                  const config = statusConfig[job.status];
                  const Icon = config.icon;
                  return (
                    <tr key={job.id} className="group hover:bg-white/[0.03] transition-colors">
                      <td className="px-10 py-8">
                        <div className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${config.bg} ${config.color} border border-current/10`}>
                          <Icon className={`w-3.5 h-3.5 ${job.status === 'processing' ? 'animate-spin' : ''}`} />
                          {config.label}
                        </div>
                      </td>
                      <td className="px-8 py-8 text-[11px] font-mono text-gray-400 tracking-tighter opacity-70">
                        {job.id}
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden ring-1 ring-white/5">
                            <img src={`https://storage.googleapis.com/${job.request_image_path.replace('gs://', '')}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" onError={(e: any) => e.target.src = "https://placehold.co/48x48/png?text=IMG"} />
                          </div>
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest truncate max-w-[120px] opacity-60" title={job.request_image_path}>{job.request_image_path.split('/').pop()}</p>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        {job.music_prompt ? (
                          <div className="flex flex-col gap-1.5 group/music">
                            <div className="flex items-center gap-2 text-indigo-400">
                              <RefreshCw className="w-3 h-3 animate-spin opacity-50" />
                              <span className="text-[10px] font-black uppercase tracking-widest">{t('music_analysis')}</span>
                            </div>
                            <p className="text-[9px] text-gray-500 font-bold italic leading-tight max-w-[150px] line-clamp-2 opacity-60 group-hover/music:opacity-100 transition-opacity" title={job.music_prompt}>
                              {job.music_prompt}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-700 font-black uppercase tracking-widest opacity-30">-</span>
                        )}
                      </td>
                      <td className="px-8 py-8 text-sm text-gray-300 font-bold tracking-tight">
                        {new Date(job.created_at).toLocaleString()}
                      </td>
                      <td className="px-10 py-8 text-right">
                        {job.status === 'completed' && job.result_public_url ? (
                          <Link
                            href={job.result_public_url}
                            target="_blank"
                            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white transition-all text-xs font-black uppercase tracking-widest group/btn border border-blue-500/20 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                          >
                            {t('view_asset')}
                            <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                          </Link>
                        ) : job.status === 'failed' ? (
                          <div className="text-rose-500/80 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-end gap-2" title={job.error_message || ''}>
                            <AlertCircle className="w-3.5 h-3.5" />
                            {language === 'ko' ? '시스템 오류' : 'System Error'}
                          </div>
                        ) : (
                          <div className="flex justify-end pr-8">
                            <Loader2 className="w-5 h-5 text-gray-700 animate-spin" />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : !loading && (
                <tr>
                  <td colSpan={5} className="py-32 text-center text-gray-600 font-black uppercase tracking-[0.3em] text-xs">
                    {t('registry_empty')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
