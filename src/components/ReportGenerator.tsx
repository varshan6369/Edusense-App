import React, { useState } from 'react';
import { Student } from '../types';
import { calculateStudentPrediction } from '../services/predictionEngine';
import { useAuth } from '../context/AuthContext';
import { PrintButton } from './PrintButton';
import jsPDF from 'jspdf';
import {
  FileSpreadsheet,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface ReportGeneratorProps {
  student: Student;
  onSelectStudent: (id: string) => void;
  allStudents: Student[];
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  student,
  onSelectStudent,
  allStudents,
}) => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const [reportType, setReportType] = useState<'weekly' | 'parent' | 'teacher'>('parent');

  const prediction = calculateStudentPrediction(student);

  const exportPDF = () => {
    const doc = new jsPDF();

    // Header Branding
    doc.setFillColor(13, 47, 91); // #0D2F5B (Deep Blue)
    doc.rect(0, 0, 210, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('EduSense Learning Analytics Report', 14, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 140, 18);

    // Student Info Block
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Student: ${student.name}`, 14, 45);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`ID: ${student.studentId}  |  Class: ${student.class}  |  Roll #: ${student.rollNumber}`, 14, 52);

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 57, 196, 57);

    // Metrics Overview
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Academic Metrics Summary', 14, 68);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`• Attendance Rate: ${student.attendance}% (${student.attendance >= 75 ? 'Satisfactory' : 'Attention Required'})`, 14, 76);
    doc.text(`• Study Hours: ${student.studyHours} hrs/week  |  Sleep Hours: ${student.sleepHours} hrs/night`, 14, 83);
    doc.text(`• Motivation Level: ${student.motivation}  |  Parental Support: ${student.parentalInvolvement}`, 14, 90);

    // Exam Scores
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Subject Examination Scores', 14, 103);

    let yPos = 112;
    student.subjects.forEach((sub) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${sub.subject}: ${sub.score}% (Class Avg: ${sub.classAverage}%)`, 18, yPos);
      yPos += 7;
    });

    // AI Prediction & Recommendations
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Predictive Analytics & Recommendations', 14, yPos + 8);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Predicted Final Exam Score: ${prediction.predictedExamScore}%`, 14, yPos + 16);
    doc.text(`Pass Probability: ${prediction.passProbability}%`, 14, yPos + 23);

    const splitText = doc.splitTextToSize(`AI Advice: ${prediction.aiRecommendation}`, 180);
    doc.text(splitText, 14, yPos + 31);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('EduSense AI Analytics System • St. Jude Academy of STEM', 14, 285);

    doc.save(`${student.name.replace(/\s+/g, '_')}_EduSense_Report.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="accent-pill">
              Automated Document Export
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#1A1A2E] tracking-tight">
            Academic Reports & PDF Generator
          </h1>
          <p className="text-xs text-[#9B9BB8] font-semibold mt-1">
            Generate formal PDF reports for parents, teachers, and weekly progress reviews.
          </p>
        </div>

        {/* Student Selector (Teachers only; students isolated to own profile) */}
        {!isStudent ? (
          <div className="bg-slate-50/70 border border-slate-200/50 p-2.5 rounded-2xl w-full sm:w-auto shrink-0 min-w-[200px]">
            <label className="block text-[9px] font-black uppercase tracking-wider text-[#9B9BB8] mb-1">Select Student</label>
            <select
              value={student.studentId}
              onChange={(e) => onSelectStudent(e.target.value)}
              className="bg-white text-[#1A1A2E] text-xs font-bold rounded-xl px-3 py-1.5 border border-slate-200 outline-none w-full cursor-pointer"
            >
              {allStudents.map((st) => (
                <option key={st.studentId} value={st.studentId}>
                  {st.name} ({st.attendance}% Att)
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="bg-indigo-50/60 border border-indigo-100 p-3 rounded-2xl w-full sm:w-auto shrink-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 block">Student Profile</span>
            <span className="text-xs font-extrabold text-[#1A1A2E]">{student.name} ({student.studentId})</span>
          </div>
        )}
      </div>

      {/* Report Controls & Type Tabs */}
      <div className="glass-card p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/50">
          <button
            onClick={() => setReportType('parent')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all focus-ring cursor-pointer ${
              reportType === 'parent'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                : 'text-[#9B9BB8] hover:text-[#1A1A2E]'
            }`}
          >
            Parent-Teacher Report
          </button>
          <button
            onClick={() => setReportType('weekly')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all focus-ring cursor-pointer ${
              reportType === 'weekly'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                : 'text-[#9B9BB8] hover:text-[#1A1A2E]'
            }`}
          >
            Weekly Summary
          </button>
          {!isStudent && (
            <button
              onClick={() => setReportType('teacher')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all focus-ring cursor-pointer ${
                reportType === 'teacher'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                  : 'text-[#9B9BB8] hover:text-[#1A1A2E]'
              }`}
            >
              Teacher Executive
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <PrintButton label="Print Report View" variant="outline" size="md" />
          <button
            onClick={exportPDF}
            className="flex items-center justify-center gap-2 clay-btn font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all shrink-0 focus-ring cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Styled Document Sheet Preview */}
      <div className="bg-white border border-slate-200 p-8 sm:p-12 rounded-3xl shadow-xl max-w-4xl mx-auto space-y-8 font-sans">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-indigo-600/10">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#1A1A2E] tracking-tight leading-none mb-1.5">
                EduSense Learning Analytics
              </h2>
              <p className="text-xs text-[#9B9BB8] font-bold">St. Jude Academy of STEM • Academic Term 2</p>
            </div>
          </div>

          <div className="text-right text-xs text-[#9B9BB8]">
            <span className="font-black text-[#1A1A2E] block uppercase tracking-wider">
              {reportType === 'parent'
                ? 'Parent Progress Report'
                : reportType === 'weekly'
                ? 'Weekly Progress Review'
                : 'Teacher Intervention Report'}
            </span>
            <span className="font-bold">Date: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Student Profile Block */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs shadow-[inset_1px_1px_2px_rgba(0,0,0,0.01)]">
          <div>
            <span className="text-[#9B9BB8] font-black uppercase tracking-wider block mb-1">Student Name</span>
            <span className="font-black text-[#1A1A2E] text-sm leading-none">{student.name}</span>
          </div>
          <div>
            <span className="text-[#9B9BB8] font-black uppercase tracking-wider block mb-1">Student ID</span>
            <span className="font-black text-[#1A1A2E] text-sm leading-none">{student.studentId}</span>
          </div>
          <div>
            <span className="text-[#9B9BB8] font-black uppercase tracking-wider block mb-1">Class & Stream</span>
            <span className="font-black text-[#1A1A2E] text-sm leading-none">{student.class}</span>
          </div>
          <div>
            <span className="text-[#9B9BB8] font-black uppercase tracking-wider block mb-1">Risk Status</span>
            <span
              className={`font-black text-sm leading-none ${
                student.atRisk ? 'text-red-500' : 'text-emerald-500'
              }`}
            >
              {student.atRisk ? 'High Risk' : 'Satisfactory'}
            </span>
          </div>
        </div>

        {/* Performance Metrics Table */}
        <div className="space-y-3">
          <h3 className="font-black text-xs text-[#9B9BB8] uppercase tracking-wider">
            Current Factor Breakdown
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#9B9BB8] block mb-1">Attendance Rate</span>
              <span className="text-xl font-black text-indigo-600">{student.attendance}%</span>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#9B9BB8] block mb-1">Weekly Study Hours</span>
              <span className="text-xl font-black text-purple-600">{student.studyHours} hrs/wk</span>
            </div>
            <div className="p-4 bg-cyan-50 border border-cyan-100 rounded-2xl shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#9B9BB8] block mb-1">Sleep Quality</span>
              <span className="text-xl font-black text-cyan-600">{student.sleepHours} hrs/night</span>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="p-6 bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-900 border border-indigo-500/30 text-white rounded-2xl space-y-2 shadow-lg shadow-indigo-950/20">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-300" /> AI Predictive Synthesis
          </div>
          <p className="text-xs sm:text-sm text-white/95 leading-relaxed font-bold">
            {prediction.aiRecommendation}
          </p>
        </div>
      </div>
    </div>
  );
};


