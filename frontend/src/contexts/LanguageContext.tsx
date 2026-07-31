import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useGoogleTranslate, getStoredLanguage } from '../hooks/useGoogleTranslate';

// ─── Types ────────────────────────────────────────────────────────────────────

export type LanguageOption = {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  /** ISO 639-1 code passed to SpeechSynthesis/SpeechRecognition */
  speechCode: string;
};

type LanguageContextType = {
  language: string;           // UI/display code (e.g. 'hi')
  speechLanguage: string;     // Speech code (e.g. 'hi-IN')
  setLanguage: (lang: string) => void;
  availableLanguages: LanguageOption[];
};

// ─── Language Manifest ────────────────────────────────────────────────────────

const availableLanguages: LanguageOption[] = [
  { code: 'en', name: 'English',   nativeName: 'English',    flag: '🇺🇸', speechCode: 'en-US' },
  { code: 'hi', name: 'Hindi',     nativeName: 'हिन्दी',      flag: '🇮🇳', speechCode: 'hi-IN' },
  { code: 'mr', name: 'Marathi',   nativeName: 'मराठी',       flag: '🇮🇳', speechCode: 'mr-IN' },
  { code: 'gu', name: 'Gujarati',  nativeName: 'ગુજરાતી',    flag: '🇮🇳', speechCode: 'gu-IN' },
  { code: 'pa', name: 'Punjabi',   nativeName: 'ਪੰਜਾਬੀ',     flag: '🇮🇳', speechCode: 'pa-IN' },
  { code: 'bn', name: 'Bengali',   nativeName: 'বাংলা',       flag: '🇮🇳', speechCode: 'bn-IN' },
  { code: 'ta', name: 'Tamil',     nativeName: 'தமிழ்',       flag: '🇮🇳', speechCode: 'ta-IN' },
  { code: 'te', name: 'Telugu',    nativeName: 'తెలుగు',      flag: '🇮🇳', speechCode: 'te-IN' },
  { code: 'kn', name: 'Kannada',   nativeName: 'ಕನ್ನಡ',      flag: '🇮🇳', speechCode: 'kn-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം',      flag: '🇮🇳', speechCode: 'ml-IN' },
  { code: 'or', name: 'Odia',      nativeName: 'ଓଡ଼ିଆ',       flag: '🇮🇳', speechCode: 'or-IN' },
  { code: 'ur', name: 'Urdu',      nativeName: 'اردو',        flag: '🇮🇳', speechCode: 'ur-IN' },
];

// ─── Context ──────────────────────────────────────────────────────────────────

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Bootstrap from persisted preference
  const [language, setLanguageState] = useState<string>(() => {
    // Only read localStorage on the client to avoid SSR mismatch
    if (typeof window !== 'undefined') {
      return getStoredLanguage() || 'en';
    }
    return 'en';
  });

  const { setTranslationLanguage } = useGoogleTranslate();

  const setLanguage = useCallback((langCode: string) => {
    setLanguageState(langCode);

    // Apply RTL for Urdu
    if (langCode === 'ur') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }

    // Update html lang attr
    document.documentElement.lang = langCode;

    // Drive Google Translate
    setTranslationLanguage(langCode);
  }, [setTranslationLanguage]);

  // Sync html attrs on initial mount when restoring a persisted language
  useEffect(() => {
    if (language && language !== 'en') {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentLangOption = availableLanguages.find(l => l.code === language) ?? availableLanguages[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        speechLanguage: currentLangOption.speechCode,
        setLanguage,
        availableLanguages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
