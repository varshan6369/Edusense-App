import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Brain,
  Calendar,
  FileText,
  Edit3,
  Calculator,
  Trophy,
  Settings,
  LogOut,
  LogIn,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  role: 'student' | 'teacher';
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, role }) => {
  const { user, activeStudent, logout, setIsAuthModalOpen } = useAuth();
  const { t } = useLanguage();
  const { isGogginsMode } = useTheme();

  const teacherMenuItems = [
    { id: 'dashboard',     label: t('dashboard'),         icon: LayoutDashboard },
    { id: 'students',      label: t('students'),          icon: Users },
    { id: 'analytics',     label: 'Analytics',            icon: BarChart3 },
    { id: 'copilot',       label: t('copilot'),           icon: Brain },
    { id: 'planner',       label: t('planner'),           icon: Calendar },
    { id: 'reports',       label: t('reports'),           icon: FileText },
    { id: 'notes',         label: t('notes'),             icon: Edit3 },
    { id: 'gamification',  label: t('gamification'),      icon: Trophy },
    { id: 'settings',      label: t('settings'),          icon: Settings },
  ];

  const studentMenuItems = [
    { id: 'dashboard',     label: t('dashboard'),         icon: LayoutDashboard },
    { id: 'analytics',     label: 'Analytics',            icon: BarChart3 },
    { id: 'copilot',       label: t('copilot'),           icon: Brain },
    { id: 'planner',       label: t('planner'),           icon: Calendar },
    { id: 'reports',       label: t('reports'),           icon: FileText },
    { id: 'notes',         label: t('notes'),             icon: Edit3 },
    { id: 'gamification',  label: t('gamification'),      icon: Trophy },
    { id: 'settings',      label: t('settings'),          icon: Settings },
  ];

  const menuItems = role === 'teacher' ? teacherMenuItems : studentMenuItems;

  const displayName = role === 'student'
    ? (activeStudent?.name || 'Varshan V')
    : (user?.name || 'Dr. Evelyn Vance');
  const displayRole = role === 'student' ? 'Student' : 'Teacher';
  const avatarSrc = role === 'student' && activeStudent?.avatar
    ? activeStudent.avatar
    : (user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');

  return (
    <aside className="w-full md:w-[220px] sidebar-card p-5 flex flex-col shrink-0 h-auto md:h-[calc(100vh-3rem)] sticky top-6">
      {/* Brand */}
      <div className="mb-7 px-1">
        <div className="flex items-center gap-2.5">
          {/* LUCIFER Logo Emblem Icon */}
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-all ${
              isGogginsMode
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-500 text-white shadow-indigo-500/30 border border-indigo-400/30'
            }`}
          >
            <Flame className="w-5 h-5 fill-current" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span
                className={`font-black text-2xl tracking-[0.16em] transition-colors ${
                  isGogginsMode ? 'text-white dark:text-white' : 'text-[#1A1A2E]'
                }`}
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                LUCIFER
              </span>
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isGogginsMode ? 'bg-amber-400 shadow-amber-500/50 shadow-sm' : 'bg-[#6366F1] shadow-indigo-500/50 shadow-sm'
                }`}
              />
            </div>
            <span
              className={`text-[9px] font-extrabold uppercase tracking-widest ${
                isGogginsMode ? 'text-amber-400/90' : 'text-indigo-600/80 dark:text-indigo-400'
              }`}
            >
              {isGogginsMode ? 'STAY HARD EDITION' : 'AI ACADEMIC COPILOT'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTabChange(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 relative group ${
                isActive
                  ? isGogginsMode
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-sm shadow-amber-500/10'
                    : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold shadow-md shadow-indigo-500/25'
                  : 'text-[#4A4A6A] hover:text-[#1A1A2E] hover:bg-slate-100/80 active:bg-slate-200/80 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive
                      ? isGogginsMode
                        ? 'text-amber-300'
                        : 'text-white'
                      : 'text-[#9B9BB8] group-hover:text-indigo-600 dark:text-slate-400'
                  }`}
                />
                <span className={`truncate ${isActive ? 'text-white font-bold' : ''}`}>{item.label}</span>
              </div>

              {'badge' in item && item.badge && (
                <span
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter shrink-0 animate-pulse-glow ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Profile Footer */}
      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-orange-500/20 space-y-2">
        {/* Profile Widget */}
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100/70 active:bg-slate-200/60 dark:hover:bg-slate-800/50 transition-colors cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 group"
        >
          <div className="flex items-center gap-3">
            {/* Gradient avatar ring */}
            <div className={`w-9 h-9 rounded-full p-[2px] shrink-0 ${
              isGogginsMode
                ? 'bg-gradient-to-tr from-orange-500 via-red-500 to-yellow-400'
                : 'bg-gradient-to-tr from-[#6366F1] via-[#8B5CF6] to-[#EC4899]'
            }`}>
              <img
                src={user ? avatarSrc : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={user ? displayName : 'Guest'}
                className="w-full h-full rounded-full object-cover bg-white"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#1A1A2E] dark:text-white truncate leading-tight">
                {user ? displayName : 'Not Logged In'}
              </p>
              <p className="text-[10px] text-[#9B9BB8] dark:text-slate-400 font-medium leading-tight mt-0.5">
                {user ? displayRole : 'Click to Sign In'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#9B9BB8] group-hover:text-[#6366F1] dark:group-hover:text-orange-400 transition-colors shrink-0" />
        </button>

        {/* Logout / Login button */}
        {user ? (
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#9B9BB8] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-orange-500/20 dark:text-orange-400 dark:hover:bg-orange-500/30 transition-colors cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <LogIn className="w-4 h-4 shrink-0" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </aside>
  );
};


