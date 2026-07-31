/**
 * LanguageSwitcher.tsx
 * Premium animated language selector for the AI Mentor OS.
 * Integrates with Google Translate via LanguageContext.
 * All markup uses notranslate to prevent recursive translation.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, availableLanguages } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLang = availableLanguages.find(l => l.code === language) ?? availableLanguages[0];

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSelect = (code: string) => {
    setLanguage(code);
    setOpen(false);
  };

  return (
    <div className="relative notranslate" ref={ref}>
      {/* Trigger button */}
      <button
        aria-label={`Language: ${currentLang.name}. Click to change.`}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen(prev => !prev)}
        className="notranslate relative flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20"
      >
        <Globe className="notranslate h-4 w-4 text-blue-400 shrink-0" />
        <span className="hidden sm:block leading-none">{currentLang.nativeName}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="notranslate"
        >
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </motion.div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            aria-label="Select language"
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="notranslate absolute right-0 top-full mt-2 w-[230px] rounded-2xl border border-white/10 bg-[#0F172A]/95 backdrop-blur-xl shadow-2xl overflow-hidden z-[9999]"
            style={{ boxShadow: '0 24px 60px -12px rgba(0,0,0,0.6)' }}
          >
            <div className="p-2">
              <p className="px-2 pt-1 pb-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
                Select Language
              </p>
              <div className="space-y-0.5 max-h-[320px] overflow-y-auto scrollbar-thin pr-0.5">
                {availableLanguages.map(lang => {
                  const isActive = lang.code === language;
                  return (
                    <button
                      key={lang.code}
                      role="option"
                      aria-selected={isActive}
                      onClick={() => handleSelect(lang.code)}
                      className={`notranslate w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left group ${
                        isActive
                          ? 'bg-blue-500/20 text-white'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="notranslate text-xl leading-none shrink-0">{lang.flag}</span>
                      <div className="notranslate flex flex-col min-w-0">
                        <span className="notranslate font-semibold text-sm leading-tight">{lang.nativeName}</span>
                        <span className="notranslate text-[10px] opacity-50 group-hover:opacity-70 transition-opacity">{lang.name}</span>
                      </div>
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="notranslate ml-auto flex items-center justify-center h-5 w-5 rounded-full bg-blue-500/30"
                          >
                            <Check className="notranslate h-3 w-3 text-blue-400" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
