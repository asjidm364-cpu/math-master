import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Clock,
  Zap,
  Flame,
  Target,
  Sparkles,
  Edit3,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Award,
  BookOpen,
  Volume2,
  ShieldCheck,
  Radio,
  Wifi,
  WifiOff,
  Sliders,
  Check,
  AlertTriangle,
  Calendar,
  Lock,
  Trophy,
} from 'lucide-react';
import {
  Question,
  StudentProfile,
  DodgingTestAttempt,
  DodgingQuestionLog,
  AchievementBadge,
} from '../types';
import { generateDodgingQuestion } from '../utils/mathGenerator';
import { StorageService } from '../utils/storage';
import { sounds } from '../utils/audio';
import { PracticeReminder } from './PracticeReminder';
import { BadgeUnlockedModal } from './BadgeUnlockedModal';
import { DailyStreakTracker } from './DailyStreakTracker';

interface DodgingArenaProps {
  profile: StudentProfile;
  onFinishTest: (attempt: DodgingTestAttempt, mistakes: { question: Question; answer: string }[]) => void;
  onOpenScratchpad: () => void;
  onOpenMistakeReview?: () => void;
  onOpenStudyLab?: () => void;
  onOpenLeaderboard?: () => void;
}

export const DodgingArena: React.FC<DodgingArenaProps> = ({
  profile,
  onFinishTest,
  onOpenScratchpad,
  onOpenMistakeReview,
  onOpenStudyLab,
  onOpenLeaderboard,
}) => {
  // Test parameters from student profile
  const timePerQuestionLimit = profile.assignedTimePerQuestionSec || 10;
  const totalTestQuestions = profile.assignedQuestionCount || 15;
  const minTable = profile.assignedMinTable || 2;
  const maxTable = profile.assignedMaxTable || 12;
  const testMode = profile.assignedMode || 'multiplication';

  // Daily test restriction check
  const [dailyQuotaCheck, setDailyQuotaCheck] = useState(() =>
    StorageService.canTakeDailyDodgingTest(profile.id)
  );

  // Game state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isTestOver, setIsTestOver] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [numpadValue, setNumpadValue] = useState<string>('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [inputMode, setInputMode] = useState<'choice' | 'numpad'>('choice');

  // Badge celebration modal
  const [unlockedBadgesModal, setUnlockedBadgesModal] = useState<AchievementBadge[]>([]);

  // Per-Question Countdown Timer
  const [questionTimeLeft, setQuestionTimeLeft] = useState<number>(timePerQuestionLimit);
  const questionStartTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Scores & metrics
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [questionLogs, setQuestionLogs] = useState<DodgingQuestionLog[]>([]);
  const [testMistakes, setTestMistakes] = useState<{ question: Question; answer: string }[]>([]);
  const [completedAttempt, setCompletedAttempt] = useState<DodgingTestAttempt | null>(null);

  // Network offline state
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Refresh daily quota check when student profile changes
  useEffect(() => {
    setDailyQuotaCheck(StorageService.canTakeDailyDodgingTest(profile.id));
  }, [profile.id]);

  // Keyboard number listener for direct numpad entry and choice shortcuts
  useEffect(() => {
    if (!isPlaying || isTestOver || feedback) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        if (inputMode === 'choice') {
          // 1, 2, 3, 4 picks option
          const num = parseInt(e.key, 10);
          if (num >= 1 && num <= 4 && currentQuestion?.options[num - 1]) {
            handleAnswer(currentQuestion.options[num - 1]);
          }
        } else {
          // Direct numpad entry
          setNumpadValue((prev) => (prev.length < 5 ? prev + e.key : prev));
          sounds.playTick();
        }
      } else if (e.key === 'Backspace') {
        if (inputMode === 'numpad') {
          setNumpadValue((prev) => prev.slice(0, -1));
          sounds.playTick();
        }
      } else if (e.key === 'Enter') {
        if (inputMode === 'numpad' && numpadValue.trim()) {
          handleAnswer(numpadValue.trim());
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isTestOver, feedback, inputMode, numpadValue, currentQuestion]);

  // Per-Question countdown loop
  useEffect(() => {
    if (!isPlaying || isTestOver || feedback) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          // Time out!
          handleTimeout();
          return 0;
        }
        if (prev <= 4) {
          sounds.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isPlaying, isTestOver, feedback, questionIndex, currentQuestion]);

  // Start test
  const startTest = () => {
    setIsPlaying(true);
    setIsTestOver(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setQuestionIndex(0);
    setQuestionLogs([]);
    setTestMistakes([]);
    setCompletedAttempt(null);
    setFeedback(null);
    setSelectedOption(null);
    setNumpadValue('');

    const firstQ = generateDodgingQuestion({ min: minTable, max: maxTable }, testMode, 0);
    setCurrentQuestion(firstQ);
    setQuestionTimeLeft(timePerQuestionLimit);
    questionStartTimeRef.current = Date.now();
  };

  // Handle timeout
  const handleTimeout = () => {
    if (!currentQuestion) return;
    sounds.playIncorrect();
    setFeedback('timeout');
    setStreak(0);
    setWrongCount((prev) => prev + 1);

    const timeSpent = timePerQuestionLimit;
    const log: DodgingQuestionLog = {
      id: `log_${Date.now()}_${questionIndex}`,
      questionText: currentQuestion.text,
      tableNumber: currentQuestion.tableNumber || minTable,
      multiplier: currentQuestion.multiplier || 2,
      correctAnswer: currentQuestion.correctAnswer,
      studentAnswer: '(Timed Out)',
      isCorrect: false,
      timeSpentSec: timeSpent,
      timedOut: true,
    };

    const newLogs = [...questionLogs, log];
    setQuestionLogs(newLogs);

    const mistake = { question: currentQuestion, answer: '(Timed Out)' };
    const newMistakes = [...testMistakes, mistake];
    setTestMistakes(newMistakes);

    setTimeout(() => {
      advanceNextQuestion(newLogs, newMistakes);
    }, 1200);
  };

  // Handle user answer
  const handleAnswer = (answer: string) => {
    if (!currentQuestion || feedback) return;
    setSelectedOption(answer);

    const isCorrect = answer.trim() === currentQuestion.correctAnswer.trim();
    const timeSpentMs = Date.now() - questionStartTimeRef.current;
    const timeSpentSec = parseFloat(Math.min(timePerQuestionLimit, timeSpentMs / 1000).toFixed(1));

    if (isCorrect) {
      sounds.playCorrect();
      setFeedback('correct');
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      setCorrectCount((prev) => prev + 1);

      // Score calculation: speed bonus + streak bonus
      // Speed bonus rewards genuinely fast reactions (<= 2s gets full 10pts, up to 5s gets partial, >5s gets 1pt)
      const speedBonus = Math.max(1, Math.min(10, Math.round((5 - timeSpentSec) * 2)));
      const streakBonus = Math.min(10, newStreak * 2);
      const points = 10 + speedBonus + streakBonus;
      setScore((prev) => prev + points);
    } else {
      sounds.playIncorrect();
      setFeedback('wrong');
      setStreak(0);
      setWrongCount((prev) => prev + 1);
    }

    const log: DodgingQuestionLog = {
      id: `log_${Date.now()}_${questionIndex}`,
      questionText: currentQuestion.text,
      tableNumber: currentQuestion.tableNumber || minTable,
      multiplier: currentQuestion.multiplier || 2,
      correctAnswer: currentQuestion.correctAnswer,
      studentAnswer: answer,
      isCorrect,
      timeSpentSec,
    };

    const newLogs = [...questionLogs, log];
    setQuestionLogs(newLogs);

    let newMistakes = testMistakes;
    if (!isCorrect) {
      newMistakes = [...testMistakes, { question: currentQuestion, answer }];
      setTestMistakes(newMistakes);
    }

    setTimeout(() => {
      advanceNextQuestion(newLogs, newMistakes);
    }, 1000);
  };

  // Advance to next question or complete test
  const advanceNextQuestion = (
    currentLogs: DodgingQuestionLog[],
    currentMistakes: { question: Question; answer: string }[]
  ) => {
    setFeedback(null);
    setSelectedOption(null);
    setNumpadValue('');

    const nextIndex = questionIndex + 1;
    if (nextIndex >= totalTestQuestions) {
      finishDodgingTest(currentLogs, currentMistakes);
    } else {
      setQuestionIndex(nextIndex);
      const nextQ = generateDodgingQuestion({ min: minTable, max: maxTable }, testMode, nextIndex);
      setCurrentQuestion(nextQ);
      setQuestionTimeLeft(timePerQuestionLimit);
      questionStartTimeRef.current = Date.now();
    }
  };

    // Complete test and record data
  const finishDodgingTest = (
    finalLogs: DodgingQuestionLog[],
    finalMistakes: { question: Question; answer: string }[]
  ) => {
    setIsPlaying(false);
    setIsTestOver(true);

    const totalQ = finalLogs.length;
    const correctQ = finalLogs.filter((l) => l.isCorrect).length;
    const accuracy = totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 0;
    const totalTimeSpentSec = finalLogs.reduce((sum, l) => sum + l.timeSpentSec, 0);
    const avgSpeed = totalQ > 0 ? parseFloat((totalTimeSpentSec / totalQ).toFixed(1)) : 0;
    
    // Normalize score to standard 10-question basis so different question count assignments are fair across leaderboard
    const rawScore = score;
    const finalScore = totalQ > 0 ? Math.round((rawScore / totalQ) * 10) : rawScore;
    const xpGained = Math.round(finalScore + (accuracy === 100 ? 50 : 0));

    const attempt: DodgingTestAttempt = {
      id: `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      studentId: profile.id,
      studentUsername: profile.username,
      studentName: profile.name,
      timestamp: new Date().toISOString(),
      timeLimitPerQuestionSec: timePerQuestionLimit,
      tableRange: { min: minTable, max: maxTable },
      mode: testMode,
      totalQuestions: totalQ,
      correctQuestions: correctQ,
      score: finalScore,
      accuracy,
      totalTimeSpentSec,
      avgTimePerQuestionSec: avgSpeed,
      xpGained,
      isSynced: typeof navigator !== 'undefined' ? navigator.onLine : true,
      questionLogs: finalLogs,
    };

    setCompletedAttempt(attempt);

    // Save into central storage & offline queue
    const saveResult = StorageService.recordDodgingAttempt(attempt);
    onFinishTest(attempt, finalMistakes);
    setDailyQuotaCheck(StorageService.canTakeDailyDodgingTest(profile.id));

    if (saveResult.newBadgesUnlocked && saveResult.newBadgesUnlocked.length > 0) {
      setUnlockedBadgesModal(saveResult.newBadgesUnlocked);
      sounds.playFanfare();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    } else if (accuracy >= 80) {
      sounds.playFanfare();
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    }
  };

  // Calculate table breakdown stats for results screen
  const tableBreakdown: Record<number, { total: number; correct: number }> = {};
  if (completedAttempt) {
    completedAttempt.questionLogs.forEach((l) => {
      const t = l.tableNumber;
      if (!tableBreakdown[t]) tableBreakdown[t] = { total: 0, correct: 0 };
      tableBreakdown[t].total += 1;
      if (l.isCorrect) tableBreakdown[t].correct += 1;
    });
  }

  const timerPercent = (questionTimeLeft / timePerQuestionLimit) * 100;
  const isUrgent = questionTimeLeft <= 3;

  return (
    <div id="dodging-arena-root" className="space-y-6">
      {/* PRACTICE REMINDER & DAILY QUOTA WIDGET */}
      {!isPlaying && (
        <PracticeReminder
          onStartTest={dailyQuotaCheck.allowed ? startTest : undefined}
          onOpenStudyLab={onOpenStudyLab}
          onOpenMistakes={onOpenMistakeReview}
          onOpenLeaderboard={onOpenLeaderboard}
        />
      )}

      {/* Network & Offline Progress Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 px-4 rounded-2xl bg-white border-2 border-amber-200 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-black">
          {isOnline ? (
            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
              <Wifi className="w-3.5 h-3.5" />
              <span>🟢 Online • Automatic Cloud Sync Active</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-orange-800 bg-orange-50 px-2.5 py-1 rounded-xl border border-orange-300">
              <WifiOff className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
              <span>🟠 Offline Mode • Test Progress Saved Locally</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <span className="bg-amber-100 text-amber-950 px-2.5 py-1 rounded-xl border border-amber-300 font-mono font-black">
            Assigned Table Range: {minTable} to {maxTable}
          </span>
          <span className="bg-amber-100 text-amber-950 px-2.5 py-1 rounded-xl border border-amber-300 font-mono font-black">
            ⏱️ {timePerQuestionLimit}s / Question
          </span>
        </div>
      </div>

      {/* DAILY STREAK COUNTER & PRACTICE QUOTA CALENDAR */}
      {!isPlaying && !isTestOver && (
        <DailyStreakTracker
          profile={profile}
          onStartTest={dailyQuotaCheck.allowed ? startTest : undefined}
          onOpenStudyLab={onOpenStudyLab}
          onOpenMistakes={onOpenMistakeReview}
        />
      )}

      {/* VIEW 1A: DAILY TEST ALREADY COMPLETED (1 Test / Day Limit) */}
      {!isPlaying && !isTestOver && !dailyQuotaCheck.allowed && dailyQuotaCheck.todayAttempt && (
        <div className="p-6 sm:p-10 rounded-3xl bg-white border-4 border-amber-900 shadow-pop-amber text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 border border-emerald-400 text-emerald-950 text-xs font-black uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Daily Dodging Test Completed for Today</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Great work today, {profile.name}!
            </h2>

            <p className="text-sm font-bold text-slate-600 leading-relaxed">
              You have already completed your official daily dodging test for today. Each student is allocated{' '}
              <span className="text-amber-950 font-black">1 official test per day</span> to encourage daily focus and consistency.
            </p>
          </div>

          {/* Today's Attempt Summary Card */}
          <div className="max-w-xl mx-auto p-5 rounded-3xl bg-amber-50 border-3 border-amber-300 text-left space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                Today's Test Result
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                {new Date(dailyQuotaCheck.todayAttempt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-white border border-amber-200">
                <span className="text-[10px] font-black text-slate-500 uppercase">Accuracy</span>
                <p className="text-xl font-black text-emerald-700 font-mono">
                  {dailyQuotaCheck.todayAttempt.accuracy}%
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-amber-200">
                <span className="text-[10px] font-black text-slate-500 uppercase">Correct</span>
                <p className="text-xl font-black text-indigo-700 font-mono">
                  {dailyQuotaCheck.todayAttempt.correctQuestions} / {dailyQuotaCheck.todayAttempt.totalQuestions}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-amber-200">
                <span className="text-[10px] font-black text-slate-500 uppercase">XP Earned</span>
                <p className="text-xl font-black text-amber-950 font-mono">
                  +{dailyQuotaCheck.todayAttempt.xpGained}
                </p>
              </div>
            </div>
          </div>

          {/* Next Test Countdown & Alternative Activities */}
          <div className="space-y-4 pt-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 border-2 border-slate-300 text-xs font-black text-slate-700">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Next official test opens tomorrow at 12:00 AM Midnight</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {onOpenStudyLab && (
                <button
                  type="button"
                  onClick={onOpenStudyLab}
                  className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-900 text-amber-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(180,83,9,1)] transition active:translate-y-0.5"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Unlimited Practice in Study Table</span>
                </button>
              )}

              {onOpenMistakeReview && (
                <button
                  type="button"
                  onClick={onOpenMistakeReview}
                  className="px-6 py-3.5 rounded-2xl bg-white hover:bg-amber-50 border-2 border-amber-300 text-amber-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Review Mistake Vault</span>
                </button>
              )}

              {onOpenScratchpad && (
                <button
                  type="button"
                  onClick={onOpenScratchpad}
                  className="px-6 py-3.5 rounded-2xl bg-white hover:bg-indigo-50 border-2 border-indigo-200 text-indigo-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition"
                >
                  <Edit3 className="w-4 h-4 text-indigo-700" />
                  <span>Open Scratchpad</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1B: START SCREEN (When allowed) */}
      {!isPlaying && !isTestOver && dailyQuotaCheck.allowed && (
        <div className="p-6 sm:p-10 rounded-3xl bg-white border-4 border-amber-900 shadow-pop-amber text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-200 border border-amber-400 text-amber-950 text-xs font-black uppercase tracking-wider">
              <span>⚡ Official Daily Dodging Table Examination</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Hello, {profile.name}! Ready for your Dodging Table Test?
            </h2>

            <p className="text-sm font-bold text-slate-600">
              Your test has been configured specifically for your grade and assigned table range. Complete it today to maintain your streak!
            </p>
          </div>

          {/* Test Specs Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">Table Range</span>
              <p className="text-xl font-black text-amber-950 font-mono">
                {minTable} × to {maxTable} ×
              </p>
              <p className="text-[10px] font-bold text-slate-500">Dodging multipliers 2-12</p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-800">Time / Question</span>
              <p className="text-xl font-black text-rose-950 font-mono flex items-center gap-1">
                <Clock className="w-4 h-4 text-rose-600" />
                {timePerQuestionLimit} Seconds
              </p>
              <p className="text-[10px] font-bold text-slate-500">Per question timer limit</p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-300 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800">Questions</span>
              <p className="text-xl font-black text-indigo-950 font-mono">
                {totalTestQuestions} Items
              </p>
              <p className="text-[10px] font-bold text-slate-500">Target problem count</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">Test Mode</span>
              <p className="text-xl font-black text-emerald-950 capitalize truncate">
                {testMode}
              </p>
              <p className="text-[10px] font-bold text-slate-500">Dodging arithmetic</p>
            </div>
          </div>

          {/* Input Method Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Answer Input:</span>
            <div className="inline-flex p-1 rounded-2xl bg-slate-100 border-2 border-slate-300">
              <button
                type="button"
                onClick={() => setInputMode('choice')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                  inputMode === 'choice'
                    ? 'bg-amber-400 border-2 border-amber-900 text-amber-950 shadow-2xs'
                    : 'text-slate-600'
                }`}
              >
                4 Fast Options (1-4)
              </button>
              <button
                type="button"
                onClick={() => setInputMode('numpad')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                  inputMode === 'numpad'
                    ? 'bg-amber-400 border-2 border-amber-900 text-amber-950 shadow-2xs'
                    : 'text-slate-600'
                }`}
              >
                Direct Numeric Keypad
              </button>
            </div>
          </div>

          {/* Launch Button */}
          <div className="pt-2">
            <button
              id="btn-start-dodging-test"
              onClick={startTest}
              className="px-10 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 border-3 border-amber-900 text-amber-950 font-black text-base uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(180,83,9,1)] transition active:translate-y-1 active:shadow-none inline-flex items-center gap-3"
            >
              <Zap className="w-5 h-5 fill-amber-950" />
              <span>Begin Official Dodging Test</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: ACTIVE DODGING TEST */}
      {isPlaying && currentQuestion && (
        <div className="space-y-4">
          {/* Top Test Progress HUD */}
          <div className="p-4 rounded-2xl bg-white border-3 border-amber-900 shadow-pop-amber flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border-2 border-amber-400 text-amber-900 font-mono font-black flex items-center justify-center text-sm">
                #{questionIndex + 1}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase">Question Progress</p>
                <p className="text-sm font-black text-slate-900 font-mono">
                  {questionIndex + 1} of {totalTestQuestions}
                </p>
              </div>
            </div>

            {/* Streak & Score */}
            <div className="flex items-center gap-3">
              {streak >= 3 && (
                <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-orange-100 border border-orange-300 text-orange-700 font-black text-xs animate-bounce">
                  <Flame className="w-3.5 h-3.5 fill-orange-500" />
                  <span>{streak}x Streak!</span>
                </div>
              )}
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase">Current Score</p>
                <p className="text-sm font-black text-indigo-700 font-mono">{score} pts</p>
              </div>
            </div>
          </div>

          {/* PER-QUESTION COUNTDOWN TIMER BAR */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-black">
              <span className={`flex items-center gap-1 ${isUrgent ? 'text-rose-600 animate-pulse font-black' : 'text-slate-700'}`}>
                <Clock className="w-4 h-4" />
                <span>Time Remaining for this Question:</span>
              </span>
              <span className={`font-mono text-sm ${isUrgent ? 'text-rose-600 font-black scale-110' : 'text-slate-900'}`}>
                {questionTimeLeft}s
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3.5 border-2 border-slate-300 overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                  isUrgent ? 'bg-rose-500 animate-pulse' : questionTimeLeft <= 6 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${timerPercent}%` }}
              ></div>
            </div>
          </div>

          {/* MAIN DODGING QUESTION CARD */}
          <div
            className={`p-8 sm:p-12 rounded-[2.5rem] bg-white border-4 shadow-pop-amber text-center space-y-8 transition-colors ${
              feedback === 'correct'
                ? 'border-emerald-600 bg-emerald-50/40'
                : feedback === 'wrong'
                ? 'border-rose-600 bg-rose-50/40'
                : feedback === 'timeout'
                ? 'border-rose-600 bg-rose-50/40'
                : 'border-amber-900'
            }`}
          >
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                Table of {currentQuestion.tableNumber || minTable}
              </span>
              {/* Question Text */}
              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight font-mono py-2">
                {currentQuestion.text}
              </h1>
            </div>

            {/* Instant Feedback indicator */}
            {feedback && (
              <div className="animate-in zoom-in-95 duration-200">
                {feedback === 'correct' && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-100 border-2 border-emerald-600 text-emerald-900 font-black text-sm uppercase">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Correct! +Points & Streak</span>
                  </div>
                )}
                {feedback === 'wrong' && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-100 border-2 border-rose-600 text-rose-900 font-black text-sm uppercase">
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span>Incorrect! Correct answer is {currentQuestion.correctAnswer}</span>
                  </div>
                )}
                {feedback === 'timeout' && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-100 border-2 border-rose-600 text-rose-900 font-black text-sm uppercase">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                    <span>Time Out! Correct answer is {currentQuestion.correctAnswer}</span>
                  </div>
                )}
              </div>
            )}

            {/* INPUT METHOD: 4 FAST MULTIPLE CHOICE OPTIONS */}
            {inputMode === 'choice' && (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOption === option;
                  let btnColor = 'bg-white hover:bg-amber-50 text-slate-900 border-slate-300';
                  if (feedback && isSelected) {
                    btnColor = feedback === 'correct' ? 'bg-emerald-400 border-emerald-800 text-emerald-950' : 'bg-rose-400 border-rose-800 text-white';
                  } else if (feedback && option === currentQuestion.correctAnswer) {
                    btnColor = 'bg-emerald-200 border-emerald-700 text-emerald-950';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={feedback !== null}
                      onClick={() => handleAnswer(option)}
                      className={`p-4 sm:p-5 rounded-2xl border-3 font-mono font-black text-2xl sm:text-3xl shadow-xs transition active:translate-y-1 relative flex items-center justify-center ${btnColor}`}
                    >
                      <span className="absolute left-3 top-2 text-[10px] font-sans font-bold text-slate-400">
                        [{idx + 1}]
                      </span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* INPUT METHOD: DIRECT NUMERIC KEYPAD */}
            {inputMode === 'numpad' && (
              <div className="max-w-xs mx-auto space-y-4">
                <div className="p-3 rounded-2xl bg-slate-100 border-2 border-slate-300 font-mono font-black text-3xl text-slate-900 min-h-[56px] flex items-center justify-center shadow-inner">
                  {numpadValue || <span className="text-slate-400">?</span>}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      disabled={feedback !== null}
                      onClick={() => {
                        sounds.playTick();
                        setNumpadValue((prev) => (prev.length < 5 ? prev + String(digit) : prev));
                      }}
                      className="p-3 rounded-xl bg-white hover:bg-amber-100 border-2 border-slate-300 text-xl font-black text-slate-800 font-mono shadow-xs active:translate-y-0.5"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={feedback !== null}
                    onClick={() => {
                      sounds.playTick();
                      setNumpadValue((prev) => prev.slice(0, -1));
                    }}
                    className="p-3 rounded-xl bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 text-xs font-black uppercase text-rose-800 shadow-xs"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    disabled={feedback !== null}
                    onClick={() => {
                      sounds.playTick();
                      setNumpadValue((prev) => (prev.length < 5 ? prev + '0' : prev));
                    }}
                    className="p-3 rounded-xl bg-white hover:bg-amber-100 border-2 border-slate-300 text-xl font-black text-slate-800 font-mono shadow-xs active:translate-y-0.5"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    disabled={feedback !== null || !numpadValue.trim()}
                    onClick={() => handleAnswer(numpadValue.trim())}
                    className="p-3 rounded-xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-900 text-xs font-black uppercase text-amber-950 shadow-xs"
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}

            {/* Bottom utilities */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 max-w-xl mx-auto">
              <button
                type="button"
                onClick={onOpenScratchpad}
                className="flex items-center gap-1.5 text-xs font-black text-amber-800 hover:text-amber-950 uppercase"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Open Scratchpad</span>
              </button>

              <button
                type="button"
                onClick={() => setInputMode((prev) => (prev === 'choice' ? 'numpad' : 'choice'))}
                className="text-xs font-black text-indigo-700 hover:text-indigo-900 uppercase"
              >
                Switch to {inputMode === 'choice' ? 'Keypad' : '4-Choices'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: TEST COMPLETED RESULTS SCREEN */}
      {isTestOver && completedAttempt && (
        <div className="p-6 sm:p-10 rounded-3xl bg-white border-4 border-amber-900 shadow-pop-amber space-y-6">
          <div className="text-center space-y-2">
            <span className="text-4xl">🎉</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
              Dodging Test Complete!
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-600">
              Exam submitted by <span className="text-slate-900 font-black">{profile.name}</span>
            </p>
          </div>

          {/* Sync Status Pill */}
          <div className="p-3 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                {completedAttempt.isSynced
                  ? 'All scores & question logs synced with classroom database!'
                  : 'Saved locally in offline queue. Auto-sync will flush when connected.'}
              </span>
            </div>
            <span className="font-mono text-slate-500">{new Date(completedAttempt.timestamp).toLocaleTimeString()}</span>
          </div>

          {/* Performance KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-200 text-center space-y-1">
              <span className="text-[10px] font-black uppercase text-indigo-800">Correct Answers</span>
              <p className="text-2xl font-black text-indigo-950 font-mono">
                {completedAttempt.correctQuestions} / {completedAttempt.totalQuestions}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-center space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-800">Accuracy Rate</span>
              <p className="text-2xl font-black text-emerald-950 font-mono">{completedAttempt.accuracy}%</p>
            </div>

            <div className="p-4 rounded-2xl bg-orange-50 border-2 border-orange-200 text-center space-y-1">
              <span className="text-[10px] font-black uppercase text-orange-800">Avg Speed / Q</span>
              <p className="text-2xl font-black text-orange-950 font-mono">{completedAttempt.avgTimePerQuestionSec}s</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-center space-y-1">
              <span className="text-[10px] font-black uppercase text-amber-800">XP Earned</span>
              <p className="text-2xl font-black text-amber-950 font-mono">+{completedAttempt.xpGained}</p>
            </div>
          </div>

          {/* Table-by-Table Mastery Breakdown */}
          <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-3">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Table Performance Breakdown
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(tableBreakdown).map(([tbl, data]) => {
                const acc = Math.round((data.correct / data.total) * 100);
                return (
                  <div key={tbl} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex justify-between items-center">
                    <span className="font-black text-slate-800">Table of {tbl}</span>
                    <span className={`font-mono font-black px-1.5 py-0.5 rounded-md ${acc === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {data.correct}/{data.total} ({acc}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {onOpenStudyLab && (
              <button
                type="button"
                onClick={onOpenStudyLab}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-900 text-amber-950 font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(180,83,9,1)] transition active:translate-y-0.5"
              >
                Practice in Study Table
              </button>
            )}

            {testMistakes.length > 0 && onOpenMistakeReview && (
              <button
                type="button"
                onClick={onOpenMistakeReview}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-rose-100 hover:bg-rose-200 border-2 border-rose-300 text-rose-900 font-black text-xs uppercase tracking-wider transition"
              >
                Review {testMistakes.length} Test Mistakes
              </button>
            )}

            {onOpenLeaderboard && (
              <button
                type="button"
                onClick={onOpenLeaderboard}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-300 text-indigo-900 font-black text-xs uppercase tracking-wider transition"
              >
                View Leaderboard Standings
              </button>
            )}
          </div>
        </div>
      )}

      {/* BADGE UNLOCKED CELEBRATION MODAL */}
      <BadgeUnlockedModal
        badges={unlockedBadgesModal}
        onClose={() => setUnlockedBadgesModal([])}
      />
    </div>
  );
};
