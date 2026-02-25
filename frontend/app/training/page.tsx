'use client';

import { useState } from 'react';
import { Upload, Info, CheckCircle2, AlertCircle, BrainCircuit, Image as ImageIcon, Loader2, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { startTraining } from '../../services/trainingService';

export default function TrainingStudio() {
  const { language, t } = useLanguage();
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [modelName, setModelName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [responseMessage, setResponseMessage] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleStartTraining = async () => {
    if (!modelName || files.length === 0) return;

    setIsLoading(true);
    setProgress(0);
    setTrainingStatus('idle');
    setResponseMessage('');

    try {
      // 1. 프로그레스바 시각화 (업로드 단계 모방)
      setProgress(25);

      // 2. 실제 백엔드 통신
      const result = await startTraining(modelName, files);

      setProgress(100);
      setTrainingStatus('success');
      setResponseMessage(language === 'ko' ? `서버 응답: ${result.message}` : `Server: ${result.message}`);
      setStep(4);
    } catch (error: any) {
      setTrainingStatus('error');
      setResponseMessage(error.message || 'Error occurred during training initialization.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BrainCircuit className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-black tracking-tight glow-text uppercase text-white">{t('training_center')}</h1>
          </div>
          <p className="text-gray-300 text-lg font-medium">{t('training_desc')}</p>
        </div>
        {step < 4 && (
          <div className="flex flex-col items-end gap-3 text-white">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Processing Stage</span>
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-1.5 w-10 rounded-full transition-all duration-700 ${step >= s ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]' : 'bg-white/10'}`} />
              ))}
            </div>
          </div>
        )}
      </header>

      {step === 1 && (
        <section className="glass-panel p-12 rounded-[40px] space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 shadow-2xl">
          <div className="flex items-start gap-6 p-8 bg-blue-500/10 border border-blue-500/20 rounded-3xl shadow-inner">
            <Info className="w-8 h-8 text-blue-400 mt-1 shrink-0" />
            <div>
              <h3 className="font-black text-white text-xl uppercase tracking-tight">{t('guidelines')}</h3>
              <p className="text-sm text-gray-400 leading-relaxed mt-3 font-medium">
                {language === 'ko'
                  ? '최상의 정밀도를 위해 아래 물리적 가이드를 준수해 주세요. 수집된 데이터의 품질이 결과물의 해상도를 결정합니다.'
                  : 'Please adhere to the physical guidelines below for maximum precision. The quality of collected data determines the resolution of the output.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TrainingGuide title={language === 'ko' ? "샘플 데이터 용량" : "Dataset Capacity"} desc={language === 'ko' ? "최소 15~20장의 초고해상도 소스 이미지를 준비하세요." : "Prepare at least 15-20 ultra-high resolution source images."} />
            <TrainingGuide title={language === 'ko' ? "다각도 캡처" : "Multi-angle Capture"} desc={language === 'ko' ? "0도, 45도, 90도 등 기하학적인 모든 각도를 포함해야 합니다." : "Must include all geometric angles like 0, 45, and 90 degrees."} />
            <TrainingGuide title={language === 'ko' ? "루멘 조명 제어" : "Lumen Lighting Control"} desc={language === 'ko' ? "그림자가 최소화된 스튜디오 환경의 뉴트럴 조명을 권장합니다." : "Neutral lighting in a studio environment with minimal shadows is recommended."} />
            <TrainingGuide title={language === 'ko' ? "배경 클린업" : "Background Cleanup"} desc={language === 'ko' ? "피사체에 집중할 수 있는 단순한 단색 배경을 선호합니다." : "Prefer a simple, solid background to focus on the subject."} />
          </div>

          <div className="pt-10 flex justify-end">
            <button
              onClick={nextStep}
              className="bg-white text-black px-12 py-5 rounded-[20px] font-black flex items-center gap-3 hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1 shadow-[0_20px_40px_rgba(0,0,0,0.4)] group"
            >
              {language === 'ko' ? '프로토콜 확인 완료' : 'Confirm Protocols'}
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="glass-panel p-12 rounded-[40px] space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 shadow-2xl">
          <div className="flex items-center gap-4">
            <Upload className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-black uppercase tracking-widest text-white">{language === 'ko' ? '소스 데이터 주입' : 'Source Data Injection'}</h2>
          </div>

          <div className="border-[3px] border-dashed border-white/10 rounded-[40px] p-24 text-center hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer relative group shadow-inner overflow-hidden">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-2xl border border-white/5 pointer-events-none">
              <Upload className="w-10 h-10 text-gray-500 group-hover:text-blue-400 transition-colors" />
            </div>
            <p className="text-2xl font-black text-white tracking-tight pointer-events-none">{language === 'ko' ? '이미지 파일을 레이어로 드래그하세요' : 'Drag image files into the layer'}</p>
            <p className="text-gray-500 mt-3 font-black uppercase tracking-[0.2em] text-xs pointer-events-none">JPG, PNG (MAX-CHANNEL: 10MB EACH)</p>
            {/* Input is placed last to be on top and catch all clicks */}
            <input
              type="file"
              multiple
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>

          {files.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-5 mt-10">
              {files.map((file, i) => (
                <div key={i} className="aspect-square bg-white/5 rounded-2xl border border-white/10 overflow-hidden relative group ring-1 ring-white/5 shadow-2xl bg-cover bg-center" style={{ backgroundImage: `url(${URL.createObjectURL(file)})` }}>
                  <div className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover:opacity-100 transition-all flex items-end p-2.5 text-[8px] font-black text-white uppercase truncate backdrop-blur-[2px]">
                    {file.name}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-10 flex justify-between items-center">
            <button onClick={prevStep} className="flex items-center gap-3 text-gray-400 font-black uppercase tracking-widest hover:text-white transition-colors text-xs">
              <ChevronLeft className="w-5 h-5" /> {language === 'ko' ? '이전 단계' : 'Previous'}
            </button>
            <button
              onClick={nextStep}
              disabled={files.length < 1}
              className="bg-blue-600 text-white px-12 py-5 rounded-[20px] font-black disabled:bg-white/5 disabled:text-gray-700 transition-all shadow-2xl shadow-blue-600/20 active:scale-95 uppercase tracking-widest text-xs"
            >
              {files.length} {t('dataset')}
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="glass-panel p-12 rounded-[40px] space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 shadow-2xl">
          <div className="flex items-center gap-4 text-emerald-400">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-2xl font-black uppercase tracking-widest">{t('start_engine')}</h2>
          </div>

          <div className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black">{language === 'ko' ? '모델 고유 명칭' : 'Neural Entity Identifier'}</label>
              <input
                type="text"
                placeholder="예: WALA-CORE-SUMMER-BLUE"
                className="w-full bg-white/5 border border-white/10 rounded-[20px] py-6 px-8 text-2xl font-black text-white placeholder:text-gray-800 focus:outline-none focus:border-blue-500/50 transition-all shadow-inner"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
              />
            </div>

            <div className="p-8 bg-blue-500/5 rounded-3xl border border-blue-500/10 flex gap-6 shadow-inner italic">
              <AlertCircle className="w-8 h-8 text-blue-400 shrink-0 mt-1" />
              <p className="text-sm text-gray-400 leading-relaxed font-medium">
                {language === 'ko'
                  ? '컴퓨팅 리소스가 할당되면 학습에는 약 '
                  : 'Once computing resources are allocated, training takes approximately '}
                <span className="text-blue-400 font-black underline decoration-2 underline-offset-4">20~40 minutes</span>.
                {language === 'ko'
                  ? '신경망 가중치가 최적화되면 시스템 보고서를 전송하겠습니다.'
                  : ' A system report will be sent once neural weights are optimized.'}
              </p>
            </div>

            {isLoading && (
              <div className="space-y-4 animate-in fade-in duration-500">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] uppercase tracking-widest text-blue-400 font-black animate-pulse">
                    {language === 'ko' ? '신경망 매핑 및 가중치 계산 중...' : 'Mapping Synapses & Calculating Weights...'}
                  </span>
                  <span className="text-2xl font-black text-white">{progress}%</span>
                </div>
                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500 ease-out shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {trainingStatus === 'error' && (
              <div className="p-6 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20 text-sm font-black uppercase tracking-tight shadow-2xl">
                {responseMessage}
              </div>
            )}
          </div>

          <div className="pt-10 flex justify-between items-center">
            <button onClick={prevStep} className="text-gray-400 font-black uppercase tracking-widest hover:text-white transition-colors disabled:opacity-30 text-xs" disabled={isLoading}>
              {language === 'ko' ? '이전 단계' : 'Previous'}
            </button>
            <button
              onClick={handleStartTraining}
              disabled={!modelName || isLoading}
              className="bg-emerald-600 text-white px-16 py-5 rounded-full font-black hover:bg-emerald-500 transition-all shadow-[0_20px_40px_rgba(16,185,129,0.3)] disabled:bg-white/5 disabled:text-gray-700 flex items-center gap-4 active:scale-95 uppercase tracking-widest text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  {language === 'ko' ? '학습 엔진 작동 중' : 'Engine active'}
                </>
              ) : (
                language === 'ko' ? '학습 시퀀스 시작' : 'Initialize training'
              )}
            </button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="glass-panel p-24 rounded-[60px] text-center space-y-12 animate-in zoom-in-95 duration-1000 shadow-2xl border border-white/5">
          <div className="w-32 h-32 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto relative border border-emerald-500/20">
            <div className="absolute inset-[-8px] rounded-full border-2 border-emerald-500/20 animate-ping duration-[2000ms]" />
            <CheckCircle2 className="w-16 h-16 text-emerald-400 relative z-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]" />
          </div>
          <div className="space-y-6">
            <h2 className="text-5xl font-black glow-text text-white uppercase tracking-tighter">{t('success_deploy')}</h2>
            <p className="text-gray-400 text-xl max-w-lg mx-auto leading-relaxed font-bold opacity-80">
              {language === 'ko'
                ? `모델 "${modelName}"의 학습 프로세스가 백그라운드 서버에 안전하게 할당되었습니다.`
                : `The training process for model "${modelName}" has been securely allocated to background servers.`}
            </p>
          </div>

          <div className="inline-block p-10 bg-black/40 rounded-[32px] border border-white/10 text-left min-w-[400px] shadow-inner font-mono">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[11px] uppercase font-black text-gray-500 tracking-[0.3em]">Neural Status Log</span>
              <span className="text-[11px] uppercase font-black text-emerald-400 animate-pulse tracking-[0.3em] bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Active</span>
            </div>
            <p className="text-xs text-gray-500 font-bold tracking-tight">{">>"} {language === 'ko' ? '시스템_엔진: 큐_등록_완료' : 'CORE_ENGINE: QUEUED'}</p>
            <p className="text-xs text-emerald-400 mt-2 font-bold tracking-tight">{">>"} {responseMessage}</p>
          </div>

          <div className="pt-12">
            <button
              onClick={() => { setStep(1); setFiles([]); setModelName(''); setTrainingStatus('idle'); }}
              className="bg-white text-black px-16 py-5 rounded-[24px] font-black hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1 shadow-[0_30px_60px_rgba(0,0,0,0.5)] uppercase tracking-widest"
            >
              {language === 'ko' ? '새로운 학습 설계 시작' : 'Design New Model'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

const TrainingGuide = ({ title, desc }: any) => (
  <div className="p-8 bg-white/5 border border-white/5 rounded-[32px] hover:border-blue-500/40 hover:bg-white/[0.08] transition-all group shadow-xl">
    <h4 className="font-black text-white text-xl group-hover:text-blue-400 transition-colors uppercase tracking-tight">{title}</h4>
    <p className="text-sm text-gray-400 mt-3 font-bold leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
      {desc}
    </p>
  </div>
);
