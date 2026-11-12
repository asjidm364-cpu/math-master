import React, { useState } from 'react';
import {
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  BookOpen,
  ArrowRight,
  Target,
} from 'lucide-react';
import { MistakeRecord, Question } from '../types';
import { sounds } from '../utils/audio';
import { MathDiagram } from './MathDiagram';

interface MistakeReviewProps {
  mistakes: MistakeRecord[];
  onMistakeMastered: (mistakeId: string) => void;
  onOpenScratchpad: () => void;
}

export const MistakeReview: React.FC<MistakeReviewProps> = ({
  mistakes,
  onMistakeMastered,
  onOpenScratchpad,
}) => {
  const [activePracticeId, setActivePracticeId] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);

  const activeMistake = mistakes.find((m) => m.id === activePracticeId);

  const handleStartRetry = (mistake: MistakeRecord) => {
    setActivePracticeId(mistake.id);
    setSelectedOption(null);
    setFeedback(null);
    setShowHint(false);
  };

  const handleAnswer = (option: string) => {
    if (!activeMistake || feedback) return;

    setSelectedOption(option);
    const isCorrect =
      option.trim().toLowerCase() === activeMistake.question.correctAnswer.trim().toLowerCase();

    if (isCorrect) {
      sounds.playCorrect();
      setFeedback('correct');
      setTimeout(() => {
        onMistakeMastered(activeMistake.id);
        setActivePracticeId(null);
      }, 1400);
    } else {
      sounds.playWrong();
      setFeedback('wrong');
    }
  };

  const unmasteredMistakes = mistakes.filter((m) => !m.mastered);
  const masteredMistakes = mistakes.filter((m) => m.mastered);

  return (
    <div id="mistake-review-container" className="max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-[2rem] border-4 border-rose-400 p-6 sm:p-8 shadow-pop-rose relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 border-2 border-rose-300 text-rose-900 text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
              <span>Smart Error Correction</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight uppercase italic">
              Mistake Notebook & Mastery
            </h1>
            <p className="text-sm text-slate-600 font-medium">
              Transform missed questions into your greatest math strengths. Retry and master past errors to solidify your arithmetic skills.
            </p>
          </div>

          <div className="bg-rose-50 rounded-2xl p-4 border-2 border-rose-200 shrink-0 text-center shadow-xs">
            <p className="text-xs text-rose-800 font-black uppercase tracking-wider">Active Review Queue</p>
            <p className="text-3xl font-black text-rose-950 mt-1 font-mono">
              {unmasteredMistakes.length}
            </p>
            <p className="text-[11px] font-black text-emerald-700 mt-1 uppercase">
              {masteredMistakes.length} Mastered
            </p>
          </div>
        </div>
      </div>

      {/* ACTIVE RETRY MODAL / CARD */}
      {activeMistake && (
        <div className="bg-white rounded-[2rem] border-4 border-indigo-400 p-6 sm:p-8 shadow-pop-indigo space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-950 bg-indigo-100 border border-indigo-300 px-3 py-1 rounded-xl">
              Re-attempting Missed Problem
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 border-2 border-amber-400 text-amber-950 text-xs font-black uppercase tracking-wider"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Hint</span>
              </button>
              <button
                onClick={onOpenScratchpad}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-800 text-xs font-black uppercase tracking-wider"
              >
                <span>Scratchpad</span>
              </button>
            </div>
          </div>

          {showHint && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs">
              <p className="font-black">💡 Strategy Tip:</p>
              <p className="mt-0.5 font-medium">{activeMistake.question.hint}</p>
            </div>
          )}

          <MathDiagram
            type={activeMistake.question.diagramType}
            props={activeMistake.question.diagramProps}
          />

          <div className="text-center my-4">
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900">
              {activeMistake.question.text}
            </h3>
            <p className="text-xs text-rose-600 font-bold mt-2">
              Previous attempt was: <span className="font-mono">{activeMistake.studentAnswer}</span>
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
            {activeMistake.question.options.map((opt, i) => {
              const isSelected = selectedOption === opt;
              let style = 'bg-white border-slate-200 hover:bg-amber-50 hover:border-amber-400 text-slate-800 shadow-xs';

              if (feedback && isSelected) {
                style =
                  feedback === 'correct'
                    ? 'bg-emerald-500 border-emerald-700 text-white font-black shadow-pop-emerald'
                    : 'bg-rose-500 border-rose-700 text-white font-black shadow-pop-rose';
              } else if (feedback && opt === activeMistake.question.correctAnswer) {
                style = 'bg-emerald-100 border-emerald-600 text-emerald-950 font-black';
              }

              return (
                <button
                  key={i}
                  disabled={feedback !== null}
                  onClick={() => handleAnswer(opt)}
                  className={`p-4 rounded-2xl border-3 text-base sm:text-lg font-black transition flex items-center justify-center ${style} active:scale-98`}
                >
                  <span className="font-mono">{opt}</span>
                </button>
              );
            })}
          </div>

          {feedback && (
            <div
              className={`p-4 rounded-2xl text-xs text-left border-2 ${
                feedback === 'correct'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}
            >
              <p className="font-black">
                {feedback === 'correct' ? '🎉 Great Job! Mastered!' : 'Still not quite right.'}
              </p>
              <p className="mt-1 font-medium">{activeMistake.question.explanation}</p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => setActivePracticeId(null)}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* QUEUE LIST */}
      {unmasteredMistakes.length === 0 ? (
        <div className="bg-white rounded-[2rem] border-4 border-emerald-400 p-10 text-center space-y-3 shadow-pop-emerald">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 border-2 border-emerald-400 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase italic">Your Mistake Notebook is Clear!</h3>
          <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto">
            You have mastered all previously missed questions or haven't made any errors yet. Keep up the flawless work!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">
            Questions Needing Practice ({unmasteredMistakes.length})
          </h3>

          {unmasteredMistakes.map((record) => (
            <div
              key={record.id}
              className="p-4 bg-white rounded-2xl border-3 border-slate-200 hover:border-amber-400 hover:shadow-pop-amber flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900 font-mono">
                    {record.question.text}
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-800 uppercase tracking-wider">
                    {record.question.operation}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Your last answer:{' '}
                  <span className="font-mono text-rose-600 font-bold">{record.studentAnswer}</span>{' '}
                  • Correct: <span className="font-mono text-emerald-700 font-black">{record.question.correctAnswer}</span>
                </p>
              </div>

              <button
                onClick={() => handleStartRetry(record)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-900 text-amber-950 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(180,83,9,1)] transition active:translate-y-0.5 active:shadow-none shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Problem</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
