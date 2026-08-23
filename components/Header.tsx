
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Tooltip } from './Tooltip';
import { CogIcon } from './icons';
import { AspectRatio, StoryType, Mode, Language } from '../types';
import { PROMPT_BANK, PromptTemplate, getPromptBank, translateCategory } from '../data/promptBank';
import { getTranslation } from '../services/i18n';

interface HeaderProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    onShowInfo: () => void;
    onShowWelcome?: () => void;
    onOpenHistory: () => void;
    onSelectTemplate: (prompt: string, mode: Mode) => void;
    onOpenTemplateLibrary?: () => void;
    isLoading: boolean;
    mode: Mode;
    aspectRatio: AspectRatio;
    setAspectRatio: (ratio: AspectRatio) => void;
    resolution: string;
    setResolution: (res: string) => void;
    selectedModel: string;
    setSelectedModel: (model: string) => void;
    selectedClarificationModel: string;
    setSelectedClarificationModel: (model: string) => void;
    storyType: StoryType;
    setStoryType: (type: StoryType) => void;
    isFluidEnabled?: boolean;
    onToggleFluid?: () => void;
    language: Language;
    setLanguage: (lang: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ 
    isDarkMode, 
    toggleDarkMode, 
    onShowInfo,
    onShowWelcome,
    onOpenHistory,
    onSelectTemplate,
    onOpenTemplateLibrary,
    isLoading,
    mode,
    aspectRatio,
    setAspectRatio,
    resolution,
    setResolution,
    selectedModel,
    setSelectedModel,
    selectedClarificationModel,
    setSelectedClarificationModel,
    storyType,
    setStoryType,
    isFluidEnabled = true,
    onToggleFluid,
    language,
    setLanguage
}) => {
  const t = getTranslation(language);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const templatesRef = useRef<HTMLDivElement>(null);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ms' : 'en');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };
    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (templatesRef.current && !templatesRef.current.contains(event.target as Node)) {
        setShowTemplates(false);
      }
    };
    if (showTemplates) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTemplates]);

  const currentPromptBank = useMemo(() => {
    return getPromptBank(language);
  }, [language]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(currentPromptBank.map(t => t.category)));
    return ["All", ...unique];
  }, [currentPromptBank]);

  const filteredTemplates = useMemo(() => {
    return currentPromptBank.filter(template => {
      const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
      const query = templateSearch.toLowerCase().trim();
      const localizedCategory = translateCategory(template.category, language).toLowerCase();
      const matchesSearch = !query || 
        template.label.toLowerCase().includes(query) || 
        template.prompt.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query)) ||
        template.category.toLowerCase().includes(query) ||
        localizedCategory.includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [templateSearch, selectedCategory, currentPromptBank, language]);

  const getModelOptions = () => {
    switch (mode) {
      case 'image':
        return [
          { value: 'gemini-2.5-flash-image', label: 'Nano Banana (Fast)' },
          { value: 'gemini-3.1-flash-image-preview', label: 'Nano Banana 2 (HQ)' },
          { value: 'imagen-4.0-generate-001', label: 'Imagen 4' },
        ];
      case 'story':
      default:
        return [
          { value: 'gemini-3.7-flash', label: 'Gemini 3.7 Flash' },
          { value: 'gemini-flash-latest', label: 'Flash Latest' },
          { value: 'gemini-3.1-flash-lite-preview', label: 'Flash Lite' },
        ];
    }
  };

  const getResolutionOptions = () => {
    if (mode === 'image') {
      return ['512px', '1K', '2K', '4K'];
    }
    return [];
  };

  const showResolutionSelector = mode === 'image';

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl py-2.5 px-4 flex justify-between items-center border-b border-gray-200/60 dark:border-gray-800/80 shadow-sm transition-colors duration-200 relative z-[100]">
      <div className="flex items-center gap-3">
        <button 
          onClick={onShowWelcome || onShowInfo}
          className="flex items-center gap-2 text-left group focus:outline-none focus:ring-2 focus:ring-pink-400 rounded-xl p-1 -m-1 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          title="Open Ka!ro Welcome Guide"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-pink-500/20 font-black text-sm select-none group-hover:shadow-pink-500/40 transition-shadow">
            K!
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 bg-clip-text text-transparent dark:from-pink-400 dark:via-rose-300 dark:to-amber-300 select-none leading-none">
              {t.appTitle}
            </h1>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase hidden sm:block group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-colors">
              {t.appSubtitle}
            </span>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Language Switcher */}
        <Tooltip content={language === 'en' ? 'Tukar ke Bahasa Melayu' : 'Switch to English'}>
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200/80 dark:border-gray-700/80 text-gray-700 dark:text-gray-200 text-[11px] font-extrabold tracking-wide hover:border-pink-400 dark:hover:border-pink-500 hover:text-pink-500 dark:hover:text-pink-400 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 shadow-sm"
            aria-label="Toggle language"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-pink-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <div className="flex items-center font-black">
              <span className={language === 'en' ? 'text-pink-600 dark:text-pink-400' : 'text-gray-400 dark:text-gray-500'}>EN</span>
              <span className="mx-0.5 text-gray-300 dark:text-gray-600">/</span>
              <span className={language === 'ms' ? 'text-pink-600 dark:text-pink-400' : 'text-gray-400 dark:text-gray-500'}>BM</span>
            </div>
          </button>
        </Tooltip>

        {/* Templates Button */}
        <div className="relative" ref={templatesRef}>
          <Tooltip content={t.templateLibrary}>
            <button
              onClick={() => {
                if (onOpenTemplateLibrary) {
                  onOpenTemplateLibrary();
                } else {
                  setShowTemplates(!showTemplates);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-bold tracking-wide transition-all focus:outline-none focus:ring-2 focus:ring-brand-pink-300 shadow-sm ${
                showTemplates
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 border-transparent text-white shadow-pink-500/25'
                  : 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/80 dark:border-gray-700/80 text-gray-700 dark:text-gray-200 hover:border-pink-400 dark:hover:border-pink-500 hover:text-pink-500 dark:hover:text-pink-400'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="hidden sm:inline">{t.templateLibrary}</span>
            </button>
          </Tooltip>

          {showTemplates && !onOpenTemplateLibrary && (
            <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 max-h-[480px] overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700/80 p-3.5 flex flex-col gap-2.5 animate-fade-in z-[100]">
              <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-xs font-extrabold text-gray-800 dark:text-gray-100 uppercase tracking-wider">
                  {t.promptBankTitle} ({filteredTemplates.length})
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{t.promptBankClickToPopulate}</span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder={t.promptBankSearchPlaceholder}
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  className="w-full bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400/50"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {templateSearch && (
                  <button 
                    onClick={() => setTemplateSearch('')}
                    className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 text-xs"
                  >
                    &times;
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px] select-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-0.5 rounded-full whitespace-nowrap transition-colors text-[10px] font-bold ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {cat === "All" ? t.categoryAll : translateCategory(cat, language)}
                  </button>
                ))}
              </div>
              
              {/* Scrollable Templates List */}
              <div className="overflow-y-auto max-h-[320px] flex flex-col gap-1.5 pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-8 text-xs text-gray-400 dark:text-gray-500">
                    {t.promptBankNoResults}
                  </div>
                ) : (
                  filteredTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        onSelectTemplate(template.prompt, template.mode);
                        setShowTemplates(false);
                      }}
                      className="w-full text-left p-2.5 rounded-xl transition-all hover:bg-pink-50/70 dark:hover:bg-pink-950/30 border border-gray-100 dark:border-gray-800 hover:border-pink-300 dark:hover:border-pink-800/60 flex items-start gap-2.5 group bg-white/70 dark:bg-gray-800/60 shadow-sm"
                    >
                      <span className="text-base shrink-0 mt-0.5">{template.icon}</span>
                      <div className="flex flex-col flex-grow min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs text-gray-800 dark:text-gray-100 group-hover:text-pink-600 dark:group-hover:text-pink-300 truncate">
                            {template.label}
                          </span>
                          <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                            template.mode === 'image'
                              ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300'
                              : 'bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300'
                          }`}>
                            {template.mode}
                          </span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-[11px] line-clamp-2 mt-0.5 leading-snug">
                          {template.prompt}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {template.tags.map((tag) => (
                            <span key={tag} className="text-[9px] px-1.5 py-0.2 rounded-md bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Fluid Ambient Background Toggle */}
        {onToggleFluid && (
          <Tooltip content={isFluidEnabled ? "Disable Fluid Ambient Background" : "Enable Fluid Ambient Background"}>
            <button
              onClick={onToggleFluid}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-bold tracking-wide transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-sm ${
                isFluidEnabled
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 border-transparent text-white shadow-cyan-500/25'
                  : 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/80 dark:border-gray-700/80 text-gray-700 dark:text-gray-200 hover:border-cyan-400 dark:hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isFluidEnabled ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <span className="hidden sm:inline">{t.fluid}</span>
            </button>
          </Tooltip>
        )}

        {/* Settings Button & Popover */}
        <div className="relative" ref={settingsRef}>
             <Tooltip content={t.settings}>
                 <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-bold tracking-wide transition-all focus:outline-none focus:ring-2 focus:ring-brand-pink-300 shadow-sm ${
                        showSettings 
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 border-transparent text-white' 
                        : 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/80 dark:border-gray-700/80 text-gray-700 dark:text-gray-200 hover:border-pink-400 dark:hover:border-pink-500 hover:text-pink-500 dark:hover:text-pink-400'
                    }`}
                 >
                    <CogIcon />
                    <span className="hidden sm:inline">{t.settings}</span>
                 </button>
             </Tooltip>

             {/* Settings Popover */}
             {showSettings && (
                 <div className="absolute top-full right-0 mt-2 w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700/80 p-3.5 flex flex-col gap-3 animate-fade-in z-[100]">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t.model}</span>
                        <select 
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-pink-400/50 focus:outline-none"
                        >
                            {getModelOptions().map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t.clarificationModel}</span>
                        <select 
                            value={selectedClarificationModel}
                            onChange={(e) => setSelectedClarificationModel(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-pink-400/50 focus:outline-none"
                        >
                            <option value="gemini-3.7-flash">Gemini 3.7 Flash (Recommended)</option>
                            <option value="gemini-flash-latest">Flash Latest</option>
                            <option value="gemini-3.1-flash-lite-preview">Flash Lite (Fastest)</option>
                        </select>
                    </div>

                    {mode === 'story' && (
                         <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t.storyType}</span>
                            <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                <button 
                                onClick={() => setStoryType('generic')}
                                className={`flex-1 text-xs px-2.5 py-1.5 font-medium transition-colors ${storyType === 'generic' ? 'bg-pink-500 text-white font-bold' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                                >
                                {t.storyGeneric}
                                </button>
                                <button 
                                onClick={() => setStoryType('video-prompt')}
                                className={`flex-1 text-xs px-2.5 py-1.5 font-medium transition-colors ${storyType === 'video-prompt' ? 'bg-pink-500 text-white font-bold' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                                >
                                {t.storyNarrative}
                                </button>
                            </div>
                         </div>
                    )}

                    {mode === 'image' && (
                         <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t.aspectRatio}</span>
                            <select 
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-pink-400/50 focus:outline-none"
                            >
                                <option value="16:9">16:9 ({t.landscape})</option>
                                {mode === 'image' && <option value="1:1">1:1 ({t.square})</option>}
                                <option value="9:16">9:16 ({t.portrait})</option>
                                {mode === 'image' && (
                                    <>
                                    <option value="4:3">4:3</option>
                                    <option value="3:4">3:4</option>
                                    {selectedModel === 'gemini-3.1-flash-image-preview' && (
                                        <>
                                        <option value="1:4">1:4 (Ultra-tall)</option>
                                        <option value="1:8">1:8 (Ultra-tall)</option>
                                        <option value="4:1">4:1 (Ultra-wide)</option>
                                        <option value="8:1">8:1 (Ultra-wide)</option>
                                        </>
                                    )}
                                    </>
                                )}
                            </select>
                         </div>
                    )}

                    {showResolutionSelector && (
                         <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t.resolution}</span>
                            <select 
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-pink-400/50 focus:outline-none"
                            >
                            {getResolutionOptions().map(res => (
                                <option key={res} value={res}>{res}</option>
                            ))}
                            </select>
                        </div>
                    )}
                 </div>
             )}
        </div>

        <Tooltip content={t.history} position="bottom-right">
            <button
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200/80 dark:border-gray-700/80 text-gray-700 dark:text-gray-200 text-[12px] font-bold tracking-wide hover:border-pink-400 dark:hover:border-pink-500 hover:text-pink-500 dark:hover:text-pink-400 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">{t.history}</span>
            </button>
        </Tooltip>
        <Tooltip content={t.info} position="bottom-right">
            <button
              onClick={onShowInfo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200/80 dark:border-gray-700/80 text-gray-700 dark:text-gray-200 text-[12px] font-bold tracking-wide hover:border-pink-400 dark:hover:border-pink-500 hover:text-pink-500 dark:hover:text-pink-400 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">{t.info}</span>
            </button>
        </Tooltip>
        <Tooltip content={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"} position="bottom-right">
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200/80 dark:border-gray-700/80 text-gray-700 dark:text-gray-200 text-[12px] font-bold tracking-wide hover:border-pink-400 dark:hover:border-pink-500 hover:text-pink-500 dark:hover:text-pink-400 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 shadow-sm"
            >
              {isDarkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
              ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
              )}
              <span className="hidden sm:inline">{isDarkMode ? t.themeLight : t.themeDark}</span>
            </button>
        </Tooltip>
      </div>
    </header>
  );
};

export default Header;
