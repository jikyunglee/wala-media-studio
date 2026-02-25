'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ko' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('ko');

    // Load language preference from localStorage
    useEffect(() => {
        const savedLang = localStorage.getItem('wala-lang') as Language;
        if (savedLang && (savedLang === 'ko' || savedLang === 'en')) {
            setLanguage(savedLang);
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('wala-lang', lang);
    };

    const translations: Record<Language, Record<string, string>> = {
        ko: {
            dashboard: '대시보드',
            studio: '비디오 스튜디오',
            assets: '에셋 저장소',
            templates: '제작 템플릿',
            training: '학습 스튜디오',
            history: '작업 히스토리',
            system_command: '시스템 커맨드',
            next_gen_engine: '차세대 AI 미디어 엔진',
            description_main: 'WALA Area: Google Veo 기반의 고성능 영상 제작 솔루션입니다. 기업 자산과 AI의 상상력을 결합하여 비즈니스 메시지를 시각화합니다.',
            creative_central: '창작 본부',
            generate_new: '새 비디오 생성하기',
            resource_node: '자원 노드',
            manage_assets: '시각적 자산 관리',
            network_registry: '네트워크 레지스트리',
            track_jobs: '작업 현황 및 기록',
            ready_to_launch: '엔진 가동 준비 완료',
            system_status_ok: '모든 시스템이 최적의 상태로 가동 중입니다. 지금 바로 기업 에셋을 활용해 시네마틱 홍보 영상을 제작해 보세요.',
            launch_studio: '스튜디오 런칭',
            job_id: '고유 식별자',
            status: '상태',
            timestamp: '타임스탬프',
            result: '결과물',
            view_asset: '자산 확인',
            queuing: '대기 중',
            processing: '생성 중',
            completed: '완료됨',
            failed: '실패',
            registry_empty: '등록된 작업이 없습니다.',
            media_registry_title: '미디어 자산소',
            media_registry_desc: '핵심 비주얼 자산을 안전하게 관리하고 배포합니다.',
            inject_asset: '신규 에셋 주입',
            satellite_upload: '위성 업로드 채널',
            upload_cloud: '클라우드 전송',
            uploading: '업로드 중...',
            active_assets: '활성 자산 리스트',
            studio_title: 'AI 비디오 스튜디오',
            studio_desc: '기업 자산과 최첨단 Google Veo AI를 결합하여 전문가급 영상을 제작합니다.',
            select_template: '템플릿 선택',
            select_asset: '에셋 선택',
            generation_process: '생성 프로세스',
            selected_mood: '선택된 무드',
            base_asset: '베이스 에셋',
            ai_prompt_analysis: 'AI 프롬프트 분석',
            start_generation: '영상 제작 시작',
            engine_running: 'AI 핵심 엔진 가동 중...',
            template_gallery: '제작 템플릿',
            template_desc: 'AI 비디오 생성을 위한 마스터 프롬프트 아카이브입니다.',
            new_template: '신규 템플릿 설계',
            template_name: '템플릿 명칭',
            template_summary: '설명',
            veo_master_prompt: 'VEO 마스터 프롬프트',
            register_template: '템플릿 등록',
            archived_templates: '아카이브된 템플릿',
            edit_template: '템플릿 매개변수 수정',
            update_data: '데이터 갱신',
            training_center: 'AI 학습 센터',
            training_desc: '브랜드 아이덴티티를 위한 맞춤형 비주얼 모델을 트레이닝합니다.',
            guidelines: '트레이닝 가이드라인',
            dataset: '데이터셋 확정',
            start_engine: '학습 엔진 가동',
            success_deploy: '배치 성공',
            satellite_upload_channel: '위성 업로드 채널',
            include_music: 'AI 배경음악 함께 생성',
            music_analysis: 'AI 음악 분석 및 설계',
            sound_sculpting: '사운드 이퀄라이징 중...',
            // ... more as needed
        },
        en: {
            dashboard: 'Dashboard',
            studio: 'Video Studio',
            assets: 'Media Assets',
            templates: 'Templates',
            training: 'Training Studio',
            history: 'Job History',
            system_command: 'System Command',
            next_gen_engine: 'Next-Gen AI Media Engine',
            description_main: 'WALA Area: High-performance video creation solution based on Google Veo. Combining corporate assets with AI imagination to visualize business messages.',
            creative_central: 'Creative Central',
            generate_new: 'Generate New Video',
            resource_node: 'Resource Node',
            manage_assets: 'Manage Visual Assets',
            network_registry: 'Network Registry',
            track_jobs: 'Track Job Status & History',
            ready_to_launch: 'Engine Ready for Launch',
            system_status_ok: 'All systems are operating at optimal levels. Start creating cinematic promotional videos using corporate assets now.',
            launch_studio: 'Launch Studio',
            job_id: 'Job Identifier',
            status: 'Status',
            timestamp: 'Timestamp',
            result: 'Result',
            view_asset: 'View Asset',
            queuing: 'Queuing',
            processing: 'Processing',
            completed: 'Completed',
            failed: 'Failed',
            registry_empty: 'No jobs registered.',
            media_registry_title: 'Media Registry',
            media_registry_desc: 'Safely manage and deploy key visual assets.',
            inject_asset: 'Inject New Asset',
            satellite_upload: 'Satellite Upload Channel',
            upload_cloud: 'Push to Cloud',
            uploading: 'Uploading...',
            active_assets: 'Active Asset List',
            studio_title: 'AI Video Studio',
            studio_desc: 'Combine corporate assets with cutting-edge Google Veo AI to create professional-grade videos in minutes.',
            select_template: 'Select Template',
            select_asset: 'Select Asset',
            generation_process: 'Generation Process',
            selected_mood: 'Selected Mood',
            base_asset: 'Base Asset',
            ai_prompt_analysis: 'AI Prompt Analysis',
            start_generation: 'Start Generation',
            engine_running: 'AI Core Engine Running...',
            template_gallery: 'Production Templates',
            template_desc: 'Master prompt archive for AI video generation.',
            new_template: 'Design New Template',
            template_name: 'Template Name',
            template_summary: 'Description',
            veo_master_prompt: 'VEO Master Prompt',
            register_template: 'Register Template',
            archived_templates: 'Archived Templates',
            edit_template: 'Edit Template Parameters',
            update_data: 'Update Data',
            training_center: 'AI Training Center',
            training_desc: 'Train custom visual models for brand identity.',
            guidelines: 'Training Guidelines',
            dataset: 'Confirm Dataset',
            start_engine: 'Start Training Engine',
            success_deploy: 'Deployment Successful',
            satellite_upload_channel: 'Satellite Upload Channel',
            include_music: 'Generate AI Background Music',
            music_analysis: 'AI Sound Design',
            sound_sculpting: 'Sculpting Neural Sound...',
        },
    };

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
