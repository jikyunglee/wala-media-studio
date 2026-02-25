'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Upload, Image as ImageIcon, FileCode, CheckCircle2, AlertCircle, Loader2, Plus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Asset {
  id: string;
  name: string;
  url: string;
  gcs_uri: string;
  size: number;
  type: string;
}

export default function AssetsPage() {
  const { t } = useLanguage();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8002/assets/');
      if (!response.ok) throw new Error('Load failed');
      const data: Asset[] = await response.json();
      setAssets(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch('http://localhost:8002/assets/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      setSelectedFile(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      fetchAssets();
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ImageIcon className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-black tracking-tight glow-text uppercase text-white">{t('media_registry_title')}</h1>
          </div>
          <p className="text-gray-300 text-lg">{t('media_registry_desc')}</p>
        </div>
      </header>

      {/* Upload Section */}
      <section className="gradient-border p-10">
        <div className="flex items-center gap-3 mb-8">
          <Plus className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold uppercase tracking-wider text-white">{t('inject_asset')}</h2>
        </div>

        <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-8 items-end">
          <div className="flex-1 w-full space-y-3">
            <label htmlFor="file-upload" className="block text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">
              {t('satellite_upload_channel')}
            </label>
            <div className="relative group">
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-300
                  file:mr-6 file:py-3 file:px-8
                  file:rounded-2xl file:border-0
                  file:text-xs file:font-black
                  file:bg-blue-600 file:text-white
                  file:cursor-pointer
                  hover:file:bg-blue-700
                  bg-white/5 border border-white/10 rounded-2xl py-2 px-3
                  focus:outline-none focus:border-blue-500/50 transition-all
                  cursor-pointer transition-colors group-hover:bg-white/[0.08]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading || !selectedFile}
            className={`px-10 py-4 rounded-2xl font-black flex items-center gap-3 transition-all active:scale-95 whitespace-nowrap shadow-2xl ${uploading || !selectedFile
                ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-1'
              }`}
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            {uploading ? t('uploading') : t('upload_cloud')}
          </button>
        </form>
        {uploadError && (
          <p className="mt-4 text-sm text-rose-400 flex items-center gap-2 font-bold animate-pulse">
            <AlertCircle className="w-4 h-4" /> {uploadError}
          </p>
        )}
      </section>

      {/* Asset Grid */}
      <section className="space-y-8 pb-20">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <FileCode className="w-5 h-5 text-gray-500" />
            <h2 className="text-xl font-bold uppercase tracking-wider text-white">{t('active_assets')}</h2>
          </div>
          <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            {assets.length} UNITS DETECTED
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl text-rose-400 flex items-center gap-3 font-bold">
            <AlertCircle className="w-6 h-6" /> {error}
          </div>
        )}

        {loading && assets.length === 0 ? (
          <div className="flex flex-col items-center py-32 gap-6 bg-white/5 rounded-3xl border border-white/5 animate-pulse">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs">Scanning Cloud Registry...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {assets.length > 0 ? (
              assets.map((asset) => (
                <div key={asset.id} className="glass-card group p-2.5 rounded-3xl relative border border-white/5 shadow-inner">
                  <div className="aspect-square relative overflow-hidden rounded-2xl border border-white/10 ring-1 ring-white/5 shadow-2xl">
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <div className="p-4 bg-white/10 rounded-full border border-white/20 shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-500">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-black truncate text-white uppercase tracking-tight" title={asset.name}>{asset.name}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[9px] text-blue-400 font-black uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">{asset.type}</span>
                      <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{(asset.size / 1024).toFixed(0)} KB</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-32 bg-white/5 rounded-[40px] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-gray-600 text-sm font-black uppercase tracking-[0.3em]">
                Registry Empty - Awaiting Data Injection
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
