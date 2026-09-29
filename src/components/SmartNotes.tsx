import React, { useState } from 'react';
import { SmartNoteAnalysis } from '../types';
import { useSpeechToText } from '../hooks/useSpeechToText';
import {
  FileText,
  Sparkles,
  HelpCircle,
  Layers,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Loader2,
  BookOpen,
  Mic,
  MicOff,
} from 'lucide-react';

export const SmartNotes: React.FC = () => {
  const [noteTitle, setNoteTitle] = useState('Physics: Newton Laws & Momentum');
  const [noteText, setNoteText] = useState(
    `Newton's first law states that every object will remain at rest or in uniform motion in a straight line unless compelled to change its state by the action of an external force. This tendency to resist changes in state of motion is inertia.\n\nNewton's second law states that force equals mass times acceleration (F = ma). Momentum (p = mv) is conserved in an isolated system.\n\nNewton's third law states that for every action, there is an equal and opposite reaction.`
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmartNoteAnalysis | null>(null);

  const {
    isListening,
    toggleListening,
    stopListening,
  } = useSpeechToText((dictated) => {
    setNoteText((prev) => (prev ? `${prev} ${dictated}` : dictated));
  });

  // Quiz state
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  // Flashcards state
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const processNotes = async () => {
    if (!noteText.trim()) return;
    setLoading(true);
    setUserAnswers({});
    setShowQuizResults(false);
    setFlippedCards({});

    try {
      const res = await fetch('/api/ai/smart-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteText, title: noteTitle }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setResult(data.data);
      } else {
        throw new Error(data.error || 'Failed to process notes');
      }
    } catch (err: any) {
      alert(`Error processing notes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qId: string, optIdx: number) => {
    if (showQuizResults) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const toggleFlip = (cardId: string) => {
    setFlippedCards((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="accent-pill">
              AI Smart Notes & Assessment Generator
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#1A1A2E] tracking-tight">
            Smart Notes & Interactive Quiz
          </h1>
          <p className="text-xs text-[#9B9BB8] font-semibold mt-1">
            Paste lecture transcripts or notes. Gemini AI extracts key concepts, generates quizzes & flashcards.
          </p>
        </div>
      </div>

      {/* Input Area */}
      <div className="glass-card p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#4A4A6A] mb-1">
            Topic / Note Title
          </label>
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/50 text-xs sm:text-sm font-semibold rounded-xl p-3 text-[#1A1A2E] outline-none shadow-[inset_1px_1px_2px_rgba(0,0,0,0.02)] focus-ring"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-[#4A4A6A]">
              Lecture Content or Textbook Text
            </label>
            <button
              type="button"
              onClick={toggleListening}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-indigo-50 text-indigo-600 border border-indigo-200/60 hover:bg-indigo-100'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span>Stop Dictating</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5" />
                  <span>Dictate Notes via Voice</span>
                </>
              )}
            </button>
          </div>
          <textarea
            rows={5}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={isListening ? "Listening... speak lecture notes clearly" : "Paste raw notes, textbook excerpt, or click Dictate..."}
            className="w-full bg-slate-50 border border-slate-200/50 text-xs sm:text-sm rounded-xl p-3 text-[#1A1A2E] outline-none shadow-[inset_1px_1px_2px_rgba(0,0,0,0.02)] focus-ring"
          />
        </div>

        <button
          onClick={processNotes}
          disabled={loading || !noteText.trim()}
          className="flex items-center justify-center gap-2 clay-btn font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" /> Processing with Gemini...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-white" /> Generate Summary, Quiz & Flashcards
            </>
          )}
        </button>
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          {/* Summary & Key Concepts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Summary */}
            <div className="glass-card p-6 space-y-3">
              <h3 className="font-black text-xs text-[#1A1A2E] tracking-wider uppercase flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                Executive Summary
              </h3>
              <ul className="space-y-2.5">
                {result.summary.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#4A4A6A] font-bold">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Concepts */}
            <div className="glass-card p-6 space-y-3">
              <h3 className="font-black text-xs text-[#1A1A2E] tracking-wider uppercase flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-500" />
                Key Concepts Glossary
              </h3>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {result.keyConcepts.map((kc, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-0.5">
                    <span className="font-black text-indigo-600">{kc.concept}</span>
                    <p className="text-[#4A4A6A] font-bold leading-relaxed">{kc.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Practice Quiz */}
          <div className="glass-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-[#1A1A2E] tracking-wider uppercase flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-500" />
                  AI Practice Knowledge Quiz
                </h3>
                <p className="text-xs text-[#9B9BB8] font-bold">Test your comprehension on the generated notes</p>
              </div>

              {!showQuizResults ? (
                <button
                  onClick={() => setShowQuizResults(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm focus-ring cursor-pointer"
                >
                  Check Answers
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowQuizResults(false);
                    setUserAnswers({});
                  }}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 text-[#1A1A2E] text-xs font-bold rounded-xl transition-all focus-ring cursor-pointer"
                >
                  Retry Quiz
                </button>
              )}
            </div>

            <div className="space-y-6">
              {result.quiz.map((q, qIdx) => {
                const selectedOpt = userAnswers[q.id];
                const isCorrect = selectedOpt === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="p-5 bg-slate-50 border border-slate-200/50 rounded-2xl space-y-3 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.01)]"
                  >
                    <div className="font-black text-[#1A1A2E] text-xs uppercase tracking-wider">
                      {qIdx + 1}. {q.question}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = selectedOpt === oIdx;
                        let optionStyle = 'bg-white text-[#4A4A6A] border-slate-200 hover:border-indigo-300 shadow-sm';

                        if (showQuizResults) {
                          if (oIdx === q.correctIndex) {
                            optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-700 font-black';
                          } else if (isSelected) {
                            optionStyle = 'bg-red-50 border-red-500 text-red-700 line-through font-black';
                          }
                        } else if (isSelected) {
                          optionStyle = 'bg-indigo-50 border-indigo-500 text-indigo-700 font-black shadow-sm';
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectOption(q.id, oIdx)}
                            className={`p-3 rounded-xl border text-xs font-bold text-left transition-all focus-ring cursor-pointer ${optionStyle}`}
                          >
                            <span className="font-black mr-2">{String.fromCharCode(65 + oIdx)}.</span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {showQuizResults && (
                      <div className="p-3 bg-indigo-50/50 rounded-xl text-xs text-indigo-700 border border-indigo-100 font-bold leading-relaxed">
                        <span className="font-black">Explanation: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Flashcards Section */}
          <div className="space-y-4">
            <h3 className="font-black text-sm text-[#1A1A2E] tracking-wider uppercase flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              Interactive Revision Flashcards
            </h3>
            <p className="text-xs text-[#9B9BB8] font-bold">Click any card to flip between Question and Answer</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {result.flashcards.map((fc) => {
                const isFlipped = !!flippedCards[fc.id];
                return (
                  <div
                    key={fc.id}
                    onClick={() => toggleFlip(fc.id)}
                    className={`h-44 clay-card p-5 cursor-pointer flex flex-col justify-between transition-all duration-300 ${
                      isFlipped ? 'bg-indigo-50/50 border-indigo-200/80' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-[#9B9BB8]">
                      <span>{fc.category}</span>
                      <span className={isFlipped ? 'text-indigo-600 font-black' : ''}>{isFlipped ? 'Answer' : 'Question'}</span>
                    </div>

                    <div className="text-xs sm:text-sm font-bold text-[#1A1A2E] text-center my-auto leading-relaxed">
                      {isFlipped ? fc.back : fc.front}
                    </div>

                    <div className="text-[10px] text-center text-indigo-600 font-black">
                      {isFlipped ? 'Click to view question' : 'Click to flip 🔄'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


