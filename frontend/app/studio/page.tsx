'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, Wand2, PlayCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Template {
  id: number;
  name: string;
  description: string;
  user_template_text: string;
}

interface Asset {
  id: string;
  name: string;
  url: string;
  gcs_uri: string;
  type: string;
  size: number;
}

export default function StudioPage() {
  const { t } = useLanguage();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [includeMusic, setIncludeMusic] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tRes, aRes] = await Promise.all([
        fetch('http://localhost:8002/templates/'),
        fetch('http://localhost:8002/assets/')
      ]);

      if (!tRes.ok || !aRes.ok) throw new Error('Data load failed');

      const tData = await tRes.json();
      const aData = await aRes.json();

      setTemplates(tData);
      setAssets(aData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateVideo = async () => {
    if (!selectedTemplate || !selectedAsset) return;

    setGenerating(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8002/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_image_path: selectedAsset.gcs_uri,
          user_template_text: selectedTemplate.user_template_text,
          include_music: includeMusic
        }),
      });

      if (!response.ok) throw new Error('Generation request failed');

      const result = await response.json();
      alert(`Request Success! Job ID: ${result.id.substring(0, 8)}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-blue-400" />
          <h1 className="text-4xl font-black tracking-tight glow-text uppercase text-white">{t('studio_title')}</h1>
        </div>
        <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
          {t('studio_desc')}
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-gray-400 animate-pulse tracking-widest uppercase">Initializing Core Systems...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

          {/* 1. Template Section */}
          <div className="xl:col-span-1 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-[0_0_15px_rgba(37,99,235,0.4)]">1</span>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">{t('select_template')}</h2>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`glass-card p-6 rounded-2xl cursor-pointer group border ${selectedTemplate?.id === template.id ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'border-white/5'
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{template.name}</h3>
                    {selectedTemplate?.id === template.id && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />}
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed font-medium">{template.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Asset Section */}
          <div className="xl:col-span-1 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-[0_0_15px_rgba(168,85,247,0.4)]">2</span>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">{t('select_asset')}</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`glass-card p-2 rounded-2xl cursor-pointer relative overflow-hidden group border ${selectedAsset?.id === asset.id ? 'border-purple-500 ring-4 ring-purple-500/10 bg-purple-500/5' : 'border-white/5'
                    }`}
                >
                  <img src={asset.url} alt={asset.name} className="w-full h-32 object-cover rounded-xl transition-transform duration-700 group-hover:scale-110" />
                  <div className={`absolute inset-0 bg-purple-600/20 opacity-0 transition-opacity ${selectedAsset?.id === asset.id ? 'opacity-100' : ''}`} />
                  <div className="mt-2 px-1">
                    <p className="text-xs font-bold truncate text-gray-200 uppercase tracking-tight">{asset.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Preview & Action */}
          <div className="xl:col-span-1 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-[0_0_15px_rgba(16,185,129,0.4)]">3</span>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">{t('generation_process')}</h2>
            </div>

            <div className="gradient-border p-8 space-y-8 min-h-[400px] flex flex-col justify-between">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">{t('selected_mood')}</label>
                  <p className="text-lg font-black text-white italic tracking-tight">
                    {selectedTemplate ? `"${selectedTemplate.name}"` : "-"}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">{t('base_asset')}</label>
                  {selectedAsset ? (
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                      <img src={selectedAsset.url} className="w-12 h-12 rounded-lg object-cover ring-1 ring-white/20" />
                      <div>
                        <p className="text-sm font-black text-white uppercase tracking-tight">{selectedAsset.name}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{selectedAsset.type}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-24 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center text-gray-600 font-bold italic text-sm">
                      WAITING FOR INPUT...
                    </div>
                  )}
                </div>

                {selectedTemplate && (
                  <div className="space-y-4 pt-4 border-t border-white/5 animate-in fade-in duration-700">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 group/toggle cursor-pointer" onClick={() => setIncludeMusic(!includeMusic)}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-colors ${includeMusic ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-400'}`}>
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-white uppercase tracking-tight">{t('include_music')}</p>
                          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{includeMusic ? 'AI SYNTHESIS ACTIVE' : 'VISUAL ONLY'}</p>
                        </div>
                      </div>
                      <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${includeMusic ? 'bg-blue-600' : 'bg-white/20'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-xl ${includeMusic ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                disabled={!selectedTemplate || !selectedAsset || generating}
                onClick={handleGenerateVideo}
                className={`w-full py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 uppercase tracking-widest shadow-2xl ${!selectedTemplate || !selectedAsset || generating
                  ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-1'
                  }`}
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {includeMusic ? t('sound_sculpting') : t('engine_running')}
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    {t('start_generation')}
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
