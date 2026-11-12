import React, { useState } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  Clock,
  Target,
  Sparkles,
  Users,
  Globe,
  Filter,
  Search,
  ArrowUp,
  Award,
  Zap,
  Calendar,
} from 'lucide-react';
import { LeaderboardEntry, StudentProfile, DifficultyGrade, StudentStats } from '../types';
import { StorageService } from '../utils/storage';
import { sounds } from '../utils/audio';

interface LeaderboardProps {
  profile: StudentProfile;
  stats: StudentStats;
  peers: LeaderboardEntry[];
  onAddPeer?: (peer: LeaderboardEntry) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ profile, stats, peers }) => {
  const [timeframe, setTimeframe] = useState<'all' | 'weekly' | 'daily'>('all');
  const [scope, setScope] = useState<'global' | 'classroom'>('classroom');
  const [category, setCategory] = useState<'blitz' | 'accuracy' | 'xp' | 'streak'>('blitz');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showBadgeShowcase, setShowBadgeShowcase] = useState<boolean>(true);

  // Get dynamic student leaderboard generated from database
  const liveLeaderboard = StorageService.getLeaderboard(timeframe);
  const competitiveBadges = StorageService.getBadges();

  // Filter by scope (Global vs Classroom)
  let filtered = liveLeaderboard.filter((entry) => {
    if (scope === 'classroom') {
      return (entry.classCode || 'MATH-808').toLowerCase() === (profile.classCode || 'MATH-808').toLowerCase();
    }
    return true;
  });

  // Filter by search query
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (e) => e.name.toLowerCase().includes(q) || (e.classCode && e.classCode.toLowerCase().includes(q))
    );
  }

  // Sort by category (Default: blitz test score)
  filtered.sort((a, b) => {
    if (category === 'blitz') {
      if (b.blitzHighScore !== a.blitzHighScore) return b.blitzHighScore - a.blitzHighScore;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      if (a.avgSpeedSec !== b.avgSpeedSec && a.avgSpeedSec > 0 && b.avgSpeedSec > 0) return a.avgSpeedSec - b.avgSpeedSec;
      return b.totalXP - a.totalXP;
    }
    if (category === 'accuracy') return b.accuracy - a.accuracy || b.blitzHighScore - a.blitzHighScore;
    if (category === 'xp') return b.totalXP - a.totalXP;
    if (category === 'streak') return b.streakHighScore - a.streakHighScore;
    return b.blitzHighScore - a.blitzHighScore;
  });

  // Identify current user's entry & rank
  const currentUserRankIndex = filtered.findIndex((e) => e.studentId === profile.id || e.id === profile.id);
  const currentUserRank = currentUserRankIndex >= 0 ? currentUserRankIndex + 1 : null;
  const aheadOfUser = currentUserRankIndex > 0 ? filtered[currentUserRankIndex - 1] : null;

  // Top 3 Podium
  const top1 = filtered[0];
  const top2 = filtered[1];
  const top3 = filtered[2];

  const getMetricDisplay = (entry: LeaderboardEntry) => {
    if (category === 'blitz') return `${entry.blitzHighScore} pts (Dodging Test Score)`;
    if (category === 'accuracy') return `${entry.accuracy}% Accuracy`;
    if (category === 'xp') return `${entry.totalXP.toLocaleString()} XP`;
    if (category === 'streak') return `${entry.streakHighScore}x Streak`;
    return `${entry.blitzHighScore} pts`;
  };

  return (
    <div id="leaderboard-view-container" className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-amber-400 rounded-3xl border-4 border-amber-900 p-6 sm:p-8 shadow-pop-amber relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950 text-amber-300 text-xs font-black uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" />
              <span>Dodging Table Champions</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-amber-950 tracking-tight uppercase">
              Math Masters Leaderboard
            </h1>
            <p className="text-xs sm:text-sm text-amber-950/90 font-bold max-w-md">
              Real-time student rankings across accuracy, speed, and tests completed. All offline tests sync automatically!
            </p>
          </div>

          {/* Current user rank summary */}
          {currentUserRank && (
            <div className="bg-white rounded-2xl p-4 border-3 border-amber-900 shrink-0 flex items-center gap-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-amber-400 text-amber-950 border-2 border-amber-900 flex items-center justify-center font-black text-2xl shadow-[2px_2px_0px_0px_rgba(180,83,9,1)]">
                #{currentUserRank}
              </div>
              <div>
                <p className="text-[10px] text-amber-900 font-black uppercase tracking-wider">Your Class Position</p>
                <p className="text-base font-black text-slate-900">{getMetricDisplay(filtered[currentUserRankIndex])}</p>
                {aheadOfUser && (
                  <p className="text-[11px] font-black text-indigo-700 flex items-center gap-1 mt-0.5">
                    <ArrowUp className="w-3.5 h-3.5" />
                    <span>Next target: {aheadOfUser.name}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Filters Bar */}
      <div className="bg-white rounded-3xl border-3 border-amber-900 p-4 space-y-4 shadow-pop-amber">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Timeframe selector (Daily, Weekly, All-Time) */}
          <div className="flex items-center bg-amber-100/70 p-1 rounded-2xl border-2 border-amber-300">
            <button
              onClick={() => {
                sounds.playTick();
                setTimeframe('daily');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                timeframe === 'daily'
                  ? 'bg-amber-400 text-amber-950 border-2 border-amber-900 shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Today (Daily)
            </button>
            <button
              onClick={() => {
                sounds.playTick();
                setTimeframe('weekly');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                timeframe === 'weekly'
                  ? 'bg-amber-400 text-amber-950 border-2 border-amber-900 shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => {
                sounds.playTick();
                setTimeframe('all');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                timeframe === 'all'
                  ? 'bg-amber-400 text-amber-950 border-2 border-amber-900 shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              All-Time
            </button>
          </div>

          {/* Scope Toggle: Global vs Classroom */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => {
                sounds.playTick();
                setScope('classroom');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                scope === 'classroom'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span>Class ({profile.classCode || 'MATH-808'})</span>
            </button>
            <button
              onClick={() => {
                sounds.playTick();
                setScope('global');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                scope === 'global'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <span>All Students</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search classmates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-400"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Sort By:
          </span>

          <button
            onClick={() => {
              sounds.playTick();
              setCategory('blitz');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 ${
              category === 'blitz'
                ? 'bg-amber-400 text-amber-950 border-2 border-amber-900 shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-amber-50'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Test Score (Official Rank)</span>
          </button>

          <button
            onClick={() => {
              sounds.playTick();
              setCategory('accuracy');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 ${
              category === 'accuracy'
                ? 'bg-amber-400 text-amber-950 border-2 border-amber-900 shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-amber-50'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Accuracy %</span>
          </button>

          <button
            onClick={() => {
              sounds.playTick();
              setCategory('xp');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 ${
              category === 'xp'
                ? 'bg-amber-400 text-amber-950 border-2 border-amber-900 shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-amber-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Total XP</span>
          </button>

          <button
            onClick={() => {
              sounds.playTick();
              setCategory('streak');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 ${
              category === 'streak'
                ? 'bg-amber-400 text-amber-950 border-2 border-amber-900 shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-amber-50'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Streak Record</span>
          </button>
        </div>
      </div>

      {/* COMPETITIVE 10 BADGES RECORD BOARD */}
      <div className="bg-white rounded-3xl border-3 border-amber-900 p-5 sm:p-6 shadow-pop-amber space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🏆</span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-950 uppercase tracking-tight">
                10 Competitive Trophy Badges (Record Holders)
              </h2>
              <p className="text-xs text-slate-500 font-bold">
                Badges are transferable! Break another student's record in speed, accuracy, or score to seize their badge.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowBadgeShowcase(!showBadgeShowcase)}
            className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs border-2 border-amber-900 shadow-2xs transition"
          >
            {showBadgeShowcase ? 'Hide Badges' : 'View All 10 Badges'}
          </button>
        </div>

        {showBadgeShowcase && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            {competitiveBadges.map((badge) => {
              const isHeldByMe = badge.currentHolderId === profile.id;
              return (
                <div
                  key={badge.id}
                  className={`p-3 rounded-2xl border-2 transition flex flex-col justify-between ${
                    isHeldByMe
                      ? 'bg-amber-100/90 border-amber-900 shadow-xs ring-2 ring-amber-400'
                      : badge.currentHolderId
                      ? 'bg-slate-50 border-slate-300'
                      : 'bg-slate-50/50 border-dashed border-slate-300 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{badge.emoji || '🎖️'}</span>
                      {isHeldByMe ? (
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-950 text-amber-300 text-[9px] font-black uppercase tracking-wider">
                          You Hold
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          Record
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-xs text-slate-900 leading-tight">{badge.title}</h3>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">{badge.description}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono font-black text-amber-950">
                      <span>{badge.recordValueDisplay}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-600 truncate font-bold">
                      <span>{badge.currentHolderAvatar}</span>
                      <span className="truncate">{badge.currentHolderName}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TOP 3 PODIUM */}
      {filtered.length >= 3 && !searchQuery && (
        <div className="grid grid-cols-3 gap-3 pt-6 pb-2 items-end max-w-2xl mx-auto text-center">
          {/* Rank 2 */}
          <div className="bg-white rounded-3xl p-4 border-3 border-amber-900 shadow-pop-amber space-y-2 relative flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 font-black text-xs flex items-center justify-center border-2 border-amber-900 -mt-7 shadow-xs">
              2
            </div>
            <div className="text-3xl">{top2.avatar}</div>
            <p className="font-black text-xs text-slate-900 truncate max-w-full">{top2.name}</p>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-300">
                🏆 {top2.badgeCount || 0} badges
              </span>
            </div>
            <span className="text-[10px] font-mono font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
              {getMetricDisplay(top2)}
            </span>
          </div>

          {/* Rank 1 */}
          <div className="bg-amber-400 rounded-3xl p-5 border-4 border-amber-900 shadow-pop-amber space-y-2 relative flex flex-col items-center scale-105 z-10">
            <div className="w-8 h-8 rounded-full bg-amber-950 text-amber-300 font-black text-sm flex items-center justify-center border-2 border-amber-900 -mt-8 shadow-xs">
              👑
            </div>
            <div className="text-4xl">{top1.avatar}</div>
            <p className="font-black text-sm text-amber-950 truncate max-w-full">{top1.name}</p>
            <div className="flex items-center gap-1">
              <span className="text-xs font-black bg-amber-950 text-amber-300 px-2.5 py-0.5 rounded-lg border border-amber-900 shadow-2xs">
                🏆 {top1.badgeCount || 0} Record Badges
              </span>
            </div>
            <span className="text-xs font-mono font-black text-amber-950 bg-amber-200 px-2.5 py-1 rounded-xl border border-amber-400 shadow-xs">
              {getMetricDisplay(top1)}
            </span>
          </div>

          {/* Rank 3 */}
          <div className="bg-white rounded-3xl p-4 border-3 border-amber-900 shadow-pop-amber space-y-2 relative flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center border-2 border-amber-900 -mt-7 shadow-xs">
              3
            </div>
            <div className="text-3xl">{top3.avatar}</div>
            <p className="font-black text-xs text-slate-900 truncate max-w-full">{top3.name}</p>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-300">
                🏆 {top3.badgeCount || 0} badges
              </span>
            </div>
            <span className="text-[10px] font-mono font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
              {getMetricDisplay(top3)}
            </span>
          </div>
        </div>
      )}

      {/* FULL LEADERBOARD TABLE */}
      <div className="bg-white rounded-3xl border-3 border-amber-900 shadow-pop-amber overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-amber-100/70 border-b-2 border-amber-200 text-slate-700 font-black uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 w-12 text-center">Rank</th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Class</th>
                <th className="py-3.5 px-4 text-center">Badges Held</th>
                <th className="py-3.5 px-4">Accuracy</th>
                <th className="py-3.5 px-4 font-black text-indigo-900">Dodging Test Score</th>
                <th className="py-3.5 px-4">Avg Speed</th>
                <th className="py-3.5 px-4 text-right">Total XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((entry, index) => {
                const rank = index + 1;
                const isCurrent = entry.studentId === profile.id || entry.id === profile.id;
                const badgesHeld = competitiveBadges.filter((b) => b.currentHolderId === entry.studentId || b.currentHolderId === entry.id);

                return (
                  <tr
                    key={entry.id}
                    className={`transition ${
                      isCurrent
                        ? 'bg-amber-100/80 font-bold border-l-4 border-amber-900'
                        : 'hover:bg-amber-50/50'
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center font-mono font-black">
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{entry.avatar}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-slate-900">{entry.name}</span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-amber-950 text-[9px] font-black uppercase">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">@{entry.username || entry.name.toLowerCase().replace(/\s+/g, '.')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-600">
                      {entry.classCode || 'MATH-808'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-black font-mono ${
                          (entry.badgeCount || 0) > 0
                            ? 'bg-amber-400 text-amber-950 border border-amber-900 shadow-2xs'
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                          🏆 {entry.badgeCount || 0}
                        </span>
                        {badgesHeld.length > 0 && (
                          <span className="text-sm">
                            {badgesHeld.map((b) => b.emoji).join('')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-black px-2 py-0.5 rounded-lg text-[11px] ${
                          entry.accuracy >= 90
                            ? 'bg-emerald-100 text-emerald-800'
                            : entry.accuracy >= 75
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {entry.accuracy}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-indigo-700 text-sm">
                      {entry.blitzHighScore} pts
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {entry.avgSpeedSec > 0 ? `${entry.avgSpeedSec}s / q` : '--'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-amber-950 text-sm">
                      {entry.totalXP.toLocaleString()} XP
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
