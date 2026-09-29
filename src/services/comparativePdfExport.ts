import jsPDF from 'jspdf';
import { Student } from '../types';
import { calculateStudentPrediction } from './predictionEngine';

export interface ParentTeacherMeetingConfig {
  teacherName?: string;
  parentName?: string;
  meetingDate?: string;
  conferenceNotes?: string;
  customActionItems?: string[];
  targetGoals?: string;
}

export const generateComparativeMeetingPDF = (
  studentA: Student,
  studentB: Student,
  allStudents: Student[],
  config: ParentTeacherMeetingConfig = {}
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const predA = calculateStudentPrediction(studentA);
  const predB = calculateStudentPrediction(studentB);

  const teacher = config.teacherName || 'Academic Advisor / Grade Faculty';
  const parent = config.parentName || 'Parent / Legal Guardian';
  const dateStr = config.meetingDate || new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate subject list & averages
  const allSubjectNames = Array.from(
    new Set([
      ...Object.keys(studentA.examScores || {}),
      ...Object.keys(studentB.examScores || {}),
      ...(studentA.subjects || []).map((s) => s.subject),
      ...(studentB.subjects || []).map((s) => s.subject),
    ])
  );

  const subjectData = allSubjectNames.map((subject) => {
    const scoreA =
      studentA.examScores[subject] ??
      studentA.subjects.find((s) => s.subject.toLowerCase() === subject.toLowerCase())?.score ??
      0;
    const scoreB =
      studentB.examScores[subject] ??
      studentB.subjects.find((s) => s.subject.toLowerCase() === subject.toLowerCase())?.score ??
      0;
    const classAvg = Math.round(
      allStudents.reduce((acc, curr) => {
        const val =
          curr.examScores[subject] ??
          curr.subjects.find((s) => s.subject.toLowerCase() === subject.toLowerCase())?.score ??
          70;
        return acc + val;
      }, 0) / (allStudents.length || 1)
    );
    return { subject, scoreA, scoreB, classAvg };
  });

  const avgA = Math.round(
    (Object.values(studentA.examScores) as number[]).reduce((a, b) => a + b, 0) /
      (Object.keys(studentA.examScores).length || 1)
  );
  const avgB = Math.round(
    (Object.values(studentB.examScores) as number[]).reduce((a, b) => a + b, 0) /
      (Object.keys(studentB.examScores).length || 1)
  );

  // ──────────────── PAGE 1: EXECUTIVE BRIEF & COMPARATIVE DATA ────────────────
  // Top Banner
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, 210, 32, 'F');

  // Accent Line
  doc.setFillColor(99, 102, 241); // Indigo-500
  doc.rect(0, 32, 210, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PARENT-TEACHER CONFERENCE REPORT', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('EduSense Learning Analytics • Comparative Growth & Progress Assessment', 14, 23);
  doc.text(`Date: ${dateStr}  |  Faculty: ${teacher}`, 14, 28);

  // Document Purpose
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Conference Purpose & Student Context', 14, 43);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const purposeText = `This report provides an objective, data-informed analysis of ${studentA.name}'s academic progress, attendance consistency, and behavioral study factors in comparison with class benchmarks and peer profile (${studentB.name}). This comparative evaluation is designed to help parents and educators align on targeted support strategies.`;
  const splitPurpose = doc.splitTextToSize(purposeText, 182);
  doc.text(splitPurpose, 14, 49);

  // 2. Student Comparison Profile Matrix (Table)
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Core Academic & Behavioral Factor Matrix', 14, 66);

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, 70, 182, 7, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, 70, 182, 7, 'S');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('EVALUATION FACTOR', 16, 75);
  doc.text(`${studentA.name.toUpperCase()} (PRIMARY)`, 80, 75);
  doc.text(`${studentB.name.toUpperCase()} (COMPARISON)`, 130, 75);
  doc.text('TARGET / NORM', 172, 75);

  const factorRows = [
    {
      factor: 'Class / Roll Number',
      valA: `${studentA.class} (#${studentA.rollNumber})`,
      valB: `${studentB.class} (#${studentB.rollNumber})`,
      norm: 'Current Cohort',
    },
    {
      factor: 'Overall Mark Average',
      valA: `${avgA}%`,
      valB: `${avgB}%`,
      norm: '75.0% Class Target',
    },
    {
      factor: 'Attendance Rate',
      valA: `${studentA.attendance}% (${studentA.attendance >= 75 ? 'Good' : 'Deficient'})`,
      valB: `${studentB.attendance}% (${studentB.attendance >= 75 ? 'Good' : 'Deficient'})`,
      norm: '>= 75.0% Mandatory',
    },
    {
      factor: 'Weekly Study Hours',
      valA: `${studentA.studyHours} hours/week`,
      valB: `${studentB.studyHours} hours/week`,
      norm: '15-20 hrs/week',
    },
    {
      factor: 'Nightly Sleep Duration',
      valA: `${studentA.sleepHours} hrs (${studentA.sleepHours >= 7 ? 'Optimal' : 'Sub-optimal'})`,
      valB: `${studentB.sleepHours} hrs (${studentB.sleepHours >= 7 ? 'Optimal' : 'Sub-optimal'})`,
      norm: '7.0 - 8.5 hrs',
    },
    {
      factor: 'Student Motivation Level',
      valA: `${studentA.motivation}`,
      valB: `${studentB.motivation}`,
      norm: 'High / Sustained',
    },
    {
      factor: 'Predicted Exam Score (AI)',
      valA: `${predA.predictedExamScore}% (${predA.passProbability}% pass)`,
      valB: `${predB.predictedExamScore}% (${predB.passProbability}% pass)`,
      norm: '>= 70.0% Projected',
    },
    {
      factor: 'Academic Risk Status',
      valA: studentA.atRisk ? 'ATTENTION REQUIRED' : 'ON TRACK',
      valB: studentB.atRisk ? 'ATTENTION REQUIRED' : 'ON TRACK',
      norm: 'Low Risk',
    },
  ];

  let currentY = 77;
  factorRows.forEach((row, idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, currentY, 182, 6.5, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, currentY, 182, 6.5, 'S');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(row.factor, 16, currentY + 4.5);

    // Primary student styling
    if (row.factor === 'Academic Risk Status') {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(studentA.atRisk ? 220 : 16, studentA.atRisk ? 38 : 140, studentA.atRisk ? 38 : 60);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
    }
    doc.text(row.valA, 80, currentY + 4.5);

    // Comparison student styling
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(row.valB, 130, currentY + 4.5);

    doc.setTextColor(100, 116, 139);
    doc.text(row.norm, 172, currentY + 4.5);

    currentY += 6.5;
  });

  // 3. Subject Score Differential Table
  currentY += 6;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Subject-by-Subject Examination Performance', 14, currentY);

  currentY += 4;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, currentY, 182, 7, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, currentY, 182, 7, 'S');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('SUBJECT', 16, currentY + 5);
  doc.text(`${studentA.name.split(' ')[0]} SCORE`, 75, currentY + 5);
  doc.text(`${studentB.name.split(' ')[0]} SCORE`, 112, currentY + 5);
  doc.text('CLASS AVG', 148, currentY + 5);
  doc.text('DEVIATION', 175, currentY + 5);

  currentY += 7;
  subjectData.forEach((row, idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, currentY, 182, 6.5, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, currentY, 182, 6.5, 'S');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(row.subject, 16, currentY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text(`${row.scoreA}%`, 75, currentY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(16, 185, 129);
    doc.text(`${row.scoreB}%`, 112, currentY + 4.5);

    doc.setTextColor(100, 116, 139);
    doc.text(`${row.classAvg}%`, 148, currentY + 4.5);

    const delta = row.scoreA - row.classAvg;
    doc.setFont('helvetica', 'bold');
    if (delta >= 0) {
      doc.setTextColor(16, 140, 60);
      doc.text(`+${delta}%`, 175, currentY + 4.5);
    } else {
      doc.setTextColor(220, 38, 38);
      doc.text(`${delta}%`, 175, currentY + 4.5);
    }

    currentY += 6.5;
  });

  // Footer Page 1
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`EduSense AI Analytics • Confidential Parent-Teacher Document • Page 1 of 2`, 14, 287);
  doc.text(`Generated: ${new Date().toLocaleTimeString()}`, 170, 287);

  // ──────────────── PAGE 2: AI DIAGNOSTICS, ACTION PLAN & SIGNATURES ────────────────
  doc.addPage();

  // Top Slim Header
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 18, 'F');
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 18, 210, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`CONFERENCE ACTION PLAN & INTERVENTION STRATEGY`, 14, 12);
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Student: ${studentA.name} (${studentA.studentId})  |  Comparison: ${studentB.name}`, 130, 12);

  // 4. AI Machine Learning Key Findings
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Predictive Diagnostic Insights (Kaggle Model)', 14, 28);

  doc.setFillColor(248, 250, 252);
  doc.rect(14, 32, 182, 38, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, 32, 182, 38, 'S');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  const varianceInsight =
    Math.abs(studentA.attendance - studentB.attendance) >= 15
      ? `• Attendance Disparity: A ${Math.abs(studentA.attendance - studentB.attendance)}% attendance difference represents the single most significant factor in overall performance divergence.`
      : `• Study Routine Alignment: Study effort delta of ${Math.abs(studentA.studyHours - studentB.studyHours)} hrs/week is primary driver in STEM subject competencies.`;

  const splitVar = doc.splitTextToSize(varianceInsight, 176);
  doc.text(splitVar, 18, 39);

  const recA = `• Priority Focus for ${studentA.name}: ${predA.aiRecommendation}`;
  const splitRecA = doc.splitTextToSize(recA, 176);
  doc.text(splitRecA, 18, 49);

  const passOutlook = `• Examination Projection: Model projects a ${predA.passProbability}% pass likelihood and ${predA.riskPercentage}% risk index. Consistent weekly study of ${Math.max(studentA.studyHours + 4, 16)} hrs is recommended to ensure exam mastery.`;
  const splitPass = doc.splitTextToSize(passOutlook, 176);
  doc.text(splitPass, 18, 60);

  // 5. Parent-Teacher Agreed Collaborative Action Items
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('5. Collaborative Parent-School Action Plan', 14, 78);

  const defaultActionItems = [
    `1. Home Study Environment: Establish a structured daily study block of at least ${Math.max(studentA.studyHours + 3, 14)} hours/week free from screen distractions.`,
    `2. Attendance Recovery: Maintain 100% attendance over the next 30 days to raise cumulative attendance above the 75% threshold.`,
    `3. Subject Reinforcement: Schedule weekly teacher office hours check-in for STEM/Math practice modules.`,
    `4. Sleep & Wellness Routine: Ensure consistent 7.5+ hours of nightly sleep before examination days.`,
    `5. Parent Progress Sync: Bi-weekly email updates between parent (${parent}) and faculty (${teacher}).`,
  ];

  const actionItems =
    config.customActionItems && config.customActionItems.length > 0
      ? config.customActionItems
      : defaultActionItems;

  let actionY = 84;
  actionItems.forEach((item) => {
    doc.setFillColor(241, 245, 249);
    doc.rect(14, actionY, 182, 11, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, actionY, 182, 11, 'S');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);

    const splitItem = doc.splitTextToSize(item, 176);
    doc.text(splitItem, 18, actionY + 5.5);

    actionY += 13;
  });

  // 6. Conference Notes & Target Goals
  if (config.conferenceNotes || config.targetGoals) {
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('6. Meeting Notes & Specific Target Milestones', 14, actionY + 2);

    doc.setFillColor(254, 252, 232); // Light yellow
    doc.rect(14, actionY + 6, 182, 22, 'F');
    doc.setDrawColor(254, 240, 138);
    doc.rect(14, actionY + 6, 182, 22, 'S');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(113, 63, 18);
    const combinedNotes = `Target Goal: ${config.targetGoals || 'Achieve >= 80% mark in upcoming midterm exams and 90%+ attendance.'}\nNotes: ${config.conferenceNotes || 'Parent and faculty agreed on daily progress check-ins.'}`;
    const splitNotes = doc.splitTextToSize(combinedNotes, 176);
    doc.text(splitNotes, 18, actionY + 12);

    actionY += 32;
  } else {
    actionY += 4;
  }

  // 7. Formal Signatures & Acknowledgement
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('7. Conference Acknowledgement & Signatures', 14, actionY + 4);

  const sigY = actionY + 22;

  // Teacher Signature Line
  doc.setDrawColor(148, 163, 184);
  doc.line(16, sigY, 68, sigY);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Teacher Signature', 16, sigY + 4);
  doc.text(teacher, 16, sigY + 8);

  // Parent Signature Line
  doc.line(78, sigY, 130, sigY);
  doc.text('Parent / Guardian Signature', 78, sigY + 4);
  doc.text(parent, 78, sigY + 8);

  // Counselor / Admin Signature Line
  doc.line(140, sigY, 192, sigY);
  doc.text('Academic Counselor / Principal', 140, sigY + 4);
  doc.text(`Date: ${dateStr}`, 140, sigY + 8);

  // Footer Page 2
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`EduSense AI Analytics • Confidential Parent-Teacher Document • Page 2 of 2`, 14, 287);
  doc.text(`Verification Code: ${studentA.studentId}-CONF-${Date.now().toString().slice(-4)}`, 140, 287);

  // Save the PDF
  const filename = `${studentA.name.replace(/\s+/g, '_')}_Parent_Teacher_Meeting_Comparative_Report.pdf`;
  doc.save(filename);
};
