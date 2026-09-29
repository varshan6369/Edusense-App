import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  Flame,
  Moon,
  Sun,
  Users,
  Filter,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Calendar,
  Layers,
  BarChart3,
  Lightbulb,
  CheckCircle2,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface WeeklyStudyHeatmapProps {
  students: Student[];
  onSelectStudent?: (studentId: string) => void;
}

export type HeatmapMetric = 'hours' | 'density' | 'efficiency';
export type ViewType = 'matrix' | 'dailyDistribution' | 'studentRoster';

interface TimeSlot {
  id: string;
  label: string;
  shortLabel: string;
  period: 'morning' | 'afternoon' | 'evening' | 'night';
}

const DAYS_OF_WEEK = [
  { key: 'Mon', full: 'Monday', short: 'M' },
  { key: 'Tue', full: 'Tuesday', short: 'Tu' },
  { key: 'Wed', full: 'Wednesday', short: 'W' },
  { key: 'Thu', full: 'Thursday', short: 'Th' },
  { key: 'Fri', full: 'Friday', short: 'F' },
  { key: 'Sat', full: 'Saturday', short: 'Sa' },
  { key: 'Sun', full: 'Sunday', short: 'Su' },
];

const TIME_SLOTS: TimeSlot[] = [
  { id: '06-08', label: '06:00 – 08:00', shortLabel: '6 - 8 AM', period: 'morning' },
  { id: '08-10', label: '08:00 – 10:00', shortLabel: '8 - 10 AM', period: 'morning' },
  { id: '10-12', label: '10:00 – 12:00', shortLabel: '10 - 12 PM', period: 'morning' },
  { id: '12-14', label: '12:00 – 14:00', shortLabel: '12 - 2 PM', period: 'afternoon' },
  { id: '14-17', label: '14:00 – 17:00', shortLabel: '2 - 5 PM', period: 'afternoon' },
  { id: '17-20', label: '17:00 – 20:00', shortLabel: '5 - 8 PM', period: 'evening' },
  { id: '20-23', label: '20:00 – 23:00', shortLabel: '8 - 11 PM', period: 'evening' },
  { id: '23-02', label: '23:00 – 02:00', shortLabel: '11 PM - 2 AM', period: 'night' },
];

const SUBJECTS_LIST = ['All Subjects', 'Math', 'Physics', 'Chemistry', 'English', 'Computer Science'];

// Deterministic seed helper
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export const WeeklyStudyHeatmap: React.FC<WeeklyStudyHeatmapProps> = ({
  students,
  onSelectStudent,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('All Subjects');
  const [metricMode, setMetricMode] = useState<HeatmapMetric>('hours');
  const [activeView, setActiveView] = useState<ViewType>('matrix');
  const [hoveredCell, setHoveredCell] = useState<{
    day: string;
    dayFull: string;
    slot: TimeSlot;
    hours: number;
    activeCount: number;
    densityPct: number;
    topSubject: string;
    activeStudents: { name: string; hours: number; avatar?: string }[];
  } | null>(null);
  const [pinnedCell, setPinnedCell] = useState<{
    day: string;
    dayFull: string;
    slot: TimeSlot;
    hours: number;
    activeCount: number;
    densityPct: number;
    topSubject: string;
    activeStudents: { name: string; hours: number; avatar?: string }[];
  } | null>(null);

  const activeInspectionCell = hoveredCell || pinnedCell;

  // Compute heatmap matrix values
  const { matrixData, maxHoursInCell, totalCohortStudyHours, peakWindow, nightOwlVolumePct, weekendVolumePct } = useMemo(() => {
    const activeStudentsList = selectedStudentId === 'all'
      ? students
      : students.filter((s) => s.studentId === selectedStudentId);

    // Subject multiplier
    const subjectMultiplier = selectedSubject === 'All Subjects' ? 1 : 0.45;

    // Grid mapping: [dayIndex][slotIndex]
    const grid: {
      day: string;
      dayFull: string;
      slot: TimeSlot;
      hours: number;
      activeCount: number;
      densityPct: number;
      topSubject: string;
      activeStudents: { name: string; hours: number; avatar?: string }[];
    }[][] = [];

    let overallMaxHours = 0.1;
    let sumTotalHours = 0;
    let nightHours = 0;
    let weekendHours = 0;
    let peakCell: { day: string; slotLabel: string; slotShortLabel: string; hours: number } = {
      day: 'Tuesday',
      slotLabel: '17:00 – 20:00',
      slotShortLabel: '5 - 8 PM',
      hours: 0,
    };

    DAYS_OF_WEEK.forEach((dayObj, dayIdx) => {
      const dayRow: typeof grid[0] = [];
      const isWeekend = dayObj.key === 'Sat' || dayObj.key === 'Sun';

      TIME_SLOTS.forEach((slot, slotIdx) => {
        let cellHours = 0;
        const activeInCell: { name: string; hours: number; avatar?: string }[] = [];

        activeStudentsList.forEach((st) => {
          const seed = hashString(`${st.studentId}-${dayObj.key}-${slot.id}`);
          const rand = (seed % 100) / 100;

          // Baseline weight based on slot and student profile
          let timeWeight = 0.05;
          if (slot.period === 'morning') {
            timeWeight = isWeekend ? 0.12 : (slot.id === '06-08' ? 0.06 : 0.14);
          } else if (slot.period === 'afternoon') {
            timeWeight = isWeekend ? 0.22 : 0.18;
          } else if (slot.period === 'evening') {
            timeWeight = isWeekend ? 0.25 : 0.38; // Prime study hours
          } else if (slot.period === 'night') {
            // High night weight for students with low sleep
            const nightOwlFactor = st.sleepHours < 6.5 ? 0.28 : 0.08;
            timeWeight = isWeekend ? nightOwlFactor * 1.3 : nightOwlFactor;
          }

          // Individual student weekly study ratio allocation
          const studentWeeklyHours = st.studyHours || 14;
          const studentSlotHours = Number(((studentWeeklyHours / 7) * timeWeight * (0.8 + rand * 0.5) * subjectMultiplier).toFixed(1));

          if (studentSlotHours > 0.15) {
            cellHours += studentSlotHours;
            activeInCell.push({
              name: st.name,
              hours: studentSlotHours,
              avatar: st.avatar,
            });
          }
        });

        cellHours = Number(cellHours.toFixed(1));
        if (cellHours > overallMaxHours) overallMaxHours = cellHours;
        sumTotalHours += cellHours;

        if (slot.period === 'night') {
          nightHours += cellHours;
        }
        if (isWeekend) {
          weekendHours += cellHours;
        }

        if (cellHours > peakCell.hours) {
          peakCell = {
            day: dayObj.full,
            slotLabel: slot.label,
            slotShortLabel: slot.shortLabel,
            hours: cellHours,
          };
        }

        // Determine dominant subject in slot
        const subIndex = (dayIdx + slotIdx) % 5;
        const topSubject = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English Literature'][subIndex];

        dayRow.push({
          day: dayObj.key,
          dayFull: dayObj.full,
          slot,
          hours: cellHours,
          activeCount: activeInCell.length,
          densityPct: activeStudentsList.length > 0 ? Math.round((activeInCell.length / activeStudentsList.length) * 100) : 0,
          topSubject,
          activeStudents: activeInCell.sort((a, b) => b.hours - a.hours),
        });
      });

      grid.push(dayRow);
    });

    return {
      matrixData: grid,
      maxHoursInCell: overallMaxHours,
      totalCohortStudyHours: Math.round(sumTotalHours),
      peakWindow: peakCell,
      nightOwlVolumePct: sumTotalHours > 0 ? Math.round((nightHours / sumTotalHours) * 100) : 0,
      weekendVolumePct: sumTotalHours > 0 ? Math.round((weekendHours / sumTotalHours) * 100) : 0,
    };
  }, [students, selectedStudentId, selectedSubject]);

  // Color Intensity helper
  const getCellBgClass = (hours: number, density: number) => {
    if (metricMode === 'density') {
      if (density === 0) return 'bg-slate-100/70 border-slate-200/50 text-slate-400';
      if (density < 25) return 'bg-indigo-50 border-indigo-100 text-indigo-700';
      if (density < 50) return 'bg-indigo-200 border-indigo-300 text-indigo-800';
      if (density < 75) return 'bg-indigo-400 border-indigo-500 text-white font-bold';
      return 'bg-indigo-600 border-indigo-700 text-white font-black shadow-sm';
    }

    // Default Hours mode
    const ratio = hours / (maxHoursInCell || 1);
    if (hours === 0 || ratio < 0.05) return 'bg-slate-100/70 border-slate-200/50 text-slate-400';
    if (ratio < 0.25) return 'bg-emerald-50 border-emerald-100 text-emerald-700';
    if (ratio < 0.50) return 'bg-emerald-200 border-emerald-300 text-emerald-800';
    if (ratio < 0.75) return 'bg-emerald-400 border-emerald-500 text-slate-900 font-bold';
    return 'bg-emerald-600 border-emerald-700 text-white font-black shadow-sm shadow-emerald-500/20';
  };

  // Day totals for the side column
  const dayTotals = useMemo(() => {
    return matrixData.map((dayRow) => {
      const totalHours = dayRow.reduce((acc, c) => acc + c.hours, 0);
      const avgDensity = Math.round(dayRow.reduce((acc, c) => acc + c.densityPct, 0) / dayRow.length);
      return {
        day: dayRow[0].day,
        dayFull: dayRow[0].dayFull,
        totalHours: Number(totalHours.toFixed(1)),
        avgDensity,
      };
    });
  }, [matrixData]);

  // Hourly totals for the bottom summary
  const slotTotals = useMemo(() => {
    return TIME_SLOTS.map((slot, sIdx) => {
      let totalSlotHours = 0;
      let totalDensity = 0;
      matrixData.forEach((dayRow) => {
        totalSlotHours += dayRow[sIdx].hours;
        totalDensity += dayRow[sIdx].densityPct;
      });
      return {
        slot,
        totalHours: Number(totalSlotHours.toFixed(1)),
        avgDensity: Math.round(totalDensity / matrixData.length),
      };
    });
  }, [matrixData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card p-6 space-y-6"
    >
      {/* ── Header & Key Controls ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-[#1A1A2E] tracking-tight">
              Weekly Study Activity Heatmap
            </h3>
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
              Live Pulse
            </span>
          </div>
          <p className="text-xs text-[#9B9BB8] font-medium">
            Monitor when students concentrate their revision, identify peak study windows, and spot late-night burnout risk.
          </p>
        </div>

        {/* View & Filter Toggles */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Student Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="text-xs font-bold text-[#1A1A2E] bg-transparent outline-none cursor-pointer pr-1"
            >
              <option value="all">Entire Cohort ({students.length} Students)</option>
              {students.map((st) => (
                <option key={st.studentId} value={st.studentId}>
                  {st.name} ({st.studyHours}h/wk)
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="text-xs font-bold text-[#1A1A2E] bg-transparent outline-none cursor-pointer pr-1"
            >
              {SUBJECTS_LIST.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          {/* Metric Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setMetricMode('hours')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                metricMode === 'hours'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-[#9B9BB8] hover:text-[#1A1A2E]'
              }`}
            >
              Study Hours
            </button>
            <button
              onClick={() => setMetricMode('density')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                metricMode === 'density'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-[#9B9BB8] hover:text-[#1A1A2E]'
              }`}
            >
              % Active
            </button>
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveView('matrix')}
              title="Matrix Grid View"
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === 'matrix' ? 'bg-white text-indigo-600 shadow-xs' : 'text-[#9B9BB8]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveView('dailyDistribution')}
              title="Daily Distribution Bar View"
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === 'dailyDistribution' ? 'bg-white text-indigo-600 shadow-xs' : 'text-[#9B9BB8]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveView('studentRoster')}
              title="Student Study Habits View"
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === 'studentRoster' ? 'bg-white text-indigo-600 shadow-xs' : 'text-[#9B9BB8]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Metric Snapshot Highlights Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/20">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#9B9BB8]">
              Peak Study Window
            </span>
            <p className="text-xs font-black text-[#1A1A2E] leading-tight">
              {peakWindow.day}s ({peakWindow.slotLabel})
            </p>
            <span className="text-[10px] font-bold text-indigo-600">{peakWindow.hours} hrs logged</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#9B9BB8]">
              Weekly Total Logged
            </span>
            <p className="text-sm font-black text-[#1A1A2E] leading-tight">
              {totalCohortStudyHours} Hours
            </p>
            <span className="text-[10px] font-bold text-emerald-600">
              Avg {(totalCohortStudyHours / (selectedStudentId === 'all' ? students.length : 1)).toFixed(1)}h / student
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20">
            <Sun className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#9B9BB8]">
              Weekend Volume
            </span>
            <p className="text-sm font-black text-[#1A1A2E] leading-tight">{weekendVolumePct}%</p>
            <span className="text-[10px] font-bold text-amber-600">Sat & Sun Revision</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-purple-500/20">
            <Moon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#9B9BB8]">
              Late Night (11PM-2AM)
            </span>
            <p className="text-sm font-black text-[#1A1A2E] leading-tight">{nightOwlVolumePct}%</p>
            <span className="text-[10px] font-bold text-purple-600">Burnout Surveillance</span>
          </div>
        </div>
      </div>

      {/* ── Main View Content ── */}
      <AnimatePresence mode="wait">
        {activeView === 'matrix' && (
          <motion.div
            key="matrix-view"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Heatmap Legend */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-[#9B9BB8] uppercase tracking-wider">
                  Intensity ({metricMode === 'hours' ? 'Study Hours' : '% Cohort Active'}):
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-bold">Low</span>
                  <div className="w-4 h-4 rounded bg-slate-100 border border-slate-200/60" />
                  <div className={`w-4 h-4 rounded ${metricMode === 'hours' ? 'bg-emerald-100 border-emerald-200' : 'bg-indigo-100 border-indigo-200'}`} />
                  <div className={`w-4 h-4 rounded ${metricMode === 'hours' ? 'bg-emerald-300 border-emerald-400' : 'bg-indigo-300 border-indigo-400'}`} />
                  <div className={`w-4 h-4 rounded ${metricMode === 'hours' ? 'bg-emerald-500 border-emerald-600' : 'bg-indigo-500 border-indigo-600'}`} />
                  <div className={`w-4 h-4 rounded ${metricMode === 'hours' ? 'bg-emerald-700 border-emerald-800' : 'bg-indigo-700 border-indigo-800'}`} />
                  <span className="text-[10px] text-slate-700 font-bold">Peak</span>
                </div>
              </div>
              <div className="text-[11px] text-[#9B9BB8] font-medium italic">
                💡 Hover over any time slot to inspect active students & dominant subjects
              </div>
            </div>

            {/* Heatmap Grid Matrix Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-xs">
              <div className="min-w-[760px] p-4">
                {/* Header Row: Time Slots */}
                <div className="grid grid-cols-10 gap-2 pb-3 mb-2 border-b border-slate-100 text-center">
                  <div className="col-span-1 text-left text-[11px] font-black uppercase tracking-wider text-[#9B9BB8] flex items-center">
                    Day / Time
                  </div>
                  {TIME_SLOTS.map((slot) => (
                    <div key={slot.id} className="col-span-1 flex flex-col items-center justify-center">
                      <span className="text-[11px] font-black text-[#1A1A2E] leading-none">
                        {slot.shortLabel}
                      </span>
                      <span className="text-[9px] text-[#9B9BB8] font-semibold mt-0.5 capitalize">
                        {slot.period}
                      </span>
                    </div>
                  ))}
                  <div className="col-span-1 text-right text-[11px] font-black uppercase tracking-wider text-[#9B9BB8] pr-1">
                    Day Total
                  </div>
                </div>

                {/* Day Rows */}
                <div className="space-y-2">
                  {matrixData.map((dayRow, dayIdx) => {
                    const dayTotal = dayTotals[dayIdx];
                    const isWeekend = dayRow[0].day === 'Sat' || dayRow[0].day === 'Sun';

                    return (
                      <div key={dayRow[0].day} className="grid grid-cols-10 gap-2 items-center">
                        {/* Day Label */}
                        <div className="col-span-1 flex items-center gap-1.5">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                              isWeekend
                                ? 'bg-amber-100/70 text-amber-800 border border-amber-200/60'
                                : 'bg-slate-100 text-[#1A1A2E]'
                            }`}
                          >
                            {dayRow[0].day}
                          </span>
                          <span className="text-xs font-bold text-[#1A1A2E] hidden sm:inline">
                            {dayRow[0].dayFull}
                          </span>
                        </div>

                        {/* 8 Time Slot Cells */}
                        {dayRow.map((cell) => {
                          const bgClass = getCellBgClass(cell.hours, cell.densityPct);
                          const isHovered = hoveredCell?.day === cell.day && hoveredCell?.slot.id === cell.slot.id;
                          const isPinned = pinnedCell?.day === cell.day && pinnedCell?.slot.id === cell.slot.id;
                          const isCurrentActive = isHovered || isPinned;

                          return (
                            <div
                              key={cell.slot.id}
                              className="col-span-1 relative"
                              onMouseEnter={() => setHoveredCell(cell)}
                              onMouseLeave={() => setHoveredCell(null)}
                              onClick={() => {
                                setPinnedCell((prev) =>
                                  prev?.day === cell.day && prev?.slot.id === cell.slot.id ? null : cell
                                );
                              }}
                            >
                              <div
                                className={`h-11 rounded-xl border flex flex-col items-center justify-center transition-all duration-150 cursor-pointer p-1 text-center select-none ${bgClass} ${
                                  isCurrentActive
                                    ? 'ring-2 ring-indigo-500 ring-offset-1 z-10 shadow-md scale-[1.04]'
                                    : 'hover:scale-[1.03] hover:shadow-xs'
                                }`}
                              >
                                {metricMode === 'hours' ? (
                                  <>
                                    <span className="text-xs leading-none font-bold">
                                      {cell.hours > 0 ? `${cell.hours}h` : '—'}
                                    </span>
                                    {cell.activeCount > 0 && (
                                      <span className="text-[9px] opacity-80 leading-none mt-1">
                                        {cell.activeCount} stu
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <span className="text-xs leading-none font-bold">
                                      {cell.densityPct > 0 ? `${cell.densityPct}%` : '—'}
                                    </span>
                                    {cell.activeCount > 0 && (
                                      <span className="text-[9px] opacity-80 leading-none mt-1">
                                        {cell.activeCount} active
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Day Total Column */}
                        <div className="col-span-1 text-right pr-1">
                          <span className="text-xs font-black text-[#1A1A2E] block leading-none">
                            {dayTotal.totalHours}h
                          </span>
                          <span className="text-[9px] text-[#9B9BB8] font-bold">
                            {dayTotal.avgDensity}% avg
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Row: Hourly Cohort Aggregate */}
                <div className="grid grid-cols-10 gap-2 pt-3 mt-3 border-t border-slate-100 text-center items-center">
                  <div className="col-span-1 text-left text-[10px] font-black uppercase tracking-wider text-[#9B9BB8]">
                    Time Sum
                  </div>
                  {slotTotals.map((st) => (
                    <div key={st.slot.id} className="col-span-1">
                      <span className="text-xs font-black text-[#1A1A2E] block leading-none">
                        {st.totalHours}h
                      </span>
                      <span className="text-[9px] text-indigo-600 font-bold">
                        {st.avgDensity}%
                      </span>
                    </div>
                  ))}
                  <div className="col-span-1 text-right pr-1">
                    <span className="text-xs font-black text-emerald-600">
                      {totalCohortStudyHours}h
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stable Zero-Shift Inspector Bar (Prevents Layout Jumping on Hover/Scroll) */}
            <div className="min-h-[84px] p-4 rounded-2xl bg-slate-900 text-white shadow-lg border border-slate-800 transition-all">
              {activeInspectionCell ? (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                        {activeInspectionCell.dayFull} ({activeInspectionCell.slot.label})
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-semibold capitalize border border-slate-700">
                        {activeInspectionCell.slot.period} Window
                      </span>
                      {pinnedCell && (
                        <span className="text-[10px] bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-md font-bold">
                          Pinned Slot
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-200">
                      {activeInspectionCell.hours} Total Logged Hours • {activeInspectionCell.activeCount} Active Students ({activeInspectionCell.densityPct}% participation)
                    </p>
                    <p className="text-xs text-slate-400">
                      Primary Subject Focus: <strong className="text-indigo-300">{activeInspectionCell.topSubject}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Active Student Avatars */}
                    {activeInspectionCell.activeStudents.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">
                          Top Active:
                        </span>
                        <div className="flex items-center -space-x-2">
                          {activeInspectionCell.activeStudents.slice(0, 5).map((st, i) => (
                            <div
                              key={i}
                              title={`${st.name} (${st.hours} hrs)`}
                              className="w-7 h-7 rounded-full bg-indigo-600 border-2 border-slate-900 overflow-hidden shrink-0"
                            >
                              <img
                                src={st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                                alt={st.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                        {activeInspectionCell.activeStudents.length > 5 && (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded-full border border-slate-700">
                            +{activeInspectionCell.activeStudents.length - 5}
                          </span>
                        )}
                      </div>
                    )}

                    {pinnedCell && (
                      <button
                        onClick={() => setPinnedCell(null)}
                        className="px-2.5 py-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                      >
                        Unpin
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-slate-300">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 text-indigo-400 flex items-center justify-center shrink-0 border border-slate-700">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white tracking-wide uppercase">
                        Interactive Time Slot Inspector
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Hover or click any slot above to inspect active student volume, subject concentration, and hourly volume without jumping.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-[11px] font-bold text-amber-300">
                      ⚡ Peak: {peakWindow.day} ({peakWindow.slotShortLabel || peakWindow.slotLabel}) • {peakWindow.hours}h
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Daily Distribution Bar View ── */}
        {activeView === 'dailyDistribution' && (
          <motion.div
            key="dist-view"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3.5">
              {matrixData.map((dayRow, dIdx) => {
                const totalDayHours = dayRow.reduce((a, c) => a + c.hours, 0);
                const isWeekend = dayRow[0].day === 'Sat' || dayRow[0].day === 'Sun';

                return (
                  <div
                    key={dayRow[0].day}
                    className={`p-4 rounded-2xl border ${
                      isWeekend
                        ? 'bg-amber-50/40 border-amber-200/60'
                        : 'bg-white border-slate-200/80'
                    } flex flex-col justify-between space-y-4`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-[#1A1A2E] uppercase">
                          {dayRow[0].dayFull}
                        </span>
                        <span className="text-xs font-black text-indigo-600">
                          {totalDayHours.toFixed(1)}h
                        </span>
                      </div>
                      <span className="text-[10px] text-[#9B9BB8] font-bold">
                        {Math.round((totalDayHours / totalCohortStudyHours) * 100)}% of weekly volume
                      </span>
                    </div>

                    {/* Hourly Mini Bars */}
                    <div className="space-y-1.5">
                      {dayRow.map((cell) => (
                        <div key={cell.slot.id} className="space-y-0.5">
                          <div className="flex items-center justify-between text-[9px] font-bold text-slate-500">
                            <span>{cell.slot.shortLabel}</span>
                            <span>{cell.hours}h</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                cell.slot.period === 'evening'
                                  ? 'bg-indigo-500'
                                  : cell.slot.period === 'night'
                                  ? 'bg-purple-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, (cell.hours / (maxHoursInCell || 1)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── Student Study Habits Table View ── */}
        {activeView === 'studentRoster' && (
          <motion.div
            key="roster-view"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.25 }}
            className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white"
          >
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-[#9B9BB8]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Weekly Study Load</th>
                  <th className="py-3 px-4">Preferred Study Window</th>
                  <th className="py-3 px-4">Night Owl Tendency</th>
                  <th className="py-3 px-4">Sleep vs Study Balance</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {students.map((st) => {
                  const isNightOwl = st.sleepHours < 6.0 && st.studyHours > 12;
                  const preferredWindow =
                    st.studyHours > 18 ? 'Evening & Late Night (18:00 - 01:00)' :
                    st.attendance > 90 ? 'Afternoon Focus (14:00 - 19:00)' :
                    'Scattered Weekend Sessions';

                  return (
                    <tr key={st.studentId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={st.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-black text-[#1A1A2E]">{st.name}</p>
                            <p className="text-[10px] text-[#9B9BB8]">{st.rollNumber} • {st.class}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-black text-[#1A1A2E]">
                        <span className="text-indigo-600 font-black">{st.studyHours} hrs</span> / week
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-bold text-slate-700">{preferredWindow}</span>
                      </td>
                      <td className="py-3 px-4">
                        {isNightOwl ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-50 text-red-700 border border-red-200">
                            <AlertCircle className="w-3 h-3 text-red-500" /> High (Late Night)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Balanced
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-bold text-slate-600">
                          {st.sleepHours}h sleep / {st.studyHours}h study
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedStudentId(st.studentId);
                            setActiveView('matrix');
                          }}
                          className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          View Heatmap
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── AI Teacher Insights & Actionable Recommendations ── */}
      <div className="p-4.5 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-white border border-indigo-100/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/20">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-black text-[#1A1A2E] tracking-tight">
                AI Pedagogical Recommendation
              </span>
              <span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-2 py-0.2 rounded-full">
                Optimal Assignment Timing
              </span>
            </div>
            <p className="text-xs text-[#4A4A6A] font-medium leading-relaxed">
              Cohort engagement reaches its peak velocity between <strong>17:00 and 20:00 on Tuesday & Thursday</strong>.
              Schedule collaborative quizzes and release challenging STEM practice problems during this window for maximum completion rates.
            </p>
          </div>
        </div>

        <button
          onClick={() => setSelectedSubject(selectedSubject === 'All Subjects' ? 'Math' : 'All Subjects')}
          className="px-3.5 py-2 rounded-xl bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs font-black transition-all cursor-pointer shrink-0 shadow-2xs flex items-center gap-1.5"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          {selectedSubject === 'All Subjects' ? 'Filter Math Revision' : 'Reset Subject Filter'}
        </button>
      </div>
    </motion.div>
  );
};
