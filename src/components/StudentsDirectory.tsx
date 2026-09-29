import React, { useState } from 'react';
import { Student } from '../types';
import { calculateStudentPrediction } from '../services/predictionEngine';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Search,
  AlertTriangle,
  CheckCircle2,
  Brain,
  FileText,
  Calendar,
  Sparkles,
  UserCheck,
  TrendingUp,
  Clock,
  BookOpen,
  X,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface StudentsDirectoryProps {
  students: Student[];
  onSelectStudent: (studentId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const StudentsDirectory: React.FC<StudentsDirectoryProps> = ({
  students,
  onSelectStudent,
  onNavigateTab,
}) => {
  const { selectStudent, switchRole, activeStudent } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'atRisk' | 'onTrack' | 'lowAttendance'>('all');
  const [selectedProfile, setSelectedProfile] = useState<Student | null>(null);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.class.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === 'atRisk') return s.atRisk;
    if (filterType === 'onTrack') return !s.atRisk;
    if (filterType === 'lowAttendance') return s.attendance < 75;
    return true;
  });

  const handleInspectStudent = (s: Student) => {
    setSelectedProfile(s);
  };

  const handleActivateAndNavigate = (s: Student, tab: string) => {
    onSelectStudent(s.studentId);
    onNavigateTab(tab);
  };

  const handleSwitchToStudentView = (s: Student) => {
    onSelectStudent(s.studentId);
    switchRole('student');
    onNavigateTab('dashboard');
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Top Banner */}
      <div className="glass-card p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="z-10 relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 uppercase tracking-widest border border-indigo-100">
              Student Directory & RAG Hub
            </span>
            <span className="text-xs text-[#9B9BB8] font-bold">
              {students.length} Total Enrolled
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#1A1A2E] tracking-tight mb-2 leading-none">
            Students Roster & Profiles
          </h1>
          <p className="text-sm text-[#9B9BB8] font-medium max-w-xl leading-relaxed">
            Browse student profiles, inspect predictive learning analytics, and switch views to simulate student experiences.
          </p>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex items-center gap-3 shrink-0 z-10">
          <div className="px-4 py-3 rounded-2xl bg-white/80 border border-slate-200/60 shadow-sm text-center">
            <p className="text-[10px] font-black text-[#9B9BB8] uppercase tracking-wider">At-Risk Count</p>
            <p className="text-xl font-black text-red-500 leading-tight">{students.filter(s => s.atRisk).length}</p>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-white/80 border border-slate-200/60 shadow-sm text-center">
            <p className="text-[10px] font-black text-[#9B9BB8] uppercase tracking-wider">On-Track Count</p>
            <p className="text-xl font-black text-emerald-600 leading-tight">{students.filter(s => !s.atRisk).length}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#9B9BB8] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student by name, ID, or class..."
            className="w-full bg-slate-50 border border-slate-200/50 rounded-2xl text-xs pl-10 pr-4 py-3 text-[#1A1A2E] placeholder-[#8A99AD] outline-none shadow-inner focus-ring font-medium"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {(['all', 'atRisk', 'onTrack', 'lowAttendance'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                filterType === f
                  ? f === 'atRisk'
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                    : f === 'onTrack'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : f === 'lowAttendance'
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                    : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 text-[#9B9BB8] hover:text-[#1A1A2E] hover:bg-slate-200'
              }`}
            >
              {f === 'all'
                ? `All (${students.length})`
                : f === 'atRisk'
                ? `At Risk (${students.filter((s) => s.atRisk).length})`
                : f === 'onTrack'
                ? `On Track (${students.filter((s) => !s.atRisk).length})`
                : `<75% Att (${students.filter((s) => s.attendance < 75).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Student Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStudents.map((st) => {
          const pred = calculateStudentPrediction(st);
          const isCurrentActive = activeStudent?.studentId === st.studentId;
          const avgScore = Math.round(
            (Object.values(st.examScores) as number[]).reduce((a, b) => a + b, 0) /
              Math.max(1, (Object.values(st.examScores) as number[]).length)
          );

          return (
            <motion.div
              key={st.studentId}
              whileHover={{ y: -6, transition: { type: 'spring', stiffness: 350, damping: 22 } }}
              className={`clay-card p-6 flex flex-col justify-between transition-all relative overflow-hidden ${
                isCurrentActive ? 'ring-2 ring-indigo-500 shadow-lg' : ''
              }`}
            >
              <div>
                {/* Top Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[2px] shrink-0">
                      <img
                        src={st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={st.name}
                        className="w-full h-full rounded-full object-cover bg-white"
                      />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[#1A1A2E] text-base leading-tight">
                        {st.name}
                      </h3>
                      <p className="text-[11px] text-[#9B9BB8] font-bold mt-0.5">
                        {st.studentId} • {st.class}
                      </p>
                    </div>
                  </div>

                  {st.atRisk ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-red-50 text-red-500 border border-red-100 shrink-0">
                      <AlertTriangle className="w-3 h-3" />
                      At Risk
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      On Track
                    </span>
                  )}
                </div>

                {/* Stat Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50/80 p-3 rounded-2xl border border-slate-100 mb-4 text-center">
                  <div>
                    <p className="text-[10px] font-black text-[#9B9BB8] uppercase">Attendance</p>
                    <p className={`text-sm font-black ${st.attendance >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {st.attendance}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#9B9BB8] uppercase">Avg Score</p>
                    <p className="text-sm font-black text-[#1A1A2E]">{avgScore}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#9B9BB8] uppercase">Predicted</p>
                    <p className="text-sm font-black text-indigo-600">{pred.predictedExamScore}%</p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-1.5 text-xs text-[#4A4A6A] font-semibold mb-4 px-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[#9B9BB8]">Study / Sleep:</span>
                    <span>{st.studyHours}h/wk study • {st.sleepHours}h sleep</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#9B9BB8]">Motivation:</span>
                    <span className="capitalize">{st.motivation}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#9B9BB8]">Level & XP:</span>
                    <span className="text-purple-600 font-bold">Lvl {st.level} ({st.xp} XP)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleInspectStudent(st)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#1A1A2E] transition-all cursor-pointer text-center"
                >
                  View Profile
                </button>
                <button
                  onClick={() => handleSwitchToStudentView(st)}
                  className="flex-1 py-2 px-3 rounded-xl btn-primary text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1"
                >
                  Student View <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* RAG Profile Modal */}
      <AnimatePresence>
        {selectedProfile && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="glass-card max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto relative"
            >
              <button
                onClick={() => setSelectedProfile(null)}
                className="absolute top-5 right-5 p-2 text-[#9B9BB8] hover:text-[#1A1A2E] rounded-full hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <img
                  src={selectedProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={selectedProfile.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 p-0.5 shadow-md"
                />
                <div>
                  <h2 className="text-2xl font-black text-[#1A1A2E]">{selectedProfile.name}</h2>
                  <p className="text-xs text-[#9B9BB8] font-bold">
                    {selectedProfile.studentId} • {selectedProfile.class} • Roll No: {selectedProfile.rollNumber}
                  </p>
                </div>
              </div>

              {/* Prediction & Risk Card */}
              {(() => {
                const pred = calculateStudentPrediction(selectedProfile);
                return (
                  <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">
                        AI Predictive Diagnosis
                      </span>
                      {selectedProfile.atRisk ? (
                        <span className="text-xs font-black text-red-500 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" /> At Risk ({pred.riskPercentage}% Risk Factor)
                        </span>
                      ) : (
                        <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Pass Likelihood: {pred.passProbability}%
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[#9B9BB8] font-bold">Predicted Final Score:</span>
                        <p className="text-lg font-black text-[#1A1A2E]">{pred.predictedExamScore}/100</p>
                      </div>
                      <div>
                        <span className="text-[#9B9BB8] font-bold">Primary Risk Cause:</span>
                        <p className="text-xs font-bold text-[#1A1A2E]">{selectedProfile.riskReason || 'None (Performing Well)'}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Exam Scores Grid */}
              <div>
                <h4 className="text-xs font-black text-[#1A1A2E] uppercase tracking-wider mb-2">Subject Scores</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(selectedProfile.examScores).map(([subj, score]) => (
                    <div key={subj} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                      <p className="text-[10px] font-black text-[#9B9BB8] uppercase">{subj}</p>
                      <p className={`text-lg font-black ${(score as number) >= 75 ? 'text-indigo-600' : 'text-amber-500'}`}>
                        {score as number}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => {
                    setSelectedProfile(null);
                    handleActivateAndNavigate(selectedProfile, 'copilot');
                  }}
                  className="p-3 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl hover:bg-indigo-100 transition-all cursor-pointer text-center"
                >
                  <Sparkles className="w-4 h-4 mx-auto mb-1" />
                  Ask AI Copilot
                </button>
                <button
                  onClick={() => {
                    setSelectedProfile(null);
                    handleActivateAndNavigate(selectedProfile, 'planner');
                  }}
                  className="p-3 bg-blue-50 text-blue-600 font-bold text-xs rounded-xl hover:bg-blue-100 transition-all cursor-pointer text-center"
                >
                  <Calendar className="w-4 h-4 mx-auto mb-1" />
                  Study Planner
                </button>
                <button
                  onClick={() => {
                    setSelectedProfile(null);
                    handleActivateAndNavigate(selectedProfile, 'reports');
                  }}
                  className="p-3 bg-amber-50 text-amber-600 font-bold text-xs rounded-xl hover:bg-amber-100 transition-all cursor-pointer text-center"
                >
                  <FileText className="w-4 h-4 mx-auto mb-1" />
                  PDF Report
                </button>
                <button
                  onClick={() => {
                    setSelectedProfile(null);
                    handleSwitchToStudentView(selectedProfile);
                  }}
                  className="p-3 bg-emerald-50 text-emerald-600 font-bold text-xs rounded-xl hover:bg-emerald-100 transition-all cursor-pointer text-center"
                >
                  <UserCheck className="w-4 h-4 mx-auto mb-1" />
                  Student View
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
