import { useState, useEffect, useRef, useCallback } from 'react';

export type VoiceState = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'INTERRUPTED' | 'ERROR';

interface UseVoiceAIOptions {
  onTranscriptChange?: (interim: string, final: string) => void;
  onUserMessage?: (text: string) => void;
  language?: string;
}

export function useVoiceAI(options: UseVoiceAIOptions = {}) {
  const { language = 'en-US' } = options;

  // Store callbacks in refs so they are never stale without being in useEffect deps.
  // This is the KEY fix: inline arrow functions passed from parent re-create on every render,
  // putting them in deps causes the useEffect cleanup (stopAll/cancel) to fire every render.
  const onTranscriptChangeRef = useRef(options.onTranscriptChange);
  const onUserMessageRef = useRef(options.onUserMessage);
  useEffect(() => { onTranscriptChangeRef.current = options.onTranscriptChange; });
  useEffect(() => { onUserMessageRef.current = options.onUserMessage; });

  const [state, setState] = useState<VoiceState>('IDLE');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Accumulated transcript
  const fullTranscriptRef = useRef<string>('');

  // Silence timeout
  const silenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // FSM state ref — always in sync with React state, safe to use inside callbacks
  const stateRef = useRef<VoiceState>('IDLE');
  const updateState = useCallback((newState: VoiceState) => {
    console.log(`[Voice FSM] ${stateRef.current} → ${newState}`);
    stateRef.current = newState;
    setState(newState);
  }, []);

  const clearSilenceTimeout = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  }, []);

  // ─── Internal helpers (must be defined before useEffect) ─────────────────────

  const stopListeningInternal = useCallback(() => {
    clearSilenceTimeout();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
  }, [clearSilenceTimeout]);

  const stopAllInternal = useCallback(() => {
    stopListeningInternal();
    if (synthRef.current) {
      console.log('[Voice] stopAll → cancel()');
      console.trace('[Voice] cancel() call stack');
      synthRef.current.cancel();
    }
    updateState('IDLE');
  }, [stopListeningInternal, updateState]);

  const handleSilenceDetected = useCallback(() => {
    if (stateRef.current !== 'LISTENING') return;

    const finalTranscript = fullTranscriptRef.current.trim();
    console.log('[Voice] Silence detected. Transcript:', finalTranscript);

    if (finalTranscript) {
      stopListeningInternal();
      updateState('THINKING');
      fullTranscriptRef.current = '';
      if (onTranscriptChangeRef.current) onTranscriptChangeRef.current('', '');
      if (onUserMessageRef.current) onUserMessageRef.current(finalTranscript);
    }
  }, [stopListeningInternal, updateState]);

  // ─── One-time init: Speech Recognition + Synthesis ───────────────────────────
  // IMPORTANT: This effect runs ONCE on mount (empty deps).
  // Language changes are handled by updating recognition.lang directly on the ref.
  useEffect(() => {
    console.log('[Voice] Initializing Speech APIs (once)');

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onstart = () => {
        console.log('[Voice] Recognition Started');
      };

      recognition.onresult = (event: any) => {
        // Hard gate: if AI is speaking, never process any recognition result
        if (stateRef.current === 'SPEAKING') return;

        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            fullTranscriptRef.current += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (onTranscriptChangeRef.current) {
          onTranscriptChangeRef.current(interim, fullTranscriptRef.current);
        }

        // Reset silence detection window on every speech fragment
        clearSilenceTimeout();
        silenceTimeoutRef.current = setTimeout(handleSilenceDetected, 1500);
      };

      recognition.onerror = (event: any) => {
        // 'aborted'   — fired when we manually call stop(). Expected, safe to ignore.
        // 'no-speech' — fired after silence timeout. Expected, safe to ignore.
        // 'network'   — fired in offline/headless environments. Ignore to stop spam.
        const benignErrors = ['aborted', 'no-speech', 'network'];
        if (benignErrors.includes(event.error)) return;

        console.error('[Voice] Recognition error:', event.error);
        if (event.error === 'not-allowed') {
          updateState('ERROR');
          setErrorMsg('Microphone access denied. Please allow permissions.');
        }
      };

      recognition.onend = () => {
        console.log('[Voice] Recognition ended. State:', stateRef.current);
        // Auto-restart ONLY if the FSM says we should still be listening.
        // The 300ms delay prevents a tight restart loop on transient failures (e.g. network)
        if (stateRef.current === 'LISTENING') {
          setTimeout(() => {
            if (stateRef.current === 'LISTENING') {
              try { recognition.start(); } catch (_) {}
            }
          }, 300);
        }
      };

      recognitionRef.current = recognition;
    } else {
      updateState('ERROR');
      setErrorMsg('Speech Recognition is not supported in this browser.');
    }

    synthRef.current = window.speechSynthesis;

    // Cleanup: only runs on component UNMOUNT, not on every re-render
    return () => {
      console.log('[Voice] Component unmounting — cleaning up');
      stopAllInternal();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← EMPTY DEPS: init runs once, cleanup runs once on unmount only

  // ─── Sync language to recognition without tearing down ──────────────────────
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  // ─── Voice cache ─────────────────────────────────────────────────────────────
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const load = () => setAvailableVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, []);

  // ─── Public API ──────────────────────────────────────────────────────────────

  const startListening = useCallback(() => {
    console.log('[Voice] startListening called, state:', stateRef.current);

    // Manual barge-in
    if (stateRef.current === 'SPEAKING' || stateRef.current === 'THINKING') {
      console.log('[Voice] Barge-in: cancelling AI speech');
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    }

    clearSilenceTimeout();
    fullTranscriptRef.current = '';
    if (onTranscriptChangeRef.current) onTranscriptChangeRef.current('', '');

    if (recognitionRef.current) {
      updateState('LISTENING');
      try {
        recognitionRef.current.start();
      } catch (_) {
        // InvalidStateError thrown if already started — safe to ignore
      }
    }
  }, [clearSilenceTimeout, updateState]);

  const stopListening = useCallback(() => {
    stopListeningInternal();
  }, [stopListeningInternal]);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) {
      console.error('[Voice] speechSynthesis not available');
      return;
    }

    console.log('[Voice] speak() called. Text:', text.substring(0, 60));

    // Transition to SPEAKING *before* calling stop() on recognition.
    // This ensures recognition.onend sees SPEAKING and does NOT auto-restart.
    updateState('SPEAKING');

    // Stop recognition — recognition.onend will fire but won't restart (state is SPEAKING)
    stopListeningInternal();

    const utterance = new SpeechSynthesisUtterance(text);
    // Hold a ref to prevent Chrome's GC from destroying the utterance (Bug #509488)
    activeUtteranceRef.current = utterance;

    // Select best voice for the language
    const voices = availableVoices.length > 0 ? availableVoices : synthRef.current.getVoices();
    if (voices.length > 0) {
      const langPrefix = language.split('-')[0];
      let voice =
        voices.find(v => v.lang === language) ||
        voices.find(v => v.lang.startsWith(langPrefix) && v.name.includes('Google')) ||
        voices.find(v => v.lang.startsWith(langPrefix)) ||
        voices.find(v => v.name.includes('Google')) ||
        voices[0];

      if (voice) {
        utterance.voice = voice;
        console.log('[Voice] Selected voice:', voice.name, voice.lang);
      }
    }

    utterance.onstart = () => {
      console.log('[Voice] Speech Started ▶');
    };

    utterance.onend = () => {
      console.log('[Voice] Speech Ended ■');
      if (stateRef.current === 'SPEAKING') {
        // Wait 500ms before re-enabling the mic — gives audio hardware time to settle
        setTimeout(() => {
          if (stateRef.current === 'SPEAKING') {
            updateState('LISTENING');
            try { recognitionRef.current?.start(); } catch (_) {}
          }
        }, 500);
      }
    };

    utterance.onerror = (e) => {
      // 'interrupted' fires on manual cancel (barge-in) — not an error
      // 'canceled' fires on stopAll — not an error
      const benign = ['interrupted', 'canceled', 'cancelled'];
      if (benign.includes(e.error)) {
        console.log('[Voice] Speech cancelled (benign):', e.error);
      } else {
        console.error('[Voice] Speech Error:', e.error);
      }
      if (stateRef.current === 'SPEAKING') {
        updateState('IDLE');
      }
    };

    console.log('[Voice] Calling synth.speak()');
    synthRef.current.speak(utterance);
  }, [availableVoices, language, stopListeningInternal, updateState]);

  const stopAll = useCallback(() => {
    stopAllInternal();
  }, [stopAllInternal]);

  return { state, errorMsg, startListening, stopListening, speak, stopAll };
}
