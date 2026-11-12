import React, { useState, useEffect } from "react";
import {
  Bell,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Sparkles,
  Flame,
  ArrowRight,
  BookOpen,
  Calendar,
  X,
  ChevronRight,
  Target,
} from "lucide-react";
import { StorageService } from "../utils/storage";
import { DodgingTestAttempt } from "../types";

interface PracticeReminderProps {
  practiceMode?: boolean;
  onStartTest?: () => void;
  onOpenStudyLab?: () => void;
  onOpenMistakes?: () => void;
  onOpenLeaderboard?: () => void;
}

export const PracticeReminder: React.FC<PracticeReminderProps> = ({
  practiceMode = false,
  onStartTest,
  onOpenStudyLab,
  onOpenMistakes,
  onOpenLeaderboard,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [dailyStatus, setDailyStatus] = useState<{
    completed: boolean;
    todayAttempt?: DodgingTestAttempt;
    hoursUntilMidnight: number;
  }>(() => StorageService.hasCompletedDailyDodgingTest());

  const currentStudent = StorageService.getCurrentStudent();
  const currentHour = new Date().getHours();

  useEffect(() => {
    const update = () => {
      setDailyStatus(StorageService.hasCompletedDailyDodgingTest());
    };
    window.addEventListener("storage", update);
    const interval = setInterval(update, 15000);
    return () => {
      window.removeEventListener("storage", update);
      clearInterval(interval);
    };
  }, []);

  if (practiceMode) {
    return (
      <div className="flex items-center justify-between p-2.5 px-4 rounded-2xl bg-emerald-100/80 border-2 border-emerald-300 text-xs font-black text-emerald-950 shadow-xs">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-700" />
          <span>
            Study Lab practice mode active — no official test, badges, or XP are
            being awarded.
          </span>
        </div>
      </div>
    );
  }

  if (isDismissed) {
    return (
      <div className="flex items-center justify-between p-2.5 px-4 rounded-2xl bg-amber-100/80 border-2 border-amber-300 text-xs font-black text-amber-950 shadow-xs">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-700 animate-bounce" />
          <span>
            Daily Dodging Quota:{" "}
            {dailyStatus.completed ? (
              <span className="text-emerald-800">✅ 1/1 Completed Today</span>
            ) : (
              <span className="text-rose-700">⏳ 0/1 Pending for Today</span>
            )}
          </span>
        </div>
        <button
          onClick={() => setIsDismissed(false)}
          className="text-[11px] underline text-amber-900 hover:text-amber-950 font-bold"
        >
          Expand Reminder
        </button>
      </div>
    );
  }

  // Case 1: Already Completed for Today
  if (dailyStatus.completed && dailyStatus.todayAttempt) {
    const attempt = dailyStatus.todayAttempt;
    return (
      <div
        id="practice-reminder-widget"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500/10 via-amber-50 to-emerald-50 border-3 border-emerald-600/50 p-4 sm:p-5 shadow-pop-amber"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-xs border-2 border-emerald-700">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-300">
                  🎉 Daily Quota Met (1/1 Test)
                </span>
                <span className="flex items-center gap-1 text-[11px] font-black text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full border border-orange-300">
                  <Flame className="w-3 h-3 fill-orange-500" />
                  {currentStudent.profile.streakDays}-Day Streak Kept!
                </span>
              </div>

              <h3 className="text-base font-black text-slate-900">
                Well done, {currentStudent.profile.name}! Today's Dodging Test
                is Completed.
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Today's Result:{" "}
                <span className="font-mono font-bold text-emerald-700">
                  {attempt.accuracy}% accuracy
                </span>{" "}
                ({attempt.correctQuestions}/{attempt.totalQuestions} correct) •
                Next official test unlocks at midnight (
                {dailyStatus.hoursUntilMidnight}h left).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end sm:self-center shrink-0">
            {onOpenStudyLab && (
              <button
                type="button"
                onClick={onOpenStudyLab}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 border-2 border-emerald-300 text-emerald-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition shadow-2xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                <span>Practice Study Table</span>
              </button>
            )}

            {onOpenMistakes && (
              <button
                type="button"
                onClick={onOpenMistakes}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-amber-50 border-2 border-amber-300 text-amber-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition shadow-2xs"
              >
                <Target className="w-3.5 h-3.5 text-amber-700" />
                <span>Review Mistakes</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/60 transition"
              title="Minimize Reminder"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Incomplete & Evening Urgent (>= 17:00 / 5 PM)
  const isEveningUrgent = currentHour >= 17;
  const isAfternoonWarning = currentHour >= 12 && currentHour < 17;

  return (
    <div
      id="practice-reminder-widget"
      className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 shadow-pop-amber border-3 transition-all ${
        isEveningUrgent
          ? "bg-gradient-to-r from-rose-100 via-amber-50 to-orange-100 border-rose-600/70 animate-pulse"
          : isAfternoonWarning
            ? "bg-gradient-to-r from-amber-100 via-amber-50 to-yellow-100 border-amber-600/70"
            : "bg-gradient-to-r from-amber-50 via-white to-amber-100 border-amber-500"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 shadow-xs border-2 ${
              isEveningUrgent
                ? "bg-rose-500 text-white border-rose-700 animate-bounce"
                : "bg-amber-400 text-amber-950 border-amber-800"
            }`}
          >
            {isEveningUrgent ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <Clock className="w-6 h-6" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  isEveningUrgent
                    ? "bg-rose-200 text-rose-900 border-rose-400"
                    : "bg-amber-200 text-amber-950 border-amber-400"
                }`}
              >
                {isEveningUrgent
                  ? "🚨 Evening Quota Reminder (0/1 Test)"
                  : isAfternoonWarning
                    ? "⏰ Afternoon Practice Reminder"
                    : "🌅 Daily Practice Goal (0/1 Test)"}
              </span>

              <span className="flex items-center gap-1 text-[11px] font-black text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full border border-orange-300">
                <Flame className="w-3 h-3 fill-orange-500" />
                Streak: {currentStudent.profile.streakDays} Days
              </span>

              <span className="text-[11px] font-bold text-slate-500 font-mono">
                ⏳ {dailyStatus.hoursUntilMidnight}h left today
              </span>
            </div>

            <h3 className="text-base font-black text-slate-900">
              {isEveningUrgent
                ? `Don't break your streak, ${currentStudent.profile.name}! Daily Dodging Test pending.`
                : isAfternoonWarning
                  ? `Time for your daily dodging table practice, ${currentStudent.profile.name}!`
                  : `Ready for today's Dodging Table Test, ${currentStudent.profile.name}?`}
            </h3>

            <p className="text-xs text-slate-600 font-medium">
              Each student takes{" "}
              <span className="font-bold text-amber-950">
                1 official test per day
              </span>{" "}
              (10-15 questions). Complete it to earn XP, unlock the Perfect
              10/10 badge, and maintain your streak!
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {onStartTest && (
            <button
              type="button"
              id="btn-reminder-take-test"
              onClick={onStartTest}
              className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-900 text-amber-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[3px_3px_0px_0px_rgba(180,83,9,1)] transition active:translate-y-0.5"
            >
              <Zap className="w-4 h-4 fill-amber-950" />
              <span>Take Today's Test Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/60 transition"
            title="Minimize"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
