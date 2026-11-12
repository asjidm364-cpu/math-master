import React, { useState } from "react";
import {
  Flame,
  Calendar,
  CheckCircle2,
  Clock,
  Zap,
  Award,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Trophy,
  ArrowRight,
  Info,
} from "lucide-react";
import { StudentProfile, StudentStreakData, DayStreakItem } from "../types";
import { StorageService } from "../utils/storage";
import { sounds } from "../utils/audio";

interface DailyStreakTrackerProps {
  profile: StudentProfile;
  practiceMode?: boolean;
  onStartTest?: () => void;
  onOpenStudyLab?: () => void;
  onOpenMistakes?: () => void;
  compact?: boolean;
}

export const DailyStreakTracker: React.FC<DailyStreakTrackerProps> = ({
  profile,
  practiceMode = false,
  onStartTest,
  onOpenStudyLab,
  onOpenMistakes,
  compact = false,
}) => {
  const streakData: StudentStreakData = StorageService.getStudentStreakData(
    profile.id,
  );
  const [selectedDay, setSelectedDay] = useState<DayStreakItem | null>(null);

  const getFlameGlowClass = (tier: string) => {
    switch (tier) {
      case "phoenix":
        return "from-amber-400 via-rose-500 to-purple-600 shadow-[0_0_25px_rgba(245,158,11,0.6)] animate-pulse";
      case "inferno":
        return "from-amber-400 via-orange-500 to-rose-600 shadow-[0_0_20px_rgba(249,115,22,0.5)] animate-pulse";
      case "blaze":
        return "from-amber-300 via-amber-500 to-orange-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]";
      case "ember":
        return "from-amber-200 via-amber-400 to-orange-400 shadow-xs";
      default:
        return "from-slate-200 to-slate-300 text-slate-400";
    }
  };

  const getFlameEmoji = (tier: string) => {
    switch (tier) {
      case "phoenix":
        return "🌟🔥";
      case "inferno":
        return "⚡🔥";
      case "blaze":
        return "🔥🔥";
      case "ember":
        return "🔥";
      default:
        return "🕯️";
    }
  };

  if (compact) {
    return (
      <div
        id="compact-daily-streak-card"
        className="p-4 rounded-3xl bg-white border-3 border-amber-900 shadow-pop-amber space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white border-2 border-amber-900 shadow-2xs">
              <Flame className="w-5 h-5 fill-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-slate-900">
                  {streakData.streakDays} Day Streak
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-950 font-mono text-[10px] font-black border border-amber-300">
                  {streakData.xpMultiplier}x XP
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-500">
                {streakData.isTodayQuotaCompleted
                  ? "✅ Quota Met Today"
                  : "⏳ Quota Pending Today"}
              </p>
            </div>
          </div>

          {/* Mini 7-day indicators */}
          <div className="flex items-center gap-1">
            {streakData.weekCalendar.map((day) => (
              <div
                key={day.dateStr}
                title={`${day.dayName} ${day.dayNumber}: ${day.isCompleted ? "Quota Completed" : "Incomplete"}`}
                className={`w-6 h-7 rounded-lg flex flex-col items-center justify-center text-[9px] font-black border transition ${
                  day.isCompleted
                    ? "bg-amber-400 border-amber-900 text-amber-950 shadow-2xs"
                    : day.isToday
                      ? "bg-orange-50 border-orange-400 text-orange-700 border-dashed animate-pulse"
                      : "bg-slate-100 border-slate-200 text-slate-400"
                }`}
              >
                <span>{day.dayName[0]}</span>
                {day.isCompleted && (
                  <span className="text-[8px] leading-none">🔥</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="daily-streak-counter-widget"
      className="p-5 sm:p-7 rounded-3xl bg-white border-4 border-amber-900 shadow-pop-amber space-y-6"
    >
      {/* SECTION 1: HEADER & ACTIVE FLAME BANNER */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 pb-5 border-b-2 border-amber-200">
        <div className="flex items-center gap-4">
          {/* Animated Flame Container */}
          <div className="relative group">
            <div
              className={`w-16 h-16 sm:w-18 sm:h-18 rounded-3xl bg-gradient-to-tr ${getFlameGlowClass(
                streakData.streakTier,
              )} flex items-center justify-center border-3 border-amber-950 transition-transform group-hover:scale-105`}
            >
              <Flame className="w-9 h-9 sm:w-10 sm:h-10 text-white fill-amber-100 drop-shadow-md" />
            </div>
            {streakData.isTodayQuotaCompleted && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-xs font-black shadow-xs">
                ✓
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 font-black text-xs uppercase tracking-wider border border-amber-300">
                {streakData.streakTierEmoji} {streakData.streakTierLabel}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono text-xs font-black border border-indigo-200">
                ⚡ {streakData.xpMultiplier}x Practice XP Boost
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {streakData.streakDays}
              </h2>
              <span className="text-xl sm:text-2xl font-black text-amber-950 uppercase tracking-tight">
                {streakData.streakDays === 1 ? "Day Streak" : "Days Streak"}
              </span>
            </div>

            <p className="text-xs font-bold text-slate-600">
              {streakData.isTodayQuotaCompleted
                ? `🎉 Awesome job! You completed today's official practice quota. Your streak is protected!`
                : `⚡ Complete 1 official test today to keep your daily chain and level up your XP multiplier!`}
            </p>
          </div>
        </div>

        {/* Practice Quota Status Badge */}
        <div className="w-full lg:w-auto p-3.5 px-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center justify-between lg:justify-start gap-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
              Daily Practice Quota
            </span>
            <div className="flex items-center gap-1.5 font-mono font-black text-sm">
              {streakData.isTodayQuotaCompleted ? (
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />1 / 1
                  Test (100% Cleared)
                </span>
              ) : (
                <span className="text-rose-700 flex items-center gap-1">
                  <Clock className="w-4 h-4 text-rose-600 animate-spin" />0 / 1
                  Test (Pending)
                </span>
              )}
            </div>
          </div>

          {!streakData.isTodayQuotaCompleted &&
            !practiceMode &&
            onStartTest && (
              <button
                type="button"
                id="btn-streak-start-now"
                onClick={() => {
                  sounds.playTick();
                  onStartTest();
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-900 text-amber-950 font-black text-xs uppercase tracking-wider shadow-2xs transition active:translate-y-0.5 flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-amber-950" />
                <span>Complete Now</span>
              </button>
            )}
        </div>
      </div>

      {/* SECTION 2: 7-DAY VISUAL CALENDAR INDICATOR */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-700" />
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-700">
              7-Day Practice Streak Calendar
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            Click any day to view practice history
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {streakData.weekCalendar.map((day) => {
            const isSelected = selectedDay?.dateStr === day.dateStr;

            return (
              <div
                key={day.dateStr}
                onClick={() => {
                  sounds.playTick();
                  setSelectedDay(isSelected ? null : day);
                }}
                className={`cursor-pointer relative p-2.5 sm:p-3.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-between text-center gap-1 ${
                  day.isCompleted
                    ? "bg-amber-100/90 border-amber-900 shadow-xs hover:bg-amber-200"
                    : day.isToday
                      ? "bg-orange-50 border-orange-400 ring-2 ring-orange-300 shadow-xs animate-pulse"
                      : day.isPast
                        ? "bg-slate-50 border-slate-200 opacity-60 hover:opacity-90"
                        : "bg-slate-50 border-slate-200 opacity-40"
                } ${isSelected ? "ring-3 ring-amber-950 scale-102" : ""}`}
              >
                {/* Day Header */}
                <span className="text-[10px] font-black uppercase text-slate-600">
                  {day.dayName}
                </span>

                {/* Day Number */}
                <span className="text-base sm:text-lg font-black text-slate-900 font-mono">
                  {day.dayNumber}
                </span>

                {/* Status Indicator Icon */}
                <div className="mt-1">
                  {day.isCompleted ? (
                    <div className="w-6 h-6 rounded-full bg-amber-400 border border-amber-900 flex items-center justify-center text-xs text-amber-950 shadow-2xs">
                      🔥
                    </div>
                  ) : day.isToday ? (
                    <div className="w-6 h-6 rounded-full bg-orange-100 border border-orange-400 flex items-center justify-center text-[10px] text-orange-700 font-black">
                      ⏳
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] text-slate-400">
                      •
                    </div>
                  )}
                </div>

                {/* Tag */}
                {day.isToday && (
                  <span className="mt-1 px-1.5 py-0.2 rounded-md bg-orange-600 text-white text-[8px] font-black uppercase tracking-wider">
                    Today
                  </span>
                )}
                {day.isCompleted && !day.isToday && (
                  <span className="mt-1 px-1.5 py-0.2 rounded-md bg-amber-300 text-amber-950 text-[8px] font-black uppercase">
                    Done
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Day Expanded Details */}
        {selectedDay && (
          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-300 border-2 border-amber-900 flex items-center justify-center font-black text-base">
                {selectedDay.isCompleted ? "🔥" : "📅"}
              </div>
              <div>
                <h4 className="font-black text-xs text-slate-900 uppercase tracking-tight">
                  {selectedDay.dayName}, {selectedDay.dateStr}{" "}
                  {selectedDay.isToday && (
                    <span className="text-orange-600">(Today)</span>
                  )}
                </h4>
                <p className="text-xs text-slate-600 font-medium">
                  {selectedDay.isCompleted ? (
                    <span>
                      Quota Met • Completed{" "}
                      <strong className="text-amber-950">
                        {selectedDay.testsCompleted} test(s)
                      </strong>{" "}
                      with{" "}
                      <strong className="text-emerald-700">
                        {selectedDay.accuracy}% accuracy
                      </strong>{" "}
                      (+
                      {selectedDay.xpEarned} XP)
                    </span>
                  ) : selectedDay.isToday ? (
                    <span className="text-orange-700 font-bold">
                      Practice quota is pending for today. Take your test to
                      complete!
                    </span>
                  ) : (
                    <span>No practice tests logged on this date.</span>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedDay(null)}
              className="text-xs font-black text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* SECTION 3: STREAK MILESTONES & REWARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t-2 border-amber-100">
        {/* Milestone Tracker */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-200 border border-amber-400 flex items-center justify-center text-amber-950 font-black shrink-0">
            🎯
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Next Streak Goal
            </span>
            <p className="font-black text-xs text-slate-900 truncate">
              {streakData.nextMilestoneDays} Days Milestone
            </p>
            <p className="text-[10px] font-bold text-amber-900">
              {streakData.daysToNextMilestone} more day(s) to reach!
            </p>
          </div>
        </div>

        {/* Longest Streak Record */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-200 border border-indigo-400 flex items-center justify-center text-indigo-950 font-black shrink-0">
            🏆
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              All-Time Best
            </span>
            <p className="font-black text-xs text-indigo-950 truncate font-mono">
              {streakData.maxStreak} Days Record
            </p>
            <p className="text-[10px] font-bold text-indigo-700">
              Personal High Score
            </p>
          </div>
        </div>

        {/* Streak Shield Status */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-200 border border-emerald-400 flex items-center justify-center text-emerald-950 font-black shrink-0">
            🛡️
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Streak Status
            </span>
            <p className="font-black text-xs text-emerald-950 truncate">
              {streakData.isTodayQuotaCompleted
                ? "Protected & Safe"
                : "Action Required Today"}
            </p>
            <p className="text-[10px] font-bold text-emerald-700">
              {streakData.isTodayQuotaCompleted
                ? "1/1 Goal Achieved"
                : "Practice before midnight"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
