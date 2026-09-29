export type Role = 'student' | 'teacher';

export type MotivationLevel = 'High' | 'Medium' | 'Low';
export type ParentalInvolvement = 'High' | 'Medium' | 'Low';

export interface SubjectScore {
  subject: string;
  score: number;
  previousScore: number;
  classAverage: number;
}

export interface AttendanceRecord {
  month: string;
  attendanceRate: number;
  daysPresent: number;
  totalDays: number;
}

export interface Student {
  studentId: string;
  name: string;
  email: string;
  avatar?: string;
  class: string;
  rollNumber: string;
  attendance: number; // Percentage, e.g., 68
  studyHours: number; // Hours per week, e.g., 14
  sleepHours: number; // Hours per day, e.g., 6.5
  motivation: MotivationLevel;
  internetAccess: boolean;
  parentalInvolvement: ParentalInvolvement;
  extracurricular: boolean;
  examScores: Record<string, number>; // { Math: 62, Science: 78, English: 85, History: 70, Physics: 58 }
  subjects: SubjectScore[];
  attendanceHistory: AttendanceRecord[];
  xp: number;
  level: number;
  streak: number;
  badges: Badge[];
  atRisk: boolean;
  riskReason?: string;
  notes?: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  studentId?: string; // If role === 'student'
  schoolName: string;
  className?: string;
}

export interface PredictionResult {
  studentId: string;
  studentName: string;
  predictedExamScore: number;
  riskPercentage: number;
  passProbability: number;
  confidenceScore: number;
  influencingFactors: {
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    value: string;
    description: string;
  }[];
  aiRecommendation: string;
}

export interface StudyPlanDay {
  day: string;
  focusSubject: string;
  topic: string;
  durationMinutes: number;
  tasks: string[];
  priority: 'High' | 'Medium' | 'Low';
}

export interface WeeklyStudyPlan {
  studentId: string;
  studentName: string;
  generatedDate: string;
  weeklyGoal: string;
  totalTargetHours: number;
  schedule: StudyPlanDay[];
  aiAdvice: string[];
}

export interface SmartNoteQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
}

export interface SmartNoteAnalysis {
  title: string;
  summary: string[];
  keyConcepts: { concept: string; definition: string }[];
  quiz: SmartNoteQuizQuestion[];
  flashcards: Flashcard[];
}

export interface AcademicReport {
  reportId: string;
  studentId: string;
  studentName: string;
  type: 'weekly' | 'monthly' | 'parent' | 'teacher';
  date: string;
  overallGrade: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  attendanceSummary: string;
  actionItems: string[];
  predictedOutcome: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; action: string }[];
}
