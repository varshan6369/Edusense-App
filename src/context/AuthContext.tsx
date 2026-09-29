import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Role, Student } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  activeStudent: Student | null;
  allStudents: Student[];
  login: (role: Role, email?: string, name?: string) => void;
  logout: () => void;
  switchRole: (role: Role) => void;
  selectStudent: (studentId: string) => void;
  refreshStudents: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  awardStudentPoints: (studentId: string, points: number, reason?: string) => void;
  awardStudentBadge: (studentId: string, badgeId: string, badgeTitle: string) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_TEACHER: UserProfile = {
  uid: 'usr-teacher-1',
  name: 'Dr. Evelyn Vance',
  email: 'evelyn.vance@edusense.edu',
  role: 'teacher',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  schoolName: 'St. Jude Academy of STEM',
  className: 'Grade 11 - Science Stream',
};

const DEFAULT_STUDENT_USER: UserProfile = {
  uid: 'usr-student-1',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@edusense.edu',
  role: 'student',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  studentId: 'STU-1001',
  schoolName: 'St. Jude Academy of STEM',
  className: 'Grade 11 - Section A',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(DEFAULT_TEACHER);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      if (data.success && data.data) {
        setAllStudents(data.data);
        if (!activeStudent && data.data.length > 0) {
          setActiveStudent(data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const selectStudent = (studentId: string) => {
    const found = allStudents.find((s) => s.studentId === studentId);
    if (found) {
      setActiveStudent(found);
      if (user?.role === 'student') {
        setUser({
          ...user,
          name: found.name,
          email: found.email,
          avatar: found.avatar || user.avatar,
          studentId: found.studentId,
        });
      }
    }
  };

  const clearScopedSessionStorage = () => {
    const sessionPattern = /(role|session|token|user|auth)/i;
    const protectedPattern = /(theme|lang|grind|kaggle|dataset|seed|config)/i;

    const clearFromStorage = (storage: Storage) => {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && sessionPattern.test(key) && !protectedPattern.test(key)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => storage.removeItem(key));
      } catch (e) {
        console.warn('Storage clear error', e);
      }
    };

    clearFromStorage(localStorage);
    clearFromStorage(sessionStorage);
  };

  const login = (role: Role, email?: string, name?: string) => {
    clearScopedSessionStorage();
    let newUser: UserProfile;
    if (role === 'teacher') {
      newUser = {
        ...DEFAULT_TEACHER,
        email: email || DEFAULT_TEACHER.email,
        name: name || DEFAULT_TEACHER.name,
      };
    } else {
      const targetStudent = activeStudent || allStudents[0];
      newUser = {
        ...DEFAULT_STUDENT_USER,
        email: email || targetStudent?.email || DEFAULT_STUDENT_USER.email,
        name: name || targetStudent?.name || DEFAULT_STUDENT_USER.name,
        studentId: targetStudent?.studentId || 'STU-1001',
        avatar: targetStudent?.avatar || DEFAULT_STUDENT_USER.avatar,
      };
    }
    setUser(newUser);
    try {
      sessionStorage.setItem('edusense_user_session', JSON.stringify(newUser));
      localStorage.setItem('edusense_auth_role', newUser.role);
    } catch {}
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    clearScopedSessionStorage();
    setUser(null);
    setIsAuthModalOpen(true);
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const switchRole = (newRole: Role) => {
    clearScopedSessionStorage();
    login(newRole);
  };

  const awardStudentPoints = (studentId: string, points: number, _reason?: string) => {
    setAllStudents((prev) =>
      prev.map((s) => {
        if (s.studentId === studentId) {
          const newXp = (s.xp || 0) + points;
          const newLevel = Math.max(1, Math.floor(newXp / 500) + 1);
          return { ...s, xp: newXp, level: newLevel };
        }
        return s;
      })
    );
    if (activeStudent && activeStudent.studentId === studentId) {
      const newXp = (activeStudent.xp || 0) + points;
      const newLevel = Math.max(1, Math.floor(newXp / 500) + 1);
      setActiveStudent((prev) => (prev ? { ...prev, xp: newXp, level: newLevel } : null));
    }
  };

  const awardStudentBadge = (studentId: string, badgeId: string, badgeTitle: string) => {
    setAllStudents((prev) =>
      prev.map((s) => {
        if (s.studentId === studentId) {
          const existingBadges = s.badges || [];
          if (!existingBadges.some((b) => b.id === badgeId)) {
            const newBadge = {
              id: badgeId,
              title: badgeTitle,
              description: `Awarded by Faculty for academic excellence.`,
              icon: '🏆',
              unlockedAt: new Date().toISOString().split('T')[0],
            };
            const newXp = (s.xp || 0) + 200;
            const newLevel = Math.max(1, Math.floor(newXp / 500) + 1);
            return { ...s, badges: [...existingBadges, newBadge], xp: newXp, level: newLevel };
          }
        }
        return s;
      })
    );
    if (activeStudent && activeStudent.studentId === studentId) {
      const existingBadges = activeStudent.badges || [];
      if (!existingBadges.some((b) => b.id === badgeId)) {
        const newBadge = {
          id: badgeId,
          title: badgeTitle,
          description: `Awarded by Faculty for academic excellence.`,
          icon: '🏆',
          unlockedAt: new Date().toISOString().split('T')[0],
        };
        const newXp = (activeStudent.xp || 0) + 200;
        const newLevel = Math.max(1, Math.floor(newXp / 500) + 1);
        setActiveStudent((prev) => (prev ? { ...prev, badges: [...existingBadges, newBadge], xp: newXp, level: newLevel } : null));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeStudent,
        allStudents,
        login,
        logout,
        switchRole,
        selectStudent,
        refreshStudents: fetchStudents,
        updateUserProfile,
        awardStudentPoints,
        awardStudentBadge,
        isAuthModalOpen,
        setIsAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
