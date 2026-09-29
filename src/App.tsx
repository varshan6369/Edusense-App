import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentsDirectory } from './components/StudentsDirectory';
import { AICopilotView } from './components/AICopilotDrawer';
import { AIStudyPlanner } from './components/AIStudyPlanner';
import { SmartNotes } from './components/SmartNotes';
import { ReportGenerator } from './components/ReportGenerator';
import { GamificationView } from './components/GamificationView';
import { SettingsView } from './components/SettingsView';
import { CommandPalette } from './components/CommandPalette';
import { AuthModal } from './components/AuthModal';

const mainContentVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.02,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.16, ease: [0.16, 1, 0.3, 1] },
  },
};

const childPanelVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.995 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 26,
    },
  },
};

const AppContent: React.FC = () => {
  const { user, activeStudent, allStudents, selectStudent, refreshStudents } = useAuth();
  const { setTheme, setGogginsAmbientAudio, isGogginsMode } = useTheme();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isAICopilotDrawerOpen, setIsAICopilotDrawerOpen] = useState<boolean>(false);

  const role = user?.role || 'teacher';

  // Automatically reset Goggins mode and ambient audio for teachers
  React.useEffect(() => {
    if (role === 'teacher') {
      if (isGogginsMode) {
        setTheme('light');
      }
      setGogginsAmbientAudio(false);
    }
  }, [role, isGogginsMode, setTheme, setGogginsAmbientAudio]);

  // Back-button guard: when logged out, ensure browser back button remains on clean login
  React.useEffect(() => {
    const handlePopState = () => {
      if (!user) {
        window.history.pushState(null, '', window.location.pathname);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user]);

  const handleResetData = async () => {
    if (confirm('Reset database to original Kaggle Seed records?')) {
      await fetch('/api/students/reset', { method: 'POST' });
      await refreshStudents();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#EEEEF8] text-[#1A1A2E] relative font-sans">
        <AuthModal />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row relative overflow-hidden font-sans selection:bg-indigo-600 selection:text-white p-4 gap-5 md:p-6 md:gap-6 w-full max-w-[1600px] mx-auto transition-colors duration-300 ${
      isGogginsMode ? 'bg-[#0A0C10] text-slate-100' : 'bg-[#EEEEF8] text-[#1A1A2E]'
    }`}>
      {/* Subtle ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className={`absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-3xl transition-colors duration-500 ${
          isGogginsMode
            ? 'bg-gradient-radial from-orange-600/20 to-transparent'
            : 'bg-gradient-radial from-indigo-200/30 to-transparent'
        }`} />
        <div className={`absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl transition-colors duration-500 ${
          isGogginsMode
            ? 'bg-gradient-radial from-red-600/20 to-transparent'
            : 'bg-gradient-radial from-purple-200/25 to-transparent'
        }`} />
      </div>

      {/* Left Sidebar Menu */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} role={role} />

      {/* Right Column: Navbar + Main Content */}
      <div className="flex-1 flex flex-col gap-5 md:gap-5 min-w-0 z-10 h-full overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onToggleAICopilot={() => setIsAICopilotDrawerOpen((prev) => !prev)}
          onNavigateTab={setActiveTab}
        />

        {/* Central View Content Container with Staggered Entrance Variants */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto pr-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={mainContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="h-full"
            >
              <motion.div variants={childPanelVariants} className="h-full">
                {activeTab === 'dashboard' && (
                  role === 'teacher' ? (
                    <TeacherDashboard
                      students={allStudents}
                      onSelectStudent={selectStudent}
                      onNavigateTab={setActiveTab}
                      onResetData={handleResetData}
                    />
                  ) : activeStudent ? (
                    <StudentDashboard
                      student={activeStudent}
                      onNavigateTab={setActiveTab}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 clay-card">
                      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-sm font-semibold text-[var(--text-secondary)]">Loading student profile...</p>
                    </div>
                  )
                )}

                {activeTab === 'analytics' && (
                  role === 'teacher' ? (
                    <TeacherDashboard
                      students={allStudents}
                      onSelectStudent={selectStudent}
                      onNavigateTab={setActiveTab}
                      onResetData={handleResetData}
                      initialMode="comparative"
                    />
                  ) : activeStudent ? (
                    <StudentDashboard
                      student={activeStudent}
                      onNavigateTab={setActiveTab}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 clay-card">
                      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-sm font-semibold text-[var(--text-secondary)]">Loading learning analytics...</p>
                    </div>
                  )
                )}

                {activeTab === 'students' && (
                  role === 'teacher' ? (
                    <StudentsDirectory
                      students={allStudents}
                      onSelectStudent={selectStudent}
                      onNavigateTab={setActiveTab}
                    />
                  ) : activeStudent ? (
                    <StudentDashboard
                      student={activeStudent}
                      onNavigateTab={setActiveTab}
                    />
                  ) : null
                )}

                {activeTab === 'copilot' && <AICopilotView isDrawer={false} />}

                {activeTab === 'planner' && (
                  activeStudent ? (
                    <AIStudyPlanner
                      student={activeStudent}
                      onSelectStudent={selectStudent}
                      allStudents={allStudents}
                    />
                  ) : (
                    <div className="p-8 text-center text-[var(--text-secondary)] font-semibold">Select a student profile to generate study plans.</div>
                  )
                )}

                {activeTab === 'notes' && <SmartNotes />}

                {activeTab === 'reports' && (
                  activeStudent ? (
                    <ReportGenerator
                      student={activeStudent}
                      onSelectStudent={selectStudent}
                      allStudents={allStudents}
                    />
                  ) : (
                    <div className="p-8 text-center text-[var(--text-secondary)] font-semibold">Select a student profile to generate reports.</div>
                  )
                )}

                {activeTab === 'gamification' && (
                  <GamificationView
                    student={activeStudent || allStudents[0]}
                    allStudents={allStudents}
                    role={role}
                  />
                )}

                {activeTab === 'settings' && (
                  <SettingsView onResetData={handleResetData} />
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Modals and Drawers */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setActiveTab}
        onSelectStudent={selectStudent}
      />

      <AuthModal />

      <AICopilotView
        isDrawer={true}
        isOpen={isAICopilotDrawerOpen}
        onClose={() => setIsAICopilotDrawerOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

