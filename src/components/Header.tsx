import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Flame,
  BarChart3,
  BookOpen,
  Volume2,
  VolumeX,
  Edit3,
  User,
  ShieldCheck,
  Zap,
  Crown,
  Wifi,
  WifiOff,
  RefreshCw,
  LogOut,
  Sliders,
  LogIn,
  Key,
} from 'lucide-react';
import { StudentProfile, AuthState } from '../types';
import { StorageService } from '../utils/storage';
import { sounds } from '../utils/audio';

interface HeaderProps {
  profile: StudentProfile;
  authState: AuthState;
  activeTab: 'arena' | 'quest' | 'leaderboard' | 'analytics' | 'mistakes' | 'admin';
  setActiveTab: (tab: 'arena' | 'quest' | 'leaderboard' | 'analytics' | 'mistakes' | 'admin') => void;
  onOpenProfile: () => void;
  onOpenScratchpad: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  mistakeCount: number;
  onSyncOfflineQueue?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  authState,
  activeTab,
  setActiveTab,
  onOpenProfile,
  onOpenScratchpad,
  onOpenAuthModal,
  onLogout,
  soundEnabled,
  onToggleSound,
  mistakeCount,
  onSyncOfflineQueue,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(() => StorageService.getOfflineQueue().length);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (onSyncOfflineQueue) onSyncOfflineQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(() => {
      setOfflineQueueCount(StorageService.getOfflineQueue().length);
    }, 2500);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [onSyncOfflineQueue]);

  const handleManualSync = () => {
    setIsSyncing(true);
    sounds.playTick();
    setTimeout(() => {
      const res = StorageService.syncOfflineData();
      setOfflineQueueCount(StorageService.getOfflineQueue().length);
      setIsSyncing(false);
      if (res.syncedCount > 0) {
        sounds.playFanfare();
      }
    }, 400);
  };

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-amber-50/95 backdrop-blur-md border-b-2 border-amber-200">
      {/* Top utility bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveTab(authState.role === 'admin' ? 'admin' : 'arena')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 bg-amber-400 rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(180,83,9,1)] border-2 border-amber-900 group-hover:scale-105 transition-transform">
              <span className="text-2xl font-black text-amber-950">×</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl sm:text-2xl font-black text-amber-950 tracking-tight">
                  MATH MASTERS
                </h1>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 border border-amber-400">
                  DODGING PRO
                </span>
              </div>
              <p className="text-amber-800 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>
                  {authState.role === 'admin'
                    ? '👑 Educator Admin Deck'
                    : `Dodging Tables Test Station • ${profile.name}`}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Center/Right stats & tools */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Live Network & Offline Sync Badge */}
          {isOnline ? (
            offlineQueueCount > 0 ? (
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                title="Pending offline test records. Click to sync now!"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-orange-100 border-2 border-orange-300 text-orange-900 font-black text-xs shadow-xs animate-pulse hover:bg-orange-200 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync {offlineQueueCount} Offline Tests</span>
              </button>
            ) : (
              <div
                title="App is connected. Tests sync automatically."
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-800 font-black text-xs shadow-xs"
              >
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>🟢 Cloud Synced</span>
              </div>
            )
          ) : (
            <div
              title="Offline mode active. All test results are stored locally."
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-900 font-black text-xs shadow-xs"
            >
              <WifiOff className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
              <span>Offline ({offlineQueueCount} Cached)</span>
            </div>
          )}

          {/* Student Streak (if student role) */}
          {authState.role !== 'admin' && (
            <div
              id="streak-badge-header"
              title={`${profile.streakDays} day practice streak!`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-orange-50 border-2 border-orange-200 text-orange-700 font-black text-xs shadow-xs"
            >
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span>{profile.streakDays}d</span>
            </div>
          )}

          {/* XP & Level Badge (if student) */}
          {authState.role !== 'admin' && (
            <div
              id="xp-badge-header"
              onClick={onOpenProfile}
              className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 text-indigo-700 font-black text-xs shadow-xs transition"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
              <span>{profile.totalXP} XP</span>
            </div>
          )}

          {/* Scratchpad Trigger */}
          <button
            id="btn-open-scratchpad"
            onClick={() => {
              sounds.playTick();
              onOpenScratchpad();
            }}
            title="Open Scratchpad"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white hover:bg-amber-100 border-2 border-amber-900 text-amber-950 text-xs font-black shadow-xs transition active:translate-y-0.5"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline uppercase tracking-wider">Draw Pad</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-toggle-sound"
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute SFX' : 'Enable SFX'}
            className="p-2 rounded-2xl border-2 border-amber-900 bg-white hover:bg-amber-100 text-amber-950 shadow-xs transition active:translate-y-0.5"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-700" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* User Status & Login/Switch Portal Button */}
          {authState.role === 'admin' ? (
            <div className="flex items-center gap-1.5">
              <div
                onClick={() => setActiveTab('admin')}
                className="cursor-pointer flex items-center gap-2 bg-amber-950 text-amber-300 p-1.5 px-3 rounded-2xl border-2 border-amber-900 shadow-xs"
              >
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black uppercase">Teacher Admin</span>
              </div>
              <button
                id="btn-header-login-portal"
                onClick={onOpenAuthModal}
                title="Switch User or Logout"
                className="px-3 py-1.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 border-2 border-amber-900 font-black text-xs flex items-center gap-1.5 shadow-xs transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Switch / Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <div
                id="btn-student-profile"
                onClick={onOpenProfile}
                className="cursor-pointer flex gap-2 items-center bg-white p-1 pr-3 rounded-full border-2 border-amber-900 shadow-xs hover:bg-amber-50 transition"
              >
                <div className="w-7 h-7 bg-amber-300 rounded-full border border-amber-900 flex items-center justify-center text-sm">
                  <span>{profile.avatar}</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black text-slate-900 truncate max-w-[90px]">
                    {profile.name}
                  </span>
                  <span className="text-[9px] font-bold text-amber-800">
                    Tables {profile.assignedMinTable || 2}-{profile.assignedMaxTable || 12}
                  </span>
                </div>
              </div>

              <button
                id="btn-header-login-portal"
                onClick={onOpenAuthModal}
                title="Open Login Page / Switch Student or Admin"
                className="px-3 py-1.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 border-2 border-amber-900 font-black text-xs flex items-center gap-1.5 shadow-xs transition"
              >
                <Key className="w-3.5 h-3.5 text-amber-950" />
                <span className="hidden sm:inline">Login / Switch</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 border-t border-amber-200">
          <button
            id="tab-arena"
            onClick={() => {
              sounds.playTick();
              setActiveTab('arena');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === 'arena'
                ? 'bg-amber-400 text-amber-950 border-2 border-amber-900 shadow-[2px_2px_0px_0px_rgba(180,83,9,1)]'
                : 'bg-white text-slate-700 border-2 border-slate-200 hover:bg-amber-100'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>⚡ Dodging Table Test</span>
          </button>

          <button
            id="tab-leaderboard"
            onClick={() => {
              sounds.playTick();
              setActiveTab('leaderboard');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-amber-400 text-amber-950 border-2 border-amber-900 shadow-[2px_2px_0px_0px_rgba(180,83,9,1)]'
                : 'bg-white text-slate-700 border-2 border-slate-200 hover:bg-amber-100'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>🏆 Student Leaderboard</span>
          </button>

          <button
            id="tab-quest"
            onClick={() => {
              sounds.playTick();
              setActiveTab('quest');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === 'quest'
                ? 'bg-amber-400 text-amber-950 border-2 border-amber-900 shadow-[2px_2px_0px_0px_rgba(180,83,9,1)]'
                : 'bg-white text-slate-700 border-2 border-slate-200 hover:bg-amber-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>📖 Study Table</span>
          </button>

          <button
            id="tab-analytics"
            onClick={() => {
              sounds.playTick();
              setActiveTab('analytics');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === 'analytics'
                ? 'bg-amber-400 text-amber-950 border-2 border-amber-900 shadow-[2px_2px_0px_0px_rgba(180,83,9,1)]'
                : 'bg-white text-slate-700 border-2 border-slate-200 hover:bg-amber-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>📊 Progress Analytics</span>
          </button>

          <button
            id="tab-mistakes"
            onClick={() => {
              sounds.playTick();
              setActiveTab('mistakes');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all relative ${
              activeTab === 'mistakes'
                ? 'bg-amber-400 text-amber-950 border-2 border-amber-900 shadow-[2px_2px_0px_0px_rgba(180,83,9,1)]'
                : 'bg-white text-slate-700 border-2 border-slate-200 hover:bg-amber-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Mistake Vault</span>
            {mistakeCount > 0 && (
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === 'mistakes' ? 'bg-amber-950 text-white' : 'bg-rose-500 text-white'
                }`}
              >
                {mistakeCount}
              </span>
            )}
          </button>

          {/* Admin Deck Tab */}
          <button
            id="tab-admin"
            onClick={() => {
              sounds.playTick();
              if (authState.role !== 'admin') {
                onOpenAuthModal();
              } else {
                setActiveTab('admin');
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === 'admin'
                ? 'bg-amber-950 text-amber-300 border-2 border-amber-900 shadow-[2px_2px_0px_0px_rgba(180,83,9,1)]'
                : 'bg-amber-100/70 text-amber-950 border-2 border-amber-300 hover:bg-amber-200'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-600" />
            <span>👑 Teacher Admin Deck</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
