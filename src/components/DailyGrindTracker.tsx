import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import {
  Flame,
  Dumbbell,
  Clock,
  Target,
  Zap,
  CheckCircle2,
  Calendar,
  Award,
  ShieldAlert,
  Sparkles,
  ChevronDown,
  Trash2,
} from 'lucide-react';

export interface GrindLogEntry {
  id: string;
  date: string;
  studyHours: number;
  pushupsCount: number;
  focusIntensity: number; // 1-10
  boatGoal: string; // The "Boat/Log" carried today
  notes: string; // Reflection / No excuses log
  xpEarned: number;
}

interface DailyGrindTrackerProps {
  student: Student;
  onLogComplete?: (xp: number) => void;
}

const GOGGINS_SLOGANS = [
  "DON'T STOP WHEN YOU'RE TIRED. STOP WHEN YOU'RE DONE!",
  "YOU CARRIED THE LOG TODAY! NO EXCUSES!",
  "THE ACCOUNTABILITY MIRROR REFLECTS REAL EFFORT!",
  "TAKING SOULS AND OUTWORKING THE WEAKNESS!",
  "STAY HARD! BUILT IN THE FIRE OF DISCIPLINE!",
];

export const DailyGrindTracker: React.FC<DailyGrindTrackerProps> = ({ student, onLogComplete }) => {
  const { awardStudentPoints } = useAuth();
  const localStorageKey = `goggins_grind_logs_${student.studentId || 'default'}`;

  // Form states
  const [studyHours, setStudyHours] = useState<number>(3.5);
  const [pushupsCount, setPushupsCount] = useState<number>(50);
  const [focusIntensity, setFocusIntensity] = useState<number>(8);
  const [boatGoal, setBoatGoal] = useState<string>('Master Calculus Integration & Quantum Physics');
  const [notes, setNotes] = useState<string>('Pushed past mental fatigue at hour 2. Finished 40 practice problems.');

  // Logs list
  const [logs, setLogs] = useState<GrindLogEntry[]>([]);
  const [isSuccessToast, setIsSuccessToast] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Load saved logs
  useEffect(() => {
    try {
      const saved = localStorage.getItem(localStorageKey);
      if (saved) {
        setLogs(JSON.parse(saved));
      } else {
        // Initial sample log
        const sampleLogs: GrindLogEntry[] = [
          {
            id: 'sample-1',
            date: new Date(Date.now() - 86400000).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            studyHours: 4.5,
            pushupsCount: 100,
            focusIntensity: 9,
            boatGoal: 'Conquer Advanced Chemistry & Thermodynamics',
            notes: 'Zero excuses. Studied while everyone else slept.',
            xpEarned: 250,
          },
        ];
        setLogs(sampleLogs);
        localStorage.setItem(localStorageKey, JSON.stringify(sampleLogs));
      }
    } catch {
      // Fallback
    }
  }, [localStorageKey]);

  const saveLogsToStorage = (updatedLogs: GrindLogEntry[]) => {
    setLogs(updatedLogs);
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(updatedLogs));
    } catch {
      //
    }
  };

  const handleLogGrind = (e: React.FormEvent) => {
    e.preventDefault();

    const xpEarned = Math.round(studyHours * 30 + pushupsCount * 2 + focusIntensity * 15);
    const newEntry: GrindLogEntry = {
      id: `grind-${Date.now()}`,
      date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      studyHours: Number(studyHours),
      pushupsCount: Number(pushupsCount),
      focusIntensity: Number(focusIntensity),
      boatGoal: boatGoal.trim() || 'Attacked core syllabus',
      notes: notes.trim() || 'No excuses. Stayed hard.',
      xpEarned,
    };

    const updated = [newEntry, ...logs];
    saveLogsToStorage(updated);

    // Confetti & Toast
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FF5500', '#DC2626', '#F59E0B', '#EAB308'],
    });

    awardStudentPoints(student.studentId, xpEarned, 'Daily Study & Grind Session');

    const slogan = GOGGINS_SLOGANS[Math.floor(Math.random() * GOGGINS_SLOGANS.length)];
    setIsSuccessToast(`🪵 SAVAGE LOGGED! +${xpEarned} XP EARNED! "${slogan}"`);
    setTimeout(() => setIsSuccessToast(null), 4500);

    if (onLogComplete) {
      onLogComplete(xpEarned);
    }
  };

  const handleDeleteLog = (id: string) => {
    const updated = logs.filter((l) => l.id !== id);
    saveLogsToStorage(updated);
  };

  // Derived Stats
  const totalStudyHours = logs.reduce((acc, l) => acc + l.studyHours, 0);
  const totalPushups = logs.reduce((acc, l) => acc + l.pushupsCount, 0);
  const streakDays = logs.length;

  return (
    <div className="glass-card p-6 sm:p-7 relative overflow-hidden bg-slate-900 border border-slate-800 text-slate-100 shadow-xl rounded-2xl">
      {/* Toast Notification */}
      <AnimatePresence>
        {isSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-slate-800 text-slate-100 font-bold text-xs sm:text-sm px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-amber-500/40 max-w-md"
          >
            <Flame className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="font-bold text-white uppercase text-xs">Daily Grind Logged!</p>
              <p className="text-amber-300 text-xs font-medium">{isSuccessToast}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              STAY HARD DAILY INTENSITY TRACKER
            </span>
            <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" /> {streakDays} Day Streak
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Daily Grind & Discipline Log
          </h2>
          <p className="text-xs text-slate-400 font-normal max-w-lg mt-1">
            Input your study metrics, physical discipline reps, and main goal for today.
          </p>
        </div>

        {/* Quick Summary Badges */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-center">
            <p className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">Total Focus</p>
            <p className="text-base font-bold text-white">{totalStudyHours.toFixed(1)} hrs</p>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-center">
            <p className="text-[9px] font-bold text-red-400 uppercase tracking-wider">Discipline Reps</p>
            <p className="text-base font-bold text-white">{totalPushups} reps</p>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleLogGrind} className="mt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Metric 1: Study Hours */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" /> Focus Study Hours
              </span>
              <span className="text-sm text-white font-bold">{studyHours} hrs</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="16"
              step="0.5"
              value={studyHours}
              onChange={(e) => setStudyHours(parseFloat(e.target.value))}
              className="w-full accent-amber-500 bg-slate-900 cursor-pointer h-2 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>0.5h</span>
              <span>8h</span>
              <span>16h</span>
            </div>
          </div>

          {/* Metric 2: Physical Discipline Reps / Pushups */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-red-400" /> Pushups / Discipline Reps
              </span>
              <span className="text-sm text-red-400 font-bold">{pushupsCount} reps</span>
            </label>
            <input
              type="number"
              min="0"
              max="1000"
              value={pushupsCount}
              onChange={(e) => setPushupsCount(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold px-3.5 py-2 text-white outline-none focus:border-amber-500"
              placeholder="e.g. 50"
            />
            <p className="text-[10px] text-slate-400 font-normal">Physical discipline sharpens the mind.</p>
          </div>

          {/* Metric 3: Focus Intensity Rating */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" /> Focus Intensity
              </span>
              <span className="text-sm text-amber-400 font-bold">{focusIntensity} / 10</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={focusIntensity}
              onChange={(e) => setFocusIntensity(parseInt(e.target.value))}
              className="w-full accent-amber-500 bg-slate-900 cursor-pointer h-2 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>1 (Sluggish)</span>
              <span>5 (Solid)</span>
              <span>10 (Peak)</span>
            </div>
          </div>
        </div>

        {/* Goal / Boat To Carry Input */}
        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
          <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-4 h-4 text-amber-400" />
            Today's Main Goal ("The Boat / Log To Carry")
          </label>
          <input
            type="text"
            required
            value={boatGoal}
            onChange={(e) => setBoatGoal(e.target.value)}
            placeholder="e.g. Master Integration, Solve 50 Physics problems, Finish History Essay..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl text-sm font-medium px-4 py-2.5 text-white outline-none focus:border-amber-500 placeholder-slate-500"
          />
        </div>

        {/* Reflections & Zero Excuses Notes */}
        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
          <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            Accountability Reflection
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What difficulty did you conquer today?"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl text-xs font-normal p-3.5 text-slate-100 outline-none focus:border-amber-500 placeholder-slate-500 resize-none leading-relaxed"
          />
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border border-amber-500"
          >
            <Flame className="w-4 h-4 text-white" />
            <span>LOG DAILY DISCIPLINE</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{showHistory ? 'Hide Grind History' : `View Grind History (${logs.length})`}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </form>

      {/* History Log Modal / Accordion */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-slate-800 space-y-3"
          >
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
              <span>Grind History Logs</span>
              <span className="text-xs text-slate-400 font-medium">{logs.length} Entries</span>
            </h3>

            {logs.length === 0 ? (
              <p className="text-xs text-slate-400 italic font-medium py-3">No logs recorded yet. Start grinding today!</p>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-400">{log.date}</span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold text-[10px]">
                          +{log.xpEarned} XP
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {log.studyHours}h study • {log.pushupsCount} reps • {log.focusIntensity}/10 intensity
                        </span>
                      </div>
                      <p className="font-bold text-white text-xs">🎯 Goal: {log.boatGoal}</p>
                      <p className="text-slate-300 text-[11px] font-normal leading-relaxed italic">"{log.notes}"</p>
                    </div>

                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      title="Delete entry"
                      className="text-slate-500 hover:text-red-400 transition-colors p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
