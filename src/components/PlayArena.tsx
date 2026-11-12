import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Zap,
  Flame,
  Clock,
  Target,
  Sparkles,
  HelpCircle,
  Edit3,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Award,
  ChevronRight,
  TrendingUp,
  Sliders,
  Calendar,
  Volume2,
} from 'lucide-react';
import {
  MathOperation,
  DifficultyGrade,
  GameMode,
  Question,
  GameSessionSummary,
  StudentProfile,
} from '../types';
import { generateQuestion } from '../utils/mathGenerator';
import { sounds } from '../utils/audio';
import { MathDiagram } from './MathDiagram';

interface PlayArenaProps {
  profile: StudentProfile;
  onFinishGame: (summary: GameSessionSummary, mistakes: { question: Question; answer: string }[]) => void;
  onOpenScratchpad: () => void;
  initialMode?: GameMode;
  initialOperation?: MathOperation;
  initialDifficulty?: DifficultyGrade;
}

export const PlayArena: React.FC<PlayArenaProps> = ({
  profile,
  onFinishGame,
  onOpenScratchpad,
  initialMode = 'blitz',
  initialOperation = 'multiplication',
  initialDifficulty,
}) => {
  // Game Setup State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [mode, setMode] = useState<GameMode>(initialMode);
  const [operation, setOperation] = useState<MathOperation>(initialOperation);
  const [difficulty, setDifficulty] = useState<DifficultyGrade>(initialDifficulty || profile.grade);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [inputMode, setInputMode] = useState<'choice' | 'numpad'>('choice');

  // Active Game State
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [numpadValue, setNumpadValue] = useState<string>('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Scores & Counters
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreakInGame, setMaxStreakInGame] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState<number>(0);

  // History of current session
  const [sessionMistakes, setSessionMistakes] = useState<{ question: Question; answer: string }[]>([]);
  const [sessionAnswers, setSessionAnswers] = useState<{
    question: Question;
    givenAnswer: string;
    isCorrect: boolean;
    timeMs: number;
  }[]>([]);

  // Modals & End Screen
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const questionStartTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start a new game
  const startGame = (
    selectedMode = mode,
    selectedOp = operation,
    selectedDiff = difficulty
  ) => {
    setIsPlaying(true);
    setIsGameOver(false);
    setMode(selectedMode);
    setOperation(selectedOp);
    setDifficulty(selectedDiff);
    setScore(0);
    setStreak(0);
    setMaxStreakInGame(0);
    setCorrectCount(0);
    setWrongCount(0);
    setQuestionIndex(0);
    setSessionMistakes([]);
    setSessionAnswers([]);
    setFeedback(null);
    setSelectedOption(null);
    setNumpadValue('');
    setShowHint(false);
    setTotalTimeElapsed(0);

    const initialTime = selectedMode === 'blitz' ? 60 : 0;
    setTimeLeft(initialTime);

    const firstQ = generateQuestion(selectedOp, selectedDiff, 0);
    setCurrentQuestion(firstQ);
    questionStartTimeRef.current = Date.now();
  };

  // Timer loop
  useEffect(() => {
    if (!isPlaying || isGameOver) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTotalTimeElapsed((prev) => prev + 1);

      if (mode === 'blitz') {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          if (prev <= 6) {
            sounds.playTick();
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isGameOver, mode]);

  // Keyboard support for answering
  useEffect(() => {
    if (!isPlaying || isGameOver || !currentQuestion || feedback) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '4' && inputMode === 'choice') {
        const optIdx = parseInt(e.key, 10) - 1;
        if (currentQuestion.options[optIdx] !== undefined) {
          handleAnswer(currentQuestion.options[optIdx]);
        }
      } else if (inputMode === 'numpad') {
        if (e.key >= '0' && e.key <= '9') {
          setNumpadValue((prev) => (prev.length < 6 ? prev + e.key : prev));
        } else if (e.key === 'Backspace') {
          setNumpadValue((prev) => prev.slice(0, -1));
        } else if (e.key === 'Enter') {
          if (numpadValue.trim()) {
            handleAnswer(numpadValue.trim());
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver, currentQuestion, feedback, inputMode, numpadValue]);

  // Handle Answer
  const handleAnswer = (answer: string) => {
    if (!currentQuestion || feedback) return;

    setSelectedOption(answer);
    const isCorrect =
      answer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();
    const timeTakenMs = Date.now() - questionStartTimeRef.current;

    const answerRecord = {
      question: currentQuestion,
      givenAnswer: answer,
      isCorrect,
      timeMs: timeTakenMs,
    };
    setSessionAnswers((prev) => [...prev, answerRecord]);

    if (isCorrect) {
      sounds.playCorrect();
      setFeedback('correct');
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreakInGame) setMaxStreakInGame(newStreak);

      if (newStreak >= 3 && newStreak % 3 === 0) {
        sounds.playCombo(newStreak);
      }

      // Calculate score points with streak multiplier
      const multiplier = 1 + Math.min(newStreak * 0.2, 2.5);
      const basePoints = mode === 'blitz' ? 10 : 15;
      const speedBonus = timeTakenMs < 3000 ? 5 : 0;
      const gained = Math.round((basePoints + speedBonus) * multiplier);
      setScore((prev) => prev + gained);
      setCorrectCount((prev) => prev + 1);

      // Auto proceed after brief delay
      setTimeout(() => {
        proceedToNextQuestion();
      }, 550);
    } else {
      sounds.playWrong();
      setFeedback('wrong');
      setWrongCount((prev) => prev + 1);
      setStreak(0);
      setSessionMistakes((prev) => [...prev, { question: currentQuestion, answer }]);

      if (mode === 'streak') {
        // In Flawless Streak mode, 1 wrong ends the game!
        setTimeout(() => {
          handleGameOver();
        }, 1200);
        return;
      }

      setTimeout(() => {
        proceedToNextQuestion();
      }, 950);
    }
  };

  const proceedToNextQuestion = () => {
    const nextIdx = questionIndex + 1;
    const maxQ =
      mode === 'blitz'
        ? 999
        : mode === 'daily'
        ? 5
        : questionCount;

    if (mode !== 'blitz' && nextIdx >= maxQ) {
      handleGameOver();
      return;
    }

    setQuestionIndex(nextIdx);
    setFeedback(null);
    setSelectedOption(null);
    setNumpadValue('');
    setShowHint(false);
    setCurrentQuestion(generateQuestion(operation, difficulty, nextIdx));
    questionStartTimeRef.current = Date.now();
  };

  const handleGameOver = () => {
    setIsGameOver(true);
    setIsPlaying(false);

    const totalQ = correctCount + wrongCount;
    const accuracy = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;
    const xpGained = Math.max(15, Math.round(score * 1.2 + correctCount * 5));

    if (accuracy >= 80 && totalQ >= 5) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      sounds.playLevelUp();
    }

    const summary: GameSessionSummary = {
      id: `session_${Date.now()}`,
      timestamp: new Date().toISOString(),
      mode,
      operation,
      difficulty,
      score,
      totalQuestions: totalQ,
      correctQuestions: correctCount,
      timeSpentSec: totalTimeElapsed || 1,
      accuracy,
      xpGained,
    };

    onFinishGame(summary, sessionMistakes);
  };

  return (
    <div id="play-arena-container" className="max-w-4xl mx-auto space-y-6">
      {/* MODE SELECTOR & START SCREEN */}
      {!isPlaying && !isGameOver && (
        <div className="space-y-6">
          {/* Hero Banner */}
          <div className="bg-white rounded-[2rem] border-4 border-sky-400 p-6 sm:p-8 shadow-pop-sky relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border-2 border-amber-300 text-amber-900 text-xs font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Math Mastery Training</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight leading-tight uppercase italic">
                  Train Your Mind. Conquer The Board.
                </h1>
                <p className="text-sm sm:text-base text-slate-600 font-medium">
                  Solve rapid arithmetic, equations, fractions & geometry to build lightning mental agility and climb the global rankings.
                </p>
              </div>

              <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-200 shrink-0 text-center">
                <p className="text-xs font-black text-amber-700 uppercase">Current Tier</p>
                <p className="text-2xl font-black text-amber-900 mt-0.5 uppercase">{difficulty}</p>
                <div className="flex items-center justify-center gap-1 mt-1 text-[11px] font-black text-emerald-600">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span>READY TO PLAY</span>
                </div>
              </div>
            </div>
          </div>

          {/* Game Modes Grid */}
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase italic mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span>Choose Game Mode</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Speed Blitz */}
              <div
                id="mode-card-blitz"
                onClick={() => setMode('blitz')}
                className={`cursor-pointer p-5 rounded-2xl border-3 transition-all relative ${
                  mode === 'blitz'
                    ? 'border-amber-500 bg-amber-50 shadow-pop-amber'
                    : 'border-slate-200 bg-white hover:border-amber-300 hover:shadow-xs'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center mb-3 border-2 border-amber-900 shadow-[2px_2px_0px_0px_rgba(180,83,9,1)] font-black text-lg">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-800 text-base uppercase">Speed Blitz</h3>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-400">
                    60 SEC
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1.5">
                  Rapid-fire 60s sprint. Chain correct answers to multiply your score!
                </p>
              </div>

              {/* Flawless Streak */}
              <div
                id="mode-card-streak"
                onClick={() => setMode('streak')}
                className={`cursor-pointer p-5 rounded-2xl border-3 transition-all relative ${
                  mode === 'streak'
                    ? 'border-rose-500 bg-rose-50 shadow-pop-rose'
                    : 'border-slate-200 bg-white hover:border-rose-300 hover:shadow-xs'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-400 text-rose-950 flex items-center justify-center mb-3 border-2 border-rose-900 shadow-[2px_2px_0px_0px_rgba(244,63,94,1)] font-black text-lg">
                  <Flame className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-800 text-base uppercase">Flawless Streak</h3>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 border border-rose-400">
                    1 LIFE
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1.5">
                  Survive as long as possible. One single mistake ends the run!
                </p>
              </div>

              {/* Daily Challenge */}
              <div
                id="mode-card-daily"
                onClick={() => setMode('daily')}
                className={`cursor-pointer p-5 rounded-2xl border-3 transition-all relative ${
                  mode === 'daily'
                    ? 'border-purple-500 bg-purple-50 shadow-pop-purple'
                    : 'border-slate-200 bg-white hover:border-purple-300 hover:shadow-xs'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-400 text-purple-950 flex items-center justify-center mb-3 border-2 border-purple-900 shadow-[2px_2px_0px_0px_rgba(168,85,247,1)] font-black text-lg">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-800 text-base uppercase">Daily Challenge</h3>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 border border-purple-400">
                    +150 XP
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1.5">
                  5 curated math problems across operations. Earn daily trophy points!
                </p>
              </div>
            </div>
          </div>

          {/* Operation & Difficulty Settings */}
          <div className="bg-white rounded-[2rem] border-4 border-indigo-400 p-6 sm:p-8 shadow-pop-indigo space-y-6">
            <h3 className="font-black text-slate-800 text-lg uppercase italic flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <span>Practice Parameters</span>
            </h3>

            {/* Operation Selector */}
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2.5">
                Math Topic
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { op: 'addition', label: 'Addition', icon: '+' },
                  { op: 'subtraction', label: 'Subtraction', icon: '−' },
                  { op: 'multiplication', label: 'Multiplication', icon: '×' },
                  { op: 'division', label: 'Division', icon: '÷' },
                  { op: 'fractions', label: 'Fractions', icon: '½' },
                  { op: 'algebra', label: 'Algebra', icon: 'x' },
                  { op: 'geometry', label: 'Geometry', icon: '📐' },
                  { op: 'mixed', label: 'Mixed Master', icon: '⚡' },
                ].map((item) => (
                  <button
                    key={item.op}
                    id={`btn-op-${item.op}`}
                    onClick={() => setOperation(item.op as MathOperation)}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border-2 text-xs font-black uppercase tracking-tight transition text-left ${
                      operation === item.op
                        ? 'bg-amber-400 border-amber-900 text-amber-950 shadow-[3px_3px_0px_0px_rgba(180,83,9,1)] translate-y-[-1px]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 bg-white'
                    }`}
                  >
                    <span className="w-7 h-7 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center font-black text-slate-900 text-sm">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Grade Tier */}
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2.5">
                Grade / Tier
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { diff: 'rookie', title: 'Rookie', sub: 'Grades 1-2' },
                  { diff: 'explorer', title: 'Explorer', sub: 'Grades 3-4' },
                  { diff: 'champion', title: 'Champion', sub: 'Grades 5-6' },
                  { diff: 'master', title: 'Master', sub: 'Grades 7-8+' },
                ].map((item) => (
                  <button
                    key={item.diff}
                    id={`btn-diff-${item.diff}`}
                    onClick={() => setDifficulty(item.diff as DifficultyGrade)}
                    className={`p-3 rounded-2xl border-2 text-center transition ${
                      difficulty === item.diff
                        ? 'bg-indigo-400 border-indigo-900 text-indigo-950 shadow-[3px_3px_0px_0px_rgba(49,46,129,1)] translate-y-[-1px]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="text-xs font-black uppercase">{item.title}</div>
                    <div className="text-[10px] font-bold opacity-80">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Method Preference */}
            <div className="flex items-center justify-between pt-2 border-t-2 border-slate-100">
              <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Answer Input Style:</span>
              <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                <button
                  onClick={() => setInputMode('choice')}
                  className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-xl transition ${
                    inputMode === 'choice' ? 'bg-amber-400 text-amber-950 border border-amber-600 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Choice
                </button>
                <button
                  onClick={() => setInputMode('numpad')}
                  className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-xl transition ${
                    inputMode === 'numpad' ? 'bg-amber-400 text-amber-950 border border-amber-600 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Numpad
                </button>
              </div>
            </div>

            {/* Launch Button */}
            <button
              id="btn-start-game"
              onClick={() => startGame()}
              className="mt-4 w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl border-b-8 border-emerald-700 active:border-b-0 active:translate-y-2 uppercase tracking-widest text-base shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 fill-white" />
              <span>Start Practice Session</span>
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE GAME PLAY BOARD */}
      {isPlaying && currentQuestion && (
        <div className="space-y-4">
          {/* Top Status HUD */}
          <div className="bg-white rounded-2xl border-3 border-amber-300 p-4 flex items-center justify-between gap-4 shadow-sm">
            {/* Left: Mode / Q Index */}
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-xl bg-amber-400 border border-amber-600 text-amber-950 text-xs font-black uppercase tracking-wider">
                {mode === 'blitz' ? 'Speed Blitz' : mode === 'streak' ? 'Flawless Streak' : 'Daily Drill'}
              </div>
              <span className="text-xs font-black text-slate-700 uppercase">
                Q#{questionIndex + 1}
              </span>
            </div>

            {/* Center: Timer / Streak */}
            <div className="flex items-center gap-3">
              {mode === 'blitz' && (
                <div
                  className={`flex items-center gap-1.5 px-3.5 py-1 rounded-xl font-mono font-black text-sm border-2 ${
                    timeLeft <= 10
                      ? 'bg-rose-100 text-rose-700 animate-pulse border-rose-400'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>{timeLeft}s</span>
                </div>
              )}

              {/* Combo Streak */}
              <div
                className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-tight border-2 ${
                  streak >= 3
                    ? 'bg-amber-400 text-amber-950 border-amber-600 animate-bounce shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                <Flame className={`w-4 h-4 ${streak >= 3 ? 'text-amber-950 fill-amber-950' : 'text-slate-400'}`} />
                <span>{streak}x Combo</span>
              </div>
            </div>

            {/* Right: Score */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-black uppercase">Score:</span>
              <span className="font-black text-amber-700 text-lg">{score}</span>
            </div>
          </div>

          {/* Main Question Card */}
          <div className="bg-white rounded-[2rem] border-4 border-sky-400 p-6 sm:p-8 shadow-pop-sky text-center relative overflow-hidden">
            {/* Top helper actions */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                {currentQuestion.operation} • {currentQuestion.difficulty}
              </span>
              <div className="flex items-center gap-2">
                <button
                  id="btn-hint"
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 border-2 border-amber-500 text-amber-950 text-xs font-black uppercase tracking-wider transition"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Hint</span>
                </button>
                <button
                  id="btn-in-game-scratchpad"
                  onClick={onOpenScratchpad}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-800 text-xs font-black uppercase tracking-wider transition"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Scratchpad</span>
                </button>
              </div>
            </div>

            {/* Hint Box (if toggled) */}
            {showHint && (
              <div className="mb-4 p-3 rounded-2xl bg-amber-100 border-2 border-amber-400 text-amber-950 text-xs text-left">
                <p className="font-black mb-0.5">💡 Strategy Tip:</p>
                <p className="font-medium">{currentQuestion.hint}</p>
              </div>
            )}

            {/* Geometry / Fraction Diagram if applicable */}
            <MathDiagram type={currentQuestion.diagramType} props={currentQuestion.diagramProps} />

            {/* Question Text */}
            <div className="my-6">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight leading-snug">
                {currentQuestion.text}
              </h2>
            </div>

            {/* Answer Options (Multiple Choice) */}
            {inputMode === 'choice' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                {currentQuestion.options.map((opt, i) => {
                  const isSelected = selectedOption === opt;
                  let btnStyle =
                    'border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-400 text-slate-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.06)]';

                  if (feedback && isSelected) {
                    btnStyle =
                      feedback === 'correct'
                        ? 'bg-emerald-500 border-emerald-700 text-white shadow-pop-emerald'
                        : 'bg-rose-500 border-rose-700 text-white shadow-pop-rose';
                  } else if (feedback && opt === currentQuestion.correctAnswer) {
                    btnStyle = 'bg-emerald-100 border-emerald-600 text-emerald-950 font-black shadow-xs';
                  }

                  return (
                    <button
                      key={i}
                      id={`btn-option-${i}`}
                      disabled={feedback !== null}
                      onClick={() => handleAnswer(opt)}
                      className={`p-4 rounded-2xl border-3 text-base sm:text-xl font-black transition flex items-center justify-between ${btnStyle} active:scale-98`}
                    >
                      <span className="w-7 h-7 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 text-xs flex items-center justify-center font-black">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-center font-mono">{opt}</span>
                      <span className="w-7"></span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Direct Numpad Input */}
            {inputMode === 'numpad' && (
              <div className="max-w-xs mx-auto space-y-3">
                <div className="flex items-center justify-center p-3 rounded-2xl bg-amber-50 border-2 border-amber-300 font-mono text-2xl font-black text-amber-950 min-h-[56px]">
                  {numpadValue || <span className="text-slate-400 font-normal">Type answer...</span>}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      onClick={() => setNumpadValue((prev) => (prev.length < 6 ? prev + num : prev))}
                      className="p-3 rounded-2xl bg-white border-2 border-slate-200 hover:border-amber-400 hover:bg-amber-50 font-black text-lg text-slate-800 transition active:scale-95 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.06)]"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    onClick={() => setNumpadValue('')}
                    className="p-3 rounded-2xl bg-rose-100 border-2 border-rose-300 text-rose-700 font-black text-xs hover:bg-rose-200 transition"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setNumpadValue((prev) => (prev.length < 6 ? prev + '0' : prev))}
                    className="p-3 rounded-2xl bg-white border-2 border-slate-200 hover:border-amber-400 hover:bg-amber-50 font-black text-lg text-slate-800 transition"
                  >
                    0
                  </button>
                  <button
                    onClick={() => {
                      if (numpadValue.trim()) handleAnswer(numpadValue.trim());
                    }}
                    className="p-3 rounded-2xl bg-emerald-500 border-2 border-emerald-700 text-white font-black text-sm hover:bg-emerald-600 transition shadow-[2px_2px_0px_0px_rgba(4,120,87,1)]"
                  >
                    Enter
                  </button>
                </div>
              </div>
            )}

            {/* Step-by-step explanation reveal upon answering */}
            {feedback && (
              <div
                className={`mt-6 p-4 rounded-2xl text-left text-xs border-2 ${
                  feedback === 'correct'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-1.5 font-black mb-1">
                  {feedback === 'correct' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>
                    {feedback === 'correct'
                      ? 'Brilliant! Correct Solution'
                      : `Incorrect. Correct answer is ${currentQuestion.correctAnswer}`}
                  </span>
                </div>
                <p className="text-slate-700 mt-1 font-medium">{currentQuestion.explanation}</p>
              </div>
            )}
          </div>

          {/* Quick Exit / End Session */}
          <div className="flex justify-end">
            <button
              id="btn-end-session"
              onClick={handleGameOver}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold px-3 py-1.5 rounded-xl transition"
            >
              Finish Session Early
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER & SUMMARY MODAL */}
      {isGameOver && (
        <div className="bg-white rounded-[2rem] border-4 border-emerald-400 p-6 sm:p-8 shadow-pop-emerald space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-amber-400 border-2 border-amber-900 text-amber-950 flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_rgba(180,83,9,1)]">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 uppercase italic">Session Complete!</h2>
            <p className="text-sm text-slate-600 font-medium">
              Performance saved to your offline profile and recorded to leaderboard standings.
            </p>
          </div>

          {/* Metrics summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-200 text-center">
              <p className="text-xs font-black text-indigo-700 uppercase">Total Score</p>
              <p className="text-2xl font-black text-indigo-950 mt-1">{score}</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-center">
              <p className="text-xs font-black text-emerald-700 uppercase">Accuracy</p>
              <p className="text-2xl font-black text-emerald-950 mt-1">
                {correctCount + wrongCount > 0
                  ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
                  : 0}
                %
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 text-center">
              <p className="text-xs font-black text-amber-700 uppercase">Best Streak</p>
              <p className="text-2xl font-black text-amber-950 mt-1">{maxStreakInGame}x</p>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-200 text-center">
              <p className="text-xs font-black text-purple-700 uppercase">XP Gained</p>
              <p className="text-2xl font-black text-purple-950 mt-1">
                +{Math.max(15, Math.round(score * 1.2 + correctCount * 5))}
              </p>
            </div>
          </div>

          {/* Answer Breakdown Log */}
          {sessionAnswers.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-black text-slate-800 text-sm uppercase flex items-center justify-between">
                <span>Question Breakdown</span>
                <span className="text-xs font-bold text-slate-500">
                  {correctCount} correct / {sessionAnswers.length} total
                </span>
              </h3>

              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {sessionAnswers.map((ans, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border-2 flex items-start justify-between gap-3 text-xs ${
                      ans.isCorrect
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        : 'bg-rose-50/70 border-rose-200 text-rose-950'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-800">{ans.question.text}</span>
                      <div className="text-[11px] text-slate-600 mt-0.5 font-medium">
                        Your answer: <span className="font-mono font-bold">{ans.givenAnswer}</span>
                        {!ans.isCorrect && (
                          <span className="ml-2 text-rose-600 font-bold">
                            (Correct: {ans.question.correctAnswer})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 font-black text-[11px]">
                      {ans.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>{(ans.timeMs / 1000).toFixed(1)}s</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              id="btn-play-again"
              onClick={() => startGame(mode, operation, difficulty)}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
            <button
              id="btn-back-to-menu"
              onClick={() => {
                setIsGameOver(false);
                setIsPlaying(false);
              }}
              className="flex-1 py-3.5 px-4 rounded-2xl border-2 border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition"
            >
              <span>Back to Modes</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
