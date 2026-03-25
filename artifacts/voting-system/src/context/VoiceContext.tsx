import React, { createContext, useContext, useState, useEffect } from 'react';
import { type Language } from '@/lib/i18n';

interface VoiceContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  speak: (text: string) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('lang') as Language) || 'en';
  });
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  useEffect(() => {
    localStorage.setItem('lang', language);
  }, [language]);

  const speak = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Cancel ongoing speeches
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <VoiceContext.Provider value={{ language, setLanguage, speak, voiceEnabled, setVoiceEnabled }}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (!context) throw new Error("useVoice must be used within VoiceProvider");
  return context;
}
