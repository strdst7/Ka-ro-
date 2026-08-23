
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useMemo } from 'react';
import { Tooltip } from './Tooltip';
import { Skeleton } from './Skeleton';
import { Clarification, Language } from '../types';
import { getTranslation } from '../services/i18n';

interface ClarificationCardProps {
  clarifications: Clarification[];
  onRefresh: () => void;
  isLoading: boolean;
  pendingAnswers: {[key: string]: string};
  setPendingAnswers: React.Dispatch<React.SetStateAction<{[key: string]: string}>>;
  prompt?: string;
  language?: Language;
}

// --- Thinking Process Component ---
const ThinkingProcess = ({ prompt = "", language = ("en" as Language) }: { prompt: string; language?: Language }) => {
    const [step, setStep] = useState(0);
    const t = getTranslation(language);

    const steps = useMemo(() => {
        if (language === 'ms') {
            const baseSteps = [
                "Menganalisis kekaburan dalam prompt...",
                "Mengenal pasti atribut yang samar...",
                "Mengesan entiti tersirat...",
                "Menilai ketidakpastian semantik...",
                "Merangka soalan penjelasan...",
            ];
            if (prompt && prompt.length > 0) {
                const lowerPrompt = prompt.toLowerCase();
                if (lowerPrompt.includes("image") || lowerPrompt.includes("gambar") || lowerPrompt.includes("scene")) {
                     baseSteps.splice(1, 0, "Meneliti deskriptor visual...");
                }
                if (lowerPrompt.includes("story") || lowerPrompt.includes("cerita") || lowerPrompt.includes("narasi")) {
                     baseSteps.splice(1, 0, "Menilai jurang naratif...");
                }
            }
            return baseSteps;
        }

        const baseSteps = [
            "Analyzing prompt for ambiguities...",
            "Identifying vague attributes...",
            "Detecting implicit entities...",
            "Evaluating semantic uncertainties...",
            "Drafting clarification questions...",
        ];
        
        // Context detection for more specific steps
        if (prompt && prompt.length > 0) {
            const lowerPrompt = prompt.toLowerCase();
            if (lowerPrompt.includes("image") || lowerPrompt.includes("picture") || lowerPrompt.includes("scene")) {
                 baseSteps.splice(1, 0, "Scanning visual descriptors...");
            }
            if (lowerPrompt.includes("story") || lowerPrompt.includes("narrative") || lowerPrompt.includes("write")) {
                 baseSteps.splice(1, 0, "Evaluating narrative gaps...");
            }
        }
        
        return baseSteps;
    }, [prompt, language]);

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((s) => (s + 1) % steps.length);
        }, 2200); // 2.2 seconds per step
        return () => clearInterval(interval);
    }, [steps]);

    return (
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300 animate-pulse min-w-[240px] text-center transition-all duration-300">
            {steps[step]}
        </span>
    );
};

const ClarificationCard: React.FC<ClarificationCardProps> = ({ 
    clarifications, 
    onRefresh,
    isLoading,
    pendingAnswers,
    setPendingAnswers,
    prompt = "",
    language = ('en' as Language)
}) => {
  const t = getTranslation(language);

  const handleSelectOption = (question: string, option: string) => {
      setPendingAnswers(prev => ({ ...prev, [question]: option }));
  };

  const handleCustomAnswerChange = (question: string, value: string) => {
      setPendingAnswers(prev => {
          const newState = { ...prev, [question]: value };
          if (!value.trim()) delete newState[question];
          return newState;
      });
  };

  return (
    <div className="bg-transparent rounded-2xl transition-colors duration-200 flex flex-col relative w-full flex-1 min-h-0 h-full">
      
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-30 rounded-2xl transition-opacity duration-300 min-h-0">
            <div className="flex flex-col items-center p-8 bg-white/90 dark:bg-gray-850/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700/80 max-w-sm w-full mx-4">
                <div className="relative mb-4">
                     <svg className="animate-spin h-10 w-10 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
                <ThinkingProcess prompt={prompt} language={language} />
            </div>
        </div>
      )}

      {/* Content Layer */}
      <div className={`flex flex-col flex-1 min-h-0 h-full ${isLoading ? 'opacity-30 pointer-events-none' : ''}`}>
        {clarifications.length === 0 && !isLoading ? (
            <div className="p-4 flex flex-col flex-1 justify-center items-center h-full min-h-0">
                <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl border border-gray-200/60 dark:border-gray-800/80 flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500 p-8 w-full max-w-lg shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-pink-500/10 dark:bg-pink-500/20 text-pink-500 flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t.noActiveClarifications}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {language === 'ms' ? 'Tekan ' : 'Click '}
                      <span className="font-bold text-pink-500">{t.helpMeRefinePrompt}</span>
                      {language === 'ms' ? ' untuk menjana soalan panduan.' : ' to generate guided questions.'}
                    </p>
                </div>
            </div>
        ) : (
            <div className="flex flex-col flex-1 min-h-0">
                <div className="space-y-3.5 p-4 flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                    {/* Actual content */}
                    {isLoading && clarifications.length === 0 ? (
                         [1, 2, 3].map(i => (
                             <div key={i} className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-150 dark:border-gray-700/60">
                                <Skeleton className="h-4 w-3/4 mb-3" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-7 w-20 rounded-full" />
                                    <Skeleton className="h-7 w-20 rounded-full" />
                                    <Skeleton className="h-7 w-20 rounded-full" />
                                </div>
                             </div>
                         ))
                    ) : (
                        clarifications.map((item, index) => (
                            <div key={index} className="bg-white/60 dark:bg-gray-855/60 backdrop-blur-md rounded-xl p-3.5 border border-gray-200/70 dark:border-gray-750/70 shadow-sm transition-all hover:border-pink-300 dark:hover:border-pink-800/60">
                                <p className="font-bold text-gray-800 dark:text-gray-100 mb-2 text-sm leading-snug">{item.question}</p>
                                <div className="flex flex-wrap gap-1.5 mb-2.5">
                                    {item.options.map(option => (
                                        <button
                                            key={option}
                                            onClick={() => handleSelectOption(item.question, option)}
                                            disabled={isLoading}
                                            className={`text-xs py-1 px-3 rounded-full border transition-all ${
                                                pendingAnswers[item.question] === option
                                                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 border-transparent text-white font-bold shadow-md shadow-pink-500/20'
                                                    : 'bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-pink-300 dark:hover:border-pink-700 hover:text-pink-600 dark:hover:text-pink-300'
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={pendingAnswers[item.question] && !item.options.includes(pendingAnswers[item.question]) ? pendingAnswers[item.question] : ''}
                                    onChange={(e) => handleCustomAnswerChange(item.question, e.target.value)}
                                    placeholder={t.customAnswerPlaceholder}
                                    disabled={isLoading}
                                    className="w-full text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/30 bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-gray-200 transition-all placeholder:text-gray-400"
                                />
                            </div>
                        ))
                    )}
                </div>
                
                {clarifications.length > 0 && (
                    <div className="py-2.5 px-4 border-t border-gray-200/60 dark:border-gray-800/80 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md flex flex-row justify-between items-center gap-2 z-10 flex-shrink-0">
                        <Tooltip content={t.getDifferentQuestionsTooltip} position="bottom-left">
                            <button 
                                onClick={onRefresh}
                                disabled={isLoading}
                                className="bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-200 font-bold h-7 md:h-8 px-3 rounded-lg flex items-center justify-center transition-all shadow-sm text-xs disabled:pointer-events-none whitespace-nowrap gap-1.5"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {t.refresh}
                            </button>
                        </Tooltip>
                        <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">{t.clickUpdatePromptPrompt}</span>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default ClarificationCard;
