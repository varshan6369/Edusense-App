import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { calculateStudentPrediction } from '../services/predictionEngine';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Brain,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Moon,
  Sparkles,
  Zap,
  BookOpen,
  ArrowRight,
  ChevronDown,
  Layers,
  BarChart3,
  Activity,
  Award,
  Calculator,
  UserCheck,
  Scale,
  ShieldAlert,
  FileText,
  Printer,
  Download,
} from 'lucide-react';
import { ParentTeacherMeetingModal } from './ParentTeacherMeetingModal';
import { generateComparativeMeetingPDF } from '../services/comparativePdfExport';

interface StudentComparativeViewProps {
  students: Student[];
  initialStudentAId?: string;
  initialStudentBId?: string;
  onSelectStudent: (studentId: string) => void;
  onNavigateTab: (tab: string) => void;
  onClose?: () => void;
}

export const StudentComparativeView: React.FC<StudentComparativeViewProps> = ({
  students,
  initialStudentAId,
  initialStudentBId,
  onSelectStudent,
  onNavigateTab,
  onClose,
}) => {
  // Safe defaults if students are available
  const defaultAId = initialStudentAId || (students[0] ? students[0].studentId : '');
  const defaultBId =
    initialStudentBId && initialStudentBId !== defaultAId
      ? initialStudentBId
      : students[1]
      ? students[1].studentId
      : students[0]?.studentId || '';

  const [studentAId, setStudentAId] = useState<string>(defaultAId);
  const [studentBId, setStudentBId] = useState<string>(defaultBId);
  const [chartType, setChartType] = useState<'bar' | 'area' | 'line'>('bar');
  const [activeMetricTab, setActiveMetricTab] = useState<'subjects' | 'radar' | 'timeline'>('subjects');
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isQuickDownloading, setIsQuickDownloading] = useState(false);

  const studentA = useMemo(
    () => students.find((s) => s.studentId === studentAId) || students[0],
    [students, studentAId]
  );
  const studentB = useMemo(
    () => students.find((s) => s.studentId === studentBId) || students[1] || students[0],
    [students, studentBId]
  );

  const predA = useMemo(() => (studentA ? calculateStudentPrediction(studentA) : null), [studentA]);
  const predB = useMemo(() => (studentB ? calculateStudentPrediction(studentB) : null), [studentB]);

  const handleSwap = () => {
    setStudentAId(studentBId);
    setStudentBId(studentAId);
  };

  // Quick preset pairings
  const applyPreset = (idA: string, idB: string) => {
    setStudentAId(idA);
    setStudentBId(idB);
  };

  const topStudent = useMemo(() => {
    return [...students].sort((a, b) => {
      const scoresA = Object.values(a.examScores) as number[];
      const scoresB = Object.values(b.examScores) as number[];
      const avgA = scoresA.reduce((x, y) => x + y, 0) / (scoresA.length || 1);
      const avgB = scoresB.reduce((x, y) => x + y, 0) / (scoresB.length || 1);
      return avgB - avgA;
    })[0];
  }, [students]);

  const atRiskStudent = useMemo(() => {
    return students.find((s) => s.atRisk) || students[0];
  }, [students]);

  const avgStudent = useMemo(() => {
    return students.find((s) => !s.atRisk && s.studentId !== topStudent?.studentId) || students[2] || students[0];
  }, [students, topStudent]);

  // Unified Subject Performance Chart Data
  const subjectChartData = useMemo(() => {
    if (!studentA || !studentB) return [];

    // Collect all unique subjects across both students
    const allSubjectNames = Array.from(
      new Set([
        ...Object.keys(studentA.examScores || {}),
        ...Object.keys(studentB.examScores || {}),
        ...(studentA.subjects || []).map((s) => s.subject),
        ...(studentB.subjects || []).map((s) => s.subject),
      ])
    );

    return allSubjectNames.map((subject) => {
      const scoreA =
        studentA.examScores[subject] ??
        studentA.subjects.find((s) => s.subject.toLowerCase() === subject.toLowerCase())?.score ??
        0;

      const scoreB =
        studentB.examScores[subject] ??
        studentB.subjects.find((s) => s.subject.toLowerCase() === subject.toLowerCase())?.score ??
        0;

      // Calculate class average for this subject across all students
      const subjectAvg = Math.round(
        students.reduce((acc, curr) => {
          const val =
            curr.examScores[subject] ??
            curr.subjects.find((s) => s.subject.toLowerCase() === subject.toLowerCase())?.score ??
            70;
          return acc + val;
        }, 0) / (students.length || 1)
      );

      const delta = scoreA - scoreB;

      return {
        subject,
        [studentA.name]: scoreA,
        [studentB.name]: scoreB,
        scoreA,
        scoreB,
        classAvg: subjectAvg,
        delta,
        leading: delta > 0 ? studentA.name : delta < 0 ? studentB.name : 'Tie',
      };
    });
  }, [studentA, studentB, students]);

  // Multidimensional Competency Radar Data
  const radarChartData = useMemo(() => {
    if (!studentA || !studentB) return [];

    const getMotivationScore = (lvl: string) => {
      if (lvl === 'High') return 95;
      if (lvl === 'Medium') return 65;
      return 35;
    };

    const avgScoreA = Math.round(
      (Object.values(studentA.examScores) as number[]).reduce((a, b) => a + b, 0) /
        (Object.keys(studentA.examScores).length || 1)
    );
    const avgScoreB = Math.round(
      (Object.values(studentB.examScores) as number[]).reduce((a, b) => a + b, 0) /
        (Object.keys(studentB.examScores).length || 1)
    );

    const studyEffortA = Math.min(100, Math.round((studentA.studyHours / 25) * 100));
    const studyEffortB = Math.min(100, Math.round((studentB.studyHours / 25) * 100));

    const sleepScoreA = Math.min(100, Math.round((studentA.sleepHours / 8) * 100));
    const sleepScoreB = Math.min(100, Math.round((studentB.sleepHours / 8) * 100));

    const mathScoreA = studentA.examScores.Math || 60;
    const mathScoreB = studentB.examScores.Math || 60;

    const streakScoreA = Math.min(100, studentA.streak * 10);
    const streakScoreB = Math.min(100, studentB.streak * 10);

    return [
      { attribute: 'Academic Avg', [studentA.name]: avgScoreA, [studentB.name]: avgScoreB, fullMark: 100 },
      { attribute: 'Attendance', [studentA.name]: studentA.attendance, [studentB.name]: studentB.attendance, fullMark: 100 },
      { attribute: 'Study Hours', [studentA.name]: studyEffortA, [studentB.name]: studyEffortB, fullMark: 100 },
      { attribute: 'Sleep Quality', [studentA.name]: sleepScoreA, [studentB.name]: sleepScoreB, fullMark: 100 },
      { attribute: 'Motivation', [studentA.name]: getMotivationScore(studentA.motivation), [studentB.name]: getMotivationScore(studentB.motivation), fullMark: 100 },
      { attribute: 'Math Core', [studentA.name]: mathScoreA, [studentB.name]: mathScoreB, fullMark: 100 },
      { attribute: 'Daily Streak', [studentA.name]: streakScoreA, [studentB.name]: streakScoreB, fullMark: 100 },
    ];
  }, [studentA, studentB]);

  // Attendance History Trajectory Data
  const timelineChartData = useMemo(() => {
    if (!studentA || !studentB) return [];

    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
    return months.map((month) => {
      const recA = studentA.attendanceHistory?.find((h) => h.month === month);
      const recB = studentB.attendanceHistory?.find((h) => h.month === month);

      return {
        month,
        [studentA.name]: recA ? recA.attendanceRate : studentA.attendance,
        [studentB.name]: recB ? recB.attendanceRate : studentB.attendance,
        benchmark: 75,
      };
    });
  }, [studentA, studentB]);

  // Overall metrics calculation
  const overallAvgA = useMemo(() => {
    if (!studentA) return 0;
    const scores = Object.values(studentA.examScores) as number[];
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [studentA]);

  const overallAvgB = useMemo(() => {
    if (!studentB) return 0;
    const scores = Object.values(studentB.examScores) as number[];
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [studentB]);

  // Motion variants for fluid transitions
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.04,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
      },
    },
  };

  const chartTransitionVariants = {
    hidden: { opacity: 0, y: 14, scale: 0.985 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.38,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.985,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
  };

  if (!studentA || !studentB) {
    return (
      <div className="p-8 text-center glass-card">
        <p className="text-sm font-semibold text-[#9B9BB8]">Insufficient student records to generate comparison.</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-6"
    >
      {/* ── Top Header & Mode Bar ── */}
      <motion.div variants={itemVariants} className="glass-card p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                Teacher Comparative Analytics
              </span>
              <span className="text-[10px] text-[#9B9BB8] font-bold uppercase tracking-wider">
                Multi-Student Overlay
              </span>
            </div>
            <h2 className="text-2xl font-black text-[#1A1A2E] tracking-tight">
              Student Head-to-Head Performance Comparison
            </h2>
            <p className="text-xs text-[#4A4A6A] font-medium max-w-xl mt-0.5">
              Overlay academic marks, Kaggle predictive factors, attendance trajectories, and risk levels between two student profiles.
            </p>
          </div>

          {/* Export PDF & Preset Quick Chips & Close Button */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsMeetingModalOpen(true)}
              className="text-xs font-black px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-md shadow-indigo-500/25 transition-all cursor-pointer flex items-center gap-2"
              title="Export Parent-Teacher Conference PDF Report"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export Parent-Teacher PDF</span>
            </button>

            <button
              onClick={() => {
                setIsQuickDownloading(true);
                try {
                  generateComparativeMeetingPDF(studentA, studentB, students);
                } finally {
                  setIsQuickDownloading(false);
                }
              }}
              disabled={isQuickDownloading}
              className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Instant Download A4 PDF"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Quick PDF</span>
            </button>

            {topStudent && atRiskStudent && (
              <button
                onClick={() => applyPreset(topStudent.studentId, atRiskStudent.studentId)}
                className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-[#4A4A6A] transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-200/60"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                Top vs At-Risk
              </button>
            )}
            {topStudent && avgStudent && topStudent.studentId !== avgStudent.studentId && (
              <button
                onClick={() => applyPreset(topStudent.studentId, avgStudent.studentId)}
                className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-[#4A4A6A] transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-200/60"
              >
                <Award className="w-3 h-3 text-indigo-500" />
                Top vs Average
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="text-xs font-bold px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-[#4A4A6A] transition-all cursor-pointer"
              >
                Back to Overview
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Dual Student Selector Banner ── */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center"
      >
        {/* Student A Selector Box */}
        <motion.div
          key={`student-a-card-${studentAId}`}
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="md:col-span-5 glass-card p-5 border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-50/40 to-white relative"
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-100/70 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              Primary Student (A)
            </span>
            {studentA.atRisk ? (
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-50 text-red-500 border border-red-100 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> At Risk
              </span>
            ) : (
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> On Track
              </span>
            )}
          </div>

          <div className="flex items-center gap-3.5">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-12 h-12 rounded-2xl bg-indigo-500 p-[2px] shrink-0 shadow-md shadow-indigo-500/20"
            >
              <img
                src={studentA.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={studentA.name}
                className="w-full h-full rounded-2xl object-cover bg-white"
              />
            </motion.div>
            <div className="flex-1 min-w-0">
              <select
                value={studentAId}
                onChange={(e) => setStudentAId(e.target.value)}
                className="w-full font-black text-base text-[#1A1A2E] bg-white border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
              >
                {students.map((s) => (
                  <option key={s.studentId} value={s.studentId} disabled={s.studentId === studentBId}>
                    {s.name} ({s.studentId}) {s.atRisk ? '⚠️' : '✅'}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#4A4A6A] font-semibold">
                <span>{studentA.class}</span>
                <span>•</span>
                <span>Attendance: <strong className="text-indigo-600">{studentA.attendance}%</strong></span>
                <span>•</span>
                <span>Study: <strong>{studentA.studyHours}h/wk</strong></span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Swap / VS Button */}
        <div className="md:col-span-1 flex flex-col items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSwap}
            title="Swap Primary & Comparison Student"
            className="w-11 h-11 rounded-2xl bg-white border border-slate-200 shadow-md hover:border-indigo-400 transition-all flex items-center justify-center text-[#4A4A6A] hover:text-indigo-600 cursor-pointer group"
          >
            <ArrowLeftRight className="w-4 h-4 transition-transform" />
          </motion.button>
          <span className="text-[10px] font-black text-[#9B9BB8] uppercase tracking-widest mt-1">VS</span>
        </div>

        {/* Student B Selector Box */}
        <motion.div
          key={`student-b-card-${studentBId}`}
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="md:col-span-5 glass-card p-5 border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-50/40 to-white relative"
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Comparison Student (B)
            </span>
            {studentB.atRisk ? (
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-50 text-red-500 border border-red-100 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> At Risk
              </span>
            ) : (
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> On Track
              </span>
            )}
          </div>

          <div className="flex items-center gap-3.5">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-12 h-12 rounded-2xl bg-emerald-500 p-[2px] shrink-0 shadow-md shadow-emerald-500/20"
            >
              <img
                src={studentB.avatar || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'}
                alt={studentB.name}
                className="w-full h-full rounded-2xl object-cover bg-white"
              />
            </motion.div>
            <div className="flex-1 min-w-0">
              <select
                value={studentBId}
                onChange={(e) => setStudentBId(e.target.value)}
                className="w-full font-black text-base text-[#1A1A2E] bg-white border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-emerald-500 shadow-sm cursor-pointer"
              >
                {students.map((s) => (
                  <option key={s.studentId} value={s.studentId} disabled={s.studentId === studentAId}>
                    {s.name} ({s.studentId}) {s.atRisk ? '⚠️' : '✅'}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#4A4A6A] font-semibold">
                <span>{studentB.class}</span>
                <span>•</span>
                <span>Attendance: <strong className="text-emerald-700">{studentB.attendance}%</strong></span>
                <span>•</span>
                <span>Study: <strong>{studentB.studyHours}h/wk</strong></span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Key Metrics Comparison Strip (4 Head-to-Head Cards) with Entrance Motion ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`metrics-strip-${studentAId}-${studentBId}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {/* Metric 1: Overall Average */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.02, type: 'spring', stiffness: 280, damping: 24 }}
            className="glass-card p-4 space-y-2.5"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-[#9B9BB8] flex items-center justify-between">
              <span>Overall Score Avg</span>
              <Brain className="w-3.5 h-3.5 text-indigo-500" />
            </span>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-600">{studentA.name.split(' ')[0]}:</span>
                <p className="text-xl font-black text-[#1A1A2E] leading-none">{overallAvgA}%</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-600">{studentB.name.split(' ')[0]}:</span>
                <p className="text-xl font-black text-[#1A1A2E] leading-none">{overallAvgB}%</p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
              <span className="text-[#9B9BB8]">Differential</span>
              <span
                className={
                  overallAvgA >= overallAvgB
                    ? 'text-indigo-600 flex items-center gap-0.5'
                    : 'text-emerald-600 flex items-center gap-0.5'
                }
              >
                {overallAvgA >= overallAvgB ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(overallAvgA - overallAvgB)}% diff
              </span>
            </div>
          </motion.div>

          {/* Metric 2: Predicted Exam Score */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, type: 'spring', stiffness: 280, damping: 24 }}
            className="glass-card p-4 space-y-2.5"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-[#9B9BB8] flex items-center justify-between">
              <span>Predicted Score</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            </span>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-600">{studentA.name.split(' ')[0]}:</span>
                <p className="text-xl font-black text-indigo-600 leading-none">{predA?.predictedExamScore}%</p>
                <span className="text-[9px] text-[#9B9BB8] font-semibold">{predA?.passProbability}% pass</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-600">{studentB.name.split(' ')[0]}:</span>
                <p className="text-xl font-black text-emerald-600 leading-none">{predB?.predictedExamScore}%</p>
                <span className="text-[9px] text-[#9B9BB8] font-semibold">{predB?.passProbability}% pass</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
              <span className="text-[#9B9BB8]">Risk Index</span>
              <span className="text-xs font-black text-[#1A1A2E]">
                {predA?.riskPercentage}% vs {predB?.riskPercentage}%
              </span>
            </div>
          </motion.div>

          {/* Metric 3: Attendance Rate */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 24 }}
            className="glass-card p-4 space-y-2.5"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-[#9B9BB8] flex items-center justify-between">
              <span>Attendance Rate</span>
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
            </span>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-600">{studentA.name.split(' ')[0]}:</span>
                <p className={`text-xl font-black leading-none ${studentA.attendance >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {studentA.attendance}%
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-600">{studentB.name.split(' ')[0]}:</span>
                <p className={`text-xl font-black leading-none ${studentB.attendance >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {studentB.attendance}%
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
              <span className="text-[#9B9BB8]">Benchmark: 75%</span>
              <span className="text-xs font-black text-slate-700">
                Δ {Math.abs(studentA.attendance - studentB.attendance)}%
              </span>
            </div>
          </motion.div>

          {/* Metric 4: Weekly Study Hours */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, type: 'spring', stiffness: 280, damping: 24 }}
            className="glass-card p-4 space-y-2.5"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-[#9B9BB8] flex items-center justify-between">
              <span>Weekly Study Hours</span>
              <Clock className="w-3.5 h-3.5 text-amber-500" />
            </span>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-600">{studentA.name.split(' ')[0]}:</span>
                <p className="text-xl font-black text-[#1A1A2E] leading-none">{studentA.studyHours}h</p>
                <span className="text-[9px] text-[#9B9BB8] font-semibold">{studentA.sleepHours}h sleep</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-600">{studentB.name.split(' ')[0]}:</span>
                <p className="text-xl font-black text-[#1A1A2E] leading-none">{studentB.studyHours}h</p>
                <span className="text-[9px] text-[#9B9BB8] font-semibold">{studentB.sleepHours}h sleep</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
              <span className="text-[#9B9BB8]">Study Effort Delta</span>
              <span className="text-xs font-black text-amber-600">
                {Math.abs(studentA.studyHours - studentB.studyHours)} hrs/wk
              </span>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* ── Main Overlay Chart Section with Fluid Entrance Animation ── */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        {/* Chart View Switcher Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <h3 className="font-black text-sm text-[#1A1A2E] uppercase tracking-wider">
                Multi-Dimensional Overlay Analytics
              </h3>
            </div>
            <p className="text-xs text-[#9B9BB8] font-medium flex items-center gap-1.5">
              Comparing <strong className="text-indigo-600">{studentA.name}</strong> vs{' '}
              <strong className="text-emerald-600">{studentB.name}</strong>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 font-bold ml-1">
                Active Comparison
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Pills */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/50">
              <button
                onClick={() => setActiveMetricTab('subjects')}
                className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  activeMetricTab === 'subjects'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-[#9B9BB8] hover:text-[#1A1A2E]'
                }`}
              >
                Subject Marks
              </button>
              <button
                onClick={() => setActiveMetricTab('radar')}
                className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  activeMetricTab === 'radar'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-[#9B9BB8] hover:text-[#1A1A2E]'
                }`}
              >
                Factor Radar
              </button>
              <button
                onClick={() => setActiveMetricTab('timeline')}
                className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  activeMetricTab === 'timeline'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-[#9B9BB8] hover:text-[#1A1A2E]'
                }`}
              >
                Attendance History
              </button>
            </div>

            {/* Sub-chart toggle if in subjects view */}
            {activeMetricTab === 'subjects' && (
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/50">
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                    chartType === 'bar' ? 'bg-white text-[#1A1A2E] shadow-xs' : 'text-[#9B9BB8]'
                  }`}
                  title="Grouped Bar Chart"
                >
                  Bar
                </button>
                <button
                  onClick={() => setChartType('area')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                    chartType === 'area' ? 'bg-white text-[#1A1A2E] shadow-xs' : 'text-[#9B9BB8]'
                  }`}
                  title="Area Overlay Chart"
                >
                  Area
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                    chartType === 'line' ? 'bg-white text-[#1A1A2E] shadow-xs' : 'text-[#9B9BB8]'
                  }`}
                  title="Line Overlay Chart"
                >
                  Line
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Animated Chart Canvas Container ── */}
        <div className="pt-6 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeMetricTab === 'subjects' && (
              <motion.div
                key={`chart-subjects-${studentAId}-${studentBId}-${chartType}`}
                variants={chartTransitionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="h-[360px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <BarChart data={subjectChartData} margin={{ top: 20, right: 30, left: -10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis
                        dataKey="subject"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94A3B8', fontSize: 11 }}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-800 text-xs min-w-[210px] space-y-2">
                                <p className="font-black text-amber-300 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-800">
                                  {label} Performance
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-indigo-300 font-bold">
                                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                                    {studentA.name}:
                                  </span>
                                  <span className="font-black text-white">{data.scoreA}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-emerald-300 font-bold">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                    {studentB.name}:
                                  </span>
                                  <span className="font-black text-white">{data.scoreB}%</span>
                                </div>
                                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
                                  <span>Class Benchmark:</span>
                                  <span className="font-bold text-slate-300">{data.classAvg}%</span>
                                </div>
                                <div className="text-[10px] font-bold text-amber-400">
                                  Edge: {data.leading} {data.delta !== 0 ? `(${data.delta > 0 ? '+' : ''}${data.delta}%)` : '(Equal)'}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{ paddingBottom: 15, fontSize: 12, fontWeight: 700 }}
                      />
                      <ReferenceLine y={75} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: 'Class Target 75%', fill: '#D97706', fontSize: 10, position: 'insideTopRight' }} />
                      <Bar
                        dataKey={studentA.name}
                        fill="#6366F1"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={36}
                        isAnimationActive={true}
                        animationDuration={850}
                        animationEasing="ease-out"
                      />
                      <Bar
                        dataKey={studentB.name}
                        fill="#10B981"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={36}
                        isAnimationActive={true}
                        animationDuration={850}
                        animationEasing="ease-out"
                      />
                    </BarChart>
                  ) : chartType === 'area' ? (
                    <AreaChart data={subjectChartData} margin={{ top: 20, right: 30, left: -10, bottom: 20 }}>
                      <defs>
                        <linearGradient id="gradStudentA" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="gradStudentB" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis
                        dataKey="subject"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94A3B8', fontSize: 11 }}
                      />
                      <Tooltip />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{ paddingBottom: 15, fontSize: 12, fontWeight: 700 }}
                      />
                      <ReferenceLine y={75} stroke="#F59E0B" strokeDasharray="4 4" />
                      <Area
                        type="monotone"
                        dataKey={studentA.name}
                        stroke="#6366F1"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#gradStudentA)"
                        isAnimationActive={true}
                        animationDuration={850}
                        animationEasing="ease-out"
                      />
                      <Area
                        type="monotone"
                        dataKey={studentB.name}
                        stroke="#10B981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#gradStudentB)"
                        isAnimationActive={true}
                        animationDuration={850}
                        animationEasing="ease-out"
                      />
                    </AreaChart>
                  ) : (
                    <LineChart data={subjectChartData} margin={{ top: 20, right: 30, left: -10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis
                        dataKey="subject"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94A3B8', fontSize: 11 }}
                      />
                      <Tooltip />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{ paddingBottom: 15, fontSize: 12, fontWeight: 700 }}
                      />
                      <ReferenceLine y={75} stroke="#F59E0B" strokeDasharray="4 4" />
                      <Line
                        type="monotone"
                        dataKey={studentA.name}
                        stroke="#6366F1"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#6366F1', strokeWidth: 2, stroke: '#FFFFFF' }}
                        activeDot={{ r: 7 }}
                        isAnimationActive={true}
                        animationDuration={850}
                        animationEasing="ease-out"
                      />
                      <Line
                        type="monotone"
                        dataKey={studentB.name}
                        stroke="#10B981"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#10B981', strokeWidth: 2, stroke: '#FFFFFF' }}
                        activeDot={{ r: 7 }}
                        isAnimationActive={true}
                        animationDuration={850}
                        animationEasing="ease-out"
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </motion.div>
            )}

            {activeMetricTab === 'radar' && (
              <motion.div
                key={`chart-radar-${studentAId}-${studentBId}`}
                variants={chartTransitionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="h-[360px] w-full flex items-center justify-center"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarChartData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis
                      dataKey="attribute"
                      tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                    <Radar
                      name={studentA.name}
                      dataKey={studentA.name}
                      stroke="#6366F1"
                      fill="#6366F1"
                      fillOpacity={0.35}
                      isAnimationActive={true}
                      animationDuration={850}
                      animationEasing="ease-out"
                    />
                    <Radar
                      name={studentB.name}
                      dataKey={studentB.name}
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.35}
                      isAnimationActive={true}
                      animationDuration={850}
                      animationEasing="ease-out"
                    />
                    <Legend
                      verticalAlign="top"
                      align="center"
                      wrapperStyle={{ paddingBottom: 15, fontSize: 12, fontWeight: 700 }}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {activeMetricTab === 'timeline' && (
              <motion.div
                key={`chart-timeline-${studentAId}-${studentBId}`}
                variants={chartTransitionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="h-[360px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineChartData} margin={{ top: 20, right: 30, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }}
                    />
                    <YAxis
                      domain={[40, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94A3B8', fontSize: 11 }}
                    />
                    <Tooltip />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      wrapperStyle={{ paddingBottom: 15, fontSize: 12, fontWeight: 700 }}
                    />
                    <ReferenceLine
                      y={75}
                      stroke="#EF4444"
                      strokeDasharray="4 4"
                      label={{ value: '75% Mandatory Attendance Threshold', fill: '#EF4444', fontSize: 11, position: 'insideBottomRight' }}
                    />
                    <Line
                      type="monotone"
                      dataKey={studentA.name}
                      stroke="#6366F1"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#6366F1' }}
                      isAnimationActive={true}
                      animationDuration={850}
                      animationEasing="ease-out"
                    />
                    <Line
                      type="monotone"
                      dataKey={studentB.name}
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#10B981' }}
                      isAnimationActive={true}
                      animationDuration={850}
                      animationEasing="ease-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Detailed Subject Breakdown Table & Delta Matrix with Motion ── */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Subject Delta Table */}
        <motion.div
          key={`delta-table-${studentAId}-${studentBId}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="lg:col-span-2 glass-card overflow-hidden"
        >
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#1A1A2E]">
                Subject-by-Subject Score Comparison
              </h3>
              <p className="text-[11px] text-[#9B9BB8] font-medium mt-0.5">
                Direct academic differential and class benchmark tracking
              </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-slate-100 text-[#4A4A6A] rounded-lg">
              {subjectChartData.length} Subjects Evaluated
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-[#9B9BB8] font-black border-b border-slate-200/50 uppercase tracking-widest text-[10px]">
                <tr>
                  <th className="py-3 px-5">Subject</th>
                  <th className="py-3 px-4 text-indigo-600">{studentA.name.split(' ')[0]}</th>
                  <th className="py-3 px-4 text-emerald-600">{studentB.name.split(' ')[0]}</th>
                  <th className="py-3 px-4 text-slate-500">Benchmark</th>
                  <th className="py-3 px-4 text-right">Differential</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {subjectChartData.map((row) => {
                  const isALeading = row.scoreA > row.scoreB;
                  const isBLeading = row.scoreB > row.scoreA;
                  return (
                    <tr key={row.subject} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-5 font-bold text-[#1A1A2E]">{row.subject}</td>
                      <td className="py-3 px-4">
                        <span className="font-black text-indigo-600">{row.scoreA}%</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-black text-emerald-600">{row.scoreB}%</span>
                      </td>
                      <td className="py-3 px-4 text-[#9B9BB8] font-semibold">{row.classAvg}%</td>
                      <td className="py-3 px-4 text-right">
                        {isALeading ? (
                          <span className="inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                            {studentA.name.split(' ')[0]} (+{row.scoreA - row.scoreB}%)
                          </span>
                        ) : isBLeading ? (
                          <span className="inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {studentB.name.split(' ')[0]} (+{row.scoreB - row.scoreA}%)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">Equal (0%)</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ── AI Comparative Diagnostics & Recommendations ── */}
        <motion.div
          key={`diagnostics-${studentAId}-${studentBId}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: 'easeOut' }}
          className="glass-card p-5 space-y-4 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-xs text-[#1A1A2E] uppercase tracking-wider">
                  AI Comparative Diagnosis
                </h3>
                <p className="text-[10px] text-[#9B9BB8] font-bold">Kaggle Regression Factors</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                <p className="font-bold text-[#1A1A2E] text-[11px] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-500" />
                  Primary Key Variance
                </p>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {Math.abs(studentA.attendance - studentB.attendance) >= 15
                    ? `Attendance gap of ${Math.abs(studentA.attendance - studentB.attendance)}% is the single largest contributing factor to the predicted score differential.`
                    : `Study time delta (${Math.abs(studentA.studyHours - studentB.studyHours)} hrs/week) drives the performance deviation across STEM subjects.`}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100/60 space-y-1">
                <p className="font-bold text-indigo-900 text-[11px]">
                  {studentA.name.split(' ')[0]}'s Profile Strategy:
                </p>
                <p className="text-indigo-800/80 leading-relaxed text-[11px]">
                  {studentA.atRisk
                    ? `Requires immediate attendance recovery & targeted remedial math modules.`
                    : `Sustains strong academic velocity; encourage advanced peer-mentorship.`}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100/60 space-y-1">
                <p className="font-bold text-emerald-900 text-[11px]">
                  {studentB.name.split(' ')[0]}'s Profile Strategy:
                </p>
                <p className="text-emerald-800/80 leading-relaxed text-[11px]">
                  {studentB.atRisk
                    ? `Implement study schedule restructuring and habit tracking.`
                    : `Exhibits balanced study habits and high examination pass probability.`}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              onClick={() => setIsMeetingModalOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-200/60 text-indigo-700 text-xs font-black flex items-center justify-between cursor-pointer transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Parent-Teacher Meeting Report</span>
              </div>
              <span className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full">
                PDF
              </span>
            </button>
            <button
              onClick={() => {
                onSelectStudent(studentA.studentId);
                onNavigateTab('planner');
              }}
              className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 text-[#1A1A2E] text-xs font-bold flex items-center justify-between cursor-pointer transition-colors shadow-2xs"
            >
              <span>Study Plan for {studentA.name.split(' ')[0]}</span>
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            </button>
            <button
              onClick={() => {
                onSelectStudent(studentB.studentId);
                onNavigateTab('planner');
              }}
              className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 text-[#1A1A2E] text-xs font-bold flex items-center justify-between cursor-pointer transition-colors shadow-2xs"
            >
              <span>Study Plan for {studentB.name.split(' ')[0]}</span>
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Parent-Teacher Conference PDF Modal ── */}
      <ParentTeacherMeetingModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        studentA={studentA}
        studentB={studentB}
        allStudents={students}
      />
    </motion.div>
  );
};
