import React from 'react';
import { Award, Zap, Sparkles, Flame, Trophy, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { AchievementBadge } from '../types';

interface BadgeUnlockedModalProps {
  badges: AchievementBadge[];
  onClose: () => void;
}

export const BadgeUnlockedModal: React.FC<BadgeUnlockedModalProps> = ({ badges, onClose }) => {
  if (!badges || badges.length === 0) return null;

  return (
    <div
      id="badge-unlocked-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in"
    >
      <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-6 sm:p-8 shadow-pop-amber border-4 border-amber-900 space-y-6 text-center my-6">
        {/* Badge Icon Banner */}
        <div className="relative inline-block">
          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 border-4 border-amber-900 flex items-center justify-center text-5xl shadow-pop-amber animate-bounce">
            🏆
          </div>
          <span className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-black uppercase tracking-wider border-2 border-white shadow-xs">
            +50 XP
          </span>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200 border border-amber-400 text-amber-950 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Achievement Badge Unlocked!</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {badges.length === 1 ? 'New Badge Earned!' : `${badges.length} New Badges Earned!`}
          </h2>
          <p className="text-xs font-bold text-slate-600">
            Outstanding work on your dodging table performance!
          </p>
        </div>

        {/* Unlocked Badges List */}
        <div className="space-y-3 max-h-60 overflow-y-auto p-1">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="p-4 rounded-2xl bg-amber-50 border-3 border-amber-400 flex items-center gap-4 text-left shadow-xs"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-300 border-2 border-amber-900 flex items-center justify-center text-2xl shrink-0">
                {badge.id === 'perfect_ten'
                  ? '🎯'
                  : badge.id === 'flawless_round'
                  ? '✨'
                  : badge.id.includes('streak')
                  ? '🔥'
                  : badge.id.includes('speed') || badge.id.includes('lightning')
                  ? '⚡'
                  : badge.id === 'daily_quota_hero'
                  ? '⭐'
                  : '🎖️'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm text-slate-900 truncate">{badge.title}</h4>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">
                    Unlocked
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium line-clamp-2">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 border-3 border-amber-900 text-amber-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_rgba(180,83,9,1)] transition active:translate-y-0.5"
        >
          <span>Claim Reward & Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
