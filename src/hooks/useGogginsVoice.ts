import React, { useState, useEffect, useCallback, useRef, Dispatch, SetStateAction } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const GOGGINS_VOICE_CLIPS = [
  "STAY HARD! WHO'S GONNA CARRY THE BOATS AND THE LOGS?! NOBODY IS COMING TO SAVE YOU!",
  "DON'T STOP WHEN YOU'RE TIRED! STOP WHEN YOU'RE DONE! EXECUTE TODAY!",
  "TAKE THEIR SOULS AND OUTWORK THE WEAKNESS! NO EXCUSES IN THIS HOUSE!",
  "TIME FOR THE ACCOUNTABILITY MIRROR! LOOK AT YOURSELF AND OUTWORK YESTERDAY!",
  "YOU ARE ONLY AT 40 PERCENT OF YOUR CAPACITY! PUSH THROUGH THE GOVERNOR!",
  "PAIN IS THE LIGHT THAT SHOWS YOU WHERE THE GROWTH IS! EMBRACE THE BURN!",
];

export const GOGGINS_AUDIO_MAP: Record<string, string> = {
  q1: '/audio/goggins_q1.wav',
  q2: '/audio/goggins_q2.wav',
  q3: '/audio/goggins_q3.wav',
  q4: '/audio/goggins_q4.wav',
  q5: '/audio/goggins_q5.wav',
  q6: '/audio/goggins_q6.wav',
  q7: '/audio/goggins_q7.wav',
};

export interface UseGogginsVoiceReturn {
  isSpeaking: boolean;
  speechEnabled: boolean;
  setSpeechEnabled: Dispatch<SetStateAction<boolean>>;
  toggleSpeech: () => void;
  stopSpeech: () => void;
  speakText: (text: string, audioClipId?: string) => void;
  speakMotivationalClip: (clipIndex?: number) => void;
  playAudioClip: (clipId: string) => void;
}

export const useGogginsVoice = (): UseGogginsVoiceReturn => {
  const { isGogginsMode } = useTheme();
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load and update available speech voices dynamically
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const updateVoices = () => {
      const avail = window.speechSynthesis.getVoices();
      if (avail && avail.length > 0) {
        setVoices(avail);
      }
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Helper to strictly pick a deep male voice and exclude female TTS voices
  const getMaleVoice = useCallback((): SpeechSynthesisVoice | null => {
    const availVoices =
      voices.length > 0
        ? voices
        : 'speechSynthesis' in window
        ? window.speechSynthesis.getVoices()
        : [];
    if (!availVoices || availVoices.length === 0) return null;

    const femaleKeywords = [
      'female', 'samantha', 'victoria', 'karen', 'zira', 'fiona', 'moira', 'veena',
      'siri', 'susan', 'serena', 'hazel', 'helena', 'catherine', 'jenny', 'aria',
      'ana', 'eva', 'amy', 'emma', 'joanna', 'salli', 'linda', 'alice', 'claire'
    ];
    const maleKeywords = [
      'male', 'david', 'daniel', 'alex', 'fred', 'george', 'guy', 'james', 'richard',
      'mark', 'brian', 'matthew', 'ryan', 'tom', 'arthur', 'oliver', 'rishi', 'aaron'
    ];

    const englishVoices = availVoices.filter((v) => v.lang.startsWith('en'));

    // 1. Explicit male English voice (e.g., David, Daniel, Alex, Male)
    const explicitMale = englishVoices.find((v) => {
      const name = v.name.toLowerCase();
      return maleKeywords.some((k) => name.includes(k)) && !femaleKeywords.some((k) => name.includes(k));
    });
    if (explicitMale) return explicitMale;

    // 2. Any English voice that does NOT match female names
    const nonFemale = englishVoices.find((v) => {
      const name = v.name.toLowerCase();
      return !femaleKeywords.some((k) => name.includes(k));
    });
    if (nonFemale) return nonFemale;

    return englishVoices[0] || availVoices[0] || null;
  }, [voices]);

  // Stop speech if unmounted or if theme changes
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const stopSpeech = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const toggleSpeech = useCallback(() => {
    if (isSpeaking) {
      stopSpeech();
    } else {
      setSpeechEnabled((prev) => !prev);
    }
  }, [isSpeaking, stopSpeech]);

  const playAudioClip = useCallback(
    (clipId: string) => {
      if (isTeacher || !speechEnabled) return;
      stopSpeech();

      const audioUrl = GOGGINS_AUDIO_MAP[clipId];
      if (audioUrl) {
        try {
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          audio.volume = 1.0;
          audio.playbackRate = 1.05; // High-energy dynamic energetic playback rate
          setIsSpeaking(true);

          audio.onended = () => {
            setIsSpeaking(false);
            audioRef.current = null;
          };

          audio.onerror = () => {
            setIsSpeaking(false);
            audioRef.current = null;
          };

          audio.play().catch(() => {
            setIsSpeaking(false);
          });
        } catch {
          setIsSpeaking(false);
        }
      }
    },
    [isTeacher, speechEnabled, stopSpeech]
  );

  const speakText = useCallback(
    (text: string, audioClipId?: string) => {
      if (isTeacher || !speechEnabled) return;
      stopSpeech();

      // In Goggins mode, automatically select a matching high-intensity Goggins audio quote clip
      let clipToPlay = audioClipId;
      if (isGogginsMode && !clipToPlay) {
        const randomNum = Math.floor(Math.random() * 7) + 1;
        clipToPlay = `q${randomNum}`;
      }

      if (clipToPlay && GOGGINS_AUDIO_MAP[clipToPlay]) {
        playAudioClip(clipToPlay);
      }

      if (!('speechSynthesis' in window)) return;

      // Clean markdown tags & URL noise
      const cleanText = text
        .replace(/[*#_`~]/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Energetic, intense, commanding male voice parameters (David Goggins style)
      utterance.rate = isGogginsMode ? 1.08 : 1.0;  // High energy cadence
      utterance.pitch = isGogginsMode ? 0.88 : 0.95; // Firm, energetic male tone
      utterance.volume = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      const preferredMaleVoice = getMaleVoice();
      if (preferredMaleVoice) {
        utterance.voice = preferredMaleVoice;
      }

      window.speechSynthesis.speak(utterance);
    },
    [isTeacher, isGogginsMode, speechEnabled, stopSpeech, playAudioClip, getMaleVoice]
  );

  const speakMotivationalClip = useCallback(
    (clipIndex?: number) => {
      if (isTeacher || !isGogginsMode) return;
      const index =
        clipIndex !== undefined && clipIndex >= 0 && clipIndex < GOGGINS_VOICE_CLIPS.length
          ? clipIndex
          : Math.floor(Math.random() * GOGGINS_VOICE_CLIPS.length);

      const clip = GOGGINS_VOICE_CLIPS[index];
      const clipKey = `q${(index % 7) + 1}`;
      speakText(clip, clipKey);
    },
    [isGogginsMode, speakText]
  );

  return {
    isSpeaking,
    speechEnabled,
    setSpeechEnabled,
    toggleSpeech,
    stopSpeech,
    speakText,
    speakMotivationalClip,
    playAudioClip,
  };
};
