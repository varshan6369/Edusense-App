import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useGogginsVoice } from '../hooks/useGogginsVoice';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { ChatMessage } from '../types';
import { Brain, Send, User, Sparkles, X, Loader2, Flame, ShieldAlert, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AICopilotProps {
  isDrawer?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export const AICopilotView: React.FC<AICopilotProps> = ({
  isDrawer = false,
  isOpen = true,
  onClose,
}) => {
  const { user, activeStudent } = useAuth();
  const { isGogginsMode } = useTheme();
  const isTeacher = user?.role === 'teacher';
  const effectiveGogginsMode = isTeacher ? false : isGogginsMode;

  const {
    isSpeaking,
    speechEnabled,
    setSpeechEnabled,
    toggleSpeech,
    stopSpeech,
    speakText,
    speakMotivationalClip,
  } = useGogginsVoice();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isListening,
    transcript,
    error: speechError,
    toggleListening,
    stopListening,
    isSupported: speechSupported,
  } = useSpeechToText((recognizedText) => {
    setInput(recognizedText);
  });

  const getInitialMessage = (isGoggins: boolean): string => {
    if (isGoggins && !isTeacher) {
      return `WELCOME WARRIOR! STAY HARD! 🪵🔥 No excuses today! I'm your Goggins AI Savage Copilot. ${
        activeStudent
          ? `I see **${activeStudent.name}** has ${activeStudent.attendance}% attendance. WHO'S GONNA CARRY THE BOATS?! We don't stop when we're tired, we stop when we're DONE!`
          : 'NO DAYS OFF! What academic goal are you crushing today?'
      }`;
    }
    return `Hello! I'm EduSense AI Copilot powered by Gemini. ${
      activeStudent
        ? `I've loaded real-time performance data for **${activeStudent.name}** (${activeStudent.attendance}% attendance, Avg Score: ${(Object.values(activeStudent.examScores) as number[]).length > 0 ? Math.round((Object.values(activeStudent.examScores) as number[]).reduce((a, b) => a + b, 0) / (Object.values(activeStudent.examScores) as number[]).length) : 'N/A'}%).`
        : 'I have access to the full class roster and dataset.'
    } How can I assist you today?`;
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-init',
      sender: 'assistant',
      text: getInitialMessage(effectiveGogginsMode),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Update initial message if theme toggles
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'm-init') {
        const text = getInitialMessage(effectiveGogginsMode);
        if (effectiveGogginsMode && speechEnabled && !isTeacher) {
          speakText(text);
        }
        return [
          {
            id: 'm-init',
            sender: 'assistant',
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ];
      }
      return prev;
    });
  }, [effectiveGogginsMode, isTeacher]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (isDrawer && !isOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || loading) return;

    if (isListening) {
      stopListening();
    }

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          studentId: activeStudent?.studentId,
          role: user?.role || 'teacher',
          gogginsMode: effectiveGogginsMode,
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            sender: 'assistant',
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        if (!isTeacher && (speechEnabled || effectiveGogginsMode)) {
          speakText(data.reply);
        }
      } else {
        throw new Error(data.error || 'Failed to get AI response');
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ Error: ${err.message}. Please check your GEMINI_API_KEY or try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    activeStudent ? `What are ${activeStudent.name}'s weaknesses?` : 'Which students need support?',
    activeStudent ? `Predict ${activeStudent.name}'s score` : 'Show class attendance summary',
    'Explain quadratic equations',
    'How does sleep improve scores?',
  ];

  const contentMarkup = (
    <div className="flex flex-col h-full clay-card overflow-hidden relative">
      {/* Header */}
      <div className={`p-5 flex items-center justify-between shrink-0 border-b rounded-t-[28px] ${
        isGogginsMode
          ? 'bg-slate-900 border-slate-800'
          : 'bg-white/90 border-slate-100 backdrop-blur-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
            isGogginsMode
              ? 'bg-slate-800 text-amber-400 border border-amber-500/30'
              : 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-indigo-500/20'
          }`}>
            {isGogginsMode ? <Flame className="w-5 h-5 text-amber-400" /> : <Brain className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[#1A1A2E] dark:text-white">
                {isGogginsMode ? 'GOGGINS AI COPILOT' : 'AI Copilot'}
              </h3>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                isGogginsMode
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-indigo-50 text-indigo-600'
              }`}>
                {isGogginsMode ? 'STAY HARD' : 'Gemini RAG'}
              </span>
            </div>
            <p className={`text-[11px] font-bold mt-0.5 ${isGogginsMode ? 'text-orange-300' : 'text-[#9B9BB8]'}`}>
              {activeStudent ? `Context: ${activeStudent.name}` : 'Class Dataset Loaded'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Speech Toggle */}
          <button
            onClick={() => {
              if (isSpeaking) {
                stopSpeech();
              } else {
                setSpeechEnabled(!speechEnabled);
              }
            }}
            title={isSpeaking ? "Stop Goggins Voice" : speechEnabled ? "Disable Voice" : "Enable Goggins Voice"}
            className={`p-2 rounded-xl transition-all cursor-pointer border ${
              isSpeaking
                ? 'bg-red-500 text-white border-red-600 animate-pulse'
                : speechEnabled
                ? 'bg-orange-500/20 text-orange-400 border-orange-500/40 hover:bg-orange-500/30'
                : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}
          >
            {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {isDrawer && onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer text-[#9B9BB8] hover:text-[#1A1A2E] focus-ring border border-transparent hover:border-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-5 overflow-y-auto space-y-5 relative z-0">
        <AnimatePresence>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              className={`flex items-end gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white'
                    : 'clay-card-sub text-indigo-500'
                }`}
              >
                {m.sender === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>

              <div
                className={`max-w-[80%] p-4 text-xs sm:text-sm leading-relaxed font-medium relative group ${
                  m.sender === 'user'
                    ? isGogginsMode
                      ? 'bg-gradient-to-tr from-orange-600 to-red-600 text-white rounded-3xl rounded-br-sm shadow-lg shadow-orange-950/40'
                      : 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-3xl rounded-br-sm shadow-[0_8px_20px_-4px_rgba(99,102,241,0.35)]'
                    : isGogginsMode
                    ? 'bg-slate-900 border border-orange-500/30 rounded-3xl rounded-bl-sm text-slate-100 whitespace-pre-wrap shadow-md shadow-orange-950/20'
                    : 'glass-card rounded-3xl rounded-bl-sm text-[#4A4A6A] whitespace-pre-wrap'
                }`}
              >
                {m.text}
                <div
                  className={`text-[10px] mt-1.5 font-bold flex items-center justify-between gap-2 ${
                    m.sender === 'user' ? 'text-indigo-200 text-right' : 'text-[#9B9BB8]'
                  }`}
                >
                  <span>{m.timestamp}</span>
                  {m.sender === 'assistant' && (
                    <button
                      onClick={() => speakText(m.text)}
                      title="Read aloud in Goggins voice"
                      className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-orange-400 hover:text-orange-300 transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>{isGogginsMode ? 'MOTIVATE 🪵🔥' : 'Speak'}</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 text-xs font-bold text-[#9B9BB8] p-2"
          >
            <div className="flex gap-1">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
            <span>Gemini is thinking...</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Suggestion chips */}
      <div className="px-4 pb-3 flex items-center gap-2 overflow-x-auto shrink-0">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => handleSend(s)}
            className="text-[11px] font-black bg-indigo-50 text-indigo-600 border border-indigo-100 px-3.5 py-2 rounded-xl whitespace-nowrap hover:bg-indigo-100 hover:border-indigo-200 transition-all focus-ring cursor-pointer shrink-0"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 shrink-0 z-10">
        {isListening && (
          <div className="mb-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between text-xs font-bold text-red-500 animate-pulse">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              Listening to voice dictation...
            </span>
            <button
              onClick={stopListening}
              className="text-[10px] uppercase font-black underline hover:text-red-700 cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 sm:gap-3 clay-card-sub px-4 py-2.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? "Listening... speak now" : "Ask AI Copilot or dictate query..."}
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none font-medium"
          />

          {/* Voice to Text Dictation Button */}
          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? "Stop Voice Dictation" : "Start Voice to Text Dictation"}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer border ${
              isListening
                ? 'bg-red-500 text-white border-red-600 animate-bounce shadow-lg shadow-red-500/30'
                : 'bg-indigo-50 text-indigo-600 border-indigo-200/60 hover:bg-indigo-100 hover:border-indigo-300'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="clay-btn p-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (isDrawer) {
    return (
      <div
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-black/20 backdrop-blur-sm flex justify-end"
        onClick={onClose}
      >
        <div
          className="w-full h-full p-3 sm:p-4"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-label="AI Copilot Assistant"
        >
          {contentMarkup}
        </div>
      </div>
    );
  }

  return <div className="h-[calc(100vh-160px)] min-h-[520px]">{contentMarkup}</div>;
};


