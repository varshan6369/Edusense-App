import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage, SUPPORTED_LANGUAGES, LanguageCode } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'motion/react';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Sliders,
  Database,
  Globe,
  CheckCircle2,
  Save,
  RotateCcw,
  Sparkles,
  Download,
  AlertTriangle,
  LogOut,
  Flame,
  Volume2,
} from 'lucide-react';

interface SettingsViewProps {
  onResetData: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onResetData }) => {
  const { user, updateUserProfile, logout, activeStudent, allStudents, refreshStudents } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { gogginsAmbientAudio, setGogginsAmbientAudio, isGogginsMode } = useTheme();

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'notifications' | 'ai' | 'database'>('profile');

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [schoolName, setSchoolName] = useState(user?.schoolName || 'St. Jude Academy of STEM');
  const [className, setClassName] = useState(user?.className || 'Grade 11 - Science Stream');

  // Preferences states
  const [atRiskAlerts, setAtRiskAlerts] = useState(true);
  const [lowAttendanceWarnings, setLowAttendanceWarnings] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [offlineSync, setOfflineSync] = useState(true);
  const [aiAutoSuggestions, setAiAutoSuggestions] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (updateUserProfile) {
      updateUserProfile({
        name,
        email,
        schoolName,
        className,
      });
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTriggerReset = async () => {
    setIsResetting(true);
    try {
      await onResetData();
      await refreshStudents();
    } finally {
      setIsResetting(false);
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allStudents, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `edusense_students_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Top Banner */}
      <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 uppercase tracking-widest border border-indigo-100 flex items-center gap-1">
              <SettingsIcon className="w-3.5 h-3.5" /> System Settings & Preferences
            </span>
            <span className="text-xs text-[#9B9BB8] font-bold capitalize">
              Role: {user?.role || 'Teacher'}
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#1A1A2E] tracking-tight">
            Account & Application Preferences
          </h1>
          <p className="text-xs text-[#9B9BB8] font-medium max-w-xl mt-1 leading-relaxed">
            Manage your personal profile, notification thresholds, AI model parameters, and database seed data.
          </p>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all cursor-pointer border border-red-200/60 shadow-sm flex items-center gap-2 shrink-0"
        >
          <LogOut className="w-4 h-4" />
          Log Out of Account
        </button>
      </div>

      {/* Main Settings Panel Container */}
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        {/* Sub-tab Navigation */}
        <div className="glass-card p-3 space-y-1 self-start">
          {[
            { id: 'profile', label: 'User Profile', icon: User },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'ai', label: 'AI & Offline Sync', icon: Sliders },
            { id: 'database', label: 'Database & Reset', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-[#9B9BB8] hover:text-[#1A1A2E] hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#9B9BB8]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Content Area */}
        <div className="clay-card p-6 space-y-6">
          {savedSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Settings and user profile saved successfully!</span>
            </motion.div>
          )}

          {/* TAB 1: USER PROFILE */}
          {activeSubTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <h3 className="text-base font-black text-[#1A1A2E] mb-1">Profile Details</h3>
                <p className="text-xs text-[#9B9BB8] font-medium">Update your profile info displayed across EduSense</p>
              </div>

              <div className="flex items-center gap-4 py-2">
                <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shrink-0">
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover bg-white"
                  />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#1A1A2E]">{user?.name}</h4>
                  <p className="text-xs text-[#9B9BB8] font-bold capitalize">{user?.role} Account</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-[#1A1A2E] mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-xl text-xs px-3.5 py-2.5 text-[#1A1A2E] outline-none focus-ring font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#1A1A2E] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-xl text-xs px-3.5 py-2.5 text-[#1A1A2E] outline-none focus-ring font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#1A1A2E] mb-1.5">
                    School / Institution
                  </label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-xl text-xs px-3.5 py-2.5 text-[#1A1A2E] outline-none focus-ring font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#1A1A2E] mb-1.5">
                    Grade / Section
                  </label>
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-xl text-xs px-3.5 py-2.5 text-[#1A1A2E] outline-none focus-ring font-medium"
                  />
                </div>
              </div>

              {/* Language Selection Setting */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-extrabold text-[#1A1A2E]">Display Language</h4>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isSelected = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setLanguage(lang.code)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                            : 'bg-white text-[#1A1A2E] border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{lang.flag}</span>
                          <div>
                            <p className="text-xs font-extrabold leading-none">{lang.name}</p>
                            <p className={`text-[10px] font-medium mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-[#9B9BB8]'}`}>
                              {lang.nativeName}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl btn-primary text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" /> Save Profile Changes
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: NOTIFICATIONS */}
          {activeSubTab === 'notifications' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-black text-[#1A1A2E] mb-1">Notification & Alert Thresholds</h3>
                <p className="text-xs text-[#9B9BB8] font-medium">Configure when EduSense sends you alerts</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                  <div className="space-y-0.5">
                    <p className="text-xs font-extrabold text-[#1A1A2E]">At-Risk Student Flagging</p>
                    <p className="text-[11px] text-[#9B9BB8]">Trigger immediate alerts when student risk exceeds 50%</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={atRiskAlerts}
                    onChange={(e) => setAtRiskAlerts(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                  <div className="space-y-0.5">
                    <p className="text-xs font-extrabold text-[#1A1A2E]">Low Attendance Warnings (&lt;75%)</p>
                    <p className="text-[11px] text-[#9B9BB8]">Highlight students with attendance drop below threshold</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={lowAttendanceWarnings}
                    onChange={(e) => setLowAttendanceWarnings(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                  <div className="space-y-0.5">
                    <p className="text-xs font-extrabold text-[#1A1A2E]">Weekly Academic Digest</p>
                    <p className="text-[11px] text-[#9B9BB8]">Receive summary reports of class performance trends</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={weeklyDigest}
                    onChange={(e) => setWeeklyDigest(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI & OFFLINE SYNC */}
          {activeSubTab === 'ai' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-black text-[#1A1A2E] mb-1">AI Engine & Connectivity</h3>
                <p className="text-xs text-[#9B9BB8] font-medium">Control LLM backend features and offline database mode</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                  <div className="space-y-0.5">
                    <p className="text-xs font-extrabold text-[#1A1A2E]">Firestore Offline Persistence (IndexedDB)</p>
                    <p className="text-[11px] text-[#9B9BB8]">Cache analytics data locally for intermittent connectivity</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={offlineSync}
                    onChange={(e) => setOfflineSync(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                  <div className="space-y-0.5">
                    <p className="text-xs font-extrabold text-[#1A1A2E]">Smart Copilot Auto-Suggestions</p>
                    <p className="text-[11px] text-[#9B9BB8]">Proactively suggest study interventions based on exam drops</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={aiAutoSuggestions}
                    onChange={(e) => setAiAutoSuggestions(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                {/* Goggins High-Energy Ambient Audio Toggle (Student Mode Only) */}
                {user?.role !== 'teacher' && (
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-sm">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <Flame className="w-4 h-4 text-amber-500" />
                        High-Energy Ambient Stay Hard Audio
                      </p>
                      <p className="text-[11px] text-slate-300 font-medium max-w-md">
                        Plays high-intensity motivational focus drone & rhythm synthesizers when Stay Hard mode is active.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={gogginsAmbientAudio}
                        onChange={(e) => setGogginsAmbientAudio(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-600 peer-checked:to-red-600"></div>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: DATABASE & RESET */}
          {activeSubTab === 'database' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-black text-[#1A1A2E] mb-1">Database & Data Management</h3>
                <p className="text-xs text-[#9B9BB8] font-medium">Export student records or reset Kaggle seed data</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-extrabold text-[#1A1A2E]">Export Student Records JSON</p>
                    <p className="text-[11px] text-[#9B9BB8]">Download all {allStudents.length} student profiles and exam records</p>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="py-2 px-4 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Export JSON
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200 space-y-3">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <h4 className="text-xs font-extrabold">Reset Database to Kaggle Seed Records</h4>
                  </div>
                  <p className="text-[11px] text-red-700 font-medium">
                    Restores all student profiles, exam scores, and attendance histories to initial seed state.
                  </p>
                  <button
                    onClick={handleTriggerReset}
                    disabled={isResetting}
                    className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                  >
                    <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
                    {isResetting ? 'Resetting Data...' : 'Reset Seed Database'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
