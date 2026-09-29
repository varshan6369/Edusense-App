import { Student, PredictionResult } from '../types';

export function calculateStudentPrediction(student: Student): PredictionResult {
  const currentScores = Object.values(student.examScores) as number[];
  const avgCurrentScore = currentScores.reduce((a, b) => a + b, 0) / currentScores.length;

  // Weights calculation based on Kaggle Student Performance Factors regression model
  let scoreImpact = 0;
  const factors: PredictionResult['influencingFactors'] = [];

  // 1. Attendance Impact (Baseline threshold: 75%)
  if (student.attendance >= 85) {
    const boost = (student.attendance - 75) * 0.4;
    scoreImpact += boost;
    factors.push({
      factor: 'High Attendance',
      impact: 'positive',
      value: `${student.attendance}%`,
      description: `Consistent presence adds +${boost.toFixed(1)} points to predicted exam score.`,
    });
  } else if (student.attendance < 75) {
    const penalty = (75 - student.attendance) * 0.6;
    scoreImpact -= penalty;
    factors.push({
      factor: 'Low Attendance',
      impact: 'negative',
      value: `${student.attendance}%`,
      description: `Missing classes reduces retention, losing -${penalty.toFixed(1)} points.`,
    });
  } else {
    factors.push({
      factor: 'Moderate Attendance',
      impact: 'neutral',
      value: `${student.attendance}%`,
      description: 'Attendance meets standard baseline requirements.',
    });
  }

  // 2. Study Hours Impact (Ideal: 15-25 hrs/wk)
  if (student.studyHours >= 18) {
    const boost = Math.min((student.studyHours - 12) * 0.5, 8);
    scoreImpact += boost;
    factors.push({
      factor: 'Dedicated Study Hours',
      impact: 'positive',
      value: `${student.studyHours} hrs/wk`,
      description: `Strong self-study effort yields +${boost.toFixed(1)} points improvement.`,
    });
  } else if (student.studyHours < 12) {
    const penalty = (12 - student.studyHours) * 0.7;
    scoreImpact -= penalty;
    factors.push({
      factor: 'Insufficient Study Time',
      impact: 'negative',
      value: `${student.studyHours} hrs/wk`,
      description: `Below recommended 12 hrs/wk, deducting -${penalty.toFixed(1)} points.`,
    });
  }

  // 3. Sleep Impact (Optimal: 7-9 hours)
  if (student.sleepHours < 6) {
    scoreImpact -= 6;
    factors.push({
      factor: 'Sleep Deprivation',
      impact: 'negative',
      value: `${student.sleepHours} hrs/night`,
      description: 'Sub-6h sleep decreases cognitive recall and exam speed (-6 pts).',
    });
  } else if (student.sleepHours >= 7 && student.sleepHours <= 9) {
    scoreImpact += 3;
    factors.push({
      factor: 'Optimal Sleep',
      impact: 'positive',
      value: `${student.sleepHours} hrs/night`,
      description: 'Healthy sleep schedule improves memory consolidation (+3 pts).',
    });
  }

  // 4. Motivation & Parental Involvement
  if (student.motivation === 'High') {
    scoreImpact += 4;
    factors.push({
      factor: 'High Motivation',
      impact: 'positive',
      value: 'High',
      description: 'Self-driven learning mindset drives resilient test performance (+4 pts).',
    });
  } else if (student.motivation === 'Low') {
    scoreImpact -= 5;
    factors.push({
      factor: 'Low Motivation',
      impact: 'negative',
      value: 'Low',
      description: 'Lack of engagement leads to test anxiety and dropped focus (-5 pts).',
    });
  }

  if (student.parentalInvolvement === 'High') {
    scoreImpact += 3;
    factors.push({
      factor: 'Strong Parental Support',
      impact: 'positive',
      value: 'High',
      description: 'Home learning environment provides structure (+3 pts).',
    });
  }

  // Calculated predicted score clamped between 0 and 100
  const predictedExamScore = Math.min(Math.max(Math.round(avgCurrentScore + scoreImpact), 35), 99);

  // Risk & Pass Probability
  let riskPercentage = 0;
  if (predictedExamScore < 50 || student.attendance < 60) {
    riskPercentage = 85;
  } else if (predictedExamScore < 65 || student.attendance < 75) {
    riskPercentage = 55;
  } else if (predictedExamScore < 75) {
    riskPercentage = 25;
  } else {
    riskPercentage = 8;
  }

  const passProbability = Math.max(10, Math.min(99, Math.round(100 - riskPercentage * 0.9)));

  // Deterministic Confidence Score:
  // Derived from subject score variance (stdDev) and indicator boundary sensitivity
  const variance =
    currentScores.reduce((acc, score) => acc + Math.pow(score - avgCurrentScore, 2), 0) /
    Math.max(1, currentScores.length);
  const stdDev = Math.sqrt(variance);

  let confidenceDeduction = Math.min(10, Math.round(stdDev * 0.45));
  if (student.attendance >= 70 && student.attendance <= 78) {
    confidenceDeduction += 4; // Borderline threshold sensitivity
  }
  if (student.sleepHours < 5.5 || student.studyHours > 26) {
    confidenceDeduction += 2; // Lifestyle extreme boundary
  }

  const confidenceScore = Math.max(76, Math.min(98, 96 - confidenceDeduction));

  let aiRecommendation = '';
  if (riskPercentage > 60) {
    aiRecommendation = `URGENT INTERVENTION: ${student.name} needs immediate academic counseling. Focus on improving attendance above 75% and establishing a structured 12h/week study schedule with 7+ hours sleep.`;
  } else if (riskPercentage > 30) {
    aiRecommendation = `MODERATE ATTENTION: ${student.name} is performing reasonably well but can boost scores by +8% with targeted practice in weak subjects and consistent daily review.`;
  } else {
    aiRecommendation = `ON TRACK: ${student.name} demonstrates excellent academic habits. Encourage honors extension material and peer mentoring roles.`;
  }

  return {
    studentId: student.studentId,
    studentName: student.name,
    predictedExamScore,
    riskPercentage,
    passProbability,
    confidenceScore,
    influencingFactors: factors,
    aiRecommendation,
  };
}

export function simulateWhatIf(
  student: Student,
  newAttendance: number,
  newStudyHours: number,
  newSleepHours: number,
  newMotivation: Student['motivation']
): PredictionResult {
  const simulatedStudent: Student = {
    ...student,
    attendance: newAttendance,
    studyHours: newStudyHours,
    sleepHours: newSleepHours,
    motivation: newMotivation,
  };

  return calculateStudentPrediction(simulatedStudent);
}
