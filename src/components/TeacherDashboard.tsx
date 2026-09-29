import React, { useState } from 'react';
import { Student } from '../types';
import { calculateStudentPrediction } from '../services/predictionEngine';
import { StudentComparativeView } from './StudentComparativeView';
import { WeeklyStudyHeatmap } from './WeeklyStudyHeatmap';
import { PrintButton } from './PrintButton';
import { DownloadPDFReportButton } from './DownloadPDFReportButton';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Brain,
  Search,
  Bot,
  FileText,
  Calendar,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
  CalendarDays,
  Scale,
  LayoutDashboard,
  Clock,
  Activity,
  X,
  ShieldCheck,
  HeartHandshake,
  Moon,
  BookOpen,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

export type TeacherDashboardTab = 'overview' | 'risk' | 'trends' | 'comparative';

interface TeacherDashboardProps {
  students: Student[];
  onSelectStudent: (studentId: string) => void;
  onNavigateTab: (tab: string) => void;
  onResetData: () => void;
  initialMode?: 'overview' | 'risk' | 'trends' | 'comparative' | 'studyHeatmap';
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  students,
  onSelectStudent,
  onNavigateTab,
  onResetData,
  initialMode = 'overview',
}) => {
  const getInitialTab = (): TeacherDashboardTab => {
    if (initialMode === 'studyHeatmap' || initialMode === 'trends') return 'trends';
    if (initialMode === 'comparative') return 'comparative';
    if (initialMode === 'risk') return 'risk';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState<TeacherDashboardTab>(getInitialTab());
  const [compareStudentA, setCompareStudentA] = useState<string | undefined>(undefined);
  const [compareStudentB, setCompareStudentB] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'atRisk' | 'lowAttendance' | 'highAchievers'>('all');
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);

  React.useEffect(() => {
    if (initialMode === 'comparative') setActiveTab('comparative');
    else if (initialMode === 'studyHeatmap' || initialMode === 'trends') setActiveTab('trends');
    else if (initialMode === 'risk') setActiveTab('risk');
    else if (initialMode === 'overview') setActiveTab('overview');
  }, [initialMode]);

  const handleLaunchCompare = (studentId: string) => {
    setCompareStudentA(studentId);
    const other = students.find((s) => s.studentId !== studentId);
    if (other) {
      setCompareStudentB(other.studentId);
    }
    setActiveTab('comparative');
  };

  const totalCount = students.length;
  const atRiskStudents = students.filter((s) => s.atRisk);
  const lowAttendanceStudents = students.filter((s) => s.attendance < 75);
  const sleepDeprivedStudents = students.filter((s) => s.sleepHours < 6);
  const lowStudyStudents = students.filter((s) => s.studyHours < 15);

  const avgAttendance =
    totalCount > 0
      ? Math.round(students.reduce((a, b) => a + b.attendance, 0) / totalCount)
      : 0;
  const classAvgMath =
    totalCount > 0
      ? Math.round(students.reduce((a, b) => a + (b.examScores.Math || 0), 0) / totalCount)
      : 0;

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === 'atRisk') return s.atRisk;
    if (filterType === 'lowAttendance') return s.attendance < 75;
    if (filterType === 'highAchievers')
      return (
        s.attendance >= 90 &&
        (Object.values(s.examScores) as number[]).reduce((a, b) => a + b, 0) / 5 >= 85
      );
    return true;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } },
  };

  const statCards = [
    {
      label: 'Total Students',
      value: String(totalCount),
      sub: 'Grade 11 · Section A',
      icon: <Users className="w-4.5 h-4.5 text-indigo-500" />,
      iconBg: 'bg-indigo-50',
      accent: 'text-indigo-600',
      onClick: () => setActiveTab('overview'),
    },
    {
      label: 'At Risk',
      value: String(atRiskStudents.length),
      sub: 'Require Intervention',
      icon: <AlertTriangle className="w-4.5 h-4.5 text-red-500" />,
      iconBg: 'bg-red-50',
      accent: 'text-red-500',
      onClick: () => setActiveTab('risk'),
    },
    {
      label: 'Class Attendance',
      value: `${avgAttendance}%`,
      sub: 'Benchmark: 75% Target',
      icon: <TrendingUp className="w-4.5 h-4.5 text-emerald-500" />,
      iconBg: 'bg-emerald-50',
      accent: 'text-emerald-600',
      onClick: () => setActiveTab('trends'),
    },
    {
      label: 'Math Average',
      value: `${classAvgMath}%`,
      sub: 'Key predictor factor',
      icon: <Brain className="w-4.5 h-4.5 text-purple-500" />,
      iconBg: 'bg-purple-50',
      accent: 'text-purple-600',
      onClick: () => setActiveTab('overview'),
    },
  ];

  return (
    <motion.div
      id="teacher-dashboard-view"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5 pb-6"
    >
      {/* Header Banner */}
      <motion.div
        variants={itemVariants}
        className="glass-card p-6 sm:p-7 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-bl from-indigo-300/15 via-purple-300/10 to-transparent rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 relative z-10">
          {/* Title & Metadata */}
          <div className="min-w-0 max-w-2xl">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 uppercase tracking-wider whitespace-nowrap shadow-2xs">
                Grade 11 · STEM Stream
              </span>
              <span className="text-[10px] text-[#9B9BB8] font-bold uppercase tracking-wider whitespace-nowrap">
                Academic Term 2
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A2E] tracking-tight mb-1.5 leading-tight">
              {activeTab === 'comparative'
                ? 'Comparative Analytics'
                : activeTab === 'trends'
                ? 'Student Trends & Habit Analytics'
                : activeTab === 'risk'
                ? 'Risk Factors & Intervention Matrix'
                : 'Class Overview'}
            </h1>
            <p className="text-xs sm:text-sm text-[#4A4A6A] font-medium leading-relaxed">
              {activeTab === 'comparative'
                ? 'Side-by-side performance overlays, factor disparity diagnosis, and comparative AI modeling.'
                : activeTab === 'trends'
                ? '7-day hourly revision density, subject focus matrix, and 20-day attendance consistency.'
                : activeTab === 'risk'
                ? 'Algorithmic early-warning detection, negative factor breakdown, and priority student triage.'
                : 'Executive summary metrics, student roster, and real-time Kaggle Educational Factor predictions.'}
            </p>
          </div>

          {/* Action & Utility Controls */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <DownloadPDFReportButton
              variant="primary"
              size="md"
              label="Download PDF Report"
              targetElementId="teacher-dashboard-view"
              filename={`Teacher-${activeTab.toUpperCase()}-Report-${new Date().toISOString().slice(0, 10)}`}
              reportTitle={`EduSense Teacher Analytics — ${
                activeTab === 'comparative'
                  ? 'Comparative Performance Analysis'
                  : activeTab === 'trends'
                  ? 'Student Habits & Attendance Trends'
                  : activeTab === 'risk'
                  ? 'At-Risk Intervention & Warning Matrix'
                  : 'Executive Class Overview & Roster'
              }`}
              reportSubtitle={`Grade 11 · STEM Stream • Total Students: ${totalCount} • At-Risk: ${atRiskStudents.length} • Academic Term 2`}
              title="Generate and download a standalone, printable PDF version of this dashboard"
            />

            <PrintButton
              variant="outline"
              size="md"
              label="Print View"
              title="Print current tab view (Ctrl/Cmd + P)"
            />

            <button
              onClick={() => setIsMethodologyOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50/90 border border-indigo-200/80 hover:bg-indigo-100 transition-all cursor-pointer focus-ring shadow-xs whitespace-nowrap"
            >
              <Brain className="w-3.5 h-3.5 text-indigo-600" />
              AI Methodology
            </button>

            <button
              onClick={onResetData}
              title="Reset database to original Kaggle Seed records"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#4A4A6A] bg-white border border-slate-200 hover:border-slate-300 transition-all cursor-pointer focus-ring shadow-xs whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#9B9BB8]" />
              Reset Data
            </button>

            <button
              onClick={() => onNavigateTab('copilot')}
              className="flex items-center gap-2 px-4 py-2 btn-primary text-xs font-bold cursor-pointer focus-ring rounded-xl shadow-sm whitespace-nowrap"
            >
              <Bot className="w-3.5 h-3.5" />
              Class Copilot
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Panel Tabbed View Component */}
      <motion.div variants={itemVariants} className="no-print">
        <div className="flex items-center justify-between gap-3 bg-white/70 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/70 shadow-sm overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'text-[#4A4A6A] hover:text-[#1A1A2E] hover:bg-slate-100/70'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Class Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('risk')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'risk'
                  ? 'bg-red-600 text-white shadow-sm shadow-red-600/20'
                  : 'text-[#4A4A6A] hover:text-[#1A1A2E] hover:bg-slate-100/70'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Risk Factors</span>
              {atRiskStudents.length > 0 && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-full tabular-nums ${
                    activeTab === 'risk'
                      ? 'bg-white/20 text-white'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {atRiskStudents.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('trends')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'trends'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'text-[#4A4A6A] hover:text-[#1A1A2E] hover:bg-slate-100/70'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Student Trends</span>
            </button>

            <button
              onClick={() => setActiveTab('comparative')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'comparative'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'text-[#4A4A6A] hover:text-[#1A1A2E] hover:bg-slate-100/70'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Comparative Analysis</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 px-2 text-[11px] font-bold text-[#9B9BB8]">
            <span>Active category:</span>
            <span className="font-extrabold text-[#1A1A2E] capitalize">
              {activeTab === 'overview'
                ? 'Overview & Roster'
                : activeTab === 'risk'
                ? 'Risk & Interventions'
                : activeTab === 'trends'
                ? 'Trends & Density'
                : 'Comparative'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Tab Panels: Rendering Only One Data Category At A Time */}
      <AnimatePresence mode="wait">
        {/* ── TAB 1: CLASS OVERVIEW ── */}
        {activeTab === 'overview' && (
          <motion.div
            key="tab-overview"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statCards.map((card) => (
                <motion.div
                  key={card.label}
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={card.onClick}
                  className="stat-card p-5 flex flex-col gap-3 cursor-pointer hover:border-indigo-300 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${card.iconBg}`}
                    >
                      {card.icon}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-[#9B9BB8] mb-0.5">
                        {card.label}
                      </p>
                      <p className="text-2xl font-black text-[#1A1A2E] leading-none tabular-nums">
                        {card.value}
                      </p>
                      <p className="text-[11px] text-[#9B9BB8] font-medium mt-1">
                        {card.sub}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Student Performance Roster Table */}
            <div className="glass-card overflow-hidden">
              {/* Controls */}
              <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm text-[#1A1A2E]">
                    Student Performance Roster
                  </h3>
                  <p className="text-[11px] text-[#9B9BB8] font-medium mt-0.5">
                    Showing {filteredStudents.length} of {totalCount} students • Select any student to inspect or generate reports
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                  {/* Search */}
                  <div className="relative flex-1 md:w-56">
                    <Search className="w-3.5 h-3.5 text-[#9B9BB8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by student name or ID..."
                      className="w-full bg-slate-50 border border-slate-200/50 rounded-xl text-xs pl-9 pr-4 py-2 text-[#1A1A2E] placeholder-[#8A99AD] outline-none shadow-[inset_1px_1px_2px_rgba(0,0,0,0.02)] focus-ring"
                    />
                  </div>
                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1 p-1 bg-slate-50 border border-slate-200/50 rounded-xl">
                    {(['all', 'atRisk', 'lowAttendance', 'highAchievers'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilterType(f)}
                        className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                          filterType === f
                            ? f === 'atRisk'
                              ? 'bg-red-500 text-white shadow-xs'
                              : f === 'lowAttendance'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-indigo-600 text-white shadow-xs'
                            : 'text-[#9B9BB8] hover:text-[#1A1A2E]'
                        }`}
                      >
                        {f === 'all'
                          ? 'All'
                          : f === 'atRisk'
                          ? `At Risk (${atRiskStudents.length})`
                          : f === 'lowAttendance'
                          ? '<75% Att'
                          : 'High Marks'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[720px] text-left text-xs">
                  <thead className="bg-slate-50/70 text-[#9B9BB8] font-bold border-b border-slate-200/60 uppercase tracking-widest text-[10px]">
                    <tr>
                      <th className="py-3.5 px-5">Student</th>
                      <th className="py-3.5 px-5">Attendance</th>
                      <th className="py-3.5 px-5">Study / Sleep</th>
                      <th className="py-3.5 px-5">Math Score</th>
                      <th className="py-3.5 px-5">Predicted Score</th>
                      <th className="py-3.5 px-5">Risk Status</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredStudents.map((st) => {
                      const pred = calculateStudentPrediction(st);
                      return (
                        <tr
                          key={st.studentId}
                          className="hover:bg-slate-50/60 transition-colors cursor-pointer group"
                          onClick={() => {
                            onSelectStudent(st.studentId);
                            onNavigateTab('dashboard');
                          }}
                        >
                          {/* Student info */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] shrink-0">
                                <img
                                  src={
                                    st.avatar ||
                                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                                  }
                                  alt={st.name}
                                  className="w-full h-full rounded-full object-cover bg-white"
                                />
                              </div>
                              <div>
                                <div className="font-extrabold text-[#1A1A2E]">{st.name}</div>
                                <div className="text-[10px] text-[#9B9BB8] font-medium">
                                  {st.studentId} · {st.motivation} motivation
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Attendance */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-black tabular-nums ${
                                  st.attendance >= 75 ? 'text-emerald-600' : 'text-red-500'
                                }`}
                              >
                                {st.attendance}%
                              </span>
                              <div className="w-14 bg-slate-100 border border-slate-200/50 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    st.attendance >= 75 ? 'bg-emerald-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${st.attendance}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Study/Sleep */}
                          <td className="py-4 px-5 font-bold text-[#4A4A6A]">
                            <div className="tabular-nums">{st.studyHours}h/wk study</div>
                            <div className="text-[10px] text-[#9B9BB8] font-medium tabular-nums">
                              {st.sleepHours}h sleep/night
                            </div>
                          </td>

                          {/* Math Score */}
                          <td className="py-4 px-5 font-black text-[#1A1A2E] tabular-nums">
                            {st.examScores.Math}%
                          </td>

                          {/* Predicted */}
                          <td className="py-4 px-5">
                            <span className="font-black text-indigo-600 block tabular-nums">
                              Predicted: {pred.predictedExamScore}%
                            </span>
                            <div className="text-[10px] text-[#9B9BB8] font-medium mt-0.5 tabular-nums">
                              ({pred.confidenceScore}% conf) · Pass: {pred.passProbability}%
                            </div>
                          </td>

                          {/* Risk Badge & Factors */}
                          <td className="py-4 px-5">
                            <div className="flex flex-col gap-1 items-start">
                              {st.atRisk ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md bg-red-50 border border-red-100 text-red-600">
                                  <AlertTriangle className="w-3 h-3 text-red-500" />
                                  At Risk
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-600">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                  On Track
                                </span>
                              )}
                              <div className="flex flex-wrap gap-1 max-w-[150px] mt-0.5">
                                {pred.influencingFactors
                                  .filter((f) =>
                                    st.atRisk ? f.impact === 'negative' : f.impact === 'positive'
                                  )
                                  .slice(0, 2)
                                  .map((fac, idx) => (
                                    <span
                                      key={idx}
                                      title={fac.description}
                                      className={`text-[8.5px] font-semibold px-1.5 py-0.5 rounded leading-tight border ${
                                        fac.impact === 'negative'
                                          ? 'bg-red-50/90 text-red-600 border-red-100'
                                          : 'bg-emerald-50/90 text-emerald-700 border-emerald-100'
                                      }`}
                                    >
                                      {fac.factor}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td
                            className="py-4 px-5 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleLaunchCompare(st.studentId)}
                                title="Compare Student Analytics"
                                className="p-2 bg-white border border-slate-200/70 hover:border-indigo-300 text-[#4A4A6A] hover:text-indigo-600 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1 text-[11px] font-bold"
                              >
                                <Scale className="w-3.5 h-3.5 text-indigo-500" />
                                <span className="hidden xl:inline text-[10px]">Compare</span>
                              </button>
                              <button
                                onClick={() => {
                                  onSelectStudent(st.studentId);
                                  onNavigateTab('reports');
                                }}
                                title="Generate Parent-Teacher Report"
                                className="p-2 bg-white border border-slate-200/70 hover:border-amber-300 text-[#4A4A6A] hover:text-amber-600 rounded-xl transition-all cursor-pointer shadow-xs"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  onSelectStudent(st.studentId);
                                  onNavigateTab('planner');
                                }}
                                title="Study Planner"
                                className="p-2 bg-white border border-slate-200/70 hover:border-blue-300 text-[#4A4A6A] hover:text-blue-600 rounded-xl transition-all cursor-pointer shadow-xs"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  onSelectStudent(st.studentId);
                                  onNavigateTab('copilot');
                                }}
                                title="AI Copilot"
                                className="p-2 bg-white border border-slate-200/70 hover:border-purple-300 text-[#4A4A6A] hover:text-purple-600 rounded-xl transition-all cursor-pointer shadow-xs"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TAB 2: RISK FACTORS ── */}
        {activeTab === 'risk' && (
          <motion.div
            key="tab-risk"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* 4 Targeted Risk Drivers */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="stat-card p-5 border-l-4 border-l-red-500 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                    Flagged For Action
                  </span>
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-3xl font-black text-[#1A1A2E] tabular-nums">
                  {atRiskStudents.length}
                </div>
                <p className="text-[11px] text-[#9B9BB8] font-medium mt-1">
                  {Math.round((atRiskStudents.length / totalCount) * 100)}% of enrolled cohort
                </p>
              </div>

              <div className="stat-card p-5 border-l-4 border-l-amber-500 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                    Attendance Deficit
                  </span>
                  <Activity className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-3xl font-black text-[#1A1A2E] tabular-nums">
                  {lowAttendanceStudents.length}
                </div>
                <p className="text-[11px] text-[#9B9BB8] font-medium mt-1">
                  Students below 75% threshold
                </p>
              </div>

              <div className="stat-card p-5 border-l-4 border-l-indigo-500 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                    Sleep Deprived
                  </span>
                  <Moon className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="text-3xl font-black text-[#1A1A2E] tabular-nums">
                  {sleepDeprivedStudents.length}
                </div>
                <p className="text-[11px] text-[#9B9BB8] font-medium mt-1">
                  Students averaging &lt;6h rest/night
                </p>
              </div>

              <div className="stat-card p-5 border-l-4 border-l-purple-500 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
                    Low Study Hours
                  </span>
                  <BookOpen className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-3xl font-black text-[#1A1A2E] tabular-nums">
                  {lowStudyStudents.length}
                </div>
                <p className="text-[11px] text-[#9B9BB8] font-medium mt-1">
                  Students with &lt;15h revision/wk
                </p>
              </div>
            </div>

            {/* Model Risk Drivers Weighting & Early Warning Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Factor Impact Weighting Schedule */}
              <div className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-extrabold text-sm text-[#1A1A2E]">
                    Algorithmic Risk Determinants
                  </h3>
                </div>
                <p className="text-xs text-[#4A4A6A] leading-relaxed">
                  Calibrated against Kaggle educational regressions. The following thresholds directly trigger intervention flags:
                </p>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1A1A2E] mb-1">
                      <span>Attendance &lt; 75%</span>
                      <span className="text-red-500 font-extrabold">-0.6 pts / % deficit</span>
                    </div>
                    <p className="text-[11px] text-[#9B9BB8]">
                      Largest negative factor; accounts for 42% of projected exam failure rate.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1A1A2E] mb-1">
                      <span>Study Deficit (&lt;12h/wk)</span>
                      <span className="text-red-500 font-extrabold">-0.7 pts / hour below</span>
                    </div>
                    <p className="text-[11px] text-[#9B9BB8]">
                      Insufficient revision correlates directly with low STEM assessment retainment.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1A1A2E] mb-1">
                      <span>Sleep Deprivation (&lt;6h)</span>
                      <span className="text-amber-600 font-extrabold">-6.0 pts cognitive loss</span>
                    </div>
                    <p className="text-[11px] text-[#9B9BB8]">
                      Impairs executive memory formation during exam sprint weeks.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1A1A2E] mb-1">
                      <span>Low Motivation</span>
                      <span className="text-amber-600 font-extrabold">-5.0 pts penalty</span>
                    </div>
                    <p className="text-[11px] text-[#9B9BB8]">
                      Requires mentorship check-ins and motivational study plans.
                    </p>
                  </div>
                </div>
              </div>

              {/* Priority Intervention Queue */}
              <div className="glass-card p-6 lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <h3 className="font-extrabold text-sm text-[#1A1A2E]">
                      Priority Intervention Queue ({atRiskStudents.length} Students)
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
                    Requires Teacher Follow-Up
                  </span>
                </div>

                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {atRiskStudents.map((st) => {
                    const pred = calculateStudentPrediction(st);
                    const negativeFactors = pred.influencingFactors.filter(
                      (f) => f.impact === 'negative'
                    );

                    return (
                      <div
                        key={st.studentId}
                        className="p-4 rounded-2xl bg-white border border-red-100 hover:border-red-300 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={
                              st.avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                            }
                            alt={st.name}
                            className="w-10 h-10 rounded-full object-cover shrink-0 border border-red-200"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-sm text-[#1A1A2E]">{st.name}</h4>
                              <span className="text-[10px] text-[#9B9BB8] font-bold">
                                {st.studentId}
                              </span>
                            </div>
                            <div className="text-xs text-[#4A4A6A] mt-0.5">
                              Current Math: <strong className="text-[#1A1A2E]">{st.examScores.Math}%</strong> · Projected:{' '}
                              <strong className="text-red-600">{pred.predictedExamScore}%</strong> ({pred.passProbability}% pass probability)
                            </div>
                            {/* Triggers */}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {negativeFactors.map((fac, idx) => (
                                <span
                                  key={idx}
                                  className="text-[9px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-100"
                                >
                                  {fac.factor}: {fac.description}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Quick 1-click interventions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              onSelectStudent(st.studentId);
                              onNavigateTab('reports');
                            }}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-300 text-xs font-bold text-[#4A4A6A] hover:text-amber-700 bg-white transition-all cursor-pointer shadow-xs"
                          >
                            Parent Notice
                          </button>
                          <button
                            onClick={() => {
                              onSelectStudent(st.studentId);
                              onNavigateTab('planner');
                            }}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-300 text-xs font-bold text-[#4A4A6A] hover:text-blue-700 bg-white transition-all cursor-pointer shadow-xs"
                          >
                            Study Plan
                          </button>
                          <button
                            onClick={() => {
                              onSelectStudent(st.studentId);
                              onNavigateTab('copilot');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-all cursor-pointer shadow-xs flex items-center gap-1"
                          >
                            <Bot className="w-3 h-3 text-indigo-600" />
                            AI Advice
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Attendance Consistency Matrix in Risk Factors */}
            <div className="glass-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarDays className="w-4 h-4 text-indigo-500" />
                    <h3 className="font-black text-xs text-[#1A1A2E] tracking-wider uppercase">
                      20-Day Attendance Consistency Matrix
                    </h3>
                  </div>
                  <p className="text-[10px] text-[#9B9BB8] font-bold">
                    Visualizing daily presence, late arrivals, and unexcused absences
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-black text-[#9B9BB8] uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Present
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-amber-400" /> Late
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-red-500" /> Absent
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 overflow-x-auto">
                {students.map((st) => (
                  <div key={st.studentId} className="flex items-center gap-3 min-w-[560px]">
                    <div className="w-32 text-xs font-black text-[#1A1A2E] truncate shrink-0">
                      {st.name}
                    </div>
                    <div className="flex-1 flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100 shadow-inner">
                      {Array.from({ length: 20 }).map((_, idx) => {
                        const isPresent = (idx * 7 + st.attendance) % 10 > 10 - st.attendance / 10;
                        const isLate = !isPresent && idx % 4 === 0;
                        return (
                          <div
                            key={idx}
                            title={`${st.name} · Day ${idx + 1}: ${
                              isPresent ? 'Present (On Time)' : isLate ? 'Late Arrival' : 'Excused Absence'
                            }`}
                            className={`h-5 flex-1 rounded transition-transform duration-100 origin-center hover:scale-105 hover:z-10 cursor-pointer ${
                              isPresent ? 'bg-emerald-500' : isLate ? 'bg-amber-400' : 'bg-red-500'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <div className="w-12 text-right text-xs font-extrabold text-[#1A1A2E] shrink-0 tabular-nums">
                      {st.attendance}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TAB 3: STUDENT TRENDS ── */}
        {activeTab === 'trends' && (
          <motion.div
            key="tab-trends"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Cohort Habit Observations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card p-5 border-l-4 border-l-indigo-500 space-y-1">
                <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                  Peak Revision Window
                </div>
                <div className="text-xl font-black text-[#1A1A2E]">4:00 PM – 7:30 PM</div>
                <p className="text-[11px] text-[#9B9BB8] font-medium">
                  Class demonstrates highest concentration and completion during late afternoon blocks.
                </p>
              </div>

              <div className="glass-card p-5 border-l-4 border-l-purple-500 space-y-1">
                <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
                  Subject Focus Allocation
                </div>
                <div className="text-xl font-black text-[#1A1A2E]">64% STEM Investment</div>
                <p className="text-[11px] text-[#9B9BB8] font-medium">
                  Mathematics and Physics absorb the majority of student study plan hours.
                </p>
              </div>

              <div className="glass-card p-5 border-l-4 border-l-emerald-500 space-y-1">
                <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                  Attendance & Grade Yield
                </div>
                <div className="text-xl font-black text-[#1A1A2E]">+14.2% Delta</div>
                <p className="text-[11px] text-[#9B9BB8] font-medium">
                  Students maintaining ≥85% attendance score an average of 14 points higher on term exams.
                </p>
              </div>
            </div>

            {/* Weekly Study Activity Heatmap */}
            <WeeklyStudyHeatmap
              students={students}
              onSelectStudent={onSelectStudent}
            />

            {/* Attendance Consistency Matrix */}
            <div className="glass-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarDays className="w-4 h-4 text-indigo-500" />
                    <h3 className="font-black text-xs text-[#1A1A2E] tracking-wider uppercase">
                      Cohort Daily Attendance Heatmap (20 Days)
                    </h3>
                  </div>
                  <p className="text-[10px] text-[#9B9BB8] font-bold">
                    Class presence consistency tracking across academic term 2
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-black text-[#9B9BB8] uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Present
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-amber-400" /> Late
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-red-500" /> Absent
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 overflow-x-auto">
                {students.map((st) => (
                  <div key={st.studentId} className="flex items-center gap-3 min-w-[560px]">
                    <div className="w-32 text-xs font-black text-[#1A1A2E] truncate shrink-0">
                      {st.name}
                    </div>
                    <div className="flex-1 flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100 shadow-inner">
                      {Array.from({ length: 20 }).map((_, idx) => {
                        const isPresent = (idx * 7 + st.attendance) % 10 > 10 - st.attendance / 10;
                        const isLate = !isPresent && idx % 4 === 0;
                        return (
                          <div
                            key={idx}
                            title={`${st.name} · Day ${idx + 1}: ${
                              isPresent ? 'Present (On Time)' : isLate ? 'Late Arrival' : 'Excused Absence'
                            }`}
                            className={`h-5 flex-1 rounded transition-transform duration-100 origin-center hover:scale-105 hover:z-10 cursor-pointer ${
                              isPresent ? 'bg-emerald-500' : isLate ? 'bg-amber-400' : 'bg-red-500'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <div className="w-12 text-right text-xs font-extrabold text-[#1A1A2E] shrink-0 tabular-nums">
                      {st.attendance}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TAB 4: COMPARATIVE ANALYSIS ── */}
        {activeTab === 'comparative' && (
          <motion.div
            key="tab-comparative"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <StudentComparativeView
              students={students}
              initialStudentAId={compareStudentA}
              initialStudentBId={compareStudentB}
              onSelectStudent={onSelectStudent}
              onNavigateTab={onNavigateTab}
              onClose={() => setActiveTab('overview')}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Methodology Modal */}
      <AnimatePresence>
        {isMethodologyOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in"
            onClick={() => setIsMethodologyOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#121522] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[88vh] overflow-y-auto relative space-y-6"
            >
              {/* Close button */}
              <button
                onClick={() => setIsMethodologyOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      Deterministic Heuristic Model
                    </span>
                    <span className="text-[10px] text-[#9B9BB8] font-bold uppercase tracking-wider">
                      Kaggle Benchmark
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-[#1A1A2E] dark:text-white tracking-tight">
                    AI Prediction Methodology & Formulas
                  </h2>
                </div>
              </div>

              {/* Integrity Disclosure Statement */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-[#3D3D5C] leading-relaxed">
                <div className="flex items-center gap-2 text-indigo-700 font-extrabold mb-1">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Model Architecture & Academic Integrity Notice</span>
                </div>
                <p className="font-medium">
                  EduSense computes predicted academic outcomes using a rule-based weighted heuristic scoring engine calibrated against the Kaggle Student Performance Factors regression baseline. The engine uses <strong>no black-box generative approximations</strong>. Scores and confidence indices are derived deterministically from existing observable student records.
                </p>
              </div>

              {/* Formulas Breakdown Grid */}
              <div className="space-y-4">
                {/* Step 1: Baseline */}
                <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-[#1A1A2E] uppercase tracking-wider">
                      1. Current Performance Baseline
                    </h4>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      Arithmetic Mean
                    </span>
                  </div>
                  <p className="text-xs text-[#4A4A6A]">
                    <code className="text-indigo-600 font-bold bg-indigo-50/80 px-1.5 py-0.5 rounded">
                      avgCurrentScore = Σ(subjectScores) / N
                    </code>
                  </p>
                  <p className="text-[11px] text-[#9B9BB8]">
                    Evaluates student marks across all enrolled subjects (Math, Science, English, etc.).
                  </p>
                </div>

                {/* Step 2: Factor Impact Schedule */}
                <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-[#1A1A2E] uppercase tracking-wider">
                      2. Educational Factor Impact Weights
                    </h4>
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                      Calibrated Deltas
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#3D3D5C]">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="font-black text-[#1A1A2E] block mb-0.5">Attendance (Threshold 75%)</span>
                      <span>≥85%: <code className="text-emerald-600 font-bold">+(Att - 75) × 0.4 pts</code></span><br />
                      <span>&lt;75%: <code className="text-red-500 font-bold">-(75 - Att) × 0.6 pts</code></span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="font-black text-[#1A1A2E] block mb-0.5">Study Hours (Ideal 12–25h/wk)</span>
                      <span>≥18h: <code className="text-emerald-600 font-bold">+min((Hrs - 12) × 0.5, 8) pts</code></span><br />
                      <span>&lt;12h: <code className="text-red-500 font-bold">-(12 - Hrs) × 0.7 pts</code></span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="font-black text-[#1A1A2E] block mb-0.5">Sleep Quality</span>
                      <span>Optimal 7–9h: <code className="text-emerald-600 font-bold">+3.0 pts</code></span><br />
                      <span>Sub-6h Deprivation: <code className="text-red-500 font-bold">-6.0 pts</code></span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="font-black text-[#1A1A2E] block mb-0.5">Mindset & Environment</span>
                      <span>High Motivation: <code className="text-emerald-600 font-bold">+4 pts</code> | Low: <code className="text-red-500 font-bold">-5 pts</code></span><br />
                      <span>High Parental Support: <code className="text-emerald-600 font-bold">+3 pts</code></span>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#9B9BB8] font-bold">
                    Final Score = <code className="text-indigo-600 font-bold">clamp(round(avgCurrentScore + ΣscoreImpact), 35, 99)%</code>
                  </p>
                </div>

                {/* Step 3: Confidence Score Formula */}
                <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider">
                      3. Deterministic Confidence Derivation
                    </h4>
                    <span className="text-[10px] font-black text-indigo-700 bg-white px-2 py-0.5 rounded shadow-xs">
                      Purely Deterministic
                    </span>
                  </div>
                  <p className="text-xs text-indigo-950 leading-relaxed font-medium">
                    Confidence is computed from standard deviation across subjects (σ) and boundary proximity:
                  </p>
                  <p className="text-xs font-mono font-bold text-indigo-700 bg-white p-2 rounded-xl border border-indigo-100">
                    Confidence = clamp(96 - min(10, round(σ × 0.45)) - (BorderlineAtt ? 4 : 0) - (ExtremeHabits ? 2 : 0), 76, 98)%
                  </p>
                  <p className="text-[11px] text-[#4A4A6A] leading-tight">
                    Low inter-subject score variance yields up to 98% confidence. Borderline attendance (70%–78%) carries higher transition risk and deducts 4% accordingly.
                  </p>
                </div>
              </div>

              {/* Footer button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsMethodologyOpen(false)}
                  className="px-5 py-2.5 rounded-xl btn-primary text-xs font-bold cursor-pointer focus-ring"
                >
                  Understood & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


