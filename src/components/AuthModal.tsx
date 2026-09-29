import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { LogIn, UserCheck, Shield, GraduationCap, X } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, allStudents, selectStudent, user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role>('teacher');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('STU-1001');

  const isModalVisible = isAuthModalOpen || !user;
  if (!isModalVisible) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === 'student') {
      selectStudent(selectedStudentId);
    }
    login(selectedRole, email || undefined);
  };

  const handleGoogleLogin = () => {
    if (selectedRole === 'student') {
      selectStudent(selectedStudentId);
    }
    login(selectedRole, 'google.user@edusense.edu', selectedRole === 'teacher' ? 'Dr. Evelyn Vance' : 'Rahul Sharma');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in"
      onClick={() => { if (user) setIsAuthModalOpen(false); }}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative transition-all"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Authentication modal"
      >
        {user && (
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#F1F5F9] text-[#0D2F5B] mb-3 border border-[#B7CEE0]">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#0D2F5B] dark:text-white tracking-tight">
            EduSense Authentication
          </h2>
          <p className="text-sm text-[#6D96B3] dark:text-slate-400 mt-1">
            Firebase Google & Role Portal
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-[#F1F5F9] dark:bg-slate-800 p-1.5 rounded-2xl mb-6 border border-[#E2E8F0] dark:border-slate-700">
          <button
            type="button"
            onClick={() => setSelectedRole('teacher')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all focus-ring cursor-pointer ${
              selectedRole === 'teacher'
                ? 'bg-[#145EA0] text-white shadow-sm'
                : 'text-[#6D96B3] dark:text-slate-400 hover:text-[#0D2F5B] dark:hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            Teacher Portal
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('student')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all focus-ring cursor-pointer ${
              selectedRole === 'student'
                ? 'bg-[#145EA0] text-white shadow-sm'
                : 'text-[#6D96B3] dark:text-slate-400 hover:text-[#0D2F5B] dark:hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Student View
          </button>
        </div>

        {/* If student selected, choose student profile */}
        {selectedRole === 'student' && (
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Student Profile (Kaggle Dataset)
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {allStudents.map((s) => (
                <option key={s.studentId} value={s.studentId}>
                  {s.name} ({s.studentId}) - {s.attendance}% Att, {s.examScores.Math}% Math
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-3 px-4 rounded-xl transition-all shadow-sm hover:shadow mb-4"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-900 px-3 text-slate-400">Or email login</span>
          </div>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={selectedRole === 'teacher' ? 'evelyn.vance@edusense.edu' : 'rahul.sharma@edusense.edu'}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#145EA0] hover:bg-[#0D2F5B] text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md shadow-[#145EA0]/30 hover:shadow-lg flex items-center justify-center gap-2 mt-2 focus-ring cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            Sign In as {selectedRole === 'teacher' ? 'Teacher' : 'Student'}
          </button>
        </form>
      </div>
    </div>
  );
};


