import React, { useState, useEffect, useRef } from 'react';
import { Student } from '../types';
import { calculateStudentPrediction } from '../services/predictionEngine';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  LineChart,
  Line,
} from 'recharts';
import {
  Sparkles,
  Send,
  CalendarDays,
  Star,
  Clock,
  Target,
  TrendingUp,
  ArrowUpRight,
  BookOpen,
  FlaskConical,
  FileText,
  Flame,
  Trophy,
  Zap,
  Award,
  CheckCircle2,
  Quote,
  Lightbulb,
  ArrowRight,
  UserCheck,
  RefreshCw,
  Gift,
  Brain,
  Printer,
  ChevronDown,
} from 'lucide-react';
import { LiquidPortalCanvas } from './LiquidPortalCanvas';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Badges } from './Badges';
import { DailyGrindTracker } from './DailyGrindTracker';
import { GogginsQuotesWidget } from './GogginsQuotesWidget';
import { WeeklyStudyHeatmap } from './WeeklyStudyHeatmap';
import { PrintButton } from './PrintButton';
import { DownloadPDFReportButton } from './DownloadPDFReportButton';

interface StudentDashboardProps {
  student: Student;
  onNavigateTab: (tab: string) => void;
}

const MOTIVATIONAL_QUOTES = [
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
];

const GOGGINS_QUOTES = [
  { text: "WHO'S GONNA CARRY THE BOATS AND THE LOGS?!", author: "David Goggins" },
  { text: "Don't stop when you're tired, stop when you're DONE!", author: "David Goggins" },
  { text: "You are in danger of living a life so comfortable and soft that you will die without realizing your true potential.", author: "David Goggins" },
  { text: "Look in the Accountability Mirror every morning and ask what excuse you're killing today!", author: "David Goggins" },
  { text: "STAY HARD! NO DAYS OFF!", author: "David Goggins" },
];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning,';
  if (h < 18) return 'Good Afternoon,';
  return 'Good Evening,';
};

const genSparkline = (base: number, seed: number = 1) =>
  Array.from({ length: 8 }, (_, i) => ({
    v: Math.min(100, Math.max(0, base - 8 + i * 1.2 + ((seed * (i + 1)) % 5) - 2)),
  }));

const computeFocusScore = (student: Student) => {
  const motScore = student.motivation === 'High' ? 90 : student.motivation === 'Medium' ? 70 : 50;
  const sleepScore = Math.max(0, 100 - Math.abs(student.sleepHours - 8) * 8);
  const studyScore = Math.min(100, student.studyHours * 4.5);
  return Math.round((motScore + sleepScore + studyScore) / 3);
};

const buildPerformanceData = (student: Student) => {
  const math = student.examScores['Math'] ?? student.examScores['Maths'] ?? 70;
  const sci = student.examScores['Science'] ?? student.examScores['Physics'] ?? 70;
  const eng = student.examScores['English'] ?? 68;
  return (student.attendanceHistory || []).map((rec, i) => ({
    month: rec.month,
    Maths: Math.min(100, Math.round(math * 0.85 + i * 2.5)),
    Science: Math.min(100, Math.round(sci * 0.82 + i * 2)),
    English: Math.min(100, Math.round(eng * 0.78 + i * 2.8)),
  }));
};

const Sparkline: React.FC<{ data: { v: number }[]; color: string }> = ({ data, color }) => (
  <LineChart width={80} height={30} data={data} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
    <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.8} dot={false} />
  </LineChart>
);

const ChartTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3.5 py-2.5 text-xs font-semibold !bg-white/95 shadow-md">
      <p className="text-[#9B9BB8] mb-1 font-bold">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
          {p.name}: <span className="font-black text-[#1A1A2E] ml-0.5">{Math.round(p.value)}%</span>
        </p>
      ))}
    </div>
  );
};

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, onNavigateTab }) => {
  const { activeStudent, allStudents, awardStudentPoints, switchRole } = useAuth();
  const { isGogginsMode } = useTheme();
  const [activeSection, setActiveSection] = useState<'overview' | 'heatmap' | 'grind'>('overview');
  const [aiQuery, setAiQuery] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [xpBonus, setXpBonus] = useState(0);
  const [claimedQuests, setClaimedQuests] = useState<Record<string, boolean>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isMethodologyExpanded, setIsMethodologyExpanded] = useState(false);

  const pred = calculateStudentPrediction(student);

  const examScoresList = (student.examScores ? Object.values(student.examScores) : []) as number[];
  const avgScore = student.subjects?.length
    ? Math.round(student.subjects.reduce((s, x) => s + x.score, 0) / student.subjects.length)
    : examScoresList.length > 0
    ? Math.round(examScoresList.reduce((s, v) => s + v, 0) / examScoresList.length)
    : 72;

  const focusScore = computeFocusScore(student);
  const perfData = buildPerformanceData(student);
  const displayName = (activeStudent?.name || student.name).split(' ')[0];

  const currentStudent = activeStudent || student;
  const totalXp = (currentStudent.xp || 0) + xpBonus;

  const triggerCelebration = (msg: string, bonus: number) => {
    setXpBonus((prev) => prev + bonus);
    awardStudentPoints(currentStudent.studentId, bonus, msg);
    setToastMsg(msg);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleClaimQuest = (questId: string, questName: string, bonusXp: number) => {
    if (claimedQuests[questId]) return;
    setClaimedQuests((prev) => ({ ...prev, [questId]: true }));
    triggerCelebration(`🎉 Completed "${questName}"! Earned +${bonusXp} XP!`, bonusXp);
  };

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
  };

  const radarData = [
    { subject: 'Maths', value: student.examScores['Math'] ?? student.examScores['Maths'] ?? 72 },
    { subject: 'Science', value: student.examScores['Science'] ?? student.examScores['Physics'] ?? 68 },
    { subject: 'English', value: student.examScores['English'] ?? 65 },
    { subject: 'Computer', value: student.examScores['Computer'] ?? student.examScores['ICT'] ?? 75 },
    { subject: 'Social', value: student.examScores['Social'] ?? student.examScores['History'] ?? 70 },
  ];

  const quests = [
    { id: 'q1', title: 'Complete 1 Practice Quiz', xp: 100, icon: <FileText className="w-4 h-4 text-indigo-500" /> },
    { id: 'q2', title: 'Ask AI Copilot a Study Question', xp: 50, icon: <Sparkles className="w-4 h-4 text-purple-500" /> },
    { id: 'q3', title: 'Simulate Score Improvement', xp: 75, icon: <TrendingUp className="w-4 h-4 text-emerald-500" /> },
    { id: 'q4', title: 'Maintain 7.5+ hrs Sleep Tonight', xp: 80, icon: <Clock className="w-4 h-4 text-cyan-500" /> },
  ];

  const studentBadges = student.badges.length > 0 ? student.badges : [
    { id: 'b1', title: 'Math Scholar 🧙‍♂️', description: 'Scored 75%+ in Mathematics', icon: '🎓' },
    { id: 'b2', title: 'Consistency Champ 🏆', description: 'Maintained 85%+ attendance rate', icon: '⚡' },
    { id: 'b3', title: 'Night Owl 🦉', description: 'Optimal 8h sleep & study routine', icon: '🌙' },
  ];

  return (
    <div id="student-dashboard-view" className="space-y-6 pb-8 relative">
      {/* Toast notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 right-6 z-50 bg-indigo-600 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-indigo-400"
          >
            <Sparkles className="w-4 h-4" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Hero Section: Greeting Card (Left) + AI Copilot Card (Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Hero Card (Good Morning, Varshan / STAY HARD Goggins) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className={`lg:col-span-7 clay-card p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden min-h-[260px] ${
            isGogginsMode ? '!bg-slate-900/90 !border-orange-500/40 shadow-orange-950/30' : ''
          }`}
        >
          <div className="z-10 max-w-lg relative">
            <span className={`text-lg sm:text-xl font-extrabold uppercase tracking-wider block mb-0.5 ${
              isGogginsMode ? 'text-amber-400' : 'text-[#6366F1]'
            }`}>
              {isGogginsMode ? 'STAY HARD,' : getGreeting()}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-[#1A1A2E] dark:text-white tracking-tight mb-2 flex items-center gap-2">
              <span>{displayName}</span>
              <span>{isGogginsMode ? '💪' : '👋'}</span>
            </h1>
            <p className={`text-sm font-semibold leading-relaxed mb-6 max-w-sm ${
              isGogginsMode ? 'text-slate-300' : 'text-[#9B9BB8]'
            }`}>
              {isGogginsMode
                ? "Outwork your yesterday self. Stay focused and disciplined today."
                : "Here's what's happening with your learning journey today."}
            </p>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                isGogginsMode
                  ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                  : 'bg-slate-100/80 border-slate-200/60 text-[#4A4A6A]'
              }`}>
                {isGogginsMode ? <Flame className="w-3.5 h-3.5 text-orange-500" /> : <CalendarDays className="w-3.5 h-3.5 text-[#6366F1]" />}
                {isGogginsMode ? 'NO DAYS OFF' : 'Mon, 02 June 2025'}
              </span>
              <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                isGogginsMode
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : 'bg-slate-100/80 border-slate-200/60 text-[#4A4A6A]'
              }`}>
                <CheckCircle2 className={`w-3.5 h-3.5 ${isGogginsMode ? 'text-red-400' : 'text-indigo-500'}`} />
                {isGogginsMode ? '12 SOULS TO TAKE' : '12 tasks today'}
              </span>
            </div>
          </div>

          {/* 3D Liquid Arch Canvas Graphic */}
          <div className="absolute right-0 bottom-0 top-0 w-64 pointer-events-none select-none z-0 hidden sm:block opacity-90">
            <LiquidPortalCanvas />
          </div>
        </motion.div>

        {/* Right Hero Card (AI Copilot) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.08 }}
          className={`lg:col-span-5 clay-card p-6 flex flex-col justify-between ${
            isGogginsMode ? '!bg-slate-900/90 !border-orange-500/40 shadow-orange-950/30' : ''
          }`}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isGogginsMode ? <Flame className="w-4 h-4 text-orange-500" /> : <Sparkles className="w-4 h-4 text-[#6366F1]" />}
              <h2 className="text-base font-extrabold text-[#1A1A2E] dark:text-white">
                {isGogginsMode ? 'GOGGINS AI COACH' : 'AI Copilot'}
              </h2>
            </div>
            <p className={`text-xs font-medium mb-4 ${isGogginsMode ? 'text-orange-300/80 font-bold' : 'text-[#9B9BB8]'}`}>
              {isGogginsMode ? 'No excuses. Ask your tough study questions.' : 'Ask me anything about your studies'}
            </p>

            {/* Input Box */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder={isGogginsMode ? "Who's gonna carry the boats?..." : "Type your question here..."}
                className={`w-full border rounded-full py-3 pl-4 pr-12 text-xs font-semibold focus:outline-none transition-all shadow-inner ${
                  isGogginsMode
                    ? 'bg-slate-800/90 border-orange-500/50 text-white placeholder-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/30'
                    : 'bg-slate-50/80 border-slate-200/80 text-[#1A1A2E] placeholder-[#9B9BB8] focus:border-[#6366F1] focus:ring-2 focus:ring-indigo-500/20'
                }`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onNavigateTab('copilot');
                  }
                }}
              />
              <button
                onClick={() => onNavigateTab('copilot')}
                className={`absolute right-1.5 top-1.5 w-8 h-8 rounded-full text-white flex items-center justify-center transition-all cursor-pointer shadow-md ${
                  isGogginsMode
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 shadow-orange-900/50'
                    : 'bg-[#6366F1] hover:bg-indigo-700 shadow-indigo-500/30'
                }`}
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* 2x2 Quick Suggestion Pills */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigateTab('copilot')}
                className="p-2.5 rounded-2xl bg-slate-50/80 hover:bg-indigo-50/80 border border-slate-200/60 hover:border-indigo-200 text-left transition-all cursor-pointer group flex items-center gap-2"
              >
                <span className="text-xs">🌱</span>
                <span className="text-[11px] font-bold text-[#4A4A6A] group-hover:text-[#1A1A2E] truncate">
                  Explain Photosynthesis
                </span>
              </button>

              <button
                onClick={() => onNavigateTab('planner')}
                className="p-2.5 rounded-2xl bg-slate-50/80 hover:bg-indigo-50/80 border border-slate-200/60 hover:border-indigo-200 text-left transition-all cursor-pointer group flex items-center gap-2"
              >
                <span className="text-xs">📅</span>
                <span className="text-[11px] font-bold text-[#4A4A6A] group-hover:text-[#1A1A2E] truncate">
                  Study Plan for Exams
                </span>
              </button>

              <button
                onClick={() => onNavigateTab('copilot')}
                className="p-2.5 rounded-2xl bg-slate-50/80 hover:bg-indigo-50/80 border border-slate-200/60 hover:border-indigo-200 text-left transition-all cursor-pointer group flex items-center gap-2"
              >
                <span className="text-xs">⚛️</span>
                <span className="text-[11px] font-bold text-[#4A4A6A] group-hover:text-[#1A1A2E] truncate">
                  Quiz me on Physics
                </span>
              </button>

              <button
                onClick={() => onNavigateTab('notes')}
                className="p-2.5 rounded-2xl bg-slate-50/80 hover:bg-indigo-50/80 border border-slate-200/60 hover:border-indigo-200 text-left transition-all cursor-pointer group flex items-center gap-2"
              >
                <span className="text-xs">📄</span>
                <span className="text-[11px] font-bold text-[#4A4A6A] group-hover:text-[#1A1A2E] truncate">
                  Summarize chapter
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── AI Academic Projection & Explainability Card (Parity with Teacher View) ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.12 }}
        className={`clay-card p-6 sm:p-7 relative overflow-hidden ${
          isGogginsMode ? '!bg-slate-900/90 !border-orange-500/40 shadow-orange-950/30' : ''
        }`}
      >
        {/* Header & Confidence Score Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              isGogginsMode ? 'bg-orange-500/20 text-orange-400' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
            }`}>
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isGogginsMode
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                    : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                }`}>
                  Kaggle Benchmarked Prediction
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  student.atRisk
                    ? 'bg-red-50 text-red-500 border-red-100'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                }`}>
                  {student.atRisk ? 'Intervention Advisory' : 'On Track'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#1A1A2E] dark:text-white tracking-tight">
                Predicted: {pred.predictedExamScore}% ({pred.confidenceScore}% confidence)
              </h2>
              <p className="text-xs text-[#9B9BB8] font-semibold mt-0.5">
                Pass Probability: {pred.passProbability}% • Current Subject Average: {avgScore}%
              </p>
            </div>
          </div>

          {/* Action Buttons: View Report & Download PDF / Print */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab('reports')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-[#4A4A6A] dark:text-slate-200 shadow-sm cursor-pointer transition-all focus-ring"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Full Report</span>
            </button>
            <DownloadPDFReportButton
              label="Download PDF Report"
              variant="primary"
              size="md"
              targetElementId="student-dashboard-view"
              filename={`EduSense-Student-${student.name.replace(/\s+/g, '_')}-Report-${new Date().toISOString().slice(0, 10)}`}
              reportTitle={`Student Academic Performance Dossier — ${student.name}`}
              reportSubtitle={`ID: ${student.studentId} • Class: ${student.class} • Roll #: ${student.rollNumber} • Predicted: ${pred.predictedExamScore}% (${pred.confidenceScore}% conf)`}
              title="Download standalone printable PDF of student dashboard view"
            />
            <PrintButton label="Print" variant="outline" size="md" />
          </div>
        </div>

        {/* Explainability: Top Factors Behind Your Prediction */}
        <div className="my-5">
          <div className="mb-3">
            <h3 className="text-xs font-black text-[#1A1A2E] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-500" />
              Top Factors Behind Your Prediction
            </h3>
            <p className="text-[11px] text-[#9B9BB8] font-medium">
              Transparent breakdown of the factors impacting your projected grade
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Key Strengths (Positive Framing) */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
                  Key Strengths Boosting Your Score
                </h4>
              </div>
              <div className="space-y-1.5">
                {pred.influencingFactors.filter((f) => f.impact === 'positive').length > 0 ? (
                  pred.influencingFactors
                    .filter((f) => f.impact === 'positive')
                    .map((fac, i) => (
                      <div key={i} className="flex items-start gap-2 bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-xs">
                        <span className="text-emerald-600 font-extrabold text-[11px] shrink-0 mt-0.5">✦</span>
                        <div>
                          <span className="font-extrabold text-[#1A1A2E] dark:text-white">{fac.factor} ({fac.value}): </span>
                          <span className="text-[#4A4A6A] dark:text-slate-300 font-medium">{fac.description}</span>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-xs text-[#9B9BB8] font-medium">
                    Maintain consistent daily attendance and log study hours to activate positive score multipliers!
                  </p>
                )}
              </div>
            </div>

            {/* Growth Opportunities (Constructive Positive Framing) */}
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                <h4 className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                  High-Impact Growth Opportunities
                </h4>
              </div>
              <div className="space-y-1.5">
                {pred.influencingFactors.filter((f) => f.impact === 'negative' || f.impact === 'neutral').length > 0 ? (
                  pred.influencingFactors
                    .filter((f) => f.impact === 'negative' || f.impact === 'neutral')
                    .map((fac, i) => (
                      <div key={i} className="flex items-start gap-2 bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/30 text-xs">
                        <span className="text-amber-500 font-extrabold text-[11px] shrink-0 mt-0.5">↑</span>
                        <div>
                          <span className="font-extrabold text-[#1A1A2E] dark:text-white">{fac.factor} ({fac.value}): </span>
                          <span className="text-[#4A4A6A] dark:text-slate-300 font-medium">{fac.description}</span>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-amber-100 text-xs text-emerald-700 dark:text-emerald-300 font-bold">
                    All indicators are currently optimal! Maintain this rhythm to secure top exam honors.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Methodology: "How was my prediction calculated?" */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setIsMethodologyExpanded(!isMethodologyExpanded)}
            className="w-full flex items-center justify-between py-2 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition-colors cursor-pointer select-none"
          >
            <span className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-500" />
              How was my prediction calculated?
            </span>
            <ChevronDown className={`w-4 h-4 text-indigo-500 transition-transform duration-200 ${isMethodologyExpanded ? 'rotate-180' : ''}`} />
          </button>

          {isMethodologyExpanded && (
            <div className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 text-xs space-y-3 animate-in fade-in duration-200">
              <p className="font-medium text-[#4A4A6A] dark:text-slate-300 leading-relaxed">
                Your predicted final score of <strong>{pred.predictedExamScore}%</strong> with <strong>{pred.confidenceScore}% confidence</strong> is calculated using a rule-based weighted heuristic scoring engine calibrated against the Kaggle Student Performance Factors regression baseline. No generative black-box hallucination is involved.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-[11px]">
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-[#1A1A2E] dark:text-white block text-[10px] uppercase font-sans text-[#9B9BB8]">Base Subject Average</span>
                  <span className="text-indigo-600 font-black text-sm">{avgScore}%</span>
                  <span className="text-[10px] text-[#9B9BB8] block font-sans">Current exam marks mean</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-[#1A1A2E] dark:text-white block text-[10px] uppercase font-sans text-[#9B9BB8]">Factor Adjustments</span>
                  <span className={`font-black text-sm ${pred.predictedExamScore >= avgScore ? 'text-emerald-600' : 'text-red-500'}`}>
                    {pred.predictedExamScore >= avgScore ? `+${pred.predictedExamScore - avgScore}` : `${pred.predictedExamScore - avgScore}`} pts
                  </span>
                  <span className="text-[10px] text-[#9B9BB8] block font-sans">Attendance, study & sleep</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-[#1A1A2E] dark:text-white block text-[10px] uppercase font-sans text-[#9B9BB8]">Confidence Score</span>
                  <span className="text-purple-600 font-black text-sm">{pred.confidenceScore}%</span>
                  <span className="text-[10px] text-[#9B9BB8] block font-sans">Grade consistency index</span>
                </div>
              </div>

              <p className="text-[11px] text-[#9B9BB8] font-bold">
                Formula: <code className="text-indigo-600 dark:text-indigo-400">Predicted Score = clamp(Current Average + Attendance Impact + Study Hours Impact + Sleep Impact + Motivation Impact, 35, 99)%</code>. Confidence is derived deterministically from grade dispersion across your subjects.
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Savage Daily Grind Tracker & Quotes Engine (Active only when Goggins Mode is enabled) ── */}
      {isGogginsMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <GogginsQuotesWidget />
          <DailyGrindTracker
            student={student}
            onLogComplete={(earnedXp) => triggerCelebration(`🪵 Savage Daily Grind Logged! +${earnedXp} XP`, earnedXp)}
          />
        </motion.div>
      )}

      {/* ── Gamification & Motivation Panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Level & XP Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.05 }}
          whileHover={{ y: -6, scale: 1.01, transition: { type: 'spring', stiffness: 350, damping: 18 } }}
          className="clay-card p-6 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#9B9BB8] flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> XP & Level Standing
            </span>
            <span className="text-xs font-black text-indigo-600 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100">
              Level {student.level} Scholar 🎓
            </span>
          </div>

          <div className="space-y-2 my-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-[#1A1A2E]">{totalXp}</span>
              <span className="text-xs font-extrabold text-[#9B9BB8]">/ {(student.level + 1) * 500} XP</span>
            </div>

            {/* XP Progress Bar */}
            <div className="w-full bg-slate-100 border border-slate-200/60 h-3 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalXp / ((student.level + 1) * 500)) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-[#9B9BB8] font-bold">
              Earn {Math.max(0, (student.level + 1) * 500 - totalXp)} more XP to reach Level {student.level + 1}!
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
              <Flame className="w-4 h-4 fill-amber-500" />
              <span>{student.streak} Days Study Streak</span>
            </div>
            <button
              onClick={() => triggerCelebration('🔥 Streak Bonus Claimed! +50 XP', 50)}
              className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1"
            >
              <Gift className="w-3.5 h-3.5" /> Claim Streak Bonus
            </button>
          </div>
        </motion.div>

        {/* Card 2: Motivational Quote & Daily Affirmation */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          whileHover={{ y: -6, scale: 1.01, transition: { type: 'spring', stiffness: 350, damping: 18 } }}
          className="clay-card p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#9B9BB8] flex items-center gap-1">
              <Quote className="w-3.5 h-3.5 text-indigo-500" /> Daily Motivation
            </span>
            <button
              onClick={handleNextQuote}
              title="Next Affirmation"
              className="p-1.5 rounded-xl bg-white border border-slate-200 text-[#9B9BB8] hover:text-indigo-600 transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="my-2">
            <p className="text-sm font-bold text-[#1A1A2E] italic leading-snug">
              "{MOTIVATIONAL_QUOTES[quoteIndex].text}"
            </p>
            <p className="text-[11px] text-[#9B9BB8] font-black mt-2 text-right">
              — {MOTIVATIONAL_QUOTES[quoteIndex].author}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold text-purple-600 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Mindset Boost
            </span>
            <button
              onClick={() => onNavigateTab('copilot')}
              className="text-[11px] font-black text-indigo-600 hover:underline flex items-center gap-0.5"
            >
              Ask AI Motivation <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>

        {/* Card 3: AI Focus Area Recommendation */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}
          whileHover={{ y: -6, scale: 1.01, transition: { type: 'spring', stiffness: 350, damping: 18 } }}
          className="clay-card p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#9B9BB8] flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-indigo-500" /> Personalized Focus Tip
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600">
                AI Analytics
              </span>
            </div>

            <p className="text-xs font-bold text-[#1A1A2E] leading-relaxed mb-3">
              {student.examScores.Math && student.examScores.Math < 75
                ? `Your Math score is currently ${student.examScores.Math}%. Dedicate 30 mins to daily algebra practice to boost your predicted exam score by +8%.`
                : student.attendance < 75
                ? `Your attendance is ${student.attendance}%. Attending 3 more classes this week will reduce your course risk factor by 15%!`
                : `You are performing strongly across all subjects! Use the What-If Simulator to explore scoring 90%+ in finals.`}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('planner')}
              className="w-full py-2 px-3 rounded-xl btn-primary text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Generate 7-Day Study Plan
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── Daily Quests & Missions Panel ── */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h3 className="font-black text-sm text-[#1A1A2E] uppercase tracking-wider">
                Daily Study Missions & Quests
              </h3>
            </div>
            <p className="text-xs text-[#9B9BB8] font-bold">
              Complete daily learning tasks to earn bonus XP and climb the class leaderboard
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('gamification')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer shrink-0"
          >
            View Leaderboard <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quests.map((q) => {
            const isDone = !!claimedQuests[q.id];
            return (
              <div
                key={q.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  isDone
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-slate-50/80 border-slate-200/60 hover:bg-white hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2 rounded-xl bg-white border border-slate-200/60 shrink-0 shadow-sm">
                    {q.icon}
                  </div>
                  <span className="text-xs font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                    +{q.xp} XP
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-xs text-[#1A1A2E] leading-snug">{q.title}</h4>
                </div>

                <button
                  onClick={() => handleClaimQuest(q.id, q.title, q.xp)}
                  disabled={isDone}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    isDone
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'btn-primary'
                  }`}
                >
                  {isDone ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Claimed
                    </>
                  ) : (
                    'Claim XP'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Stat Cards Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.05 }}
          whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
          className="stat-card p-5 flex flex-col gap-3"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#9B9BB8]">Attendance</p>
              <p className="text-2xl font-black text-[#1A1A2E]">{student.attendance}%</p>
              <p className="text-[10px] text-[#9B9BB8] font-bold mt-1">
                {student.attendance >= 75 ? 'On Track' : 'Requires Improvement'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold ${student.attendance >= 75 ? 'text-emerald-500' : 'text-red-500'}`}>
              ↑ {Math.max(2, Math.round(student.attendance - 70))}%
            </span>
            <Sparkline data={genSparkline(student.attendance, 1)} color={isGogginsMode ? '#F97316' : '#6366F1'} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.1 }}
          whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
          className="stat-card p-5 flex flex-col gap-3"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-violet-50 flex items-center justify-center text-violet-500 shrink-0">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#9B9BB8]">Average Score</p>
              <p className="text-2xl font-black text-[#1A1A2E]">{avgScore}%</p>
              <p className="text-[10px] text-[#9B9BB8] font-bold mt-1">Across all subjects</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-500">↑ 4.3%</span>
            <Sparkline data={genSparkline(avgScore, 2)} color={isGogginsMode ? '#EF4444' : '#8B5CF6'} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.15 }}
          whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
          className="stat-card p-5 flex flex-col gap-3"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-cyan-50 flex items-center justify-center text-cyan-500 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#9B9BB8]">Weekly Study</p>
              <p className="text-2xl font-black text-[#1A1A2E]">{student.studyHours}h</p>
              <p className="text-[10px] text-[#9B9BB8] font-bold mt-1">Target: 15h / week</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-500">↑ 12%</span>
            <Sparkline data={genSparkline(student.studyHours * 5, 3)} color={isGogginsMode ? '#F59E0B' : '#22D3EE'} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.2 }}
          whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
          className="stat-card p-5 flex flex-col gap-3"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#9B9BB8]">Focus Score</p>
              <p className="text-2xl font-black text-[#1A1A2E]">{focusScore}</p>
              <p className="text-[10px] text-[#9B9BB8] font-bold mt-1">Sleep & Study balance</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-500">↑ 8%</span>
            <Sparkline data={genSparkline(focusScore, 4)} color="#F97316" />
          </div>
        </motion.div>
      </div>

      {/* ── Row: Performance Chart + Radar Chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ type: 'spring', stiffness: 240, damping: 20, delay: 0.1 }}
          whileHover={{ y: -4, transition: { type: 'spring', stiffness: 350, damping: 18 } }}
          className="clay-card p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#6366F1]" />
              <h3 className="font-black text-[#1A1A2E] dark:text-white text-base">Score Progress Trajectory</h3>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-[#6366F1]">
                <span className="w-2 h-2 rounded-full bg-[#6366F1]" /> Maths
              </span>
              <span className="flex items-center gap-1 text-[#8B5CF6]">
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" /> Science
              </span>
              <span className="flex items-center gap-1 text-[#EC4899]">
                <span className="w-2 h-2 rounded-full bg-[#EC4899]" /> English
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={perfData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gradMaths" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradScience" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradEnglish" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.07)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9B9BB8', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9B9BB8', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="Maths" stroke="#6366F1" strokeWidth={2} fill="url(#gradMaths)" dot={false} />
              <Area type="monotone" dataKey="Science" stroke="#8B5CF6" strokeWidth={2} fill="url(#gradScience)" dot={false} />
              <Area type="monotone" dataKey="English" stroke="#EC4899" strokeWidth={2} fill="url(#gradEnglish)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ type: 'spring', stiffness: 240, damping: 20, delay: 0.18 }}
          whileHover={{ y: -4, transition: { type: 'spring', stiffness: 350, damping: 18 } }}
          className="clay-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#6366F1]" />
              <h3 className="font-black text-[#1A1A2E] dark:text-white text-base">Subject Mastery Radar</h3>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#6366F1]">
              <span className="w-2 h-2 rounded-full bg-[#6366F1]" />
              <span>Score (0–100%)</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="rgba(99,102,241,0.12)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#9B9BB8', fontWeight: 600 }} />
              <Radar name="Score" dataKey="value" stroke="#6366F1" strokeWidth={2} fill="#6366F1" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── Virtual Badges & Achievements Component ── */}
      <Badges
        student={student}
        onClaimXp={(bonus) => triggerCelebration(`🎉 Badge Bonus Claimed! +${bonus} XP`, bonus)}
      />
    </div>
  );
};
