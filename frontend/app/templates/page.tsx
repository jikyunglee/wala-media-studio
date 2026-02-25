'use client';

import { useState, useEffect, FormEvent } from 'react';
import Modal from '@/components/Modal';
import { Palette, Plus, Edit2, Trash2, Loader2, Wand2, Sparkles, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Template {
  id: number;
  name: string;
  description: string;
  user_template_text: string;
}
type TemplateCreate = Omit<Template, 'id'>;

export default function TemplatesPage() {
  const { language, t } = useLanguage();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newTemplate, setNewTemplate] = useState<TemplateCreate>({
    name: '',
    description: '',
    user_template_text: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:8002/templates/');
      if (!response.ok) throw new Error('Templates load failed');
      const data: Template[] = await response.json();
      setTemplates(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTemplate(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editingTemplate) {
      setEditingTemplate({ ...editingTemplate, [name]: value });
    }
  };

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8002/templates/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate),
      });
      if (!response.ok) throw new Error('Creation failed');
      setNewTemplate({ name: '', description: '', user_template_text: '' });
      fetchTemplates();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    try {
      const response = await fetch(`http://localhost:8002/templates/${editingTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTemplate),
      });
      if (!response.ok) throw new Error('Update failed');
      setIsModalOpen(false);
      setEditingTemplate(null);
      fetchTemplates();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (templateId: number) => {
    if (!confirm(language === 'ko' ? '정말로 삭제하시겠습니까?' : 'Are you sure you want to delete?')) return;
    try {
      const response = await fetch(`http://localhost:8002/templates/${templateId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Delete failed');
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openEditModal = (template: Template) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Palette className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-black tracking-tight glow-text uppercase text-white">{t('template_gallery')}</h1>
          </div>
          <p className="text-gray-300 text-lg">{t('template_desc')}</p>
        </div>
      </header>

      {/* Create Form */}
      <section className="gradient-border p-10">
        <div className="flex items-center gap-3 mb-8">
          <Plus className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold uppercase tracking-wider text-white">{t('new_template')}</h2>
        </div>
        <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">{t('template_name')}</label>
              <input
                name="name"
                value={newTemplate.name}
                onChange={handleInputChange}
                placeholder={language === 'ko' ? "예: 시네마틱 사이버펑크" : "e.g. Cinematic Cyberpunk"}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-gray-700 focus:outline-none focus:border-blue-500/50 transition-all font-bold"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">{t('template_summary')}</label>
              <input
                name="description"
                value={newTemplate.description}
                onChange={handleInputChange}
                placeholder={language === 'ko' ? "템플릿의 무드나 용도를 입력하세요." : "Describe the mood or purpose of the template."}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-gray-700 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
              />
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-3 h-full flex flex-col">
              <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">{t('veo_master_prompt')}</label>
              <textarea
                name="user_template_text"
                value={newTemplate.user_template_text}
                onChange={handleInputChange}
                placeholder={language === 'ko' ? "AI 엔진이 해석할 정교한 프롬프트를 입력하세요." : "Enter the sophisticated prompt for the AI engine."}
                required
                className="flex-1 w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-gray-700 focus:outline-none focus:border-blue-500/50 transition-all font-mono text-xs leading-relaxed"
              />
            </div>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-2xl font-black flex items-center gap-3 transition-all active:scale-95 shadow-2xl hover:-translate-y-1"
            >
              <Sparkles className="w-5 h-5" />
              {t('register_template')}
            </button>
          </div>
        </form>
      </section>

      {/* List */}
      <section className="space-y-8">
        <div className="flex items-center gap-4 border-b border-white/5 pb-4">
          <Wand2 className="w-5 h-5 text-gray-500" />
          <h2 className="text-xl font-bold uppercase tracking-wider text-white">{t('archived_templates')}</h2>
          <span className="text-[10px] font-black bg-white/5 text-gray-500 px-3 py-1 rounded-full border border-white/10 ml-auto">
            {templates.length} SCHEMATICS
          </span>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl text-rose-400 flex items-center gap-3 font-bold">
            <AlertCircle className="w-6 h-6" /> {t('failed')}: {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center py-32 gap-6 bg-white/5 rounded-[40px] border border-white/5 animate-pulse">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-gray-500 font-black tracking-[0.4em] text-xs">ARCHIVE SCANNING...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.length > 0 ? templates.map((template) => (
              <div key={template.id} className="glass-card p-10 rounded-[32px] flex flex-col justify-between group border border-white/5 shadow-2xl">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-black group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-500 transition-all uppercase tracking-tight text-white">{template.name}</h3>
                    <div className="flex gap-3 scale-75 origin-right opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <button onClick={() => openEditModal(template)} className="p-3 bg-white/5 hover:bg-blue-600 rounded-2xl text-gray-400 hover:text-white transition-all border border-white/10">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(template.id)} className="p-3 bg-white/5 hover:bg-rose-600 rounded-2xl text-gray-400 hover:text-white transition-all border border-white/10">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mb-8 leading-relaxed font-bold opacity-80">{template.description || '-'}</p>
                  <div className="relative group/code bg-black/40 p-6 rounded-2xl border border-white/5 shadow-inner">
                    <code className="relative block text-[11px] text-blue-300 font-mono leading-relaxed break-all line-clamp-4 opacity-80 group-hover/code:opacity-100 transition-opacity">
                      {template.user_template_text}
                    </code>
                  </div>
                </div>
                <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">REGISTRY_ID: #{template.id}</span>
                  <div className="flex -space-x-3">
                    <div className="w-8 h-8 rounded-full border-4 border-[#0d0d12] bg-blue-500/20 shadow-xl" />
                    <div className="w-8 h-8 rounded-full border-4 border-[#0d0d12] bg-purple-500/20 shadow-xl" />
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-32 bg-white/5 rounded-[40px] border-2 border-dashed border-white/5 flex items-center justify-center text-gray-600 font-black uppercase tracking-[0.3em] text-xs">
                ARCHIVE EMPTY - AWAITING DATA INJECTION
              </div>
            )}
          </div>
        )}
      </section>

      {/* Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('edit_template')}>
        {editingTemplate && (
          <form onSubmit={handleEditSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">{t('template_name')}</label>
              <input
                name="name"
                value={editingTemplate.name}
                onChange={handleEditInputChange}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xl font-bold text-white focus:outline-none focus:border-blue-500/50 transition-all font-black shadow-inner"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">{t('template_summary')}</label>
              <input
                name="description"
                value={editingTemplate.description}
                onChange={handleEditInputChange}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold opacity-80"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">{t('veo_master_prompt')}</label>
              <textarea
                name="user_template_text"
                value={editingTemplate.user_template_text}
                onChange={handleEditInputChange}
                rows={6}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-blue-500/50 transition-all font-mono text-xs leading-relaxed shadow-inner"
              />
            </div>
            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-4 rounded-xl font-black text-gray-500 hover:bg-white/5 transition-all uppercase tracking-widest text-xs"
              >
                {language === 'ko' ? '취소' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-10 py-4 rounded-2xl font-black bg-blue-600 text-white hover:bg-blue-500 shadow-2xl shadow-blue-600/30 transition-all active:scale-95 uppercase tracking-widest text-xs"
              >
                {t('update_data')}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
