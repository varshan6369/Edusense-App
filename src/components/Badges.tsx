import React, { useState } from 'react';
import { Badge, Student } from '../types';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Award,
  Trophy,
  Zap,
  Lock,
  CheckCircle2,
  Sparkles,
  Search,
  Flame,
  Star,
  ShieldCheck,
  Clock,
  ChevronRight,
  X,
  Gift,
} from 'lucide-react';

interface BadgesProps {
  student: Student;
  onClaimXp?: (bonusXp: number) => void;
}

export interface AchievementBadge extends Badge {
  category: 'academic' | 'attendance' | 'engagement' | 'mastery' | 'goggins';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Savage';
  progress: number; // 0 to 100
  isEarned: boolean;
  xpReward: number;
  requirementText: string;
  isGogginsSpecial?: boolean;
}

export const ALL_ACHIEVEMENT_BADGES: AchievementBadge[] = [
  {
    id: 'badge-boats-and-logs',
    title: 'Carried the Boats & Logs',
    description: "Who's gonna carry the boats?! Completed 10+ hours of continuous intense study in Stay Hard mode.",
    icon: '🪵',
    category: 'goggins',
    rarity: 'Savage',
    progress: 100,
    isEarned: true,
    unlockedAt: '2026-08-09',
    xpReward: 1000,
    requirementText: 'Log 10+ hours in Stay Hard mode',
    isGogginsSpecial: true,
  },
  {
    id: 'badge-accountability-mirror',
    title: 'Accountability Mirror',
    description: 'Looked in the mirror, refused to accept excuses, and asked Goggins AI 5+ savage questions.',
    icon: '🪞',
    category: 'goggins',
    rarity: 'Epic',
    progress: 100,
    isEarned: true,
    unlockedAt: '2026-08-10',
    xpReward: 500,
    requirementText: 'Consult Goggins AI Coach 5 times',
    isGogginsSpecial: true,
  },
  {
    id: 'badge-soul-taker',
    title: 'Soul Taker',
    description: 'Took souls on exam day by dominating tough material with pure, relentless grit.',
    icon: '🔥',
    category: 'goggins',
    rarity: 'Savage',
    progress: 85,
    isEarned: false,
    xpReward: 750,
    requirementText: 'Score 90%+ in a high-difficulty exam',
    isGogginsSpecial: true,
  },
  {
    id: 'badge-430-am-club',
    title: '4:30 AM Grind Club',
    description: 'Completed a high-intensity study session before sunrise while everyone else slept.',
    icon: '⏰',
    category: 'goggins',
    rarity: 'Rare',
    progress: 100,
    isEarned: true,
    unlockedAt: '2026-08-08',
    xpReward: 350,
    requirementText: 'Complete a study plan before 6:00 AM',
    isGogginsSpecial: true,
  },
  {
    id: 'badge-savage-streak',
    title: 'Savage 14-Day Streak',
    description: 'Maintained a 14-day zero-excuses active study streak. No days off!',
    icon: '⚡',
    category: 'goggins',
    rarity: 'Epic',
    progress: 100,
    isEarned: true,
    unlockedAt: '2026-08-07',
    xpReward: 600,
    requirementText: 'Achieve 14-day continuous active study streak',
    isGogginsSpecial: true,
  },
  {
    id: 'badge-early-bird',
    title: 'Early Bird',
    description: 'Consistently log in before 8:00 AM and maintain high morning attendance.',
    icon: '🌅',
    category: 'attendance',
    rarity: 'Common',
    progress: 100,
    isEarned: true,
    unlockedAt: '2026-08-01',
    xpReward: 100,
    requirementText: 'Maintain 80%+ morning attendance rate',
  },
  {
    id: 'badge-top-performer',
    title: 'Top Performer',
    description: 'Score 85%+ in average across all academic subjects.',
    icon: '🌟',
    category: 'academic',
    rarity: 'Legendary',
    progress: 100,
    isEarned: true,
    unlockedAt: '2026-08-05',
    xpReward: 300,
    requirementText: 'Achieve 85%+ overall exam average score',
  },
  {
    id: 'badge-streak-master',
    title: 'Streak Master',
    description: 'Maintain a continuous 7-day study logging streak.',
    icon: '🔥',
    category: 'engagement',
    rarity: 'Rare',
    progress: 100,
    isEarned: true,
    unlockedAt: '2026-08-07',
    xpReward: 200,
    requirementText: 'Achieve 7-day study streak',
  },
  {
    id: 'badge-math-scholar',
    title: 'Math Scholar',
    description: 'Score 80%+ in Mathematics exams and practice quizzes.',
    icon: '📐',
    category: 'academic',
    rarity: 'Epic',
    progress: 90,
    isEarned: true,
    unlockedAt: '2026-08-03',
    xpReward: 250,
    requirementText: 'Score 80%+ in Mathematics',
  },
  {
    id: 'badge-ai-explorer',
    title: 'AI Explorer',
    description: 'Interacted with the EduSense AI Copilot for 10+ learning queries.',
    icon: '🤖',
    category: 'engagement',
    rarity: 'Common',
    progress: 100,
    isEarned: true,
    unlockedAt: '2026-08-08',
    xpReward: 150,
    requirementText: 'Ask AI Copilot 10 educational questions',
  },
  {
    id: 'badge-night-owl',
    title: 'Night Owl',
    description: 'Maintained 7.5+ hours of healthy sleep while balancing study routines.',
    icon: '🦉',
    category: 'mastery',
    rarity: 'Rare',
    progress: 85,
    isEarned: true,
    unlockedAt: '2026-08-04',
    xpReward: 180,
    requirementText: 'Average 7.5+ sleep hours per night',
  },
  {
    id: 'badge-goal-crusher',
    title: 'Goal Crusher',
    description: 'Complete a full 7-Day AI-Generated Weekly Study Plan.',
    icon: '🎯',
    category: 'mastery',
    rarity: 'Epic',
    progress: 60,
    isEarned: false,
    xpReward: 250,
    requirementText: 'Complete all tasks in a weekly study plan',
  },
  {
    id: 'badge-perfectionist',
    title: 'Perfectionist',
    description: 'Score a perfect 100% on any practice quiz assessment.',
    icon: '👑',
    category: 'academic',
    rarity: 'Legendary',
    progress: 40,
    isEarned: false,
    xpReward: 500,
    requirementText: 'Achieve 100% on a smart practice test',
  },
];

const getRarityBadgeStyle = (rarity: AchievementBadge['rarity']) => {
  switch (rarity) {
    case 'Savage':
      return 'bg-amber-600 text-white font-bold shadow-sm';
    case 'Legendary':
      return 'bg-gradient-to-r from-amber-500 to-yellow-400 text-white shadow-amber-500/20';
    case 'Epic':
      return 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/20';
    case 'Rare':
      return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-blue-500/20';
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200';
  }
};

export const Badges: React.FC<BadgesProps> = ({ student, onClaimXp }) => {
  const { isGogginsMode } = useTheme();
  const [activeFilter, setActiveFilter] = useState<'all' | 'earned' | 'locked' | 'legendary' | 'goggins'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(null);
  const [claimedRewards, setClaimedRewards] = useState<Record<string, boolean>>({});

  const earnedBadgeCount = ALL_ACHIEVEMENT_BADGES.filter((b) => b.isEarned).length;
  const totalXpEarned = ALL_ACHIEVEMENT_BADGES.filter((b) => b.isEarned).reduce((a, b) => a + b.xpReward, 0);

  const filteredBadges = ALL_ACHIEVEMENT_BADGES.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.description.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === 'earned') return b.isEarned;
    if (activeFilter === 'locked') return !b.isEarned;
    if (activeFilter === 'legendary') return b.rarity === 'Legendary' || b.rarity === 'Savage';
    if (activeFilter === 'goggins') return b.category === 'goggins' || b.isGogginsSpecial;
    return true;
  });

  const handleSelectBadge = (badge: AchievementBadge) => {
    setSelectedBadge(badge);
    if (badge.isEarned && !claimedRewards[badge.id]) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const handleClaimReward = (badge: AchievementBadge) => {
    if (claimedRewards[badge.id]) return;
    setClaimedRewards((prev) => ({ ...prev, [badge.id]: true }));
    if (onClaimXp) {
      onClaimXp(badge.xpReward);
    }
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Summary Banner ── */}
      <div className={`glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden ${
        isGogginsMode ? '!bg-slate-900/90 !border-orange-500/40 shadow-orange-950/30' : ''
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border flex items-center gap-1 ${
              isGogginsMode
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-amber-50 text-amber-600 border-amber-100'
            }`}>
              {isGogginsMode ? <Flame className="w-3.5 h-3.5 text-amber-500" /> : <Trophy className="w-3.5 h-3.5 text-amber-500" />}
              {isGogginsMode ? 'STAY HARD ACHIEVEMENTS' : 'Gamification & Achievements'}
            </span>
            <span className="text-xs text-[#9B9BB8] font-bold">
              {earnedBadgeCount} / {ALL_ACHIEVEMENT_BADGES.length} Badges Unlocked
            </span>
          </div>

          <h2 className="text-2xl font-black text-[#1A1A2E] dark:text-white tracking-tight">
            {isGogginsMode ? 'SAVAGE BATTLE BADGES 🪵🔥' : 'Virtual Achievements & Badges'}
          </h2>
          <p className={`text-xs font-medium max-w-lg mt-1 leading-relaxed ${isGogginsMode ? 'text-orange-200/80' : 'text-[#9B9BB8]'}`}>
            {isGogginsMode
              ? 'Earn Stay Hard badges by conquering marathon study sessions, asking tough questions, and taking souls on exams with zero excuses!'
              : 'Earn badges by maintaining consistent attendance, high exam scores, study streaks, and engaging with AI learning tools!'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3 z-10 shrink-0">
          <div className={`px-4 py-3 rounded-2xl border text-center transition-all ${
            isGogginsMode
              ? 'bg-slate-900 border-orange-500/40 shadow-sm text-white'
              : 'bg-white border-slate-200/80 shadow-xs'
          }`}>
            <p className={`text-[10px] font-black uppercase tracking-wider ${
              isGogginsMode ? 'text-orange-300/80' : 'text-slate-500'
            }`}>
              Total Badges
            </p>
            <p className={`text-xl font-black leading-tight ${
              isGogginsMode ? 'text-amber-400' : 'text-indigo-600'
            }`}>
              {earnedBadgeCount} / {ALL_ACHIEVEMENT_BADGES.length}
            </p>
          </div>
          <div className={`px-4 py-3 rounded-2xl border text-center transition-all ${
            isGogginsMode
              ? 'bg-slate-900 border-orange-500/40 shadow-sm text-white'
              : 'bg-white border-slate-200/80 shadow-xs'
          }`}>
            <p className={`text-[10px] font-black uppercase tracking-wider ${
              isGogginsMode ? 'text-orange-300/80' : 'text-slate-500'
            }`}>
              Badge XP Earned
            </p>
            <p className={`text-xl font-black leading-tight ${
              isGogginsMode ? 'text-orange-400' : 'text-amber-600'
            }`}>
              +{totalXpEarned} XP
            </p>
          </div>
        </div>
      </div>

      {/* ── Search and Category Filters ── */}
      <div className={`glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isGogginsMode ? '!bg-slate-900/90 !border-orange-500/40' : ''
      }`}>
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#9B9BB8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isGogginsMode ? "Search Stay Hard badges..." : "Search badges..."}
            className={`w-full border rounded-xl text-xs pl-9 pr-3 py-2 outline-none shadow-inner font-medium ${
              isGogginsMode
                ? 'bg-slate-800 border-orange-500/40 text-white placeholder-slate-400 focus:border-orange-400'
                : 'bg-slate-50 border-slate-200/60 text-[#1A1A2E] placeholder-[#8A99AD] focus-ring'
            }`}
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {(['all', 'goggins', 'earned', 'locked', 'legendary'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                activeFilter === f
                  ? isGogginsMode || f === 'goggins'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-[#9B9BB8] hover:text-[#1A1A2E] dark:hover:text-white hover:bg-slate-200'
              }`}
            >
              {f === 'all'
                ? `All (${ALL_ACHIEVEMENT_BADGES.length})`
                : f === 'goggins'
                ? `🪵 Stay Hard (${ALL_ACHIEVEMENT_BADGES.filter((b) => b.isGogginsSpecial).length})`
                : f === 'earned'
                ? `Unlocked (${earnedBadgeCount})`
                : f === 'locked'
                ? `Locked (${ALL_ACHIEVEMENT_BADGES.length - earnedBadgeCount})`
                : `Savage/Legendary (${ALL_ACHIEVEMENT_BADGES.filter((b) => b.rarity === 'Legendary' || b.rarity === 'Savage').length})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Badges Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredBadges.map((badge, index) => {
          const rarityStyle = getRarityBadgeStyle(badge.rarity);
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 24, scale: 0.93 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ type: 'spring', stiffness: 280, damping: 20, delay: Math.min(index * 0.03, 0.3) }}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectBadge(badge)}
              className={`clay-card p-4 flex flex-col items-center text-center justify-between relative cursor-pointer overflow-hidden transition-all ${
                badge.isEarned
                  ? 'border-indigo-200/80 hover:shadow-lg'
                  : 'opacity-70 grayscale hover:grayscale-0'
              }`}
            >
              {/* Top Rarity Badge */}
              <div className="w-full flex items-center justify-between mb-2">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${rarityStyle}`}>
                  {badge.rarity}
                </span>
                {badge.isEarned ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-[#9B9BB8] shrink-0" />
                )}
              </div>

              {/* Badge Icon Display */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3 my-1 relative shadow-inner ${
                badge.isEarned ? 'bg-gradient-to-br from-amber-100 via-indigo-50 to-purple-100 border border-amber-200/60' : 'bg-slate-100 border border-slate-200'
              }`}>
                <span>{badge.icon}</span>
                {badge.isEarned && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                )}
              </div>

              {/* Title & Description */}
              <h3 className="font-extrabold text-xs text-[#1A1A2E] leading-tight mb-1">
                {badge.title}
              </h3>
              <p className="text-[10px] text-[#9B9BB8] font-medium line-clamp-2 mb-3">
                {badge.description}
              </p>

              {/* Progress Bar or Earned Tag */}
              {badge.isEarned ? (
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 w-full">
                  +{badge.xpReward} XP Earned
                </span>
              ) : (
                <div className="w-full space-y-1">
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all"
                      style={{ width: `${badge.progress}%` }}
                    />
                  </div>
                  <p className="text-[9px] font-bold text-[#9B9BB8]">
                    {badge.progress}% Progress
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ── Badge Detail Modal ── */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="glass-card max-w-md w-full p-6 space-y-5 relative text-center"
            >
              <button
                onClick={() => setSelectedBadge(null)}
                className="absolute top-4 right-4 p-2 text-[#9B9BB8] hover:text-[#1A1A2E] rounded-full hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon & Rarity */}
              <div className="flex flex-col items-center">
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-3 ${getRarityBadgeStyle(selectedBadge.rarity)}`}>
                  {selectedBadge.rarity} Badge
                </span>

                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-100 via-indigo-50 to-purple-100 border-2 border-amber-300 flex items-center justify-center text-4xl shadow-lg my-2">
                  <span>{selectedBadge.icon}</span>
                </div>

                <h3 className="text-xl font-black text-[#1A1A2E] mt-2">{selectedBadge.title}</h3>
                <p className="text-xs text-[#9B9BB8] font-medium max-w-xs mt-1">
                  {selectedBadge.description}
                </p>
              </div>

              {/* Requirement & XP Reward */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-left space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#9B9BB8] font-bold">Requirement:</span>
                  <span className="font-extrabold text-[#1A1A2E]">{selectedBadge.requirementText}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#9B9BB8] font-bold">XP Bonus Reward:</span>
                  <span className="font-black text-amber-500">+{selectedBadge.xpReward} XP</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#9B9BB8] font-bold">Status:</span>
                  <span className={`font-black ${selectedBadge.isEarned ? 'text-emerald-600' : 'text-amber-500'}`}>
                    {selectedBadge.isEarned ? `Unlocked (${selectedBadge.unlockedAt || 'Recently'})` : `${selectedBadge.progress}% In Progress`}
                  </span>
                </div>
              </div>

              {/* Action */}
              {selectedBadge.isEarned ? (
                <button
                  onClick={() => handleClaimReward(selectedBadge)}
                  disabled={!!claimedRewards[selectedBadge.id]}
                  className={`w-full py-3 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                    claimedRewards[selectedBadge.id]
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'btn-primary'
                  }`}
                >
                  <Gift className="w-4 h-4" />
                  {claimedRewards[selectedBadge.id] ? 'Reward Claimed (+ XP Added!)' : `Claim +${selectedBadge.xpReward} XP Reward`}
                </button>
              ) : (
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="w-full py-3 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Keep Studying to Unlock!
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
