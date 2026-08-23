
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { Tooltip } from './Tooltip';
import { GeneratedImage, Mode, Language } from '../types';
import { getTranslation } from '../services/i18n';

const ErrorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

interface OutputDisplayProps {
  images: GeneratedImage[];
  story: string | null;
  mode: Mode;
  isLoading: boolean;
  error: string | null;
  isOutdated: boolean;
  aspectRatio?: string;
  onUseAsReference?: (imageDataUrl: string) => void;
  onApplyToPrompt?: () => void;
  language?: Language;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ 
    images, 
    story, 
    mode, 
    isLoading, 
    error, 
    isOutdated,
    aspectRatio,
    onUseAsReference,
    onApplyToPrompt,
    language = 'en'
}) => {
  const t = getTranslation(language);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showApplyConfirmation, setShowApplyConfirmation] = useState(false);
  const modalCloseButtonRef = useRef<HTMLButtonElement>(null);
  const confirmationCloseButtonRef = useRef<HTMLButtonElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);
  const lastActiveElement = useRef<HTMLElement | null>(null);

  const placeholderCount = 4;
  
  // Trap focus for Lightbox
  useEffect(() => {
    if (selectedImage && lightboxRef.current) {
        lastActiveElement.current = document.activeElement as HTMLElement;
        const modal = lightboxRef.current;
        // Focus first button (Close)
        if (modalCloseButtonRef.current) modalCloseButtonRef.current.focus();

        const handleTab = (e: KeyboardEvent) => {
            const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            if (e.key === 'Tab') {
                if (!modal.contains(document.activeElement)) {
                    e.preventDefault();
                    if (firstElement) firstElement.focus();
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
                setSelectedImage(null);
            }
        };

        document.addEventListener('keydown', handleTab);
        return () => {
            document.removeEventListener('keydown', handleTab);
            if (lastActiveElement.current) lastActiveElement.current.focus();
        };
    }
  }, [selectedImage]);

  // Trap focus for Confirmation
  useEffect(() => {
    if (showApplyConfirmation && confirmationRef.current) {
        lastActiveElement.current = document.activeElement as HTMLElement;
        const modal = confirmationRef.current;
        // Focus cancel button
        if (confirmationCloseButtonRef.current) confirmationCloseButtonRef.current.focus();

        const handleTab = (e: KeyboardEvent) => {
            const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            if (e.key === 'Tab') {
                if (!modal.contains(document.activeElement)) {
                    e.preventDefault();
                    if (firstElement) firstElement.focus();
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
                setShowApplyConfirmation(false);
            }
        };

        document.addEventListener('keydown', handleTab);
        return () => {
            document.removeEventListener('keydown', handleTab);
            if (lastActiveElement.current) lastActiveElement.current.focus();
        };
    }
  }, [showApplyConfirmation]);

  const downloadStory = () => {
    if (!story) return;
    const fileName = "generated_story.txt";
    const element = document.createElement("a");
    const file = new Blob([story], {type: 'text/plain'});
    const url = URL.createObjectURL(file);
    element.href = url;
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const handleExport = () => {
    if (mode === 'image') {
      const validImages = images.filter(img => img.url);
      validImages.forEach((image, index) => {
        if (image.url) {
          const element = document.createElement("a");
          element.href = image.url;
          element.download = `generated-image-${index + 1}.jpg`;
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        }
      });
    } else if (mode === 'story' && story) {
      downloadStory();
    }
  };

  const copyStory = () => {
      if (!story) return;
      navigator.clipboard.writeText(story);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
  };

  const handleConfirmApply = () => {
      if (onApplyToPrompt) {
          onApplyToPrompt();
      }
      setShowApplyConfirmation(false);
  };

  const renderImageContent = () => {
      if (isLoading) {
          return Array(placeholderCount).fill(null).map((_, index) => (
              <div key={index} className="w-full h-full min-h-0 bg-white/40 dark:bg-gray-850/40 rounded-2xl flex items-center justify-center border border-gray-200/50 dark:border-gray-750/50 backdrop-blur-sm shadow-sm animate-pulse">
                  <div className="flex flex-col items-center text-gray-400 dark:text-gray-500">
                      <svg className="animate-spin h-8 w-8 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="mt-3 text-xs font-semibold text-center px-4">{t.generatingImage}</span>
                  </div>
              </div>
          ));
      }

      if (images.length > 0) {
          const content = images.map((image, index) => {
              if (image.url) {
                  return (
                      <div 
                        key={index} 
                        className="w-full h-full min-h-0 bg-white/40 dark:bg-gray-850/40 rounded-2xl overflow-hidden relative shadow-md border border-gray-200/70 dark:border-gray-700/70 group focus-within:ring-4 focus-within:ring-pink-400/40 transition-all hover:shadow-xl hover:border-pink-300 dark:hover:border-pink-700/50"
                      >
                          <button 
                            className="w-full h-full cursor-zoom-in focus:outline-none"
                            onClick={() => setSelectedImage(image.url!)}
                            aria-label={`Preview generated image ${index + 1}`}
                          >
                              <img src={image.url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors"></div>
                          </button>
                          <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
                              <a
                                href={image.url}
                                download={`generated-image-${index + 1}.jpg`}
                                className="p-2 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-xl transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
                                aria-label={`Export Image ${index + 1}`}
                                title={`Export Image ${index + 1}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                              </a>
                          </div>
                      </div>
                  );
              } else {
                  return (
                     <div key={index} className="w-full h-full min-h-0 bg-white/30 dark:bg-gray-850/30 backdrop-blur-sm rounded-2xl border-2 border-dashed border-red-200 dark:border-red-900/50 flex flex-col items-center justify-center text-gray-400 text-center p-3">
                         <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/40 text-red-500 flex items-center justify-center mb-1.5">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                           </svg>
                         </div>
                         <span className="text-xs font-bold text-red-600 dark:text-red-400">{t.generationFailed}</span>
                         {image.error && <span className="text-[10px] mt-1 text-red-400 line-clamp-2">{image.error}</span>}
                     </div>
                  );
              }
          });
          
          while (content.length < 4) {
             content.push(
                 <div key={`missing-${content.length}`} className="w-full h-full min-h-0 bg-white/20 dark:bg-gray-850/20 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300 dark:border-gray-750 flex flex-col items-center justify-center text-gray-400">
                     <span className="text-xs font-medium text-gray-400">{t.slotEmpty}</span>
                 </div>
             );
          }
          return content;
      }

      return Array(placeholderCount).fill(null).map((_, index) => (
          <div key={index} className="w-full h-full min-h-0 bg-white/30 dark:bg-gray-850/30 backdrop-blur-sm rounded-2xl border border-dashed border-gray-200/80 dark:border-gray-750/80 flex flex-col items-center justify-center text-gray-300 dark:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[11px] font-medium tracking-wide">{t.readyForPrompt}</span>
          </div>
      ));
  };

  const renderStoryContent = () => {
      if (isLoading) {
          return (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                   <svg className="animate-spin h-8 w-8 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="mt-3 text-xs font-semibold">{t.craftingNarrative}</span>
              </div>
          );
      }
      if(story) {
          return (
              <div className="prose prose-sm dark:prose-invert max-w-none p-5 bg-white/70 dark:bg-gray-850/70 backdrop-blur-md rounded-2xl border border-gray-200/80 dark:border-gray-750/80 shadow-sm leading-relaxed">
                  {story.split('\n').map((paragraph, index) => <p key={index} className="text-gray-800 dark:text-gray-200 text-sm mb-3 leading-relaxed">{paragraph}</p>)}
              </div>
          )
      }
      return (
        <div className="h-full bg-white/30 dark:bg-gray-850/30 border border-dashed border-gray-200 dark:border-gray-750 rounded-2xl flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500 p-8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 dark:bg-pink-500/20 text-pink-500 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.storyCanvasReady}</p>
            <p className="text-xs text-gray-400">{t.storyCanvasReadyDesc}</p>
        </div>
      );
  };
  
  const renderError = (errorMessage: string) => (
      <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-1">
              <div className="bg-red-100 dark:bg-red-900/40 p-1.5 rounded-xl text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
              </div>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">{t.generationFailed}</span>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-red-500/10 backdrop-blur-md rounded-2xl border border-red-500/30">
              {errorMessage.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-red-700 dark:text-red-300 text-xs leading-relaxed">{paragraph}</p>
              ))}
          </div>
      </div>
  );

  const firstImageError = mode === 'image' ? images.find(img => img.error)?.error : null;
  const displayError = error || firstImageError;

  return (
    <>
        <div className="bg-white/70 dark:bg-gray-850/70 backdrop-blur-md rounded-2xl p-4 h-full border border-gray-200/80 dark:border-gray-750/80 shadow-sm flex flex-col relative overflow-hidden transition-all">
            <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-gray-200/60 dark:border-gray-750/60 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500"></span>
                    <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                        {mode === 'image' ? t.generatedShowcase : t.storyWorkspace}
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    {mode === 'story' && story && !isLoading && (
                        <div className="flex gap-1.5">
                             {onApplyToPrompt && (
                                <Tooltip content={t.useAsPromptTooltip}>
                                    <button 
                                        onClick={() => setShowApplyConfirmation(true)} 
                                        className="p-1.5 text-gray-500 hover:text-pink-500 dark:text-gray-400 dark:hover:text-pink-400 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750" 
                                        aria-label={t.useAsPromptTooltip}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                        </svg>
                                    </button>
                                </Tooltip>
                            )}
                            <Tooltip content={isCopied ? t.copied : t.copyToClipboard}>
                                <button 
                                    onClick={copyStory} 
                                    className={`p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 ${isCopied ? 'text-green-500 hover:text-green-600 dark:text-green-400' : 'text-gray-500 hover:text-pink-500 dark:text-gray-400 dark:hover:text-pink-400'}`} 
                                    aria-label={isCopied ? t.copied : t.copyToClipboard}
                                >
                                    {isCopied ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </button>
                            </Tooltip>
                        </div>
                    )}
                    {((mode === 'image' && images.some(img => img.url)) || 
                      (mode === 'story' && story)) && !isLoading && (
                        <button
                            onClick={handleExport}
                            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-pink-400"
                            aria-label={t.exportAll}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>{t.exportAll}</span>
                        </button>
                    )}
                </div>
            </div>
            
            <div className="flex-grow min-h-0 relative h-full flex flex-col">
                {displayError ? (
                    <div className="h-full overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-red-300 dark:scrollbar-thumb-red-600">
                        {renderError(displayError)}
                    </div>
                ) : (
                    mode === 'image' 
                    ? (
                        <div className="h-full w-full min-h-0 flex-1 flex flex-col">
                            <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-2 gap-3 h-full w-full flex-1 min-h-0">
                                {renderImageContent()}
                            </div>
                        </div>
                    )
                    : (
                        <div className="h-full overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                            {renderStoryContent()}
                        </div>
                    )
                )}
                
                {isOutdated && !isLoading && (images.length > 0 || story) && (
                    <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl transition-all duration-300 pointer-events-none">
                        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl border border-amber-300/80 dark:border-amber-700/80 text-center transform scale-100 pointer-events-auto">
                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-500 mx-auto mb-2 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">{t.resultsOutdated}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{t.resultsOutdatedDesc}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {selectedImage && (
            <div ref={lightboxRef} className="fixed inset-0 z-[2000] bg-black/95 flex flex-col backdrop-blur-sm overflow-y-auto" onClick={() => setSelectedImage(null)} role="dialog" aria-modal="true" aria-label="Image Preview" tabIndex={-1}>
                <button 
                    ref={modalCloseButtonRef}
                    onClick={() => setSelectedImage(null)}
                    className="fixed top-4 right-4 z-[2010] text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-all backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Close Preview"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <div className="m-auto w-full max-w-7xl flex flex-col p-4 md:p-8 pointer-events-none">
                    <img 
                        src={selectedImage} 
                        alt="Full view" 
                        className="w-auto h-auto max-w-full object-contain rounded-lg shadow-2xl pointer-events-auto mx-auto"
                        onClick={(e) => e.stopPropagation()}
                    />
                    
                    <div className="mt-6 flex flex-wrap justify-center gap-4 pointer-events-auto flex-shrink-0 bg-black/20 p-3 rounded-2xl backdrop-blur-md border border-white/10 mx-auto" onClick={(e) => e.stopPropagation()}>
                        {onUseAsReference && (
                          <button 
                              onClick={() => {
                                onUseAsReference(selectedImage);
                                setSelectedImage(null);
                              }}
                              className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-full font-semibold transition-colors flex items-center gap-2 shadow-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {t.useAsReference}
                          </button>
                        )}
                        <a 
                            href={selectedImage} 
                            download="generated-image.jpg"
                            className="bg-white text-gray-900 px-5 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-lg text-sm focus:outline-none focus:ring-2 focus:ring-white"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            {t.download}
                        </a>
                    </div>
                </div>
            </div>
        )}

        {showApplyConfirmation && (
            <div ref={confirmationRef} className="fixed inset-0 z-[3000] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setShowApplyConfirmation(false)} role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title" tabIndex={-1}>
                <div 
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full p-6 relative border border-gray-200 dark:border-gray-700 transform transition-all scale-100" 
                    onClick={e => e.stopPropagation()}
                >
                    <h3 id="confirm-modal-title" className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">{t.replacePromptTitle}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                        {t.replacePromptDesc} <span className="font-semibold text-red-500 dark:text-red-400">{t.actionCannotBeUndone}</span>
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button 
                            ref={confirmationCloseButtonRef}
                            onClick={() => setShowApplyConfirmation(false)}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            {t.cancel}
                        </button>
                        <button 
                            onClick={handleConfirmApply}
                            className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                        >
                            {t.yesReplace}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};

export default OutputDisplay;
