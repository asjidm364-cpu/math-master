import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Volume2,
  VolumeX,
  ArrowRight,
  Edit3,
  Calculator,
  ShieldCheck,
  Grid,
  ChevronRight,
  Play,
  Lightbulb,
  Info,
  Clock,
  Target,
  Hash,
} from 'lucide-react';
import { StudentProfile, Question } from '../types';
import { generateDodgingQuestion } from '../utils/mathGenerator';
import { StorageService } from '../utils/storage';
import { sounds } from '../utils/audio';

interface StudyTableProps {
  profile: StudentProfile;
  onOpenScratchpad?: () => void;
  onOpenMistakes?: () => void;
}

interface DummyTestLog {
  question: Question;
  studentAnswer: string;
  isCorrect: boolean;
  timeSpentSec: number;
}

// Memory tips and patterns for times tables
const TABLE_TIPS: Record<number, { title: string; pattern: string; tip: string }> = {
  1: {
    title: 'The Identity Table',
    pattern: 'Any number multiplied by 1 stays the exact same number.',
    tip: '1 × n = n. The mirror of mathematics!',
  },
  2: {
    title: 'The Doubles Table',
    pattern: 'Every multiple of 2 is an even number ending in 0, 2, 4, 6, or 8.',
    tip: 'Just double the number! 2 × 7 = 7 + 7 = 14.',
  },
  3: {
    title: 'The Digit-Sum Table',
    pattern: 'Sum the digits of the answer — the sum is always 3, 6, or 9!',
    tip: 'Example: 3 × 9 = 27 (2 + 7 = 9). 3 × 8 = 24 (2 + 4 = 6).',
  },
  4: {
    title: 'The Double-Double Table',
    pattern: 'Multiply by 4 by doubling twice.',
    tip: 'To do 4 × 7: Double 7 to get 14, then double 14 to get 28!',
  },
  5: {
    title: 'The Clock Table',
    pattern: 'Multiples always end in 5 (for odd multipliers) or 0 (for even multipliers).',
    tip: 'Think of minute hands on a clock: 5, 10, 15, 20, 25, 30...',
  },
  6: {
    title: 'The Even-Match Table',
    pattern: 'When multiplying 6 by an even number, the answer ends in that same number.',
    tip: '6 × 2 = 12 (ends in 2), 6 × 4 = 24 (ends in 4), 6 × 6 = 36 (ends in 6), 6 × 8 = 48 (ends in 8)!',
  },
  7: {
    title: 'The Lucky 7 Sequence',
    pattern: 'Remember the classic rhythm: 5, 6, 7, 8!',
    tip: '5, 6, 7, 8 -> 56 = 7 × 8! Break down tough ones: 7 × 9 = (7 × 10) - 7 = 63.',
  },
  8: {
    title: 'The Double-Double-Double Table',
    pattern: 'Double the number three times in a row.',
    tip: '8 × 6: Double 6 is 12, double 12 is 24, double 24 is 48!',
  },
  9: {
    title: 'The Magic Nine Table',
    pattern: 'The digits of all 9s multiples always add up to 9 (e.g. 18, 27, 36, 45, 54, 63, 72, 81).',
    tip: 'The tens digit is always 1 less than the multiplier! (9 × 7: tens is 6, 6 + 3 = 9 -> 63).',
  },
  10: {
    title: 'The Friendly Zero Table',
    pattern: 'Simply attach a zero to the end of the number.',
    tip: '10 × 7 = 70. 10 × 12 = 120. Easy, fast, and satisfying!',
  },
  11: {
    title: 'The Twin Digits Table',
    pattern: 'For single digits, repeat the digit twice (11, 22, 33, 44...).',
    tip: 'For two digits like 11 × 10: 11 × 10 = 110. Fast and easy!',
  },
  12: {
    title: 'The Dozen Table',
    pattern: 'Multiply by 10, then add double the number: (10 × n) + (2 × n).',
    tip: 'To do 12 × 7: (10 × 7 = 70) + (2 × 7 = 14) -> 70 + 14 = 84!',
  },
  13: {
    title: 'The Baker’s Dozen Table',
    pattern: 'Split into (10 × n) + (3 × n).',
    tip: 'For 13 × 7: (10 × 7 = 70) + (3 × 7 = 21) -> 70 + 21 = 91!',
  },
  14: {
    title: 'The Double 7s Table',
    pattern: 'Double the 7 times table, or (10 × n) + (4 × n).',
    tip: 'For 14 × 6: (10 × 6 = 60) + (4 × 6 = 24) -> 60 + 24 = 84!',
  },
  15: {
    title: 'The Half-Thirty Table',
    pattern: 'Multiply by 10, then add half of that: (10 × n) + (5 × n).',
    tip: 'For 15 × 8: (10 × 8 = 80), half of 80 is 40 -> 80 + 40 = 120!',
  },
  16: {
    title: 'The Double 8s Table',
    pattern: 'Double four times, or split into (10 × n) + (6 × n).',
    tip: 'For 16 × 7: (10 × 7 = 70) + (6 × 7 = 42) -> 70 + 42 = 112!',
  },
  17: {
    title: 'The Prime Teen Table',
    pattern: 'Split into (20 × n) - (3 × n), or (10 × n) + (7 × n).',
    tip: 'For 17 × 8: (20 × 8 = 160) - (3 × 8 = 24) -> 160 - 24 = 136!',
  },
  18: {
    title: 'The Double 9s Table',
    pattern: 'Multiply by 20 and subtract double: (20 × n) - (2 × n).',
    tip: 'For 18 × 7: (20 × 7 = 140) - (2 × 7 = 14) -> 140 - 14 = 126!',
  },
  19: {
    title: 'The Almost Twenty Table',
    pattern: 'Multiply by 20, then subtract the number itself: (20 × n) - n.',
    tip: 'For 19 × 7: (20 × 7 = 140) - 7 = 133! For 19 × 10: 190!',
  },
  20: {
    title: 'The Double Tens Table',
    pattern: 'Double the multiplier, then append a zero: 2 × n × 10.',
    tip: 'For 20 × 7: 2 × 7 = 14 -> add 0 = 140! For 20 × 10 = 200!',
  },
};

const PRACTICE_TIME_LIMIT_SEC = 5;

export const StudyTable: React.FC<StudyTableProps> = ({
  profile,
  onOpenScratchpad,
  onOpenMistakes,
}) => {
  // Main view state
  const [activeSubTab, setActiveSubTab] = useState<'table' | 'grid' | 'dummy_test'>('table');
  const [selectedTable, setSelectedTable] = useState<number>(profile.assignedMinTable || 2);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Dummy Test Configuration state - timed 5s per question by default
  const [testScope, setTestScope] = useState<'selected' | 'assigned' | 'all'>('selected');
  const [testMode, setTestMode] = useState<'multiplication' | 'division' | 'missing_factor' | 'mixed'>('multiplication');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [isTimed, setIsTimed] = useState<boolean>(true);

  // Active Dummy Test State
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isTestFinished, setIsTestFinished] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [feedback, setFeedback] = useState<{
    show: boolean;
    isCorrect: boolean;
    correctAnswer: string;
    explanation: string;
  } | null>(null);
  const [testLogs, setTestLogs] = useState<DummyTestLog[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(PRACTICE_TIME_LIMIT_SEC);
  const [inputMode, setInputMode] = useState<'choice' | 'numpad'>('choice');

  const questionStartTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Speech synthesis for reading tables aloud (strictly 1 to 10)
  const readTableAloud = (tableNum: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const sentences: string[] = [];
    for (let i = 1; i <= 10; i++) {
      sentences.push(`${tableNum} times ${i} is ${tableNum * i}`);
    }

    const utterance = new SpeechSynthesisUtterance(sentences.join('. '));
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Launch a new Dummy Practice Test
  const startDummyTest = (customTableNum?: number) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const tableToUse = customTableNum || selectedTable;
    let range: { min: number; max: number; custom?: number[] };

    if (testScope === 'selected' || customTableNum !== undefined) {
      range = { min: tableToUse, max: tableToUse, custom: [tableToUse] };
    } else if (testScope === 'assigned') {
      range = {
        min: profile.assignedMinTable || 2,
        max: Math.min(20, profile.assignedMaxTable || 12),
        custom: profile.assignedCustomTables,
      };
    } else {
      // All tables 2 to 20
      range = { min: 2, max: 20 };
    }

    const generated: Question[] = [];
    for (let i = 0; i < questionCount; i++) {
      generated.push(generateDodgingQuestion(range, testMode, i));
    }

    setQuestions(generated);
    setCurrentQIndex(0);
    setCurrentInput('');
    setFeedback(null);
    setTestLogs([]);
    setIsTesting(true);
    setIsTestFinished(false);
    setActiveSubTab('dummy_test');
    questionStartTimeRef.current = Date.now();
    setTimeRemaining(PRACTICE_TIME_LIMIT_SEC);
    sounds.playTick();
  };

  // Timer effect for 5s timed practice
  useEffect(() => {
    if (!isTesting || isTestFinished || !isTimed || feedback?.show) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // 5 seconds expired for this question: trigger submit with timeout
          handleAnswerSubmit('(Time Expired)');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTesting, isTestFinished, isTimed, feedback, currentQIndex]);

  // Answer submission handler for dummy practice
  const handleAnswerSubmit = (selectedAnswer?: string) => {
    if (feedback?.show) return;

    const currentQ = questions[currentQIndex];
    if (!currentQ) return;

    const answer = (selectedAnswer !== undefined ? selectedAnswer : currentInput).trim();
    const isCorrect = answer === currentQ.correctAnswer.trim();
    const timeSpent = Math.max(1, Math.round((Date.now() - questionStartTimeRef.current) / 1000));

    // Audio feedback
    if (isCorrect) {
      sounds.playCorrect();
    } else {
      sounds.playWrong();
      // Optional: record mistake to Mistake Vault so student can practice it
      try {
        StorageService.addMistake(currentQ, answer || 'No answer');
      } catch (e) {
        console.warn('Could not record mistake:', e);
      }
    }

    const log: DummyTestLog = {
      question: currentQ,
      studentAnswer: answer,
      isCorrect,
      timeSpentSec: timeSpent,
    };

    const newLogs = [...testLogs, log];
    setTestLogs(newLogs);

    setFeedback({
      show: true,
      isCorrect,
      correctAnswer: currentQ.correctAnswer,
      explanation: currentQ.explanation || `${currentQ.text} = ${currentQ.correctAnswer}`,
    });

    // Automatically transition to next question after 1.2s
    setTimeout(() => {
      if (currentQIndex + 1 < questions.length) {
        setCurrentQIndex((prev) => prev + 1);
        setCurrentInput('');
        setFeedback(null);
        setTimeRemaining(PRACTICE_TIME_LIMIT_SEC);
        questionStartTimeRef.current = Date.now();
      } else {
        // Test completed!
        setIsTesting(false);
        setIsTestFinished(true);
        sounds.playFanfare();
      }
    }, 1200);
  };

  // Keyboard listener for dummy practice
  useEffect(() => {
    if (!isTesting || isTestFinished || feedback?.show) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        setCurrentInput((prev) => (prev.length < 5 ? prev + e.key : prev));
      } else if (e.key === 'Backspace') {
        setCurrentInput((prev) => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        if (currentInput.trim().length > 0) {
          handleAnswerSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTesting, isTestFinished, feedback, currentInput]);

  // Current question data
  const currentQ = questions[currentQIndex];

  return (
    <div id="study-table-container" className="max-w-5xl mx-auto space-y-6">
      {/* HEADER HERO BANNER */}
      <div className="bg-white rounded-[2rem] border-4 border-amber-900 p-6 sm:p-8 shadow-pop-amber relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 border-2 border-amber-300 text-amber-950 text-xs font-black uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-amber-800" />
              <span>Interactive Study Table</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Study Tables & Unlimited Dummy Practice
            </h1>
            <p className="text-sm text-slate-600 font-medium">
              Study any multiplication table with tricks, patterns, and audio. Practice with{' '}
              <span className="font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                100% unlimited dummy tests
              </span>{' '}
              that do not affect your official daily exam or trophies.
            </p>
          </div>

          {/* SAFE PRACTICE GUARANTEE BADGE */}
          <div className="bg-emerald-50 rounded-2xl p-4 border-2 border-emerald-300 flex items-center gap-3.5 shrink-0 shadow-xs max-w-xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shrink-0 shadow-[2px_2px_0px_0px_rgba(6,95,70,1)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-emerald-900 font-black uppercase tracking-wider">
                Safe Dummy Practice
              </p>
              <p className="text-xs text-emerald-700 font-medium">
                • 0 XP & 0 Points
                <br />
                • No Trophies
                <br />
                • Unlimited Attempts
              </p>
            </div>
          </div>
        </div>

        {/* SUB-NAVIGATION TABS */}
        <div className="flex flex-wrap items-center gap-2 pt-6 mt-6 border-t-2 border-amber-100">
          <button
            id="subtab-table-chart"
            onClick={() => {
              sounds.playTick();
              setIsTesting(false);
              setIsTestFinished(false);
              setActiveSubTab('table');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
              activeSubTab === 'table' && !isTesting && !isTestFinished
                ? 'bg-amber-400 text-amber-950 border-2 border-amber-900 shadow-[2px_2px_0px_0px_rgba(180,83,9,1)]'
                : 'bg-slate-100 text-slate-700 hover:bg-amber-100 border-2 border-transparent'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>📖 Table Chart</span>
          </button>

          <button
            id="subtab-grid"
            onClick={() => {
              sounds.playTick();
              setIsTesting(false);
              setIsTestFinished(false);
              setActiveSubTab('grid');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
              activeSubTab === 'grid' && !isTesting && !isTestFinished
                ? 'bg-amber-400 text-amber-950 border-2 border-amber-900 shadow-[2px_2px_0px_0px_rgba(180,83,9,1)]'
                : 'bg-slate-100 text-slate-700 hover:bg-amber-100 border-2 border-transparent'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>⚡ Tables Grid (1-10)</span>
          </button>

          <button
            id="subtab-dummy-test"
            onClick={() => {
              sounds.playTick();
              setActiveSubTab('dummy_test');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
              activeSubTab === 'dummy_test' || isTesting || isTestFinished
                ? 'bg-emerald-500 text-white border-2 border-emerald-900 shadow-[2px_2px_0px_0px_rgba(6,95,70,1)]'
                : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border-2 border-emerald-300'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>🎯 Unlimited Dummy Test</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: ACTIVE DUMMY PRACTICE TEST IN PROGRESS */}
      {/* ========================================================================= */}
      {isTesting && currentQ && (
        <div className="bg-white rounded-[2rem] border-4 border-amber-900 p-6 sm:p-8 shadow-pop-amber space-y-6">
          {/* Top Bar with Clear Notice that this gives 0 XP / No Trophies */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-slate-100">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-emerald-100 border-2 border-emerald-400 text-emerald-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Dummy Practice Test (0 XP • No Trophies)</span>
              </span>
              <span className="text-xs font-bold text-slate-500">
                Question {currentQIndex + 1} of {questions.length}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {isTimed && (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-black border transition-colors ${
                    timeRemaining <= 2
                      ? 'bg-rose-100 text-rose-700 border-rose-400 animate-pulse'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>{timeRemaining}s / 5s</span>
                </div>
              )}

              {onOpenScratchpad && (
                <button
                  type="button"
                  onClick={onOpenScratchpad}
                  className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 text-xs font-black flex items-center gap-1 transition"
                  title="Open Scratchpad"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Scratchpad</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (confirm('Exit dummy practice test?')) {
                    setIsTesting(false);
                    setActiveSubTab('table');
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition"
              >
                Exit
              </button>
            </div>
          </div>

          {/* Progress bar and per-question 5s countdown */}
          <div className="space-y-1.5">
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${Math.round(((currentQIndex) / questions.length) * 100)}%` }}
              />
            </div>
            {isTimed && (
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ease-linear ${
                    timeRemaining <= 2 ? 'bg-rose-500' : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.max(0, (timeRemaining / PRACTICE_TIME_LIMIT_SEC) * 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Main Question Display */}
          <div className="py-8 text-center space-y-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              Solve the equation
            </p>
            <div className="text-4xl sm:text-6xl font-black text-slate-900 font-mono tracking-tight select-none">
              {currentQ.text}
            </div>

            {/* Input display if using numpad */}
            {inputMode === 'numpad' && (
              <div className="inline-block px-8 py-3 rounded-2xl bg-amber-50 border-3 border-amber-400 text-3xl font-mono font-black text-slate-900 min-w-[140px] shadow-inner">
                {currentInput || <span className="text-slate-300">?</span>}
              </div>
            )}
          </div>

          {/* Answer Feedback Banner */}
          {feedback?.show && (
            <div
              className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-4 animate-in fade-in duration-200 ${
                feedback.isCorrect
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                  : 'bg-rose-50 border-rose-400 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-3">
                {feedback.isCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-black">
                    {feedback.isCorrect ? 'Correct! Well done!' : `Correct Answer: ${feedback.correctAnswer}`}
                  </p>
                  <p className="text-xs font-medium opacity-90">{feedback.explanation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Input Toggle: Multiple Choice vs Keypad */}
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setInputMode('choice')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                inputMode === 'choice'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Choice Options
            </button>
            <button
              type="button"
              onClick={() => setInputMode('numpad')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                inputMode === 'numpad'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Number Keypad
            </button>
          </div>

          {/* Mode 1: Multiple Choice Grid */}
          {inputMode === 'choice' && (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-lg mx-auto">
              {currentQ.options.map((option, idx) => (
                <button
                  key={idx}
                  id={`dummy-option-${idx}`}
                  disabled={feedback?.show}
                  onClick={() => handleAnswerSubmit(option)}
                  className="p-4 sm:p-5 rounded-2xl bg-white hover:bg-amber-100 border-3 border-amber-900 text-xl sm:text-2xl font-black text-slate-900 font-mono shadow-[2px_2px_0px_0px_rgba(180,83,9,1)] transition active:translate-y-0.5 disabled:opacity-60"
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {/* Mode 2: Number Keypad */}
          {inputMode === 'numpad' && (
            <div className="max-w-xs mx-auto space-y-2">
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    disabled={feedback?.show}
                    onClick={() => {
                      if (k === 'C') setCurrentInput('');
                      else if (k === '⌫') setCurrentInput((prev) => prev.slice(0, -1));
                      else setCurrentInput((prev) => (prev.length < 5 ? prev + k : prev));
                    }}
                    className="p-3.5 rounded-xl bg-white hover:bg-amber-50 border-2 border-slate-300 font-black text-lg text-slate-800 font-mono active:bg-amber-100 transition shadow-xs"
                  >
                    {k}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={feedback?.show || currentInput.trim().length === 0}
                onClick={() => handleAnswerSubmit()}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition"
              >
                Submit Answer
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: DUMMY PRACTICE TEST RESULT SCREEN */}
      {/* ========================================================================= */}
      {isTestFinished && (
        <div className="bg-white rounded-[2rem] border-4 border-emerald-500 p-6 sm:p-8 shadow-pop-emerald space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 border border-emerald-400 text-emerald-900 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Dummy Practice Test Complete</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Great Practice Session!
            </h2>
            <p className="text-sm text-slate-600 font-medium max-w-lg mx-auto">
              This was an <strong>unlimited dummy test</strong>. It gave you practice without pressure.
            </p>
          </div>

          {/* CRITICAL NOTICE CARD: NO XP, NO POINTS, NO TROPHIES */}
          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed font-medium">
              <strong>Practice Policy Confirmation:</strong> Dummy tests do not award XP, leaderboard points, or trophies.
              Your official daily examination streak and quota are untouched. You can practice as many times as you want!
            </div>
          </div>

          {/* STATS TILES */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-white border-2 border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Accuracy</span>
              <p className="text-2xl font-black text-emerald-600 font-mono">
                {Math.round((testLogs.filter((l) => l.isCorrect).length / (testLogs.length || 1)) * 100)}%
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border-2 border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Score</span>
              <p className="text-2xl font-black text-indigo-600 font-mono">
                {testLogs.filter((l) => l.isCorrect).length} / {testLogs.length}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border-2 border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">XP Awarded</span>
              <p className="text-2xl font-black text-slate-400 font-mono">
                +0 XP
              </p>
              <span className="text-[9px] font-bold text-slate-400">(Dummy Test)</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border-2 border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Trophies</span>
              <p className="text-2xl font-black text-slate-400 font-mono">
                0
              </p>
              <span className="text-[9px] font-bold text-slate-400">(Practice Mode)</span>
            </div>
          </div>

          {/* QUESTION REVIEW ACCORDION / LIST */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Question Review ({testLogs.length})
            </h3>
            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {testLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    log.isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/60 border-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {log.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span className="font-mono font-bold text-slate-800">{log.question.text}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-600">
                      Your answer: <strong className={log.isCorrect ? 'text-emerald-700' : 'text-rose-700'}>{log.studentAnswer || 'None'}</strong>
                    </span>
                    {!log.isCorrect && (
                      <span className="text-emerald-800 font-bold">
                        Correct: {log.question.correctAnswer}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => startDummyTest()}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs uppercase tracking-wider border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Take Another Dummy Test (Unlimited)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsTestFinished(false);
                setIsTesting(false);
                setActiveSubTab('table');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider transition"
            >
              Back to Study Table
            </button>

            {onOpenMistakes && testLogs.some((l) => !l.isCorrect) && (
              <button
                type="button"
                onClick={onOpenMistakes}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 border-2 border-amber-900 font-black text-xs uppercase tracking-wider transition shadow-[2px_2px_0px_0px_rgba(180,83,9,1)]"
              >
                Review Saved Mistakes
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 3: TABLE CHART & LEARNING LAB (When not testing) */}
      {/* ========================================================================= */}
      {!isTesting && !isTestFinished && activeSubTab === 'table' && (
        <div className="space-y-6">
          {/* TABLE NUMBER SELECTOR (1 through 20) */}
          <div className="bg-white rounded-[2rem] border-4 border-amber-900 p-5 sm:p-6 shadow-pop-amber space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Select Times Table to Study
              </span>
              <span className="text-xs font-bold text-amber-900">
                My Assigned Range: Table {profile.assignedMinTable || 2} to Table {profile.assignedMaxTable || 12}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 19 }, (_, i) => i + 2).map((num) => {
                const isSelected = selectedTable === num;
                const isAssigned =
                  num >= (profile.assignedMinTable || 2) && num <= (profile.assignedMaxTable || 12);

                return (
                  <button
                    key={num}
                    id={`btn-select-table-${num}`}
                    onClick={() => {
                      sounds.playTick();
                      setSelectedTable(num);
                    }}
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl font-black text-sm flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-amber-400 border-3 border-amber-900 text-amber-950 shadow-[2px_2px_0px_0px_rgba(180,83,9,1)] -translate-y-0.5'
                        : isAssigned
                        ? 'bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 text-emerald-950'
                        : 'bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>{num}</span>
                    {isAssigned && !isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN SELECTED TABLE DISPLAY & MEMORY TRICK CARD */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LEFT 2 COLS: THE ACTUAL TIMES TABLE CHART (1 to 12) */}
            <div className="md:col-span-2 bg-white rounded-[2rem] border-4 border-amber-900 p-6 shadow-pop-amber space-y-4">
              <div className="flex items-center justify-between border-b-2 border-amber-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 border-2 border-amber-900 text-amber-950 font-black text-lg flex items-center justify-center shadow-[1px_1px_0px_0px_rgba(180,83,9,1)]">
                    {selectedTable}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      Table of {selectedTable}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Multiplication chart from 1 to 10 (Range 1 to 10)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => readTableAloud(selectedTable)}
                    className={`px-3 py-1.5 rounded-xl border-2 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition ${
                      isSpeaking
                        ? 'bg-rose-100 border-rose-300 text-rose-800 animate-pulse'
                        : 'bg-white hover:bg-amber-100 border-slate-200 text-slate-700'
                    }`}
                    title="Listen to table read aloud"
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isSpeaking ? 'Stop Audio' : 'Listen'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => startDummyTest(selectedTable)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs uppercase tracking-wider border-b-2 border-emerald-700 active:border-b-0 transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Practice Table {selectedTable}</span>
                  </button>
                </div>
              </div>

              {/* TABLE MULTIPLICATION ROWS (Strictly 1 to 10) */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {Array.from({ length: 10 }, (_, idx) => idx + 1).map((m) => {
                  const product = selectedTable * m;
                  return (
                    <div
                      key={m}
                      className="p-3 rounded-2xl bg-amber-50/50 hover:bg-amber-100/70 border-2 border-amber-200 flex flex-col justify-between gap-1 transition group"
                    >
                      <div className="font-mono text-xs font-black text-slate-700">
                        <span>{selectedTable}</span>
                        <span className="text-amber-700 mx-1">×</span>
                        <span>{m}</span>
                      </div>
                      <div className="font-mono text-base font-black text-indigo-700 bg-white px-2 py-0.5 rounded-lg border border-amber-300 shadow-2xs text-center">
                        = {product}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* REPEATED ADDITION EXPANSION */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  <strong>Concept:</strong> Multiplication is repeated addition.{' '}
                  {selectedTable} × 4 = {Array(4).fill(selectedTable).join(' + ')} = {selectedTable * 4}.
                </span>
              </div>
            </div>

            {/* RIGHT 1 COL: TIPS & QUICK DUMMY TEST LAUNCHER */}
            <div className="space-y-4">
              {/* MEMORY TIP CARD */}
              <div className="bg-white rounded-[2rem] border-4 border-amber-900 p-5 shadow-pop-amber space-y-3">
                <div className="flex items-center gap-2 text-amber-800">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    {TABLE_TIPS[selectedTable]?.title || `Table ${selectedTable} Insight`}
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-bold leading-relaxed">
                  {TABLE_TIPS[selectedTable]?.pattern ||
                    `Look for patterns: every step adds exactly ${selectedTable}!`}
                </p>

                <div className="p-3 rounded-xl bg-amber-100 border border-amber-300 text-xs font-medium text-amber-950 leading-relaxed">
                  💡 {TABLE_TIPS[selectedTable]?.tip || `Practice Table ${selectedTable} with dummy tests to build speed.`}
                </div>
              </div>

              {/* QUICK LAUNCH DUMMY TEST CARD */}
              <div className="bg-emerald-50 rounded-[2rem] border-4 border-emerald-500 p-5 shadow-pop-emerald space-y-3">
                <div className="flex items-center gap-2 text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    Unlimited Dummy Test
                  </span>
                </div>
                <p className="text-xs text-emerald-800 font-medium">
                  Test your mastery of Table {selectedTable}. Unlimited attempts, 0 XP, and no impact on leaderboard.
                </p>

                <button
                  type="button"
                  onClick={() => startDummyTest(selectedTable)}
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs uppercase tracking-wider border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Test Table {selectedTable}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 4: TABLES 2 TO 20 × MULTIPLIERS 1 TO 10 GRID */}
      {/* ========================================================================= */}
      {!isTesting && !isTestFinished && activeSubTab === 'grid' && (
        <div className="bg-white rounded-[2rem] border-4 border-amber-900 p-6 sm:p-8 shadow-pop-amber space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-amber-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Times Tables Grid (Tables 2 to 20 × Multipliers 1 to 10)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Multiplication grid covering tables 2 to 20 with multipliers strictly from 1 to 10 (e.g. 19 × 10 = 190). Click any row or cell to select that table.
              </p>
            </div>
            <span className="text-xs font-black text-amber-900 px-3 py-1 rounded-full bg-amber-100 border border-amber-300">
              Selected Table: {selectedTable}
            </span>
          </div>

          <div className="overflow-x-auto pb-2">
            <table className="w-full border-collapse text-center select-none font-mono text-xs">
              <thead>
                <tr>
                  <th className="p-2 bg-slate-800 text-white font-black rounded-tl-xl border border-slate-700">
                    Table × Multiplier
                  </th>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((col) => (
                    <th
                      key={col}
                      className={`p-2 font-black border border-slate-200 transition ${
                        col === selectedTable
                          ? 'bg-amber-400 text-amber-950 font-black'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      × {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 19 }, (_, r) => r + 2).map((row) => (
                  <tr key={row}>
                    <th
                      onClick={() => {
                        setSelectedTable(row);
                        sounds.playTick();
                      }}
                      className={`p-2 font-black border border-slate-200 transition cursor-pointer ${
                        row === selectedTable
                          ? 'bg-amber-400 text-amber-950'
                          : 'bg-slate-100 text-slate-700 hover:bg-amber-100'
                      }`}
                    >
                      Table {row}
                    </th>
                    {Array.from({ length: 10 }, (_, c) => c + 1).map((col) => {
                      const prod = row * col;
                      const isTargetRow = row === selectedTable;
                      const isTargetCol = col === selectedTable;
                      const isSquare = row === col;

                      return (
                        <td
                          key={col}
                          onClick={() => {
                            setSelectedTable(row);
                            sounds.playTick();
                          }}
                          className={`p-1.5 sm:p-2 border transition cursor-pointer ${
                            isTargetRow && isTargetCol
                              ? 'bg-amber-500 text-white font-black text-sm'
                              : isTargetRow || isTargetCol
                              ? 'bg-amber-100 text-amber-950 font-black'
                              : isSquare
                              ? 'bg-indigo-50 text-indigo-900 font-bold'
                              : 'bg-white text-slate-700 hover:bg-amber-50'
                          } border-slate-200`}
                          title={`${row} × ${col} = ${prod}`}
                        >
                          {prod}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 5: UNLIMITED DUMMY TEST CONFIGURATION SCREEN */}
      {/* ========================================================================= */}
      {!isTesting && !isTestFinished && activeSubTab === 'dummy_test' && (
        <div className="bg-white rounded-[2rem] border-4 border-emerald-500 p-6 sm:p-8 shadow-pop-emerald space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Unlimited Dummy Practice Configuration</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Customize Your Dummy Practice Test
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Take as many dummy practice tests as you want. These tests do not give XP, leaderboard points,
              or trophies, so you can practice freely without pressure!
            </p>
          </div>

          {/* PARAMETER 1: TEST TABLE SCOPE */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-slate-500" />
              <span>1. Which Table(s) to Test</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setTestScope('selected')}
                className={`p-4 rounded-2xl border-2 text-left transition ${
                  testScope === 'selected'
                    ? 'bg-amber-100 border-amber-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <p className="text-xs font-black uppercase tracking-wider text-amber-950">
                  Current Selected Table
                </p>
                <p className="text-lg font-black text-slate-900 mt-1">Table {selectedTable} Only</p>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  Laser focus on mastering {selectedTable}s.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTestScope('assigned')}
                className={`p-4 rounded-2xl border-2 text-left transition ${
                  testScope === 'assigned'
                    ? 'bg-emerald-100 border-emerald-800 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <p className="text-xs font-black uppercase tracking-wider text-emerald-900">
                  Assigned Range
                </p>
                <p className="text-lg font-black text-slate-900 mt-1">
                  Tables {profile.assignedMinTable || 2} - {profile.assignedMaxTable || 12}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  Matches your teacher's assignment.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTestScope('all')}
                className={`p-4 rounded-2xl border-2 text-left transition ${
                  testScope === 'all'
                    ? 'bg-indigo-100 border-indigo-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <p className="text-xs font-black uppercase tracking-wider text-indigo-950">
                  Full Tables Blitz
                </p>
                <p className="text-lg font-black text-slate-900 mt-1">All Tables (2 - 20)</p>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  Challenge across the complete times table range (up to 10× multiplier).
                </p>
              </button>
            </div>
          </div>

          {/* PARAMETER 2: OPERATION MODE */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-slate-500" />
              <span>2. Operation Mode</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'multiplication', label: 'Multiplication (×)', desc: '7 × 8 = ?' },
                { id: 'division', label: 'Division (÷)', desc: '56 ÷ 7 = ?' },
                { id: 'missing_factor', label: 'Missing Factor', desc: '? × 8 = 56' },
                { id: 'mixed', label: 'Mixed Mode', desc: 'All formats combined' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setTestMode(m.id as any)}
                  className={`p-3 rounded-xl border-2 text-left transition ${
                    testMode === m.id
                      ? 'bg-amber-400 border-amber-900 text-amber-950 shadow-2xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <p className="text-xs font-black">{m.label}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* PARAMETER 3: QUESTION COUNT & TIMER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-slate-500" />
                <span>3. Number of Questions</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`py-2 rounded-xl border-2 font-black text-xs transition ${
                      questionCount === count
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 border-transparent text-slate-700'
                    }`}
                  >
                    {count} Qs
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>4. Question Timer</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsTimed(true)}
                  className={`py-2 px-3 rounded-xl border-2 font-black text-xs transition ${
                    isTimed
                      ? 'bg-amber-400 border-amber-900 text-amber-950 shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 border-transparent text-slate-700'
                  }`}
                >
                  ⚡ 5s per Question (Timed)
                </button>
                <button
                  type="button"
                  onClick={() => setIsTimed(false)}
                  className={`py-2 px-3 rounded-xl border-2 font-black text-xs transition ${
                    !isTimed
                      ? 'bg-emerald-500 border-emerald-800 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 border-transparent text-slate-700'
                  }`}
                >
                  Untimed (Practice)
                </button>
              </div>
            </div>
          </div>

          {/* LAUNCH BUTTON */}
          <div className="pt-4 border-t border-slate-200">
            <button
              id="btn-start-dummy-test"
              type="button"
              onClick={() => startDummyTest()}
              className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm uppercase tracking-wider border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition flex items-center justify-center gap-2 shadow-xs"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Unlimited Dummy Test Now</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
