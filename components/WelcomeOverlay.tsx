/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mode, Language } from '../types';
import { getTranslation } from '../services/i18n';

interface WelcomeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string, mode: Mode) => void;
  language?: Language;
}

export const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
  language = 'en'
}) => {
  const t = getTranslation(language);

  const starterPrompts = language === 'ms' ? [
    {
      title: "Pesta Teh Arnab",
      prompt: "seekor kucing menganjurkan pesta teh mewah untuk rakan-rakan arnabnya di taman yang disinari matahari",
      mode: "image" as Mode,
      badge: "Imej"
    },
    {
      title: "Botani Neon",
      prompt: "rumah kaca masa depan gaya cyberpunk dengan tumbuhan bioluminescent bercahaya di bawah hujan",
      mode: "image" as Mode,
      badge: "Imej"
    },
    {
      title: "Arkib Dasar Laut",
      prompt: "sebuah perpustakaan dasar laut purba yang dijaga oleh para sarjana obor-obor",
      mode: "story" as Mode,
      badge: "Cerita"
    }
  ] : [
    {
      title: "Bunny Tea Party",
      prompt: "a cat hosting an elegant tea party for its bunny friends in a sunlit garden",
      mode: "image" as Mode,
      badge: "Image"
    },
    {
      title: "Neon Botanical",
      prompt: "a futuristic cyberpunk greenhouse filled with glowing bioluminescent plants under rain",
      mode: "image" as Mode,
      badge: "Image"
    },
    {
      title: "Deep Sea Archive",
      prompt: "an ancient underwater library tended by jellyfish scholars",
      mode: "story" as Mode,
      badge: "Story"
    }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="welcome-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[2500] flex items-center justify-center p-4 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-xl overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          key="welcome-modal"
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-3xl border border-gray-200/80 dark:border-gray-700/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] p-6 sm:p-8 overflow-hidden my-auto"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-gradient-to-br from-pink-500/20 to-rose-500/0 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-gradient-to-tl from-amber-500/20 to-pink-500/0 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400"
            aria-label="Close welcome overlay"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Brand Logo & Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 flex items-center justify-center text-white shadow-xl shadow-pink-500/25 font-black text-2xl select-none">
                K!
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 bg-clip-text text-transparent dark:from-pink-400 dark:via-rose-300 dark:to-amber-300">
              Ka!ro
            </h1>
            <p className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 tracking-wider uppercase mt-0.5">
              {t.appSubtitle}
            </p>
            <p className="mt-2.5 text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-lg leading-relaxed">
              {language === 'ms'
                ? 'Kanvas ciptaan bersama pintar yang merungkai andaian tersirat, membina soalan penjelasan terpandu, dan membolehkan anda membentuk imaginasi sebelum menjana imej atau cerita.'
                : 'An intelligent co-creation canvas that uncovers implicit assumptions, drafts guided clarifications, and lets you sculpt beliefs before rendering images or stories.'}
            </p>
          </div>

          {/* Key Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-white/70 dark:bg-gray-800/70 border border-gray-200/70 dark:border-gray-750/70 rounded-2xl p-3.5 flex flex-col items-center text-center shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-pink-500/10 dark:bg-pink-500/20 text-pink-500 flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 className="text-xs font-bold text-gray-800 dark:text-gray-100">
                {language === 'ms' ? 'Penjelasan Terpandu' : 'Guided Clarifications'}
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                {language === 'ms' ? 'Mengesan kekaburan secara proaktif dan merangka soalan utama.' : 'Proactively detects ambiguities and drafts key questions.'}
              </p>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/70 border border-gray-200/70 dark:border-gray-750/70 rounded-2xl p-3.5 flex flex-col items-center text-center shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-500 flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-xs font-bold text-gray-800 dark:text-gray-100">
                {language === 'ms' ? 'Pemurnian Prompt Pintar' : 'Smart Prompt Refinement'}
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                {language === 'ms' ? 'Menggabungkan jawapan anda ke dalam prompt berkualiti tinggi.' : 'Dynamically blends your answers into rich, high-fidelity prompts.'}
              </p>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/70 border border-gray-200/70 dark:border-gray-750/70 rounded-2xl p-3.5 flex flex-col items-center text-center shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xs font-bold text-gray-800 dark:text-gray-100">
                {language === 'ms' ? 'Pameran Ciptaan Penuh' : 'Full Showcase'}
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                {language === 'ms' ? 'Jana kuadran 4-imej atau cerita naratif mendalam.' : 'Generate 4-quadrant images or rich narrative stories.'}
              </p>
            </div>
          </div>

          {/* Quick Starter Inspiration */}
          <div className="mb-6">
            <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-2 text-center sm:text-left">
              {language === 'ms' ? 'Contoh Prompt Permulaan' : 'Quick Starter Prompts'}
            </span>
            <div className="flex flex-col gap-2">
              {starterPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectPrompt(item.prompt, item.mode);
                    onClose();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-pink-50/80 dark:hover:bg-pink-950/30 border border-gray-200/60 dark:border-gray-750/60 hover:border-pink-300 dark:hover:border-pink-700/60 text-left transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300 shrink-0">
                      {item.badge}
                    </span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate group-hover:text-pink-600 dark:group-hover:text-pink-300">
                      {item.prompt}
                    </span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-hover:text-pink-500 shrink-0 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-center">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:via-rose-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              {language === 'ms' ? 'Mula Mencipta' : 'Start Creating'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

