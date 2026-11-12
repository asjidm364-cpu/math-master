import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  StudentProfile,
  StudentStats,
  MistakeRecord,
  QuestStage,
  LeaderboardEntry,
  AchievementBadge,
  DodgingTestAttempt,
  Question,
  AuthState,
} from './types';
import { StorageService } from './utils/storage';
import { ApiService } from './utils/api';
import { sounds } from './utils/audio';

import { Header } from './components/Header';
import { DodgingArena } from './components/DodgingArena';
import { StudyTable } from './components/StudyTable';
import { Leaderboard } from './components/Leaderboard';
import { PerformanceAnalytics } from './components/PerformanceAnalytics';
import { MistakeReview } from './components/MistakeReview';
import { Scratchpad } from './components/Scratchpad';
import { ProfileModal } from './components/ProfileModal';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { LoginPage } from './components/LoginPage';

export default function App() {
  // Authentication State
  const [authState, setAuthState] = useState<AuthState>(() => StorageService.getAuthState());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Application Data States (Partitioned by student)
  const [profile, setProfile] = useState<StudentProfile>(() => StorageService.getProfile());
  const [stats, setStats] = useState<StudentStats>(() => StorageService.getStats());
  const [mistakes, setMistakes] = useState<MistakeRecord[]>(() => StorageService.getMistakes());
  const [questStages, setQuestStages] = useState<QuestStage[]>(() => StorageService.getQuestStages());
  const [peers, setPeers] = useState<LeaderboardEntry[]>(() => StorageService.getLeaderboard('all'));
  const [badges, setBadges] = useState<AchievementBadge[]>(() => StorageService.getBadges());

  // UI Navigation & Modals
  const [activeTab, setActiveTab] = useState<'arena' | 'quest' | 'leaderboard' | 'analytics' | 'mistakes' | 'admin'>('arena');
  const [isScratchpadOpen, setIsScratchpadOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reload all data helper
  const reloadData = useCallback(() => {
    const currentAuth = StorageService.getAuthState();
    setAuthState(currentAuth);
    setProfile(StorageService.getProfile());
    setStats(StorageService.getStats());
    setMistakes(StorageService.getMistakes());
    setQuestStages(StorageService.getQuestStages());
    setPeers(StorageService.getLeaderboard('all'));
    setBadges(StorageService.getBadges());
  }, []);

  // Sync sound settings
  useEffect(() => {
    sounds.setEnabled(profile.soundEnabled);
  }, [profile.soundEnabled]);

  // Initial Sync and Real-Time SSE Listener
  useEffect(() => {
    // Initial server sync
    StorageService.syncWithServer().then(() => {
      reloadData();
    });

    // Real-Time Server-Sent Events (SSE) listener
    const unsubscribe = ApiService.subscribeToUpdates((data) => {
      StorageService.syncWithServer().then(() => {
        reloadData();
      });
    });

    // Periodic heartbeat sync every 4 seconds to guarantee real-time updates across multiple open browsers
    const interval = setInterval(() => {
      StorageService.syncWithServer().then(() => {
        // Keep peers and student profile up-to-date
        setPeers(StorageService.getLeaderboard('all'));
        if (StorageService.getAuthState().currentStudentId) {
          setProfile(StorageService.getProfile());
        }
      });
    }, 4000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [reloadData]);

  // Automatic offline sync listener
  useEffect(() => {
    const handleOnline = () => {
      const result = StorageService.syncOfflineData();
      if (result.syncedCount > 0) {
        showToast(`🟢 Reconnected! Synced ${result.syncedCount} offline tests.`);
        reloadData();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [reloadData]);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Handle Login success
  const handleLoginSuccess = (newAuth: AuthState) => {
    StorageService.setAuthState(newAuth);
    setAuthState(newAuth);
    reloadData();

    if (newAuth.role === 'admin') {
      setActiveTab('admin');
      showToast('👑 Welcome, Teacher Abrash! Admin Panel Ready.');
    } else {
      setActiveTab('arena');
      const p = StorageService.getProfile();
      showToast(`⚡ Welcome back, ${p.name}!`);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    StorageService.logout();
    setAuthState({
      isAuthenticated: false,
      role: null,
      currentStudentId: null,
      username: null,
      name: null,
    });
    showToast('Logged out successfully.');
  };

  // Switch to specific student from admin panel
  const handleSwitchToStudent = (studentId: string) => {
    const students = StorageService.getStudents();
    const target = students.find((s) => s.id === studentId);
    if (target) {
      StorageService.login(target.username, target.password);
      reloadData();
      setActiveTab('arena');
      showToast(`Switched view to student ${target.name} (@${target.username})`);
    }
  };

  // Handle finished dodging test
  const handleFinishDodgingTest = (
    attempt: DodgingTestAttempt,
    newMistakes: { question: Question; answer: string }[]
  ) => {
    // Record mistakes in storage
    newMistakes.forEach((m) => {
      StorageService.addMistake(m.question, m.answer);
    });

    // Record attempt into student history & offline queue
    const { updatedProfile, isSynced } = StorageService.recordDodgingAttempt(attempt);

    setProfile(updatedProfile);
    setMistakes(StorageService.getMistakes());
    setStats(StorageService.getStats());
    setPeers(StorageService.getLeaderboard('all'));

    if (!isSynced) {
      showToast('🟠 Saved offline. Will sync automatically when connection restores.');
    } else {
      showToast('🟢 Test saved & synced with live classroom leaderboard!');
    }
  };

  // Mistake Mastered callback (No XP gain on corrections as per rules)
  const handleMistakeMastered = (mistakeId: string) => {
    StorageService.markMistakeMastered(mistakeId);
    setMistakes(StorageService.getMistakes());
    showToast('✨ Problem Mastered in Vault! Great practice.');
  };

  // Profile Save
  const handleSaveProfile = (updated: StudentProfile) => {
    StorageService.saveProfile(updated);
    setProfile(updated);
  };

  // Reset Data confirmation
  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset your local student progress?')) {
      StorageService.resetAllDatabase();
      reloadData();
      setIsProfileOpen(false);
      showToast('Student records reset.');
    }
  };

  const handleToggleSound = () => {
    const newVal = !profile.soundEnabled;
    const updated = { ...profile, soundEnabled: newVal };
    StorageService.saveProfile(updated);
    setProfile(updated);
    sounds.setEnabled(newVal);
    if (newVal) sounds.playTick();
  };

  // If user is not authenticated, show the primary Login Page first
  if (!authState.isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div
      className="min-h-screen bg-amber-50 text-slate-900 flex flex-col font-sans selection:bg-amber-400 selection:text-amber-950"
      style={{ backgroundColor: '#FFFBEB' }}
    >
      {/* Header */}
      <Header
        profile={profile}
        authState={authState}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenScratchpad={() => setIsScratchpadOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        soundEnabled={profile.soundEnabled}
        onToggleSound={handleToggleSound}
        mistakeCount={mistakes.filter((m) => !m.mastered).length}
        onSyncOfflineQueue={() => {
          const res = StorageService.syncOfflineData();
          if (res.syncedCount > 0) showToast(`Synced ${res.syncedCount} tests!`);
          reloadData();
        }}
      />

      {/* Toast notifications */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-white text-slate-900 text-xs font-black shadow-pop-amber border-3 border-amber-900 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-900 ml-2 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'arena' && (
          <DodgingArena
            profile={profile}
            onFinishTest={handleFinishDodgingTest}
            onOpenScratchpad={() => setIsScratchpadOpen(true)}
            onOpenMistakeReview={() => setActiveTab('mistakes')}
            onOpenStudyLab={() => setActiveTab('quest')}
            onOpenLeaderboard={() => setActiveTab('leaderboard')}
          />
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard
            profile={profile}
            stats={stats}
            peers={peers}
          />
        )}

        {activeTab === 'quest' && (
          <StudyTable
            profile={profile}
            onOpenScratchpad={() => setIsScratchpadOpen(true)}
            onOpenMistakes={() => setActiveTab('mistakes')}
          />
        )}

        {activeTab === 'analytics' && (
          <PerformanceAnalytics
            profile={profile}
            stats={stats}
            badges={badges}
            onDataImported={reloadData}
          />
        )}

        {activeTab === 'mistakes' && (
          <MistakeReview
            mistakes={mistakes}
            onMistakeMastered={handleMistakeMastered}
            onOpenScratchpad={() => setIsScratchpadOpen(true)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            onRefreshData={reloadData}
            onSwitchToStudent={handleSwitchToStudent}
          />
        )}
      </main>

      {/* Modals */}
      <Scratchpad
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
        onResetData={handleResetData}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(role) => {
          setIsAuthModalOpen(false);
          handleLoginSuccess(StorageService.getAuthState());
        }}
      />
    </div>
  );
}
