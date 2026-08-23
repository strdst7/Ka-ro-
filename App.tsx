/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "motion/react";
import Header from './components/Header';
import HistorySidebar from './components/HistorySidebar';
import PromptInput from './components/PromptInput';
import ClarificationCard from './components/ClarificationCard';
import OutputDisplay from './components/OutputGallery';
import { WelcomeOverlay } from './components/WelcomeOverlay';
import {
  generateClarifications,
  generateImagesFromPrompt,
  generateStoryFromPrompt,
  refinePromptWithAllUpdates,
} from './services/geminiService';
import { 
  loadSavedSession, 
  saveSessionState, 
  DEFAULT_SESSION_PROMPT, 
  DEFAULT_SESSION_MODE,
  DEFAULT_SESSION_LANGUAGE 
} from './services/sessionService';
import { Clarification, ImagePart, StoryType, GeneratedImage, AspectRatio, HistoryItem, Mode, Language } from './types';
import { getTranslation } from './services/i18n';

type MobileView = 'editor' | 'preview';

function App() {
  const initialSession = useRef(loadSavedSession()).current;

  const [language, setLanguage] = useState<Language>(() => initialSession?.language ?? DEFAULT_SESSION_LANGUAGE);
  const t = getTranslation(language);

  const [prompt, setPrompt] = useState<string>(() => initialSession?.prompt ?? DEFAULT_SESSION_PROMPT);
  const [uploadedImages, setUploadedImages] = useState<ImagePart[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(() => initialSession?.aspectRatio ?? '16:9');
  // Default resolution for Image mode
  const [resolution, setResolution] = useState<string>(() => initialSession?.resolution ?? '1K');
  // Default to Image mode model
  const [selectedModel, setSelectedModel] = useState<string>(() => initialSession?.selectedModel ?? 'gemini-2.5-flash-image');
  const [selectedClarificationModel, setSelectedClarificationModel] = useState<string>(() => initialSession?.selectedClarificationModel ?? 'gemini-3.7-flash');
  const [storyType, setStoryType] = useState<StoryType>(() => initialSession?.storyType ?? 'generic');
  
  const [isClarificationsLoading, setIsClarificationsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdatingPrompt, setIsUpdatingPrompt] = useState(false);
  
  const [isOutdated, setIsOutdated] = useState(false); 
  const [showModeChangePopup, setShowModeChangePopup] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(true);
  
  const [mode, setMode] = useState<Mode>(() => initialSession?.mode ?? DEFAULT_SESSION_MODE);
  
  const modeRef = useRef<Mode>(mode);
  const analysisRequestIdRef = useRef(0);
  const generationRequestIdRef = useRef(0);

  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [story, setStory] = useState<string | null>(null);
  const [galleryErrors, setGalleryErrors] = useState<Record<Mode, string | null>>({ image: null, story: null });
  
  const [clarifications, setClarifications] = useState<Clarification[]>(() => initialSession?.clarifications ?? []);
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>(() => initialSession?.answeredQuestions ?? []);
  const [skippedQuestions, setSkippedQuestions] = useState<string[]>(() => initialSession?.skippedQuestions ?? []); 
  const [hasGenerated, setHasGenerated] = useState(false);

  const [lastAnalyzedPrompt, setLastAnalyzedPrompt] = useState<string | null>(null);
  const [lastAnalyzedMode, setLastAnalyzedMode] = useState<Mode | null>(null);
  const [lastAnalyzedImagesSignature, setLastAnalyzedImagesSignature] = useState<string>("");

  const [pendingClarificationAnswers, setPendingClarificationAnswers] = useState<{[key: string]: string}>(() => initialSession?.pendingClarificationAnswers ?? {});
  
  const [mobileView, setMobileView] = useState<MobileView>('editor');

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | undefined>();

  // Persist session state into localStorage
  useEffect(() => {
    saveSessionState({
      prompt,
      mode,
      language,
      pendingAttributeUpdates: {},
      pendingRelationshipUpdates: {},
      pendingClarificationAnswers,
      aspectRatio,
      resolution,
      selectedModel,
      selectedClarificationModel,
      storyType,
      beliefGraph: null,
      clarifications,
      answeredQuestions,
      skippedQuestions,
      activeToolTab: 'clarify',
    });
  }, [
    prompt,
    mode,
    language,
    pendingClarificationAnswers,
    aspectRatio,
    resolution,
    selectedModel,
    selectedClarificationModel,
    storyType,
    clarifications,
    answeredQuestions,
    skippedQuestions,
  ]);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('button') ||
      target.closest('select') ||
      target.closest('a')
    ) {
      return;
    }
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        // Swipe Right -> Go to editor
        if (mobileView === 'preview') {
          setMobileView('editor');
        }
      } else {
        // Swipe Left -> Go to preview
        if (mobileView === 'editor') {
          setMobileView('preview');
        }
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  }, [mobileView]);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);
  
  const introModalRef = useRef<HTMLDivElement>(null);
  const infoModalRef = useRef<HTMLDivElement>(null);
  const lastActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isGenerating) {
        setMobileView('preview');
    }
  }, [isGenerating]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
      if (isDarkMode) {
          document.documentElement.classList.add('dark');
          document.body.style.backgroundColor = '#111827';
      } else {
          document.documentElement.classList.remove('dark');
          document.body.style.backgroundColor = '#f3f4f6';
      }
  }, [isDarkMode]);

  // Check if intro has been shown before
  useEffect(() => {
      const hasSeenIntro = localStorage.getItem('hasSeenProactiveIntro');
      if (hasSeenIntro) {
          setShowIntroModal(false);
      }
  }, []);
  
  // Trap focus for Intro Modal
  useEffect(() => {
      if (showIntroModal && introModalRef.current) {
          lastActiveElement.current = document.activeElement as HTMLElement;
          const modal = introModalRef.current;
          const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (firstElement) firstElement.focus();

          const handleTab = (e: KeyboardEvent) => {
              if (e.key === 'Tab') {
                  if (!modal.contains(document.activeElement)) {
                      e.preventDefault();
                      firstElement.focus();
                      return;
                  }

                  if (e.shiftKey) {
                      if (document.activeElement === firstElement) {
                          e.preventDefault();
                          lastElement.focus();
                      }
                  } else {
                      if (document.activeElement === lastElement) {
                          e.preventDefault();
                          firstElement.focus();
                      }
                  }
              }
              if (e.key === 'Escape') {
                  closeIntroModal();
              }
          };

          document.addEventListener('keydown', handleTab);
          return () => {
              document.removeEventListener('keydown', handleTab);
              if (lastActiveElement.current) lastActiveElement.current.focus();
          };
      }
  }, [showIntroModal]);

  // Trap focus for Info Modal
  useEffect(() => {
      if (showInfoModal && infoModalRef.current) {
          lastActiveElement.current = document.activeElement as HTMLElement;
          const modal = infoModalRef.current;
          const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (firstElement) firstElement.focus();

          const handleTab = (e: KeyboardEvent) => {
              if (e.key === 'Tab') {
                  if (!modal.contains(document.activeElement)) {
                      e.preventDefault();
                      firstElement.focus();
                      return;
                  }

                  if (e.shiftKey) {
                      if (document.activeElement === firstElement) {
                          e.preventDefault();
                          lastElement.focus();
                      }
                  } else {
                      if (document.activeElement === lastElement) {
                          e.preventDefault();
                          firstElement.focus();
                      }
                  }
              }
              if (e.key === 'Escape') {
                  setShowInfoModal(false);
              }
          };

          document.addEventListener('keydown', handleTab);
          return () => {
              document.removeEventListener('keydown', handleTab);
              if (lastActiveElement.current) lastActiveElement.current.focus();
          };
      }
  }, [showInfoModal]);
  
  // Auto-dismiss mode change popup
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (showModeChangePopup) {
        timer = setTimeout(() => {
            setShowModeChangePopup(false);
        }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showModeChangePopup]);

  const closeIntroModal = () => {
      setShowIntroModal(false);
      localStorage.setItem('hasSeenProactiveIntro', 'true');
  };

  const clearPendingUpdates = () => {
    setPendingClarificationAnswers({});
  };

  const handleStatusUpdate = useCallback((msg: string) => {
    setStatusNotification(msg);
  }, []);

  const handleModeChange = (newMode: Mode) => {
    if (newMode === mode) return;
    analysisRequestIdRef.current += 1;
    generationRequestIdRef.current += 1;
    
    const hasAnalysisData = clarifications.length > 0;

    setMode(newMode);
    setIsClarificationsLoading(false);
    setIsGenerating(false);
    setIsUpdatingPrompt(false);
    setStatusNotification(null);
    
    if (hasAnalysisData) setShowModeChangePopup(true);
    
    // Set defaults for new mode
    if (newMode === 'image') {
      setAspectRatio('16:9');
      setResolution('1K');
      setSelectedModel('gemini-2.5-flash-image');
    } else {
      setSelectedModel('gemini-flash-latest');
    }
  };

  const handleSelectTemplate = (templatePrompt: string, templateMode: Mode) => {
    setPrompt(templatePrompt);
    if (templateMode !== mode) {
      handleModeChange(templateMode);
    }
  };

  const getImagesSignature = (imgs: ImagePart[]) => {
      if (imgs.length === 0) return "";
      return `${imgs.length}-${imgs[0].inlineData.data.substring(0, 20)}`;
  };

  const refreshAnalysis = useCallback(async (
    currentPrompt: string, 
    currentAnsweredQuestions: string[], 
    currentMode: Mode, 
    currentImages: ImagePart[] = [], 
    currentStoryType: StoryType = 'generic', 
    currentClarificationModel: string = 'gemini-3.7-flash',
    currentLanguage: Language = language
  ) => {
    const requestId = ++analysisRequestIdRef.current;
    const isCurrent = () => modeRef.current === currentMode && analysisRequestIdRef.current === requestId;
    const safeStatusUpdate = (msg: string) => { if (isCurrent()) handleStatusUpdate(msg); };

    setIsClarificationsLoading(true);

    try {
      const generatedClarifications = await generateClarifications(
        currentPrompt, 
        currentAnsweredQuestions, 
        currentMode, 
        safeStatusUpdate, 
        currentImages, 
        currentStoryType, 
        currentClarificationModel,
        currentLanguage
      );
      if (isCurrent()) {
        setClarifications(generatedClarifications);
        setLastAnalyzedPrompt(currentPrompt);
        setLastAnalyzedMode(currentMode);
        setLastAnalyzedImagesSignature(getImagesSignature(currentImages));
      }
    } finally {
      if (isCurrent()) setIsClarificationsLoading(false);
    }
  }, [handleStatusUpdate, language]);

  const handleRefreshClarifications = useCallback(() => {
    const requestId = ++analysisRequestIdRef.current;
    const requestMode = mode;
    const isCurrent = () => modeRef.current === requestMode && analysisRequestIdRef.current === requestId;
    const safeStatusUpdate = (msg: string) => { if (isCurrent()) handleStatusUpdate(msg); };

    setIsClarificationsLoading(true);
    setPendingClarificationAnswers({});
    setStatusNotification(null);
    
    const currentQuestions = clarifications.map(c => c.question);
    setSkippedQuestions(prev => [...prev, ...currentQuestions]);

    generateClarifications(
      prompt, 
      [...answeredQuestions, ...skippedQuestions, ...currentQuestions], 
      requestMode, 
      safeStatusUpdate, 
      uploadedImages, 
      storyType, 
      selectedClarificationModel,
      language
    )
    .then(newClarifications => {
        if (isCurrent()) setClarifications(newClarifications);
    })
    .finally(() => {
         if (isCurrent()) setIsClarificationsLoading(false);
    });
  }, [prompt, answeredQuestions, mode, clarifications, skippedQuestions, handleStatusUpdate, uploadedImages, storyType, selectedClarificationModel, language]);

  const processRequest = useCallback(async (
    currentPrompt: string, 
    currentAnsweredQuestions: string[], 
    currentMode: Mode,
    skipAnalysis: boolean = false,
    skipGeneration: boolean = false,
    currentImages: ImagePart[] = [],
    currentRatio: AspectRatio = '16:9',
    currentResolution: string = '1K',
    currentModel: string = 'gemini-2.5-flash-image',
    currentStoryType: StoryType = 'generic',
    currentClarificationModel: string = 'gemini-3.7-flash',
    currentLanguage: Language = language
  ) => {
    const genRequestId = ++generationRequestIdRef.current;
    const requestMode = currentMode;
    const isGenCurrent = () => modeRef.current === requestMode && generationRequestIdRef.current === genRequestId;
    const safeGenStatusUpdate = (msg: string) => { if (isGenCurrent()) handleStatusUpdate(msg); };

    setGalleryErrors(prev => ({ ...prev, [requestMode]: null }));

    if (!skipGeneration) {
        if (requestMode === 'image') setImages([]);
        else if (requestMode === 'story') setStory(null);
    }
    
    setIsOutdated(false); 
    setStatusNotification(null);
    setShowModeChangePopup(false);
    
    if (!skipAnalysis) {
        setClarifications([]);
        clearPendingUpdates();
        setSkippedQuestions([]); 
    }
    
    const analysisPromise = !skipAnalysis 
        ? refreshAnalysis(currentPrompt, currentAnsweredQuestions, currentMode, currentImages, currentStoryType, currentClarificationModel, currentLanguage)
        : Promise.resolve();

    let generationPromise = Promise.resolve();
    if (!skipGeneration) {
        setIsGenerating(true);
        const historyId = Math.random().toString(36).substring(2, 9);
        setCurrentHistoryId(historyId);
        setHistory(prev => [{
          id: historyId,
          timestamp: Date.now(),
          prompt: currentPrompt,
          mode: currentMode
        }, ...prev].slice(0, 50));

        generationPromise = (async () => {
            try {
                if (requestMode === 'image') {
                    const generatedImages = await generateImagesFromPrompt(currentPrompt, safeGenStatusUpdate, currentImages, currentRatio, currentModel, currentResolution);
                    if (isGenCurrent()) {
                      setImages(generatedImages);
                      if (generatedImages.length > 0 && generatedImages[0].url) {
                        setHistory(prev => prev.map(h => h.id === historyId ? { ...h, thumbnail: generatedImages[0].url! } : h));
                      }
                    }
                } else if (requestMode === 'story') {
                    const generatedStory = await generateStoryFromPrompt(currentPrompt, safeGenStatusUpdate, currentImages, currentModel, currentStoryType, currentLanguage);
                    if (isGenCurrent()) setStory(generatedStory);
                }
            } catch (error: any) {
                if (isGenCurrent()) {
                    let userFriendlyError = error.message || "Failed to generate.";
                    
                    if (userFriendlyError.includes("429") || userFriendlyError.includes("RESOURCE_EXHAUSTED")) {
                        userFriendlyError = "API Quota exceeded. Please check your billing account or try again later.";
                    }
                    
                    setGalleryErrors(prev => ({ ...prev, [requestMode]: userFriendlyError }));
                }
            } finally {
                if (isGenCurrent()) {
                    setIsGenerating(false);
                }
            }
        })();
    }
    
    await Promise.all([analysisPromise, generationPromise]).finally(() => {
        if (isGenCurrent()) {
            setStatusNotification(null);
        }
    });
  }, [refreshAnalysis, handleStatusUpdate, language]);

  const handlePromptSubmit = useCallback(async () => {
    setHasGenerated(true);
    const qaPairs = Object.entries(pendingClarificationAnswers).map(([q, a]) => ({ question: q, answer: String(a) }));

    let targetPrompt = prompt;
    let targetAnsweredQuestions = [...answeredQuestions];
    let shouldSkipAnalysis = false;

    if (qaPairs.length > 0) {
        setIsUpdatingPrompt(true);
        try {
            const refinedPrompt = await refinePromptWithAllUpdates(prompt, qaPairs, [], handleStatusUpdate, language);
            targetPrompt = refinedPrompt;
            targetAnsweredQuestions = [...answeredQuestions, ...qaPairs.map(a => a.question)];
            setPrompt(refinedPrompt);
            setAnsweredQuestions(targetAnsweredQuestions);
            clearPendingUpdates();
        } finally {
            setIsUpdatingPrompt(false);
        }
    } else {
        const currentImagesSignature = getImagesSignature(uploadedImages);
        shouldSkipAnalysis = prompt === lastAnalyzedPrompt && mode === lastAnalyzedMode && currentImagesSignature === lastAnalyzedImagesSignature;
    }

    processRequest(targetPrompt, targetAnsweredQuestions, mode, shouldSkipAnalysis, false, uploadedImages, aspectRatio, resolution, selectedModel, storyType, selectedClarificationModel, language);
  }, [prompt, mode, lastAnalyzedPrompt, lastAnalyzedMode, lastAnalyzedImagesSignature, answeredQuestions, pendingClarificationAnswers, processRequest, handleStatusUpdate, uploadedImages, aspectRatio, resolution, selectedModel, storyType, selectedClarificationModel, language]);

  const handleAnalyzeOnly = useCallback(() => {
     setHasGenerated(true);
     setAnsweredQuestions([]);
     setClarifications([]);
     processRequest(prompt, [], mode, false, true, uploadedImages, aspectRatio, resolution, selectedModel, storyType, selectedClarificationModel, language);
  }, [prompt, mode, processRequest, uploadedImages, aspectRatio, resolution, selectedModel, storyType, selectedClarificationModel, language]);

  const handleApplyAllUpdates = async () => {
    if (isUpdatingPrompt) return;
    setIsUpdatingPrompt(true);
    const qaPairs = Object.entries(pendingClarificationAnswers).map(([q, a]) => ({ question: q, answer: String(a) }));
    const newAnsweredQuestions = [...answeredQuestions, ...qaPairs.map(a => a.question)];
    setAnsweredQuestions(newAnsweredQuestions);

    try {
        const newRefinedPrompt = await refinePromptWithAllUpdates(prompt, qaPairs, [], handleStatusUpdate, language);
        setPrompt(newRefinedPrompt);
        setIsOutdated(true); 
        clearPendingUpdates(); 
        refreshAnalysis(newRefinedPrompt, newAnsweredQuestions, mode, uploadedImages, storyType, selectedClarificationModel, language);
    } finally {
        setIsUpdatingPrompt(false);
    }
  };


  const handleUseAsReference = useCallback((imageDataUrl: string) => {
    try {
      const [header, data] = imageDataUrl.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
      
      const newImage: ImagePart = {
        inlineData: {
          data,
          mimeType
        }
      };
      
      setUploadedImages(prev => [...prev, newImage]);
      setMobileView('editor');
      handleStatusUpdate("Image added as reference.");
      setTimeout(() => setStatusNotification(prev => prev === "Image added as reference." ? null : prev), 3000);
    } catch (e) {
      console.error("Failed to parse image data URL", e);
    }
  }, [handleStatusUpdate]);

  const handleApplyStoryToPrompt = useCallback(() => {
    if (story) {
        setPrompt(story);
        setMobileView('editor');
        handleStatusUpdate("Story applied to prompt.");
        setTimeout(() => setStatusNotification(prev => prev === "Story applied to prompt." ? null : prev), 3000);
    }
  }, [story, handleStatusUpdate]);

  const handleRestoreHistory = useCallback((item: HistoryItem) => {
    setPrompt(item.prompt);
    setMode(item.mode);
    setCurrentHistoryId(item.id);
    setMobileView('editor');
    processRequest(item.prompt, [], item.mode, false, true, [], undefined, undefined, undefined, undefined, selectedClarificationModel);
  }, [processRequest, selectedClarificationModel]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handlePromptSubmit();
      }
      // Ctrl + H to toggle History
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setIsHistoryOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePromptSubmit]);

  const totalUpdateCount = Object.keys(pendingClarificationAnswers).length;
  const isBannerVisible = isUpdatingPrompt || statusNotification;

  return (
    <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`${isDarkMode ? 'dark' : ''} font-sans fixed inset-0 flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-200 overflow-hidden`}>
        <div style={{position:'fixed',inset:0,zIndex:-1,overflow:'hidden',pointerEvents:'none'}}>
            <iframe src="https://fluid.krackeddevs.com/#p=2.8,2.25,2,0.17,1,10,1,8,30,0,0,2.3889,0,1,2,1,0,0,12,0,22015,2092287,12761691,15368624,0.5" title="Fluid background" style={{width:'100%',height:'100%',border:'0',display:'block'}}></iframe>
        </div>
        <Header 
            isDarkMode={isDarkMode} 
            toggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
            onShowInfo={() => setShowInfoModal(true)}
            onShowWelcome={() => setShowIntroModal(true)}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onSelectTemplate={handleSelectTemplate}
            isLoading={isGenerating || isUpdatingPrompt || isClarificationsLoading}
            mode={mode}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            resolution={resolution}
            setResolution={setResolution}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            selectedClarificationModel={selectedClarificationModel}
            setSelectedClarificationModel={setSelectedClarificationModel}
            storyType={storyType}
            setStoryType={setStoryType}
            language={language}
            setLanguage={setLanguage}
        />

        {isBannerVisible && (
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[2000] animate-fade-in-down px-4 w-full max-w-md" role="status" aria-live="polite">
                <div className="bg-amber-100 dark:bg-amber-900/90 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 backdrop-blur-sm">
                    {isUpdatingPrompt ? (
                        <svg className="animate-spin h-5 w-5 text-amber-600 dark:text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse text-amber-600 dark:text-amber-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1-1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    )}
                    <span className="text-sm font-medium flex-1">{isUpdatingPrompt ? t.refiningPrompt : statusNotification}</span>
                    {!isUpdatingPrompt && <button onClick={() => setStatusNotification(null)} className="ml-auto text-amber-600 dark:text-amber-300 p-1 hover:bg-amber-200 dark:hover:bg-amber-800 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-amber-500" aria-label="Close notification"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
                </div>
            </div>
        )}

        {showModeChangePopup && !statusNotification && !isUpdatingPrompt && (
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[2000] animate-fade-in-down px-4 w-full max-w-md" role="alert">
                <div className="bg-blue-100 dark:bg-blue-900/90 border border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100 px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 backdrop-blur-sm relative">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1 pr-6">
                        <p className="text-sm font-bold">{mode === 'image' ? t.switchedToImageMode : t.switchedToStoryMode}</p>
                        <p className="text-xs mt-1">
                            {t.modeSwitchClarificationTip}
                        </p>
                    </div>
                    <button onClick={() => setShowModeChangePopup(false)} className="absolute top-3 right-3 text-blue-600 dark:text-blue-300 p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>
        )}

        <main className="flex-1 flex flex-col w-full max-w-screen-2xl mx-auto sm:px-4 sm:py-2 min-h-0 pb-[calc(3.5rem_+_env(safe-area-inset-bottom))] sm:pb-0 overflow-y-auto">
            {/* Enhanced Vertical Layout: Prompt box & Clarifications on top, Results below */}
            <div className="flex flex-col gap-4 w-full min-h-0 pb-6">
                {/* Top Section: Prompt + Guided Clarifications */}
                <div className={`flex flex-col bg-white/75 dark:bg-gray-800/75 backdrop-blur-xl rounded-2xl border border-gray-200/70 dark:border-gray-700/70 shadow-sm overflow-hidden shrink-0 ${mobileView === 'editor' ? 'flex' : 'hidden sm:flex'}`}>
                    <div className="relative border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-30">
                        <PromptInput
                            prompt={prompt}
                            setPrompt={setPrompt}
                            onSubmit={handlePromptSubmit}
                            onAnalyze={handleAnalyzeOnly}
                            isLoading={isGenerating || isUpdatingPrompt}
                            isGenerating={isGenerating}
                            isAnalyzing={isClarificationsLoading}
                            isFirstRun={!hasGenerated}
                            mode={mode}
                            setMode={handleModeChange}
                            uploadedImages={uploadedImages}
                            setUploadedImages={setUploadedImages}
                            language={language}
                        />
                    </div>

                    {/* Interactive Assistant Header */}
                    <div className="z-20 flex bg-gray-50/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-700 justify-between items-center px-4 py-2 shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand-pink-500 animate-pulse"></span>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">{t.guidedClarifications}</span>
                            {clarifications.length > 0 && (
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-pink-100 dark:bg-brand-pink-900/40 text-brand-pink-600 dark:text-brand-pink-300 rounded-full">
                                    {clarifications.length} {t.questionsCount}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleRefreshClarifications}
                                disabled={isClarificationsLoading || isGenerating}
                                className="text-xs text-gray-600 dark:text-gray-400 hover:text-brand-pink-600 dark:hover:text-brand-pink-400 font-medium flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 ${isClarificationsLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>{t.newQuestions}</span>
                            </button>
                        </div>
                    </div>

                    {/* Interactive Assistant Content Area */}
                    <div className="relative bg-gray-50/30 dark:bg-gray-900/30 flex flex-col w-full h-[320px] sm:h-[360px] md:h-[390px] overflow-hidden">
                        {totalUpdateCount > 0 && (
                            <div className="flex-shrink-0 bg-brand-pink-50 dark:bg-brand-pink-950/20 border-b border-brand-pink-100 dark:border-brand-pink-800/40 p-2 flex justify-between items-center animate-fade-in z-20 gap-2">
                                <div className="text-xs md:text-sm text-brand-pink-800 dark:text-brand-pink-200 font-bold flex items-center gap-1.5 flex-1 min-w-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 flex-shrink-0 text-brand-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span className="truncate">{totalUpdateCount} {t.pendingAnswersCount}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button 
                                        onClick={clearPendingUpdates} 
                                        disabled={isUpdatingPrompt || isGenerating}
                                        className="text-xs md:text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        {t.cancelAnswers}
                                    </button>
                                    <motion.button 
                                        onClick={handleApplyAllUpdates} 
                                        disabled={isUpdatingPrompt || isGenerating} 
                                        animate={totalUpdateCount > 0 && !isUpdatingPrompt && !isGenerating ? {
                                            scale: [1, 1.04, 0.98, 1.04, 1],
                                            x: [0, -3, 3, -3, 3, 0],
                                        } : { scale: 1, x: 0 }}
                                        transition={totalUpdateCount > 0 && !isUpdatingPrompt && !isGenerating ? {
                                            duration: 1.5,
                                            repeat: Infinity,
                                            repeatDelay: 3.5,
                                            ease: "easeInOut"
                                        } : undefined}
                                        className={`bg-gradient-to-r from-brand-pink-500 to-brand-peach-500 hover:from-brand-pink-600 hover:to-brand-peach-600 text-white text-xs md:text-sm font-bold py-1 px-3 rounded-md shadow-sm flex items-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-brand-pink-400 ${(isUpdatingPrompt || isGenerating) ? 'opacity-70 cursor-wait' : 'hover:shadow-md'}`}
                                    >
                                        {isUpdatingPrompt ? t.updatingPrompt : t.updatePrompt}
                                    </motion.button>
                                </div>
                            </div>
                        )}
                        <div className="w-full flex-1 min-h-0 flex flex-col h-full overflow-hidden">
                          <ClarificationCard 
                              clarifications={clarifications} 
                              onRefresh={handleRefreshClarifications} 
                              isLoading={isClarificationsLoading} 
                              pendingAnswers={pendingClarificationAnswers} 
                              setPendingAnswers={setPendingClarificationAnswers} 
                              prompt={prompt} 
                              language={language}
                          />
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Result Output */}
                <div className={`flex flex-col bg-white/75 dark:bg-gray-800/75 backdrop-blur-xl rounded-2xl border border-gray-200/70 dark:border-gray-700/70 shadow-sm overflow-hidden min-h-[480px] sm:min-h-[540px] md:min-h-[600px] ${mobileView === 'preview' ? 'flex' : 'hidden sm:flex'}`}>
                    <OutputDisplay images={images} story={story} mode={mode} isLoading={isGenerating} error={galleryErrors[mode]} isOutdated={isOutdated} aspectRatio={aspectRatio} onUseAsReference={handleUseAsReference} onApplyToPrompt={handleApplyStoryToPrompt} language={language} />
                </div>
            </div>
        </main>

        <HistorySidebar 
            history={history}
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            onRestore={handleRestoreHistory}
            currentId={currentHistoryId}
            language={language}
        />

        <footer className="text-center py-1.5 px-4 text-[10px] font-mono tracking-wide text-gray-400/75 dark:text-gray-500/75 border-t border-gray-200/40 dark:border-gray-800/60 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md select-none shrink-0 z-[150] mb-[calc(3.5rem_+_env(safe-area-inset-bottom))] sm:mb-0 transition-colors">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3">
                <span className="italic opacity-85">rationalize my instinct over intellect -&gt; miii</span>
                <span className="hidden sm:inline text-gray-300 dark:text-gray-700">|</span>
                <div className="flex items-center gap-1.5">
                    <a 
                        href="https://aimirah.com" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="hover:text-pink-500 dark:hover:text-pink-400 transition-colors hover:underline underline-offset-2"
                    >
                        aimirah.com
                    </a>
                    <span>|</span>
                    <span>2026</span>
                    <span>|</span>
                    <span>nur amirah mohd kamil</span>
                </div>
            </div>
        </footer>

        {/* Mobile Quick Switch Floating Action Button (FAB) */}
        <div className="sm:hidden fixed bottom-[4.5rem] right-4 z-[250] pointer-events-auto">
            <motion.button
                id="mobile-quick-switch-fab"
                onClick={() => setMobileView(prev => prev === 'editor' ? 'preview' : 'editor')}
                whileTap={{ scale: 0.92 }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-bold text-xs shadow-xl shadow-pink-500/30 border border-white/20 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-pink-400 active:scale-95 transition-transform"
                aria-label={mobileView === 'editor' ? t.switchToPreview : t.switchToEditor}
            >
                {mobileView === 'editor' ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{t.navPreview}</span>
                        {(images.length > 0 || Boolean(story)) && (
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse ml-0.5"></span>
                        )}
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>{language === 'ms' ? 'Sunting Prompt' : 'Edit Prompt'}</span>
                    </>
                )}
            </motion.button>
        </div>

        {/* Mobile Bottom Navigation (Editor / Preview) */}
        <div className="sm:hidden bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 flex justify-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-[200] fixed bottom-0 left-0 right-0 h-auto min-h-[3.5rem]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="flex w-full max-sm:max-w-md h-14">
                <button 
                    onClick={() => setMobileView('editor')} 
                    className={`flex-1 flex flex-col items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                        mobileView === 'editor' 
                        ? 'bg-pink-600 text-white' 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="text-[11px] font-bold uppercase tracking-tight">{t.navEditor}</span>
                </button>
                <button 
                    onClick={() => setMobileView('preview')} 
                    className={`flex-1 flex flex-col items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                        mobileView === 'preview' 
                        ? 'bg-pink-600 text-white' 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[11px] font-bold uppercase tracking-tight">{t.navPreview}</span>
                </button>
            </div>
        </div>
        
        <WelcomeOverlay
            isOpen={showIntroModal}
            onClose={closeIntroModal}
            onSelectPrompt={(selectedPrompt, selectedMode) => {
                setPrompt(selectedPrompt);
                handleModeChange(selectedMode);
                closeIntroModal();
            }}
            language={language}
        />

        {showInfoModal && (
            <div className="fixed inset-0 z-[3000] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setShowInfoModal(false)} role="dialog" aria-modal="true" aria-labelledby="info-modal-title">
                <div 
                    ref={infoModalRef}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-6 relative border border-gray-200 dark:border-gray-700 overflow-y-auto max-h-[90vh] outline-none" 
                    onClick={e => e.stopPropagation()}
                    tabIndex={-1}
                >
                    <button onClick={() => setShowInfoModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded" aria-label="Close"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                    
                    <div className="text-center mb-6">
                        <h2 id="info-modal-title" className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{t.appTitle}</h2>
                        <p className="text-gray-600 dark:text-gray-400">{t.appSubtitle}</p>
                    </div>

                    <div className="mb-6 text-left space-y-4">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 pb-2">{t.howItWorks}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {t.howItWorksDesc}
                        </p>
                        <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400 list-disc pl-4 marker:text-pink-500">
                            <li>{language === 'ms' ? 'Jawab soalan penjelasan atau masukkan nuansa tersendiri.' : 'Answer clarifying questions or enter custom nuances.'}</li>
                            <li>{language === 'ms' ? 'Klik Kemas Kini Prompt untuk menggabungkan jawapan ke dalam prompt.' : 'Click Update Prompt to seamlessly blend your answers into the prompt.'}</li>
                            <li>{language === 'ms' ? 'Jana Imej berkualiti tinggi atau Naratif Cerita.' : 'Generate high-fidelity Images or narrative Stories.'}</li>
                        </ul>
                    </div>

                    <div className="mb-8">
                        <a href="https://zi-wang.com/co-creator-feedback/" target="_blank" rel="noreferrer" className="block w-full bg-pink-50 dark:bg-pink-900/30 hover:bg-pink-100 dark:hover:bg-pink-900/50 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800 rounded-lg p-3 text-center transition-colors group focus:outline-none focus:ring-2 focus:ring-pink-500">
                            <div className="flex items-center justify-center gap-2 mb-0.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                                <span className="font-bold text-sm">{t.giveFeedback}</span>
                            </div>
                            <div className="text-[10px] opacity-80 group-hover:underline">{t.feedbackSubtext}</div>
                        </a>
                    </div>

                    <div className="mb-6 text-left">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 pb-2 mb-4">{language === 'ms' ? 'Aliran Kerja Pro' : 'Pro Workflow'}</h3>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300 flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">{t.step1Title}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.step1Desc}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300 flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">{t.step2Title}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.step2Desc}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300 flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">{t.step3Title}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.step3Desc}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mb-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-2">
                        <button 
                            onClick={() => {
                                setShowInfoModal(false);
                                setShowIntroModal(true);
                            }}
                            className="text-xs text-pink-600 dark:text-pink-400 hover:underline font-medium"
                        >
                            {t.viewWelcomeScreen}
                        </button>
                    </div>
                    
                    <div className="text-left">
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight mb-2">
                            By using this feature, you confirm that you have the necessary rights to any content that you upload. Do not generate content that infringes on others’ intellectual property or privacy rights. Your use of this generative AI service is subject to our <a href="https://policies.google.com/terms/generative-ai/use-policy" target="_blank" rel="noreferrer" className="underline hover:text-gray-600 dark:hover:text-gray-400">Prohibited Use Policy</a>.
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">
                            Please note that uploads from Google Workspace may be used to develop and improve Google products and services in accordance with <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noreferrer" className="underline hover:text-gray-600 dark:hover:text-gray-400">our terms</a>.
                        </p>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
}

export default App;
