import React, { useState } from 'react';
import { Student } from '../types';
import { calculateStudentPrediction } from '../services/predictionEngine';
import {
  generateComparativeMeetingPDF,
  ParentTeacherMeetingConfig,
} from '../services/comparativePdfExport';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Download,
  Printer,
  X,
  Sparkles,
  Calendar,
  User,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Clock,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Plus,
  Trash2,
} from 'lucide-react';

interface ParentTeacherMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentA: Student;
  studentB: Student;
  allStudents: Student[];
}

export const ParentTeacherMeetingModal: React.FC<ParentTeacherMeetingModalProps> = ({
  isOpen,
  onClose,
  studentA,
  studentB,
  allStudents,
}) => {
  const [teacherName, setTeacherName] = useState('Dr. Elizabeth Sterling (STEM Lead)');
  const [parentName, setParentName] = useState(`Parent / Guardian of ${studentA.name}`);
  const [meetingDate, setMeetingDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [conferenceNotes, setConferenceNotes] = useState(
    `Discussed attendance recovery strategies and established target milestones for ${studentA.name} in Math and Science.`
  );
  const [targetGoals, setTargetGoals] = useState(
    `Target: Reach 80%+ subject score in upcoming exams and improve monthly attendance to >= 85%.`
  );
  const [actionItems, setActionItems] = useState<string[]>([
    `1. Home Study: Establish a quiet 2-hour daily study block free of electronic distractions.`,
    `2. Attendance Recovery: Maintain perfect attendance for the next 4 weeks to exceed 75% threshold.`,
    `3. Weekly Math Practice: Complete 3 practice problem sets on EduSense every Thursday.`,
    `4. Parent-Faculty Check-in: Bi-weekly email updates on assignment submissions.`,
  ]);
  const [newActionItem, setNewActionItem] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'configure' | 'preview'>('configure');

  const predA = calculateStudentPrediction(studentA);
  const predB = calculateStudentPrediction(studentB);

  const handleAddActionItem = () => {
    if (!newActionItem.trim()) return;
    setActionItems([...actionItems, `${actionItems.length + 1}. ${newActionItem.trim()}`]);
    setNewActionItem('');
  };

  const handleRemoveActionItem = (idx: number) => {
    setActionItems(actionItems.filter((_, i) => i !== idx));
  };

  const handleDownloadPDF = () => {
    setIsExporting(true);
    try {
      const config: ParentTeacherMeetingConfig = {
        teacherName,
        parentName,
        meetingDate: new Date(meetingDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        conferenceNotes,
        targetGoals,
        customActionItems: actionItems,
      };
      generateComparativeMeetingPDF(studentA, studentB, allStudents, config);
    } catch (err) {
      console.error('Error generating PDF report:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Parent-Teacher Conference
                </span>
                <span className="text-xs text-slate-300 font-bold">Printable PDF Report</span>
              </div>
              <h3 className="text-lg font-black tracking-tight text-white mt-0.5">
                Comparative Progress Report for {studentA.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Sub-Header Tabs */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200/70 flex items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl">
            <button
              onClick={() => setActiveTab('configure')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'configure'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Report Details & Action Items
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Document Print Preview
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBrowserPrint}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Browser Print Preview"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black tracking-wide flex items-center gap-1.5 shadow-md shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Generating PDF...' : 'Download PDF Report'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'configure' ? (
            <div className="space-y-6">
              {/* Profile Summary Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-slate-50 to-emerald-50/70 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={studentA.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={studentA.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-500 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900">{studentA.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                        Primary Student
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Class: {studentA.class} • Attendance: <strong className="text-indigo-600">{studentA.attendance}%</strong> • Predicted Score: <strong>{predA.predictedExamScore}%</strong>
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-500 bg-white/80 px-3.5 py-2 rounded-xl border border-slate-200/60">
                  <span className="font-bold text-slate-700">Comparative Benchmark: </span>
                  <span className="font-semibold text-emerald-700">{studentB.name}</span> ({studentB.class}, {studentB.attendance}% attendance)
                </div>
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                    Teacher / Faculty Name
                  </label>
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                    placeholder="e.g. Dr. Jane Doe (Grade Head)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    Parent / Guardian Name
                  </label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                    placeholder="e.g. Mr. & Mrs. Davis"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    Conference Date
                  </label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Target Goals & Observations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Conference Focus & Target Goals
                  </label>
                  <textarea
                    rows={3}
                    value={targetGoals}
                    onChange={(e) => setTargetGoals(e.target.value)}
                    className="w-full text-xs font-medium p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none resize-none leading-relaxed"
                    placeholder="Key milestones discussed with parents..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Faculty Observations & Notes
                  </label>
                  <textarea
                    rows={3}
                    value={conferenceNotes}
                    onChange={(e) => setConferenceNotes(e.target.value)}
                    className="w-full text-xs font-medium p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none resize-none leading-relaxed"
                    placeholder="Specific academic notes discussed during meeting..."
                  />
                </div>
              </div>

              {/* Action Plan Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Agreed Parent-School Action Items (Printed on Page 2)
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Concrete steps for parent and student to follow at home
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {actionItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700 group hover:bg-slate-100/80 transition-colors"
                    >
                      <span>{item}</span>
                      <button
                        onClick={() => handleRemoveActionItem(idx)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newActionItem}
                    onChange={(e) => setNewActionItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddActionItem()}
                    placeholder="Add custom action item (e.g. Schedule weekly 30-min tutor session)..."
                    className="flex-1 text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                  />
                  <button
                    onClick={handleAddActionItem}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Document Print Preview Screen */
            <div className="space-y-6 bg-slate-100 p-6 rounded-2xl border border-slate-200/80 text-slate-900 print:p-0 print:bg-white">
              {/* Simulated Paper Sheet */}
              <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 space-y-6 max-w-3xl mx-auto">
                {/* PDF Header Mockup */}
                <div className="border-b-2 border-indigo-600 pb-4 flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                      Parent-Teacher Conference Report
                    </h2>
                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mt-0.5">
                      EduSense Comparative Learning Analytics System
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p className="font-bold text-slate-700">Date: {meetingDate}</p>
                    <p>Faculty: {teacherName}</p>
                  </div>
                </div>

                {/* Purpose */}
                <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <strong className="text-slate-800">Conference Objective: </strong>
                  Comprehensive academic review of {studentA.name} ({studentA.studentId}) with peer factor comparison against {studentB.name} to identify growth drivers and targeted home intervention strategies.
                </div>

                {/* Factor Matrix Mock Table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Core Academic & Behavioral Comparison Matrix
                  </h4>
                  <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-bold text-[11px]">
                      <tr>
                        <th className="p-2">Factor</th>
                        <th className="p-2 text-indigo-600">{studentA.name}</th>
                        <th className="p-2 text-emerald-600">{studentB.name}</th>
                        <th className="p-2 text-slate-500">Benchmark Target</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      <tr>
                        <td className="p-2 font-medium">Overall Average</td>
                        <td className="p-2 font-bold text-indigo-600">
                          {Math.round(((Object.values(studentA.examScores) as number[]).reduce((a, b) => a + b, 0)) / (Object.keys(studentA.examScores).length || 1))}%
                        </td>
                        <td className="p-2 font-bold text-emerald-600">
                          {Math.round(((Object.values(studentB.examScores) as number[]).reduce((a, b) => a + b, 0)) / (Object.keys(studentB.examScores).length || 1))}%
                        </td>
                        <td className="p-2 text-slate-500">75.0% Class Target</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Attendance Rate</td>
                        <td className="p-2 font-bold text-indigo-600">{studentA.attendance}%</td>
                        <td className="p-2 font-bold text-emerald-600">{studentB.attendance}%</td>
                        <td className="p-2 text-slate-500">&gt;= 75.0% Mandatory</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Weekly Study Time</td>
                        <td className="p-2 font-bold text-indigo-600">{studentA.studyHours} hrs/wk</td>
                        <td className="p-2 font-bold text-emerald-600">{studentB.studyHours} hrs/wk</td>
                        <td className="p-2 text-slate-500">15-20 hrs/wk</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Predicted Exam Score</td>
                        <td className="p-2 font-bold text-indigo-600">{predA.predictedExamScore}% ({predA.passProbability}% pass)</td>
                        <td className="p-2 font-bold text-emerald-600">{predB.predictedExamScore}% ({predB.passProbability}% pass)</td>
                        <td className="p-2 text-slate-500">&gt;= 70.0% Standard</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Academic Risk Status</td>
                        <td className={`p-2 font-black ${studentA.atRisk ? 'text-red-500' : 'text-emerald-600'}`}>
                          {studentA.atRisk ? 'ATTENTION REQUIRED' : 'ON TRACK'}
                        </td>
                        <td className={`p-2 font-black ${studentB.atRisk ? 'text-red-500' : 'text-emerald-600'}`}>
                          {studentB.atRisk ? 'ATTENTION REQUIRED' : 'ON TRACK'}
                        </td>
                        <td className="p-2 text-slate-500">Low Risk</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Action Items Box */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Agreed Parent-Teacher Action Plan
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    {actionItems.map((act, i) => (
                      <p key={i} className="font-medium">• {act}</p>
                    ))}
                  </div>
                </div>

                {/* Signatures */}
                <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 text-center text-xs text-slate-600">
                  <div>
                    <div className="h-8 border-b border-slate-300" />
                    <p className="mt-1 font-bold">Teacher Signature</p>
                    <p className="text-[10px] text-slate-400">{teacherName}</p>
                  </div>
                  <div>
                    <div className="h-8 border-b border-slate-300" />
                    <p className="mt-1 font-bold">Parent / Guardian</p>
                    <p className="text-[10px] text-slate-400">{parentName}</p>
                  </div>
                  <div>
                    <div className="h-8 border-b border-slate-300" />
                    <p className="mt-1 font-bold">Counselor / Admin</p>
                    <p className="text-[10px] text-slate-400">Date: {meetingDate}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500 font-medium">
            Generates a standard 2-page A4 PDF formatted with official school headers and signatures.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black tracking-wide flex items-center gap-1.5 shadow-md shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Creating PDF...' : 'Export Printable PDF'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
