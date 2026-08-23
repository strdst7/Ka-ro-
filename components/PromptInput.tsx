
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useState, useEffect } from 'react';
import { Tooltip } from './Tooltip';
import { ImagePart, Mode, Language } from '../types';
import { getTranslation } from '../services/i18n';

// List of MIME types officially supported by Gemini Vision models
const SUPPORTED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/heic',
  'image/heif'
];

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: () => void;
  onAnalyze: () => void;
  onOpenTemplates?: () => void;
  isLoading: boolean;
  isGenerating: boolean;
  isAnalyzing?: boolean;
  isFirstRun: boolean;
  mode: Mode;
  setMode: (mode: Mode) => void;
  uploadedImages: ImagePart[];
  setUploadedImages: (imgs: ImagePart[]) => void;
  pendingAttributeUpdates?: Record<string, string>;
  pendingRelationshipUpdates?: Record<string, string>;
  language?: Language;
}

const PromptInput: React.FC<PromptInputProps> = ({ 
  prompt, 
  setPrompt, 
  onSubmit, 
  onAnalyze,
  onOpenTemplates,
  isLoading, 
  isGenerating, 
  isAnalyzing = false,
  isFirstRun, 
  mode, 
  setMode,
  uploadedImages, 
  setUploadedImages,
  pendingAttributeUpdates = {},
  pendingRelationshipUpdates = {},
  language = 'en',
}) => {
  const t = getTranslation(language);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [generateProgress, setGenerateProgress] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setGenerateProgress(0);
      return;
    }

    setGenerateProgress(8);
    const targetDurationMs = mode === 'story' ? 5000 : 9000;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const ratio = elapsed / targetDurationMs;
      // Exponential ease-out curve that approaches up to 96%
      const calculated = Math.min(Math.round((1 - Math.exp(-ratio * 2.2)) * 100), 96);
      setGenerateProgress(prev => Math.max(prev, calculated));
    }, 100);

    return () => clearInterval(interval);
  }, [isGenerating, mode]);

  const hasUpdates = Object.keys(pendingAttributeUpdates).length > 0 || Object.keys(pendingRelationshipUpdates).length > 0;
  const generateTooltipText = `${language === 'ms' ? 'Jana' : 'Generate'} ${mode === 'story' ? (language === 'ms' ? 'cerita' : 'a story') : (language === 'ms' ? 'gambar' : 'images')}`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages: ImagePart[] = [];
      let pendingReads = files.length;
      
      Array.from(files).forEach((file: File) => {
          if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
            alert(`Unsupported image type: ${file.type}. Please upload a JPEG, PNG, WEBP, or HEIC file.`);
            pendingReads--;
            return;
          }

          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            newImages.push({
              inlineData: {
                data: base64,
                mimeType: file.type
              }
            });
            pendingReads--;
            if (pendingReads === 0) {
                 setUploadedImages([...uploadedImages, ...newImages]);
            }
          };
          reader.readAsDataURL(file);
      });

      // Reset input value to allow selecting the same file again immediately
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
      setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const getComplexity = (text: string) => {
    if (!text.trim()) return { label: t.complexityEmpty, color: 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500' };
    const words = text.trim().split(/\s+/).length;
    const hasAdvancedKeywords = /lighting|atmosphere|cinematic|detailed|texture|style|vibe|composition|lens|camera|depth|pencahayaan|suasana|terperinci/i.test(text);
    
    if (words > 25 || (words > 15 && hasAdvancedKeywords)) {
      return { label: t.complexityAdvanced, color: 'bg-brand-pink-100 text-brand-pink-700 dark:bg-brand-pink-900/40 dark:text-brand-pink-300 ring-1 ring-brand-pink-200 dark:ring-brand-pink-800' };
    }
    if (words >= 10) {
      return { label: t.complexityDetailed, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800' };
    }
    return { label: t.complexitySimple, color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 ring-1 ring-gray-200 dark:ring-gray-600' };
  };

  const complexity = getComplexity(prompt);

  return (
    <div className="bg-transparent flex flex-col transition-colors duration-200">
      {/* Header with Title and Mode Selection */}
      <div className="px-3.5 sm:px-4 py-2.5 border-b border-gray-150/80 dark:border-gray-800/80 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md flex flex-wrap justify-between items-center gap-1.5 sm:gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
            <h2 className="text-xs font-black tracking-wider text-gray-800 dark:text-gray-200 uppercase whitespace-nowrap">
              {t.visionPromptTitle}
            </h2>
          </div>
          <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${complexity.color}`}>
            {complexity.label}
          </div>
        </div>
        
        {/* Top Right Mode Selector */}
        <div className="flex items-center bg-gray-200/70 dark:bg-gray-800/80 p-0.5 rounded-xl shrink-0 h-8 gap-0.5 border border-gray-300/40 dark:border-gray-700/60">
            <button
                onClick={() => setMode('image')}
                className={`flex items-center h-full px-2.5 rounded-lg transition-all text-[11px] font-bold whitespace-nowrap gap-1.5 ${
                    mode === 'image'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm font-extrabold shadow-pink-500/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                {t.modeImage}
            </button>
 
            <button
                onClick={() => setMode('story')}
                className={`flex items-center h-full px-2.5 rounded-lg transition-all text-[11px] font-bold whitespace-nowrap gap-1.5 ${
                    mode === 'story'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm font-extrabold shadow-pink-500/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                {t.modeStory}
            </button>
        </div>
      </div>
      
      <div className="p-3 flex flex-col gap-2">
        <div 
          className="w-full relative"
        >
            <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t.promptPlaceholder}
            className={`w-full h-[100px] md:h-[120px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700/80 rounded-xl p-3 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-pink-400/60 focus:border-pink-400 focus:outline-none resize-none text-[12px] leading-relaxed shadow-inner transition-all disabled:opacity-50 disabled:pointer-events-none ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
            disabled={isLoading}
            />

            <div className="absolute bottom-2 right-2 flex gap-1.5 items-center flex-wrap justify-end">
                {uploadedImages.map((img, idx) => (
                    <div key={idx} className={`relative group ${isLoading ? 'opacity-50' : ''}`}>
                        <img 
                            src={`data:${img.inlineData.mimeType};base64,${img.inlineData.data}`} 
                            alt={`Ref ${idx}`} 
                            className="h-8 w-8 md:h-9 md:w-9 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shadow-md"
                        />
                        <Tooltip content={t.removeImageTooltip} className="absolute -top-1.5 -right-1.5">
                            <button 
                                onClick={() => removeImage(idx)}
                                disabled={isLoading}
                                className="bg-rose-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-[9px] shadow-sm hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:pointer-events-none font-bold"
                            >
                                &times;
                            </button>
                        </Tooltip>
                    </div>
                ))}
                
                <Tooltip content={t.uploadReferenceImagesTooltip} position="top-right">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        className="p-1.5 bg-gray-100/80 hover:bg-gray-200 dark:bg-gray-800/80 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-all border border-gray-200/80 dark:border-gray-700 disabled:opacity-50 disabled:pointer-events-none shadow-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </button>
                </Tooltip>

                {onOpenTemplates && (
                    <Tooltip content={t.templateLibrary} position="top-right">
                        <button
                            onClick={onOpenTemplates}
                            disabled={isLoading}
                            className="flex items-center gap-1 px-2 py-1.5 bg-pink-50/80 hover:bg-pink-100 dark:bg-pink-950/40 dark:hover:bg-pink-900/60 rounded-lg text-pink-600 dark:text-pink-300 transition-all border border-pink-200/80 dark:border-pink-800/60 disabled:opacity-50 disabled:pointer-events-none shadow-sm text-xs font-bold"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <span className="hidden sm:inline">{t.templateLibrary}</span>
                        </button>
                    </Tooltip>
                )}
            </div>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                multiple
                accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
            />
        </div>
        
        {/* Toolbar: Actions (Right) */}
        <div className="flex flex-row items-center justify-end gap-2 overflow-visible pb-0.5 flex-nowrap relative z-50">
            {/* Action Buttons */}
            <div className="flex gap-2 shrink-0 h-8 md:h-9">
            <Tooltip content={t.refinePromptTooltip} className="h-full" position="bottom-right" contentClassName="w-full">
                <button
                onClick={(e) => { e.preventDefault(); onAnalyze(); }}
                disabled={isLoading}
                className={`
                    relative overflow-hidden
                    h-full px-4 md:px-5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm
                    text-[12px] font-bold whitespace-nowrap disabled:pointer-events-none
                    ${isLoading 
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : (isAnalyzing
                            ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white cursor-wait opacity-90' 
                            : 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white hover:shadow-lg hover:shadow-pink-500/20 active:scale-[0.99]')
                    }
                    ${isFirstRun && !isLoading && !isAnalyzing ? 'ring-2 ring-pink-400/50 ring-offset-1 dark:ring-offset-gray-800' : ''}
                `}
                >
                    {isAnalyzing ? (
                         <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    )}
                    <span className="text-[11px]">{t.helpMeRefinePrompt}</span>
                    {isFirstRun && !isLoading && !isAnalyzing && (
                        <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                        </span>
                    )}
                </button>
            </Tooltip>

            <Tooltip content={generateTooltipText} position="bottom-right" className="h-full">
                <button
                onClick={(e) => { e.preventDefault(); onSubmit(); }}
                disabled={isLoading || (!prompt && uploadedImages.length === 0)}
                className={`
                    relative overflow-hidden
                    h-full px-4 md:px-5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm
                    text-xs md:text-sm font-bold whitespace-nowrap border disabled:pointer-events-none select-none
                    ${(isLoading || (!prompt && uploadedImages.length === 0))
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                        : 'bg-gray-900 hover:bg-black text-white dark:bg-gray-700 dark:hover:bg-gray-600 border-transparent shadow-md active:scale-[0.99]'}
                `}
                >
                {isGenerating && (
                    <>
                        {/* Shimmer / progress fill background */}
                        <div 
                            className="absolute inset-0 bg-gradient-to-r from-pink-500/30 to-amber-500/30 transition-[width] duration-150 ease-out origin-left pointer-events-none"
                            style={{ width: `${generateProgress}%` }}
                        />
                        
                        {/* Bottom progress bar line */}
                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-black/20 dark:bg-white/10 overflow-hidden pointer-events-none">
                            <div 
                                className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 transition-[width] duration-150 ease-out shadow-[0_0_8px_rgba(236,72,153,0.8)]"
                                style={{ width: `${generateProgress}%` }}
                            />
                        </div>
                    </>
                )}

                {isGenerating ? (
                    <div className="relative z-10 flex items-center gap-1.5">
                        <svg className="animate-spin h-3.5 w-3.5 text-pink-400 dark:text-pink-300 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-[11px] font-bold text-white">{t.generating}</span>
                        <span className="text-[10px] font-mono font-semibold text-pink-300 dark:text-pink-200">
                            {generateProgress}%
                        </span>
                    </div>
                ) : (
                    <span className="relative z-10 text-[11px] flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t.generate}
                    </span>
                )}
                </button>
            </Tooltip>
            </div>
        </div>
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default PromptInput;
