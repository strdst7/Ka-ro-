/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mode, Language } from '../types';
import { getPromptBank, PromptTemplate, PromptCategory, translateCategory } from '../data/promptBank';
import { getTranslation } from '../services/i18n';

interface TemplateLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (prompt: string, mode: Mode) => void;
  language?: Language;
}

export const TemplateLibraryModal: React.FC<TemplateLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  language = 'en'
}) => {
  const currentLanguage: Language = (language === 'ms' ? 'ms' : 'en');
  const t = getTranslation(currentLanguage);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModeFilter, setSelectedModeFilter] = useState<'all' | Mode>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load localized prompt bank
  const allTemplates = useMemo(() => {
    return getPromptBank(currentLanguage);
  }, [currentLanguage]);

  // Extract all unique categories with proper ordering (highlighted first)
  const categories = useMemo(() => {
    const priorityCategories: PromptCategory[] = [
      'Storyteller',
      'Marketing Copywriter',
      'Image Prompting',
      'Sci-Fi & Cyberpunk',
      'Fantasy & Mythical',
      'Cozy & Whimsical',
      'Cinematic & Surreal',
      'Anime & Concept Art',
      'Architecture & Spaces',
      'Narrative & Mystery',
      'Nature & Worldbuilding'
    ];

    const presentCategories = Array.from(new Set(allTemplates.map(item => item.category)));
    const sorted = [
      ...priorityCategories.filter(cat => presentCategories.includes(cat)),
      ...presentCategories.filter(cat => !priorityCategories.includes(cat as PromptCategory))
    ];

    return ['All', ...sorted];
  }, [allTemplates]);

  // Filter templates based on mode, category, and search query
  const filteredTemplates = useMemo(() => {
    return allTemplates.filter(item => {
      // Mode filter
      if (selectedModeFilter !== 'all' && item.mode !== selectedModeFilter) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesLabel = item.label.toLowerCase().includes(query);
        const matchesPrompt = item.prompt.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        const matchesTranslatedCat = translateCategory(item.category, currentLanguage).toLowerCase().includes(query);
        const matchesTags = item.tags.some(tag => tag.toLowerCase().includes(query));

        if (!matchesLabel && !matchesPrompt && !matchesCategory && !matchesTranslatedCat && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [allTemplates, selectedModeFilter, selectedCategory, searchQuery, currentLanguage]);

  // Keyboard navigation & focus trap
  useEffect(() => {
    if (!isOpen) return;

    // Auto focus search input
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 150);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopyPrompt = (e: React.MouseEvent, template: PromptTemplate) => {
    e.stopPropagation();
    navigator.clipboard.writeText(template.prompt).then(() => {
      setCopiedId(template.id);
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    });
  };

  const handleApply = (template: PromptTemplate) => {
    onSelectTemplate(template.prompt, template.mode);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[2500] flex items-center justify-center p-3 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-xl overflow-hidden"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-library-title"
      >
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-5xl h-[88vh] max-h-[850px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-3xl border border-gray-200/80 dark:border-gray-700/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden"
        >
          {/* Ambient Glows */}
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-gradient-to-br from-pink-500/15 to-rose-500/0 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-gradient-to-tl from-amber-500/15 to-pink-500/0 rounded-full blur-3xl pointer-events-none" />

          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-gray-200/70 dark:border-gray-800/80 flex flex-col gap-4 relative z-10 shrink-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-pink-500/25 font-bold text-xl select-none shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 id="template-library-title" className="text-xl sm:text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight">
                      {t.templateLibrary}
                    </h2>
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300">
                      {allTemplates.length} {t.templatesCount}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                    {t.templateLibrarySubtitle}
                  </p>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400 shrink-0"
                aria-label="Close template library"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Controls Bar: Search & Mode Filter */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t.promptBankSearchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-100/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-2xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400/50 shadow-inner"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3.5 top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    aria-label="Clear search"
                  >
                    &times;
                  </button>
                )}
              </div>

              {/* Mode Switcher Tabs (All / Image / Story) */}
              <div className="flex items-center bg-gray-100/90 dark:bg-gray-800/90 p-1 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shrink-0">
                <button
                  onClick={() => setSelectedModeFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedModeFilter === 'all'
                      ? 'bg-white dark:bg-gray-700 text-pink-600 dark:text-pink-300 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {t.filterAll}
                </button>
                <button
                  onClick={() => setSelectedModeFilter('image')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedModeFilter === 'image'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{t.filterImage}</span>
                </button>
                <button
                  onClick={() => setSelectedModeFilter('story')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedModeFilter === 'story'
                      ? 'bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-300 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>{t.filterStory}</span>
                </button>
              </div>
            </div>

            {/* Category Pills Slider */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs select-none">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                const isStoryteller = cat === 'Storyteller';
                const isMarketing = cat === 'Marketing Copywriter';
                const isImagePrompting = cat === 'Image Prompting';

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full whitespace-nowrap transition-all text-xs font-bold flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white shadow-md shadow-pink-500/20 scale-[1.02]'
                        : isStoryteller
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                          : isMarketing
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                            : isImagePrompting
                              ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 hover:bg-purple-100 dark:hover:bg-purple-900/60'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {isStoryteller && <span>🎭</span>}
                    {isMarketing && <span>✍️</span>}
                    {isImagePrompting && <span>🎨</span>}
                    <span>{cat === 'All' ? t.allCategories : translateCategory(cat, currentLanguage)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Body: Templates Grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {filteredTemplates.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-700 dark:text-gray-200 mb-1">
                  {t.promptBankNoResults}
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm mb-4">
                  {currentLanguage === 'ms' ? 'Cuba kata kunci yang berbeza atau pilih kategori lain.' : 'Try a different search query or select another category filter.'}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedModeFilter('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300 font-bold text-xs hover:bg-pink-200 dark:hover:bg-pink-900/60 transition-colors"
                >
                  {currentLanguage === 'ms' ? 'Set Semula Penapis' : 'Reset Filters'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => {
                  const isCopied = copiedId === template.id;
                  const isStory = template.mode === 'story';

                  return (
                    <motion.div
                      key={template.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="group relative flex flex-col justify-between bg-white dark:bg-gray-800/80 hover:bg-pink-50/30 dark:hover:bg-pink-950/20 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 hover:border-pink-300 dark:hover:border-pink-600/60 p-4 transition-all shadow-sm hover:shadow-md cursor-pointer"
                      onClick={() => handleApply(template)}
                    >
                      {/* Top bar: Icon, Title, Mode Badge */}
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xl shrink-0 p-1.5 rounded-xl bg-gray-100 dark:bg-gray-700/70">{template.icon}</span>
                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors truncate">
                                {template.label}
                              </h4>
                              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                                {translateCategory(template.category, currentLanguage)}
                              </span>
                            </div>
                          </div>

                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shrink-0 tracking-wider flex items-center gap-1 ${
                            isStory
                              ? 'bg-amber-100/80 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-700/60'
                              : 'bg-blue-100/80 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-700/60'
                          }`}>
                            {isStory ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            )}
                            <span>{template.mode}</span>
                          </span>
                        </div>

                        {/* Prompt Content Preview */}
                        <div className="bg-gray-50/90 dark:bg-gray-900/60 p-3 rounded-xl border border-gray-100 dark:border-gray-800 mb-3">
                          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed font-sans">
                            {template.prompt}
                          </p>
                        </div>
                      </div>

                      {/* Bottom bar: Tags + Action buttons */}
                      <div className="flex flex-col gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-800/60">
                        <div className="flex flex-wrap gap-1">
                          {template.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400 font-medium">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-1">
                          <button
                            onClick={(e) => handleCopyPrompt(e, template)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-pink-400"
                            title={t.copyPrompt || "Copy"}
                          >
                            {isCopied ? (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                  {currentLanguage === 'ms' ? 'Disalin!' : 'Copied!'}
                                </span>
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                  {currentLanguage === 'ms' ? 'Salin' : 'Copy'}
                                </span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApply(template);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs shadow-sm group-hover:shadow-pink-500/25 transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-pink-400"
                          >
                            <span>{t.useTemplate}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-5 border-t border-gray-200/70 dark:border-gray-800/80 bg-gray-50/70 dark:bg-gray-900/70 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <span className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
              {currentLanguage === 'ms' 
                ? 'Tip: Memilih templat akan mengisi prompt secara automatik dan menukar mod jika perlu.' 
                : 'Tip: Selecting a template automatically populates the prompt box and updates the mode.'}
            </span>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gray-200/80 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              {currentLanguage === 'ms' ? 'Tutup' : 'Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
