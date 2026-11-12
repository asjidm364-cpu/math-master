import React, { useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  Download,
  Upload,
  Printer,
  TrendingUp,
  Target,
  Sparkles,
  Calendar,
  Zap,
  BookOpen,
  PieChart,
  ShieldCheck,
  RotateCcw,
  FileText,
} from 'lucide-react';
import {
  StudentProfile,
  StudentStats,
  AchievementBadge,
  MathOperation,
} from '../types';
import { StorageService } from '../utils/storage';
import { sounds } from '../utils/audio';

interface PerformanceAnalyticsProps {
  profile: StudentProfile;
  stats: StudentStats;
  badges: AchievementBadge[];
  onDataImported: () => void;
}

export const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({
  profile,
  stats,
  badges,
  onDataImported,
}) => {
  const [showCertificate, setShowCertificate] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const overallAccuracy =
    stats.totalQuestions > 0
      ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
      : 0;

  const totalMinutes = Math.round(stats.totalTimeSec / 60);

  const topicConfig: Record<
    MathOperation,
    { label: string; icon: string; color: string }
  > = {
    addition: { label: 'Addition', icon: '+', color: 'bg-blue-500 text-blue-600' },
    subtraction: { label: 'Subtraction', icon: '−', color: 'bg-emerald-500 text-emerald-600' },
    multiplication: { label: 'Multiplication', icon: '×', color: 'bg-indigo-500 text-indigo-600' },
    division: { label: 'Division', icon: '÷', color: 'bg-purple-500 text-purple-600' },
    fractions: { label: 'Fractions', icon: '½', color: 'bg-amber-500 text-amber-600' },
    algebra: { label: 'Algebra', icon: 'x', color: 'bg-rose-500 text-rose-600' },
    geometry: { label: 'Geometry', icon: '📐', color: 'bg-teal-500 text-teal-600' },
    missing_factor: { label: 'Missing Factor', icon: '❓', color: 'bg-orange-500 text-orange-600' },
    mixed: { label: 'Mixed Mastery', icon: '⚡', color: 'bg-fuchsia-500 text-fuchsia-600' },
  };

  const handleExport = () => {
    sounds.playTick();
    const dataStr = StorageService.exportDatabase();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `math-masters-${profile.name.toLowerCase().replace(/\s+/g, '-')}-progress.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        const success = StorageService.importDatabase(content);
        if (success) {
          sounds.playLevelUp();
          setImportStatus('Progress file successfully loaded!');
          onDataImported();
        } else {
          setImportStatus('Failed to parse progress file.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="analytics-view-container" className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-[2rem] border-4 border-amber-400 p-6 sm:p-8 shadow-pop-amber relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border-2 border-emerald-300 text-emerald-900 text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Offline Data Vault Active</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight uppercase italic">
              Student Performance Analytics
            </h1>
            <p className="text-sm text-slate-600 font-medium max-w-md">
              Complete offline record tracking of accuracy rates, topic strengths, speed trends, and badge milestones.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-export-data"
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-amber-50 border-2 border-slate-300 text-slate-800 text-xs font-black uppercase tracking-wider transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Backup</span>
            </button>

            <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-amber-50 border-2 border-slate-300 text-slate-800 text-xs font-black uppercase tracking-wider transition cursor-pointer active:scale-95">
              <Upload className="w-3.5 h-3.5" />
              <span>Import File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>

            <button
              id="btn-open-certificate"
              onClick={() => setShowCertificate(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-900 text-amber-950 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(180,83,9,1)] transition active:translate-y-0.5 active:shadow-none"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
          </div>
        </div>

        {importStatus && (
          <div className="mt-4 p-2.5 rounded-xl bg-emerald-100 border-2 border-emerald-300 text-emerald-950 text-xs font-black">
            {importStatus}
          </div>
        )}
      </div>

      {/* CORE KPI METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Questions Solved */}
        <div className="bg-white rounded-[2rem] border-3 border-indigo-300 p-5 shadow-pop-indigo">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-black uppercase text-indigo-900">Total Solved</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 border border-indigo-300 text-indigo-700 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {stats.totalQuestions}
          </p>
          <p className="text-[11px] text-emerald-700 font-black mt-1">
            {stats.totalCorrect} Correct Answers
          </p>
        </div>

        {/* Overall Accuracy */}
        <div className="bg-white rounded-[2rem] border-3 border-emerald-300 p-5 shadow-pop-emerald">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-black uppercase text-emerald-900">Overall Accuracy</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center font-bold">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {overallAccuracy}%
          </p>
          <div className="w-full bg-emerald-100 border border-emerald-300 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${overallAccuracy}%` }}
            ></div>
          </div>
        </div>

        {/* Best Streak */}
        <div className="bg-white rounded-[2rem] border-3 border-amber-300 p-5 shadow-pop-amber">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-black uppercase text-amber-900">Max Streak</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center font-bold">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {stats.maxStreak}x
          </p>
          <p className="text-[11px] text-amber-800 font-black mt-1">
            {profile.streakDays} Day Active Streak
          </p>
        </div>

        {/* Practice Time */}
        <div className="bg-white rounded-[2rem] border-3 border-sky-300 p-5 shadow-pop-sky">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-black uppercase text-sky-900">Practice Time</span>
            <div className="w-8 h-8 rounded-xl bg-sky-100 border border-sky-300 text-sky-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {totalMinutes} <span className="text-base font-bold text-slate-500">mins</span>
          </p>
          <p className="text-[11px] text-sky-800 font-black mt-1">
            Speed Blitz: {stats.bestBlitzScore} pts
          </p>
        </div>
      </div>

      {/* TOPIC MASTERY BREAKDOWN */}
      <div className="bg-white rounded-[2rem] border-3 border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-900 text-base uppercase tracking-tight flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-600" />
              <span>Curriculum Topic Mastery</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Breakdown of accuracy and volume across all math domains
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(topicConfig) as MathOperation[]).map((op) => {
            const topic = topicConfig[op];
            const data = stats.topicStats[op] || { total: 0, correct: 0, totalTimeSec: 0 };
            const acc = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;

            let statusLabel = 'Not Started';
            let statusColor = 'bg-slate-100 text-slate-600 border-slate-300';

            if (data.total >= 10 && acc >= 90) {
              statusLabel = 'Mastered';
              statusColor = 'bg-emerald-100 text-emerald-950 border-emerald-300';
            } else if (data.total >= 5 && acc >= 75) {
              statusLabel = 'Proficient';
              statusColor = 'bg-indigo-100 text-indigo-950 border-indigo-300';
            } else if (data.total > 0) {
              statusLabel = 'In Practice';
              statusColor = 'bg-amber-100 text-amber-950 border-amber-300';
            }

            return (
              <div key={op} className="p-4 rounded-2xl border-2 border-slate-200 bg-amber-50/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-white border-2 border-slate-300 flex items-center justify-center font-black text-sm text-slate-800 shadow-2xs">
                      {topic.icon}
                    </span>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">{topic.label}</h4>
                      <p className="text-[11px] text-slate-500 font-bold">
                        {data.correct} / {data.total} correct
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black px-2 py-0.5 rounded-md font-mono">{acc}%</span>
                    <div className="mt-1">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      acc >= 85 ? 'bg-emerald-500' : acc >= 65 ? 'bg-indigo-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${acc}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ACHIEVEMENTS & TROPHY CASE */}
      <div className="bg-white rounded-[2rem] border-4 border-amber-400 p-6 shadow-pop-amber space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-900 text-base uppercase tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <span>10 Competitive Trophy Badges (Record System)</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {badges.filter((b) => b.unlocked).length} of {badges.length} record badges currently held by you. Break records in test score, accuracy, or speed to seize them!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {badges.map((badge) => {
            const isUnlocked = badge.unlocked;

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border-2 transition flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-amber-100/90 border-amber-900 shadow-xs ring-2 ring-amber-400'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center text-xl shrink-0 ${
                      isUnlocked
                        ? 'bg-amber-300 border-amber-900 text-amber-950 shadow-xs'
                        : 'bg-slate-100 border-slate-300 text-slate-400'
                    }`}
                  >
                    {badge.emoji || '🎖️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-black text-slate-900 text-xs truncate">{badge.title}</h4>
                      {isUnlocked ? (
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-950 text-amber-300 text-[8px] font-black uppercase">
                          You Hold
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-600 text-[8px] font-black uppercase">
                          Record
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium line-clamp-2 mt-0.5">
                      {badge.description}
                    </p>

                    <div className="mt-2 pt-1 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                      <span className="font-mono font-black text-indigo-700">
                        {badge.recordValueDisplay || badge.requirementDescription}
                      </span>
                      {badge.currentHolderName && (
                        <span className="text-slate-500 font-bold truncate max-w-[110px]">
                          {badge.currentHolderAvatar} {badge.currentHolderName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECENT SESSION LOGS */}
      {stats.recentSessions && stats.recentSessions.length > 0 && (
        <div className="bg-white rounded-[2rem] border-3 border-slate-200 p-6 shadow-sm space-y-3">
          <h3 className="font-black text-slate-900 text-base uppercase tracking-tight flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Recent Practice Logs</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-500 font-black uppercase text-[10px]">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Mode</th>
                  <th className="pb-2">Topic</th>
                  <th className="pb-2">Accuracy</th>
                  <th className="pb-2">Score</th>
                  <th className="pb-2 text-right">XP Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentSessions.map((session) => (
                  <tr key={session.id} className="text-slate-700">
                    <td className="py-2.5 font-mono text-[11px] text-slate-500">
                      {session.timestamp.split('T')[0]}
                    </td>
                    <td className="py-2.5 capitalize font-black text-slate-800">{session.mode}</td>
                    <td className="py-2.5 capitalize text-slate-600 font-bold">{session.operation}</td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-lg font-black font-mono text-[11px] border ${
                          session.accuracy >= 85
                            ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                            : 'bg-slate-100 text-slate-800 border-slate-300'
                        }`}
                      >
                        {session.accuracy}%
                      </span>
                    </td>
                    <td className="py-2.5 font-black font-mono">{session.score}</td>
                    <td className="py-2.5 text-right font-black text-emerald-700 font-mono">
                      +{session.xpGained}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRINTABLE PROGRESS REPORT & CERTIFICATE MODAL */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] max-w-2xl w-full p-8 shadow-pop-amber border-4 border-amber-400 space-y-6 print:shadow-none print:border-none print:p-0">
            {/* Certificate Header */}
            <div className="text-center space-y-2 border-b-3 border-amber-200 pb-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-400 border-2 border-amber-900 text-amber-950 flex items-center justify-center mx-auto text-2xl font-black shadow-[2px_2px_0px_0px_rgba(180,83,9,1)]">
                M²
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-wide italic">
                Math Masters Official Progress Certificate
              </h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verified Offline Student Performance Record</p>
            </div>

            {/* Student Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 text-xs">
              <div>
                <p className="text-slate-500 font-bold uppercase text-[10px]">Student</p>
                <p className="font-black text-slate-900 text-sm mt-0.5">{profile.name}</p>
              </div>
              <div>
                <p className="text-slate-500 font-bold uppercase text-[10px]">Grade Tier</p>
                <p className="font-black text-slate-900 capitalize text-sm mt-0.5">{profile.grade}</p>
              </div>
              <div>
                <p className="text-slate-500 font-bold uppercase text-[10px]">Classroom</p>
                <p className="font-black text-slate-900 text-sm mt-0.5">{profile.classCode}</p>
              </div>
              <div>
                <p className="text-slate-500 font-bold uppercase text-[10px]">Mastery Rank</p>
                <p className="font-black text-amber-800 text-sm mt-0.5">{profile.title}</p>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl border-2 border-slate-200 bg-white">
                <p className="text-xs font-black text-slate-500 uppercase">Total Solved</p>
                <p className="text-xl font-black text-slate-900 mt-1">{stats.totalQuestions}</p>
              </div>
              <div className="p-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50">
                <p className="text-xs font-black text-emerald-800 uppercase">Overall Accuracy</p>
                <p className="text-xl font-black text-emerald-700 mt-1">{overallAccuracy}%</p>
              </div>
              <div className="p-3 rounded-2xl border-2 border-amber-200 bg-amber-50">
                <p className="text-xs font-black text-amber-800 uppercase">Lifetime XP</p>
                <p className="text-xl font-black text-amber-700 mt-1">{profile.totalXP}</p>
              </div>
            </div>

            {/* Signature row */}
            <div className="flex items-center justify-between pt-6 border-t-2 border-slate-200 text-xs text-slate-500">
              <div>
                <p className="font-black text-slate-800">Math Masters Academic Verification</p>
                <p className="text-[10px] font-medium">Issued: {new Date().toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <div className="w-32 border-b-2 border-slate-400 mb-1"></div>
                <p className="text-[10px] font-bold">Teacher / Guardian Signature</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 print:hidden pt-2">
              <button
                onClick={handlePrint}
                className="flex-1 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-900 text-amber-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(180,83,9,1)] transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save as PDF</span>
              </button>
              <button
                onClick={() => setShowCertificate(false)}
                className="flex-1 py-3.5 rounded-2xl border-2 border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-black text-xs uppercase tracking-wider transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
