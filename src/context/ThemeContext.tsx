import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export type ThemeMode = 'light' | 'goggins';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  isGogginsMode: boolean;
  gogginsAmbientAudio: boolean;
  setGogginsAmbientAudio: (enabled: boolean) => void;
  toggleGogginsAmbientAudio: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('edusense_theme');
    return (saved === 'goggins' || saved === 'light') ? saved : 'light';
  });

  const [gogginsAmbientAudio, setGogginsAmbientAudioState] = useState<boolean>(() => {
    return localStorage.getItem('edusense_goggins_ambient_audio') === 'true';
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef<boolean>(false);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem('edusense_theme', mode);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'goggins' : 'light';
    setTheme(nextTheme);
  };

  const setGogginsAmbientAudio = (enabled: boolean) => {
    setGogginsAmbientAudioState(enabled);
    localStorage.setItem('edusense_goggins_ambient_audio', enabled ? 'true' : 'false');
  };

  const toggleGogginsAmbientAudio = () => {
    setGogginsAmbientAudio(!gogginsAmbientAudio);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'goggins') {
      root.classList.add('theme-goggins', 'dark');
    } else {
      root.classList.remove('theme-goggins', 'dark');
    }
  }, [theme]);

  const isGogginsMode = theme === 'goggins';

  // High-Energy Ambient Synthesizer via Web Audio API
  useEffect(() => {
    const stopAudio = () => {
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {
          // Ignore
        }
        audioCtxRef.current = null;
      }
      isPlayingRef.current = false;
    };

    if (isGogginsMode && gogginsAmbientAudio) {
      if (!isPlayingRef.current) {
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (!AudioContextClass) return;

          const ctx = new AudioContextClass();
          audioCtxRef.current = ctx;

          // Main Gain
          const masterGain = ctx.createGain();
          masterGain.gain.setValueAtTime(0.08, ctx.currentTime);
          masterGain.connect(ctx.destination);

          // 1. Sub-Bass Driving Pulse (Sawtooth Filtered)
          const bassOsc = ctx.createOscillator();
          bassOsc.type = 'sawtooth';
          bassOsc.frequency.setValueAtTime(65, ctx.currentTime); // C2

          const bassFilter = ctx.createBiquadFilter();
          bassFilter.type = 'lowpass';
          bassFilter.frequency.setValueAtTime(180, ctx.currentTime);

          const bassLfo = ctx.createOscillator();
          bassLfo.frequency.setValueAtTime(2.2, ctx.currentTime); // ~132 BPM pulse
          const bassLfoGain = ctx.createGain();
          bassLfoGain.gain.setValueAtTime(0.05, ctx.currentTime);

          bassOsc.connect(bassFilter);
          bassFilter.connect(masterGain);
          bassLfo.connect(bassLfoGain);
          bassLfoGain.connect(bassFilter.frequency);

          bassOsc.start();
          bassLfo.start();

          // 2. High Energy Rhythm Noise Buffer (Pulsing focus drive)
          const bufferSize = ctx.sampleRate * 2;
          const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
          }

          const whiteNoise = ctx.createBufferSource();
          whiteNoise.buffer = noiseBuffer;
          whiteNoise.loop = true;

          const noiseFilter = ctx.createBiquadFilter();
          noiseFilter.type = 'bandpass';
          noiseFilter.frequency.setValueAtTime(800, ctx.currentTime);
          noiseFilter.Q.setValueAtTime(3.0, ctx.currentTime);

          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(0.02, ctx.currentTime);

          whiteNoise.connect(noiseFilter);
          noiseFilter.connect(noiseGain);
          noiseGain.connect(masterGain);

          whiteNoise.start();

          if (ctx.state === 'suspended') {
            const handleUserGesture = () => {
              if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
                audioCtxRef.current.resume();
              }
              window.removeEventListener('click', handleUserGesture);
              window.removeEventListener('keydown', handleUserGesture);
            };
            window.addEventListener('click', handleUserGesture, { once: true });
            window.addEventListener('keydown', handleUserGesture, { once: true });
          }

          isPlayingRef.current = true;
        } catch {
          // Audio autoplay block handled gracefully
        }
      }
    } else {
      stopAudio();
    }

    return () => {
      stopAudio();
    };
  }, [isGogginsMode, gogginsAmbientAudio]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        isGogginsMode,
        gogginsAmbientAudio,
        setGogginsAmbientAudio,
        toggleGogginsAmbientAudio,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

