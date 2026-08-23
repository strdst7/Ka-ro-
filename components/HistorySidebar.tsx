import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HistoryItem, Language } from '../types';
import { getTranslation } from '../services/i18n';

interface HistorySidebarProps {
  history: HistoryItem[];
  isOpen: boolean;
  onClose: () => void;
  onRestore: (item: HistoryItem) => void;
  currentId?: string;
  language?: Language;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  history, 
  isOpen, 
  onClose, 
  onRestore,
  currentId,
  language = 'en'
}) => {
  const t = getTranslation(language);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[2000] lg:hidden"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-gray-900 shadow-2xl z-[2001] flex flex-col border-r border-gray-200 dark:border-gray-800"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t.sessionHistory}
              </h2>
              <button 
                onClick={onClose}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Close sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-gray-500 italic p-4 text-center">
                  <p>{t.noHistory}</p>
                </div>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onRestore(item);
                      onClose();
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all border group relative ${
                      currentId === item.id 
                        ? 'bg-brand-pink-50 dark:bg-brand-pink-900/20 border-brand-pink-200 dark:border-brand-pink-800 ring-1 ring-brand-pink-200 dark:ring-brand-pink-800' 
                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-brand-pink-300 dark:hover:border-brand-pink-700 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        item.mode === 'image' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                      }`}>
                        {item.mode === 'image' ? (language === 'ms' ? 'Imej' : 'Image') : (language === 'ms' ? 'Cerita' : 'Story')}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2 leading-relaxed italic">
                      "{item.prompt}"
                    </p>
                    {item.thumbnail && (
                      <div className="mt-2 w-full aspect-video rounded overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                        <img src={item.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center uppercase tracking-widest">
                {t.sessionHistoryNote}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default HistorySidebar;

