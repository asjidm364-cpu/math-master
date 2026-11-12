import React from 'react';
import { BookOpen, Lock, Star, Play, Sparkles, CheckCircle, Trophy, ShieldAlert } from 'lucide-react';
import { QuestStage, StudentProfile } from '../types';
import { sounds } from '../utils/audio';

interface QuestModeProps {
  stages: QuestStage[];
  profile: StudentProfile;
  onLaunchStage: (stage: QuestStage) => void;
}

export const QuestMode: React.FC<QuestModeProps> = ({ stages, profile, onLaunchStage }) => {
  const totalStars = stages.reduce((acc, s) => acc + (s.starsEarned || 0), 0);
  const maxPossibleStars = stages.length * 3;

  return (
    <div id="quest-mode-container" className="max-w-4xl mx-auto space-y-6">
      {/* Header World Map Banner */}
      <div className="bg-white rounded-[2rem] border-4 border-emerald-400 p-6 sm:p-8 shadow-pop-emerald relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border-2 border-emerald-300 text-emerald-900 text-xs font-black uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
              <span>Curriculum Quest Journey</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight uppercase italic">
              Math Worlds & Mastery Stages
            </h1>
            <p className="text-sm text-slate-600 font-medium">
              Clear foundational arithmetic, unlock equations & geometry, and defeat the Boss Grandmaster Trial.
            </p>
          </div>

          {/* Star progress card */}
          <div className="bg-amber-100 rounded-2xl p-4 border-2 border-amber-300 flex items-center gap-4 shrink-0 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-amber-950 border-2 border-amber-900 flex items-center justify-center font-black shadow-[2px_2px_0px_0px_rgba(180,83,9,1)]">
              <Star className="w-7 h-7 fill-amber-950 text-amber-950" />
            </div>
            <div>
              <p className="text-xs text-amber-800 font-black uppercase tracking-wider">Quest Stars</p>
              <p className="text-xl font-black text-slate-900">
                {totalStars} / {maxPossibleStars}
              </p>
              <div className="w-28 h-2.5 bg-amber-200 border border-amber-400 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((totalStars / maxPossibleStars) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quest Stages List */}
      <div className="space-y-3">
        {stages.map((stage, idx) => {
          const isUnlocked = stage.isUnlocked || profile.totalXP >= stage.requiredXP;
          const stars = stage.starsEarned || 0;

          return (
            <div
              key={stage.id}
              id={`quest-stage-${stage.stageNumber}`}
              className={`p-5 rounded-2xl border-3 transition-all ${
                stage.isBossStage
                  ? isUnlocked
                    ? 'bg-amber-50 border-amber-400 shadow-pop-amber'
                    : 'bg-slate-50 border-slate-200 opacity-70'
                  : isUnlocked
                  ? 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-pop-indigo'
                  : 'bg-slate-50/80 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left: Stage number badge & titles */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center font-black text-lg shrink-0 ${
                      stage.isBossStage
                        ? 'bg-amber-400 border-amber-900 text-amber-950 shadow-[2px_2px_0px_0px_rgba(180,83,9,1)]'
                        : isUnlocked
                        ? 'bg-indigo-500 border-indigo-900 text-white shadow-[2px_2px_0px_0px_rgba(49,46,129,1)]'
                        : 'bg-slate-200 border-slate-300 text-slate-500'
                    }`}
                  >
                    {stage.isBossStage ? (
                      <Trophy className="w-6 h-6 text-amber-950" />
                    ) : isUnlocked ? (
                      stage.stageNumber
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-slate-900 text-base">{stage.title}</h3>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-800 uppercase tracking-wider">
                        {stage.operation}
                      </span>
                      {stage.isBossStage && (
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-lg bg-amber-400 text-amber-950 border-2 border-amber-900">
                          BOSS TRIAL
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-1 max-w-md">{stage.description}</p>
                  </div>
                </div>

                {/* Right: Stars & Action button */}
                <div className="flex items-center gap-4 self-end sm:self-center">
                  {/* 3-Star Rating */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-5 h-5 ${
                          starIdx <= stars
                            ? 'text-amber-500 fill-amber-400 drop-shadow-xs'
                            : 'text-slate-300 fill-slate-100'
                        }`}
                      />
                    ))}
                  </div>

                  {isUnlocked ? (
                    <button
                      id={`btn-launch-stage-${stage.stageNumber}`}
                      onClick={() => {
                        sounds.playTick();
                        onLaunchStage(stage);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs uppercase tracking-wider border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{stars > 0 ? 'Replay' : 'Start Stage'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Unlocks at {stage.requiredXP} XP</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
