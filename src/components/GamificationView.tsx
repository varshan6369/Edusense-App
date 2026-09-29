import React, { useState } from 'react';
import { Student } from '../types';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Flame,
  Zap,
  Award,
  Crown,
  CheckCircle2,
  Sparkles,
  Gift,
  Star,
  Users,
  Target,
  PlusCircle,
  TrendingUp,
  ShieldCheck,
  Search,
  Check,
  Send,
  SlidersHorizontal,
} from 'lucide-react';
import { Badges, ALL_ACHIEVEMENT_BADGES, AchievementBadge } from './Badges';

interface GamificationViewProps {
  student: Student;
  allStudents: Student[];
  role?: 'student' | 'teacher';
}

interface CommendationLog {
  id: string;
  studentName: string;
  studentAvatar?: string;
  xpAwarded: number;
  badgeTitle?: string;
  reason: string;
  timestamp: string;
}

export const GamificationView: React.FC<GamificationViewProps> = ({
  student,
  allStudents,
  role: propRole,
}) => {
  const { user, awardStudentPoints, awardStudentBadge } = useAuth();
  const effectiveRole = propRole || user?.role || 'teacher';
  const isTeacher = effectiveRole === 'teacher';

  // Teacher Interactive Award State
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    student?.studentId || (allStudents[0]?.studentId ?? '')
  );
  const [awardType, setAwardType] = useState<'xp' | 'badge' | 'both'>('xp');
  const [xpPreset, setXpPreset] = useState<number>(150);
  const [customXp, setCustomXp] = useState<string>('150');
  const [selectedBadgeId, setSelectedBadgeId] = useState<string>(ALL_ACHIEVEMENT_BADGES[6]?.id || 'badge-top-performer');
  const [awardReason, setAwardReason] = useState<string>('Exceptional STEM Problem Solving & Participation');
  const [teacherNote, setTeacherNote] = useState<string>('');
  const [awardSuccessMsg, setAwardSuccessMsg] = useState<string | null>(null);

  // Class Quests / Challenges State
  const [classChallenges, setClassChallenges] = useState([
    {
      id: 'quest-1',
      title: 'Cohort 80%+ Attendance Sprint',
      category: 'Attendance',
      targetText: '80% Class Average',
      currentValue: Math.round(allStudents.reduce((a, b) => a + b.attendance, 0) / Math.max(1, allStudents.length)),
      targetValue: 80,
      rewardXp: 300,
      icon: '🎯',
      isCompleted: Math.round(allStudents.reduce((a, b) => a + b.attendance, 0) / Math.max(1, allStudents.length)) >= 80,
    },
    {
      id: 'quest-2',
      title: 'Class 400-Hour Weekly Study Target',
      category: 'Discipline',
      targetText: '400 Total Hours',
      currentValue: allStudents.reduce((a, b) => a + b.studyHours, 0),
      targetValue: 400,
      rewardXp: 500,
      icon: '⏱️',
      isCompleted: allStudents.reduce((a, b) => a + b.studyHours, 0) >= 400,
    },
    {
      id: 'quest-3',
      title: 'Math & Physics Mastery Blitz',
      category: 'Academic',
      targetText: '75% Pass Rate',
      currentValue: Math.round(
        (allStudents.filter((s) => (s.examScores.Math || 0) >= 70).length / Math.max(1, allStudents.length)) * 100
      ),
      targetValue: 75,
      rewardXp: 400,
      icon: '📐',
      isCompleted: true,
    },
  ]);

  // Commendation History
  const [commendationLogs, setCommendationLogs] = useState<CommendationLog[]>([
    {
      id: 'log-1',
      studentName: allStudents[0]?.name || 'Rahul Sharma',
      studentAvatar: allStudents[0]?.avatar,
      xpAwarded: 200,
      badgeTitle: 'Top Performer',
      reason: 'Perfect 100% attendance & high exam score this term',
      timestamp: 'Today at 09:30 AM',
    },
    {
      id: 'log-2',
      studentName: allStudents[1]?.name || 'Ananya Iyer',
      studentAvatar: allStudents[1]?.avatar,
      xpAwarded: 150,
      badgeTitle: 'Math Scholar',
      reason: 'Outstanding contribution during calculus group problem solving',
      timestamp: 'Yesterday at 03:15 PM',
    },
  ]);

  // Leaderboard Filtering / Sorting
  const [leaderboardFilter, setLeaderboardFilter] = useState<'all' | 'topStreak' | 'highAttendance'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const triggerConfetti = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e?.currentTarget) {
      e.currentTarget.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(1.12)' },
          { transform: 'scale(0.95)' },
          { transform: 'scale(1)' },
        ],
        {
          duration: 400,
          easing: 'ease-in-out',
        }
      );
    }
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.6 },
    });
  };

  const handleAwardRecognition = (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudent = allStudents.find((s) => s.studentId === selectedStudentId);
    if (!targetStudent) return;

    const pointsToAward = awardType === 'badge' ? 150 : Number(customXp) || xpPreset;
    const selectedBadgeObj = ALL_ACHIEVEMENT_BADGES.find((b) => b.id === selectedBadgeId);

    // Award Points
    if (awardType === 'xp' || awardType === 'both') {
      awardStudentPoints(selectedStudentId, pointsToAward, awardReason);
    }

    // Award Badge
    if (awardType === 'badge' || awardType === 'both') {
      if (selectedBadgeObj) {
        awardStudentBadge(selectedStudentId, selectedBadgeObj.id, selectedBadgeObj.title);
      }
    }

    // Add Commendation Log
    const newLog: CommendationLog = {
      id: `cmd-${Date.now()}`,
      studentName: targetStudent.name,
      studentAvatar: targetStudent.avatar,
      xpAwarded: pointsToAward,
      badgeTitle: awardType !== 'xp' ? selectedBadgeObj?.title : undefined,
      reason: teacherNote.trim() ? `${awardReason} - "${teacherNote.trim()}"` : awardReason,
      timestamp: 'Just now',
    };
    setCommendationLogs((prev) => [newLog, ...prev]);

    triggerConfetti();
    setAwardSuccessMsg(`Successfully awarded +${pointsToAward} XP to ${targetStudent.name}!`);
    setTeacherNote('');

    setTimeout(() => {
      setAwardSuccessMsg(null);
    }, 4000);
  };

  // Quick Inline Award from Leaderboard
  const handleQuickAward = (studentId: string, studentName: string) => {
    awardStudentPoints(studentId, 100, 'Teacher Quick Commendation');
    triggerConfetti();
    setCommendationLogs((prev) => [
      {
        id: `cmd-${Date.now()}`,
        studentName,
        studentAvatar: allStudents.find((s) => s.studentId === studentId)?.avatar,
        xpAwarded: 100,
        reason: 'Fast Faculty Commendation',
        timestamp: 'Just now',
      },
      ...prev,
    ]);
  };

  // Calculations for Teacher KPIs
  const totalClassXp = allStudents.reduce((acc, s) => acc + (s.xp || 0), 0);
  const avgClassLevel =
    allStudents.length > 0
      ? (allStudents.reduce((acc, s) => acc + (s.level || 1), 0) / allStudents.length).toFixed(1)
      : '1.0';
  const studentsWithStreaks = allStudents.filter((s) => (s.streak || 0) >= 3).length;
  const totalBadgesEarnedClass = allStudents.reduce((acc, s) => acc + (s.badges?.length || 0), 0);

  const sortedStudents = [...allStudents]
    .filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;
      if (leaderboardFilter === 'topStreak') return (s.streak || 0) >= 3;
      if (leaderboardFilter === 'highAttendance') return s.attendance >= 85;
      return true;
    })
    .sort((a, b) => (b.xp || 0) - (a.xp || 0));

  // Student specific store / perk items
  const [unlockedPerks, setUnlockedPerks] = useState<Record<string, boolean>>({});
  const [hasCheckedInToday, setHasCheckedInToday] = useState<boolean>(false);
  const [cheeredStudents, setCheeredStudents] = useState<Record<string, boolean>>({});

  const handleDailyCheckIn = () => {
    if (hasCheckedInToday) return;
    setHasCheckedInToday(true);
    awardStudentPoints(student.studentId, 50, 'Daily Scholar Streak Check-In');
    triggerConfetti();
  };

  const handleUnlockPerk = (perkId: string, perkName: string, cost: number) => {
    if (unlockedPerks[perkId]) return;
    if ((student.xp || 0) < cost) {
      alert(`You need ${cost} XP to unlock "${perkName}". Keep studying and maintaining streaks!`);
      return;
    }
    setUnlockedPerks((prev) => ({ ...prev, [perkId]: true }));
    triggerConfetti();
  };

  const handleCheerPeer = (peerId: string, peerName: string) => {
    if (cheeredStudents[peerId]) return;
    setCheeredStudents((prev) => ({ ...prev, [peerId]: true }));
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  // If Student role, render student-centric view
  if (!isTeacher) {
    const currentXp = student.xp || 0;
    const currentLevel = student.level || 1;
    const nextLevelXp = (currentLevel + 1) * 500;
    const progressToNext = Math.min(100, Math.round((currentXp / nextLevelXp) * 100));

    const scholarPerks = [
      { id: 'perk-1', title: "Dean's List Profile Aura", icon: '✨', cost: 300, desc: 'Special glowing avatar border in class directory' },
      { id: 'perk-2', title: 'AI Copilot Deep Brain', icon: '🧠', cost: 250, desc: 'Unlocks extended calculus & quantum physics solutions' },
      { id: 'perk-3', title: 'Golden Scholar Badge Pin', icon: '🌟', cost: 500, desc: 'Prominent badge displayed on all report exports' },
      { id: 'perk-4', title: 'STEM Champion Certificate', icon: '📜', cost: 600, desc: 'Official downloadable PDF commendation' },
    ];

    return (
      <div className="space-y-6">
        {/* Student View Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/60 p-6 sm:p-7 rounded-3xl shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 uppercase tracking-wider border border-indigo-100">
                My Learning Journey & Gamification Hub
              </span>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">
                🔥 {student.streak || 0} Day Streak
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A2E] tracking-tight">
              My XP, Badges & Class Standings
            </h1>
            <p className="text-xs sm:text-sm text-[#9B9BB8] font-bold mt-1 max-w-2xl">
              Earn XP by maintaining high attendance, completing daily study schedules, and keeping up learning streaks!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleDailyCheckIn}
              disabled={hasCheckedInToday}
              className={`flex items-center justify-center gap-2 font-bold text-xs px-5 py-3 rounded-2xl shadow-md transition-all shrink-0 cursor-pointer ${
                hasCheckedInToday
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                  : 'clay-btn text-white'
              }`}
            >
              {hasCheckedInToday ? (
                <>
                  <Check className="w-4 h-4" /> Checked In Today (+50 XP)
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 fill-amber-300 text-amber-300" /> Daily Check-In (+50 XP)
                </>
              )}
            </button>

            <button
              onClick={triggerConfetti}
              className="p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200/70 transition-all cursor-pointer shadow-2xs"
              title="Celebrate Streaks"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Student Stats Deck */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 space-y-2 border-l-4 border-l-indigo-600">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#9B9BB8]">Total Earned XP</span>
              <Zap className="w-4.5 h-4.5 text-amber-500" />
            </div>
            <div className="text-3xl font-black text-[#1A1A2E] leading-none">
              {currentXp} <span className="text-sm font-bold text-[#9B9BB8]">XP</span>
            </div>
            <p className="text-[11px] text-[#9B9BB8] font-bold">Level {currentLevel} Scholar Standing</p>
          </div>

          <div className="glass-card p-5 space-y-2 border-l-4 border-l-purple-600">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#9B9BB8]">Next Level Progress</span>
              <Trophy className="w-4.5 h-4.5 text-purple-600" />
            </div>
            <div className="text-3xl font-black text-[#1A1A2E] leading-none">
              {progressToNext}%
            </div>
            <p className="text-[11px] text-[#9B9BB8] font-bold">{Math.max(0, nextLevelXp - currentXp)} XP to Level {currentLevel + 1}</p>
          </div>

          <div className="glass-card p-5 space-y-2 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#9B9BB8]">Active Study Streak</span>
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <div className="text-3xl font-black text-[#1A1A2E] leading-none">
              {student.streak || 0} <span className="text-sm font-bold text-[#9B9BB8]">Days</span>
            </div>
            <p className="text-[11px] text-[#9B9BB8] font-bold">Consistent daily revision</p>
          </div>

          <div className="glass-card p-5 space-y-2 border-l-4 border-l-emerald-600">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#9B9BB8]">Badges Unlocked</span>
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-[#1A1A2E] leading-none">
              {(student.badges || []).length} <span className="text-sm font-bold text-[#9B9BB8]">Badges</span>
            </div>
            <p className="text-[11px] text-[#9B9BB8] font-bold">Across STEM categories</p>
          </div>
        </div>

        {/* Scholar Perks & Rewards Store */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-black text-[#1A1A2E] uppercase tracking-wider">
                  Scholar Rewards & Perks Vault
                </h3>
                <p className="text-xs text-[#9B9BB8] font-bold">
                  Redeem earned XP for study upgrades, honor roll aura, and academic recognitions
                </p>
              </div>
            </div>
            <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Your Balance: {currentXp} XP
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {scholarPerks.map((perk) => {
              const isUnlocked = !!unlockedPerks[perk.id];
              const canAfford = currentXp >= perk.cost;

              return (
                <div
                  key={perk.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isUnlocked
                      ? 'bg-emerald-50/70 border-emerald-200'
                      : 'bg-white border-slate-200/70 hover:border-indigo-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-2xl p-2 rounded-xl bg-slate-50 border border-slate-100">{perk.icon}</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {perk.cost} XP
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-xs text-[#1A1A2E] mb-1">{perk.title}</h4>
                    <p className="text-[11px] text-[#9B9BB8] font-medium leading-relaxed">{perk.desc}</p>
                  </div>

                  <button
                    onClick={() => handleUnlockPerk(perk.id, perk.title, perk.cost)}
                    disabled={isUnlocked}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isUnlocked
                        ? 'bg-emerald-600 text-white cursor-default'
                        : canAfford
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-sm'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isUnlocked ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked & Active
                      </>
                    ) : canAfford ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5" /> Unlock Perk
                      </>
                    ) : (
                      `Need ${perk.cost - currentXp} more XP`
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Badges interactive component */}
        <Badges
          student={student}
          onClaimXp={(xpReward) => {
            awardStudentPoints(student.studentId, xpReward, 'Achievement Badge Reward');
            triggerConfetti();
          }}
        />

        {/* Student View Class Leaderboard */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black text-sm text-[#1A1A2E] tracking-wider uppercase flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                Class STEM Leaderboard & Standings
              </h3>
              <p className="text-xs text-[#9B9BB8] font-bold mt-0.5">
                Climb the ranks by studying consistently, answering smart notes quizzes, and maintaining perfect attendance.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#1A1A2E] outline-none focus:ring-2 focus:ring-indigo-500 w-36 sm:w-44"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {sortedStudents.map((st, rank) => (
              <div
                key={st.studentId}
                className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${
                  st.studentId === student.studentId
                    ? 'bg-indigo-50/70 border-indigo-200 shadow-xs ring-1 ring-indigo-200'
                    : 'bg-white border-slate-200/60 hover:border-indigo-100 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                      rank === 0
                        ? 'bg-amber-400 text-white shadow-xs'
                        : rank === 1
                        ? 'bg-slate-300 text-slate-800'
                        : rank === 2
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    #{rank + 1}
                  </div>
                  <img
                    src={st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={st.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-white shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-extrabold text-[#1A1A2E] text-sm leading-none mb-1 truncate">
                      {st.name} {st.studentId === student.studentId && '(You)'}
                    </div>
                    <div className="text-[10px] text-[#9B9BB8] font-black uppercase tracking-wider flex items-center gap-2">
                      <span>{st.class}</span>
                      <span>•</span>
                      <span className="text-indigo-600">Level {st.level} Scholar</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-amber-600">
                        <Flame className="w-3 h-3 fill-amber-500" /> {st.streak || 0}d
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 text-xs font-black uppercase tracking-wider shrink-0">
                  <span className="text-indigo-600">{st.xp || 0} XP</span>
                  <span className="text-emerald-600 hidden sm:inline">{st.attendance}% Att</span>

                  {st.studentId !== student.studentId && (
                    <button
                      onClick={() => handleCheerPeer(st.studentId, st.name)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                        cheeredStudents[st.studentId]
                          ? 'bg-amber-50 text-amber-700 border-amber-200 cursor-default'
                          : 'bg-slate-50 hover:bg-indigo-50 text-slate-700 border-slate-200 hover:border-indigo-200'
                      }`}
                    >
                      {cheeredStudents[st.studentId] ? '🙌 Cheered' : '👏 Cheer'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // ── TEACHER GAMIFICATION COMMAND & RECOGNITION HUB ──
  // ═════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/60 p-6 sm:p-7 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-black px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 uppercase tracking-wider border border-indigo-100">
              Classroom Motivation & Recognition Engine
            </span>
            <span className="text-[10px] font-bold text-[#9B9BB8] uppercase tracking-wider">
              Faculty Command Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A2E] tracking-tight">
            Class Gamification & Recognition Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#9B9BB8] font-bold mt-1 max-w-2xl">
            Distribute merit XP, grant official achievement badges, launch cohort study quests, and celebrate student perseverance.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={triggerConfetti}
            className="flex items-center justify-center gap-2 clay-btn font-bold text-xs px-5 py-3 rounded-xl shadow-md transition-all shrink-0 cursor-pointer focus-ring"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Celebrate Class Milestones 🎉</span>
          </button>
        </div>
      </div>

      {/* Cohort Key Engagement Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="glass-card p-5 space-y-2 border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#9B9BB8]">Total Class XP</span>
            <Zap className="w-4.5 h-4.5 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-[#1A1A2E] leading-tight">
            {totalClassXp.toLocaleString()} <span className="text-xs font-bold text-indigo-600">XP</span>
          </div>
          <p className="text-[11px] text-[#9B9BB8] font-bold">Accumulated across {allStudents.length} students</p>
        </div>

        <div className="glass-card p-5 space-y-2 border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#9B9BB8]">Average Scholar Level</span>
            <Trophy className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-[#1A1A2E] leading-tight">
            Lvl {avgClassLevel}
          </div>
          <p className="text-[11px] text-[#9B9BB8] font-bold">Standard Grade 11 target: Level 3.0</p>
        </div>

        <div className="glass-card p-5 space-y-2 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#9B9BB8]">Active Study Streaks</span>
            <Flame className="w-4.5 h-4.5 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-3xl font-black text-[#1A1A2E] leading-tight">
            {studentsWithStreaks} / {allStudents.length}
          </div>
          <p className="text-[11px] text-[#9B9BB8] font-bold">
            {Math.round((studentsWithStreaks / Math.max(1, allStudents.length)) * 100)}% maintaining 3+ day grind
          </p>
        </div>

        <div className="glass-card p-5 space-y-2 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#9B9BB8]">Badges Distributed</span>
            <Award className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-[#1A1A2E] leading-tight">
            {totalBadgesEarnedClass}
          </div>
          <p className="text-[11px] text-[#9B9BB8] font-bold">Class-wide STEM achievements unlocked</p>
        </div>
      </div>

      {/* Main Grid: Award Merit Form + Classroom Quests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Faculty Merit Awarding Station */}
        <div className="lg:col-span-7 glass-card p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-sm">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#1A1A2E]">Award Merit XP & Achievement Badges</h3>
                <p className="text-[10px] text-[#9B9BB8] font-bold">Directly recognize student performance and effort</p>
              </div>
            </div>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-black px-2.5 py-1 rounded-full border border-indigo-100">
              Faculty Tool
            </span>
          </div>

          {awardSuccessMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{awardSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleAwardRecognition} className="space-y-4">
            {/* Target Student Selector */}
            <div>
              <label className="block text-xs font-bold text-[#4A4A6A] mb-1.5">
                Select Recipient Student
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-[#1A1A2E] rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {allStudents.map((st) => (
                  <option key={st.studentId} value={st.studentId}>
                    {st.name} — {st.class} ({st.xp || 0} XP • Lvl {st.level})
                  </option>
                ))}
              </select>
            </div>

            {/* Award Type Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => setAwardType('xp')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  awardType === 'xp'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ⚡ Award XP Points
              </button>
              <button
                type="button"
                onClick={() => setAwardType('badge')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  awardType === 'badge'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🏆 Grant Badge
              </button>
              <button
                type="button"
                onClick={() => setAwardType('both')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  awardType === 'both'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ✨ Both (XP + Badge)
              </button>
            </div>

            {/* XP Amount Selector (if XP or Both) */}
            {(awardType === 'xp' || awardType === 'both') && (
              <div>
                <label className="block text-xs font-bold text-[#4A4A6A] mb-1.5">
                  XP Commendation Amount
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[50, 100, 150, 250].map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => {
                        setXpPreset(pts);
                        setCustomXp(String(pts));
                      }}
                      className={`py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                        Number(customXp) === pts
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      +{pts} XP
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={customXp}
                  onChange={(e) => setCustomXp(e.target.value)}
                  placeholder="Custom XP (e.g. 200)"
                  className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-[#1A1A2E] rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Badge Selector (if Badge or Both) */}
            {(awardType === 'badge' || awardType === 'both') && (
              <div>
                <label className="block text-xs font-bold text-[#4A4A6A] mb-1.5">
                  Select Achievement Badge to Grant
                </label>
                <select
                  value={selectedBadgeId}
                  onChange={(e) => setSelectedBadgeId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-[#1A1A2E] rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {ALL_ACHIEVEMENT_BADGES.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.icon} {b.title} — ({b.rarity} • {b.requirementText})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Commendation Category Preset */}
            <div>
              <label className="block text-xs font-bold text-[#4A4A6A] mb-1.5">
                Recognition Category
              </label>
              <select
                value={awardReason}
                onChange={(e) => setAwardReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-[#1A1A2E] rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="Exceptional STEM Problem Solving & Participation">
                  🌟 Exceptional STEM Problem Solving & Participation
                </option>
                <option value="Perfect 100% Attendance & Punctuality Week">
                  🎯 Perfect 100% Attendance & Punctuality Week
                </option>
                <option value="Consistent Study Habits & Habit Discipline">
                  📚 Consistent Study Habits & Habit Discipline
                </option>
                <option value="Peer Tutoring & Collaborative Mentorship">
                  🤝 Peer Tutoring & Collaborative Mentorship
                </option>
                <option value="Remarkable Mid-Term Exam Score Recovery">
                  📈 Remarkable Mid-Term Exam Score Recovery
                </option>
                <option value="Outstanding Science Project & Innovation">
                  💡 Outstanding Science Project & Innovation
                </option>
              </select>
            </div>

            {/* Optional Teacher Note */}
            <div>
              <label className="block text-xs font-bold text-[#4A4A6A] mb-1.5">
                Faculty Note / Evaluation Praise (Optional)
              </label>
              <input
                type="text"
                value={teacherNote}
                onChange={(e) => setTeacherNote(e.target.value)}
                placeholder="e.g. Great job leading the calculus study group today!"
                className="w-full bg-slate-50 border border-slate-200 text-xs font-medium text-[#1A1A2E] rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-black shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer focus-ring"
            >
              <Send className="w-4 h-4" />
              <span>Grant Student Commendation & Points</span>
            </button>
          </form>
        </div>

        {/* Right Column: Classroom Quests & Live Feed */}
        <div className="lg:col-span-5 space-y-6">
          {/* Class Quests & Cohort Challenges */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-black text-[#1A1A2E] uppercase tracking-wider">
                  Active Class Quests
                </h3>
              </div>
              <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                3 Active
              </span>
            </div>

            <div className="space-y-3">
              {classChallenges.map((quest) => {
                const progressPct = Math.min(100, Math.round((quest.currentValue / quest.targetValue) * 100));
                return (
                  <div
                    key={quest.id}
                    className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{quest.icon}</span>
                        <div>
                          <div className="font-extrabold text-xs text-[#1A1A2E]">{quest.title}</div>
                          <div className="text-[10px] text-[#9B9BB8] font-bold">{quest.category} Cohort Target</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md border border-indigo-100">
                        +{quest.rewardXp} XP
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-[10px] font-black mb-1">
                        <span className="text-slate-600">
                          {quest.currentValue} / {quest.targetValue} ({quest.targetText})
                        </span>
                        <span className={quest.isCompleted ? 'text-emerald-600' : 'text-indigo-600'}>
                          {progressPct}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            quest.isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Commendation Activity Feed */}
          <div className="glass-card p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-black text-[#1A1A2E] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Faculty Recognition Logs
              </h3>
              <span className="text-[10px] text-[#9B9BB8] font-bold">Live Feed</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {commendationLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={log.studentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={log.studentName}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-extrabold text-[#1A1A2E] text-xs truncate">
                        {log.studentName}
                      </div>
                      <div className="text-[10px] text-[#9B9BB8] font-medium truncate">
                        {log.reason}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 block">
                      +{log.xpAwarded} XP
                    </span>
                    <span className="text-[9px] text-[#9B9BB8] font-bold block mt-0.5">{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Classroom Leaderboard & Merit Standings */}
      <div className="glass-card p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-black text-sm sm:text-base text-[#1A1A2E] tracking-tight flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              Classroom Academic Leaderboard & Student Merit Roster
            </h3>
            <p className="text-xs text-[#9B9BB8] font-bold mt-0.5">
              Rankings based on active XP, attendance rate, study consistency, and unlocked badges
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#1A1A2E] outline-none focus:ring-2 focus:ring-indigo-500 w-40 sm:w-48"
              />
            </div>
            <select
              value={leaderboardFilter}
              onChange={(e) => setLeaderboardFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-[#1A1A2E] rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
            >
              <option value="all">All Students</option>
              <option value="topStreak">Active Streaks (3+ days)</option>
              <option value="highAttendance">High Attendance (85%+)</option>
            </select>
          </div>
        </div>

        {/* Table / List */}
        <div className="space-y-2.5">
          {sortedStudents.map((st, rank) => (
            <div
              key={st.studentId}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/70 hover:border-indigo-200 transition-all shadow-2xs gap-3"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Rank Badge */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                    rank === 0
                      ? 'bg-amber-400 text-white shadow-xs'
                      : rank === 1
                      ? 'bg-slate-300 text-slate-800'
                      : rank === 2
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  #{rank + 1}
                </div>

                <img
                  src={st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={st.name}
                  className="w-11 h-11 rounded-full object-cover border border-slate-200 bg-white shrink-0"
                />

                <div className="min-w-0">
                  <div className="font-extrabold text-[#1A1A2E] text-sm leading-none mb-1 truncate">
                    {st.name}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#9B9BB8] font-bold">
                    <span>{st.class}</span>
                    <span>•</span>
                    <span className="text-indigo-600 font-extrabold">Lvl {st.level} Scholar</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-600">
                      <Flame className="w-3 h-3 fill-amber-500" /> {st.streak || 0}d streak
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats & Quick Action */}
              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-right">
                  <div className="text-sm font-black text-indigo-700">{st.xp || 0} XP</div>
                  <div className="text-[10px] font-bold text-emerald-600">{st.attendance}% Attendance</div>
                </div>

                <button
                  onClick={() => handleQuickAward(st.studentId, st.name)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/70 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  title="Quick Award +100 XP"
                >
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>+100 XP</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Class Badge Catalog & Distribution Overview */}
      <div className="glass-card p-6 sm:p-7 space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-black text-sm text-[#1A1A2E] uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4.5 h-4.5 text-indigo-600" />
            Class Badge Distribution & Curriculum Achievements
          </h3>
          <p className="text-xs text-[#9B9BB8] font-bold mt-0.5">
            Monitor which achievement badges students have earned across academic, attendance, and persistence categories.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_ACHIEVEMENT_BADGES.slice(0, 9).map((badge) => {
            const holders = allStudents.filter((s) => (s.badges || []).some((b) => b.id === badge.id));
            const holderPct = Math.round((holders.length / Math.max(1, allStudents.length)) * 100);

            return (
              <div
                key={badge.id}
                className="p-4 rounded-2xl bg-white border border-slate-200/70 hover:border-indigo-200 transition-all space-y-3 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{badge.icon}</span>
                    <div>
                      <div className="font-extrabold text-xs text-[#1A1A2E]">{badge.title}</div>
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {badge.rarity}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                    +{badge.xpReward} XP
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 font-medium line-clamp-2">
                  {badge.requirementText}
                </p>

                {/* Holders Count */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-500">
                    Earned by <strong className="text-indigo-600">{holders.length}</strong> / {allStudents.length} students
                  </span>
                  <span className="text-indigo-600 font-extrabold">{holderPct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};



