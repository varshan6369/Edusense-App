import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { Search, GraduationCap, Cpu, Trophy, BookOpen, FileText, Sparkles, X, Mic, MicOff } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onSelectStudent: (studentId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectStudent,
}) => {
  const { allStudents } = useAuth();
  const [query, setQuery] = useState('');

  const {
    isListening,
    toggleListening,
    stopListening,
  } = useSpeechToText((speechQuery) => setQuery(speechQuery));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
        }
      }
      if (e.key === 'Escape' && isOpen) {
        if (isListening) stopListening();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isListening, stopListening]);

  if (!isOpen) return null;

  const filteredStudents = allStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.studentId.toLowerCase().includes(query.toLowerCase()) ||
      s.class.toLowerCase().includes(query.toLowerCase())
  );

  const actions = [
    { id: 'dashboard', label: 'Go to Overview Dashboard', icon: GraduationCap },
    { id: 'analytics', label: 'View Learning Analytics & Heatmaps', icon: Sparkles },
    { id: 'copilot', label: 'Ask AI Copilot & Tutor', icon: Cpu },
    { id: 'gamification', label: 'Class Gamification & Recognition Hub', icon: Trophy },
    { id: 'planner', label: 'Generate AI Study Plan', icon: BookOpen },
    { id: 'notes', label: 'Smart Notes & Practice Quiz', icon: FileText },
    { id: 'reports', label: 'Export Academic PDF Reports', icon: FileText },
  ].filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette search"
      >
        {/* Search input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-2">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isListening ? "Listening... speak search query" : "Search students, AI tools, reports..."}
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none"
            autoFocus
          />
          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? "Stop Listening" : "Search by Voice"}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-4">
          {/* Actions */}
          {actions.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
                Quick Actions
              </div>
              <div className="space-y-0.5">
                {actions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.id}
                      onClick={() => {
                        onNavigate(act.id);
                        onClose();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#0D2F5B] dark:text-slate-200 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 hover:text-[#145EA0] dark:hover:text-[#6D96B3] transition-colors text-left focus-ring cursor-pointer"
                    >
                      <Icon className="w-4 h-4 text-[#6D96B3]" />
                      <span>{act.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Student Search */}
          {filteredStudents.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
                Students ({filteredStudents.length})
              </div>
              <div className="space-y-0.5">
                {filteredStudents.map((st) => (
                  <button
                    key={st.studentId}
                    onClick={() => {
                      onSelectStudent(st.studentId);
                      onNavigate('dashboard');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-[#0D2F5B] dark:text-slate-200 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition-colors text-left focus-ring cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={st.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{st.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{st.class} • ID: {st.studentId}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className={st.attendance < 70 ? 'text-red-500' : 'text-emerald-500'}>
                        {st.attendance}% Att
                      </span>
                      {st.atRisk && (
                        <span className="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300 px-2 py-0.5 rounded-full text-[10px]">
                          At Risk
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded shadow border text-[10px]">Ctrl+K</kbd> anywhere</span>
          <span>EduSense AI v2.5</span>
        </div>
      </div>
    </div>
  );
};


