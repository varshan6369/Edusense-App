import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGogginsVoice } from '../hooks/useGogginsVoice';
import { Flame, Quote, RefreshCw, ChevronLeft, ChevronRight, Volume2, VolumeX, ShieldAlert, Mic } from 'lucide-react';

export interface GogginsQuote {
  id: string;
  quote: string;
  context: string;
  tag: 'DISCIPLINE' | 'NO EXCUSES' | 'MINDSET' | 'GRIT' | 'ACCOUNTABILITY';
}

export const GOGGINS_QUOTES: GogginsQuote[] = [
  {
    id: 'q1',
    quote: "When you think you're done, you're only at 40% of your body's capability. Push through the governor!",
    context: "The 40% Rule — Overcoming Mental Fatigue",
    tag: 'MINDSET',
  },
  {
    id: 'q2',
    quote: "You are in danger of living a life so comfortable and soft, that you will die without ever realizing your true potential.",
    context: "Can't Hurt Me — Breaking Comfort Zones",
    tag: 'NO EXCUSES',
  },
  {
    id: 'q3',
    quote: "Who's gonna carry the boats and the logs?! Nobody is coming to save you. Get up and execute!",
    context: "Hell Week Mindset — Unrelenting Grit",
    tag: 'GRIT',
  },
  {
    id: 'q4',
    quote: "Don't stop when you're tired. Stop when you're done!",
    context: "Daily Execution Standard",
    tag: 'DISCIPLINE',
  },
  {
    id: 'q5',
    quote: "Tell yourself the truth in the Accountability Mirror. No sugarcoating, no excuses, just pure reality.",
    context: "The Accountability Mirror Method",
    tag: 'ACCOUNTABILITY',
  },
  {
    id: 'q6',
    quote: "Herding sheep is easy. Being a lone warrior in the dark, forging your own future when no one is watching—that is greatness.",
    context: "Solitude & Late-Night Grind",
    tag: 'GRIT',
  },
  {
    id: 'q7',
    quote: "Pain is the light that shows you where the growth is. Don't run from the burn—embrace it!",
    context: "Mental Resiliency",
    tag: 'MINDSET',
  },
];

export const GogginsQuotesWidget: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const { isSpeaking, speakText, stopSpeech, speakMotivationalClip } = useGogginsVoice();

  // Auto rotate quote every 9 seconds
  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % GOGGINS_QUOTES.length);
    }, 9000);

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const handleNext = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev + 1) % GOGGINS_QUOTES.length);
  };

  const handlePrev = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev - 1 + GOGGINS_QUOTES.length) % GOGGINS_QUOTES.length);
  };

  const handleRandom = () => {
    setIsAutoPlay(false);
    let nextIdx = Math.floor(Math.random() * GOGGINS_QUOTES.length);
    if (nextIdx === currentIndex) {
      nextIdx = (currentIndex + 1) % GOGGINS_QUOTES.length;
    }
    setCurrentIndex(nextIdx);
  };

  const currentQuote = GOGGINS_QUOTES[currentIndex];

  const handleSpeakCurrentQuote = () => {
    if (isSpeaking) {
      stopSpeech();
    } else {
      speakText(`${currentQuote.quote}. Stay Hard!`, currentQuote.id);
    }
  };

  return (
    <div className="glass-card p-6 relative overflow-hidden bg-slate-900 text-slate-100 border border-slate-800 shadow-xl rounded-2xl">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            STAY HARD MOTIVATION ENGINE
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-slate-800 text-slate-300 border border-slate-700">
            {currentQuote.tag}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSpeakCurrentQuote}
            title={isSpeaking ? "Stop Voice Clip" : "Listen to Synthesized Voice Clip"}
            className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              isSpeaking
                ? 'bg-amber-600 text-white border-amber-500'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isSpeaking ? 'STOP' : 'SPEAK'}</span>
          </button>
          <button
            onClick={handleRandom}
            title="Get Random Quote"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handlePrev}
            title="Previous Quote"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleNext}
            title="Next Quote"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quote Display Container */}
      <div className="py-5 min-h-[120px] flex flex-col justify-center relative">
        <Quote className="w-8 h-8 text-slate-800 absolute -top-1 -left-2 pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuote.id}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-3 z-10"
          >
            <blockquote className="text-base sm:text-lg font-bold text-white leading-snug tracking-tight italic">
              "{currentQuote.quote}"
            </blockquote>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <p className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                <span>— David Goggins</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400 font-normal">{currentQuote.context}</span>
              </p>

              <span className="text-[10px] text-slate-500 font-mono">
                Quote {currentIndex + 1} of {GOGGINS_QUOTES.length}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Animated Progress Bar */}
      {isAutoPlay && (
        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
          <motion.div
            key={currentIndex}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 9, ease: 'linear' }}
            className="h-full bg-amber-500/80"
          />
        </div>
      )}
    </div>
  );
};
