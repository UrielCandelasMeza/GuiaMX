"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type VoiceState = "idle" | "listening" | "unsupported";

interface UseVoiceInputOptions {
  onTranscript: (text: string) => void;
  lang?: string;
}

export function useVoiceInput({ onTranscript, lang = "es-MX" }: UseVoiceInputOptions) {
  const [state, setState] = useState<VoiceState>("idle");
  const recognitionRef  = useRef<SpeechRecognition | null>(null);
  const isListeningRef  = useRef(false);
  const finalTextRef    = useRef("");
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  });

  useEffect(() => {
    const SR =
      typeof window !== "undefined" &&
      (window.SpeechRecognition ??
        (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition })
          .webkitSpeechRecognition);
    if (!SR) setState("unsupported");
  }, []);

  const buildRecognition = useCallback(() => {
    const SR =
      window.SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition })
        .webkitSpeechRecognition;
    if (!SR) return null;

    const r = new SR();
    r.lang = lang;
    r.interimResults = true;
    r.continuous = true;

    r.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTextRef.current += t + " ";
        } else {
          interim = t;
        }
      }
      onTranscriptRef.current((finalTextRef.current + interim).trimStart());
    };

    r.onend = () => {
      if (isListeningRef.current) {
        // Chrome fires onend on silence even with continuous=true — restart same instance
        try { r.start(); } catch { /* already starting */ }
      } else {
        recognitionRef.current = null;
        setState("idle");
      }
    };

    r.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      isListeningRef.current = false;
      recognitionRef.current = null;
      setState("idle");
    };

    return r;
  }, [lang]);

  const start = useCallback(() => {
    finalTextRef.current = "";
    isListeningRef.current = true;
    const r = buildRecognition();
    if (!r) return;
    recognitionRef.current = r;
    r.start();
    setState("listening");
  }, [buildRecognition]);

  const stop = useCallback(() => {
    isListeningRef.current = false;
    recognitionRef.current?.stop();
  }, []);

  const toggle = useCallback(() => {
    if (state === "listening") stop();
    else if (state === "idle") start();
  }, [state, start, stop]);

  return { state, toggle };
}
