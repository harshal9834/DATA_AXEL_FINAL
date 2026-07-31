/**
 * useGoogleTranslate.ts
 * Production-grade Google Translate controller hook.
 * Manages script loading, initialization, language switching,
 * persistence, banner suppression, and error resilience.
 */

import { useEffect, useCallback, useRef } from 'react';

// Map our internal codes to Google Translate language codes
const GT_CODE_MAP: Record<string, string> = {
  en: 'en',
  hi: 'hi',
  mr: 'mr',
  gu: 'gu',
  pa: 'pa',
  ta: 'ta',
  te: 'te',
  kn: 'kn',
  ml: 'ml',
  bn: 'bn',
  ur: 'ur',
  or: 'or', // Odia
};

const STORAGE_KEY = 'gt_selected_lang';
const SCRIPT_ID = 'google-translate-script';
const WIDGET_ID = 'google_translate_element';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: new (
          opts: {
            pageLanguage: string;
            includedLanguages?: string;
            autoDisplay?: boolean;
            layout?: number;
          },
          elementId: string
        ) => void;
      };
    };
  }
}

function ensureHiddenContainer(): void {
  if (document.getElementById(WIDGET_ID)) return;
  const el = document.createElement('div');
  el.id = WIDGET_ID;
  el.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;opacity:0;pointer-events:none;top:-9999px;left:-9999px;';
  document.body.appendChild(el);
}

/** Read language from localStorage first, then googtrans cookie */
export function getStoredLanguage(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored !== 'en') return stored;
  } catch {}
  try {
    const match = document.cookie.match(/googtrans=\/en\/([a-z]+)/);
    if (match?.[1]) return match[1];
  } catch {}
  return 'en';
}

/** Write googtrans cookie + localStorage */
function persistLanguage(lang: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {}
  if (lang === 'en') {
    document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = `googtrans=; path=/; domain=${location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  } else {
    document.cookie = `googtrans=/en/${lang}; path=/`;
    document.cookie = `googtrans=/en/${lang}; path=/; domain=${location.hostname}`;
  }
}

/**
 * Locate the hidden Google combo select and trigger a language change.
 * Retries up to `retries` times with `delayMs` spacing.
 */
async function triggerGoogleTranslate(langCode: string, retries = 12, delayMs = 250): Promise<boolean> {
  const gtCode = GT_CODE_MAP[langCode] ?? langCode;

  for (let i = 0; i < retries; i++) {
    const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
    if (select) {
      select.value = gtCode;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      // Verify change took effect after short delay
      await new Promise<void>(r => setTimeout(r, 100));
      if (select.value === gtCode) return true;
    }
    await new Promise<void>(r => setTimeout(r, delayMs));
  }
  return false;
}

/** Load and initialize Google Translate SDK (idempotent) */
function loadGoogleTranslateScript(onReady: () => void): void {
  // Already loaded
  if (window.google?.translate?.TranslateElement) {
    onReady();
    return;
  }
  // Script tag already in DOM
  if (document.getElementById(SCRIPT_ID)) return;

  // Set up the global init callback
  window.googleTranslateElementInit = () => {
    try {
      ensureHiddenContainer();
      new window.google!.translate!.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,hi,mr,gu,pa,ta,te,kn,ml,bn,ur,or',
          autoDisplay: false,
        },
        WIDGET_ID
      );
      onReady();
    } catch (e) {
      console.warn('[GT] Init failed:', e);
    }
  };

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  script.async = true;
  script.onerror = () => console.warn('[GT] Script load failed — fallback to English');
  document.head.appendChild(script);
}

// ─── The Hook ──────────────────────────────────────────────────────────────────

export function useGoogleTranslate() {
  const readyRef = useRef(false);
  const queuedLang = useRef<string | null>(null);

  const applyLanguage = useCallback(async (lang: string) => {
    persistLanguage(lang);

    if (lang === 'en') {
      // Restore original — Google Translate does not have a simple "restore" via combo.
      // Best approach: set to 'en' which reloads the original.
      const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
      if (select) {
        select.value = 'en';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return;
    }

    const ok = await triggerGoogleTranslate(lang);
    if (!ok) {
      console.warn(`[GT] Could not apply language: ${lang}`);
    }
  }, []);

  const setTranslationLanguage = useCallback((lang: string) => {
    if (!readyRef.current) {
      queuedLang.current = lang;
      return;
    }
    applyLanguage(lang);
  }, [applyLanguage]);

  useEffect(() => {
    ensureHiddenContainer();

    loadGoogleTranslateScript(async () => {
      readyRef.current = true;

      // Apply stored language on first load
      const stored = getStoredLanguage();
      if (stored && stored !== 'en') {
        await applyLanguage(stored);
      }

      // Apply any queued change that came in before ready
      if (queuedLang.current) {
        applyLanguage(queuedLang.current);
        queuedLang.current = null;
      }
    });
  }, [applyLanguage]);

  return { setTranslationLanguage, getStoredLanguage };
}
