import React, { useState } from 'react';
import {
  User,
  X,
  Save,
  Trash2,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  Users,
  Check,
  Award,
  Trophy,
  Lock,
} from 'lucide-react';
import { StudentProfile, DifficultyGrade } from '../types';
import { StorageService } from '../utils/storage';
import { sounds } from '../utils/audio';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onSaveProfile: (profile: StudentProfile) => void;
  onResetData: () => void;
}

const AVATAR_CHOICES = [
  '🧑‍🚀', '🦊', '🦉', '🐉', '🦁', '🚀', '⚡', '👑',
  '🌟', '🤖', '🧙‍♂️', '🐯', '🦄', '🐬', '🏆', '🎯'
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onResetData,
}) => {
  const [name, setName] = useState<string>(profile.name);
  const [avatar, setAvatar] = useState<string>(profile.avatar);
  const [grade, setGrade] = useState<DifficultyGrade>(profile.grade);
  const [classCode, setClassCode] = useState<string>(profile.classCode);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(profile.soundEnabled);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'badges'>('profile');

  if (!isOpen) return null;

  const levelInfo = StorageService.calculateLevel(profile.totalXP);
  const allBadges = StorageService.getAllBadges(profile.id);
  const unlockedCount = allBadges.filter((b) => b.unlocked).length;

  const handleSave = () => {
    sounds.playTick();
    const updated: StudentProfile = {
      ...profile,
      name: name.trim() || 'Math Student',
      avatar,
      grade,
      classCode: classCode.trim().toUpperCase() || 'MATH-808',
      soundEnabled,
    };
    sounds.setEnabled(soundEnabled);
    onSaveProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div
      id="profile-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-[2rem] max-w-lg w-full p-6 sm:p-8 shadow-pop-amber border-4 border-amber-400 space-y-6 my-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 border-2 border-amber-900 text-amber-950 flex items-center justify-center font-black shadow-[2px_2px_0px_0px_rgba(180,83,9,1)]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">Student Profile & Badges</h3>
              <p className="text-xs text-slate-500 font-medium">Manage student details & view achievements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-amber-100 text-slate-500 hover:text-slate-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex gap-2 p-1 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
              activeTab === 'profile'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Profile Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 ${
              activeTab === 'badges'
                ? 'bg-amber-400 text-amber-950 shadow-xs border border-amber-900'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Badges ({unlockedCount}/{allBadges.length})</span>
          </button>
        </div>

        {/* Level & Title Summary Card */}
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl filter drop-shadow-xs">{avatar}</span>
              <div>
                <p className="font-black text-slate-900 text-sm">{name || 'Math Student'}</p>
                <p className="text-xs text-amber-800 font-black uppercase tracking-wider">{levelInfo.title}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-amber-400 border border-amber-900 text-amber-950 shadow-2xs">
                Level {levelInfo.level}
              </span>
              <p className="text-[11px] text-slate-600 font-mono font-bold mt-1">{profile.totalXP} Total XP</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-600 font-black mb-1">
              <span>Next Rank: {levelInfo.nextLevelXP} XP</span>
              <span>{levelInfo.progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${levelInfo.progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* TAB 1: PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {/* Avatar picker */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                Choose Avatar
              </label>
              <div className="grid grid-cols-8 gap-2">
                {AVATAR_CHOICES.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`p-2 rounded-xl text-xl transition flex items-center justify-center border-2 ${
                      avatar === emoji
                        ? 'bg-amber-300 border-amber-900 scale-110 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-amber-50 hover:border-amber-300'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Student Name */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">Student Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Mercer"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-sm focus:outline-hidden focus:border-amber-500 font-bold"
              />
            </div>

            {/* Classroom Code */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Classroom Code (for Class Leaderboard)
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  placeholder="e.g. MATH-808"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-sm uppercase font-mono font-black focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            {/* Grade Tier */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">Grade Level</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { val: 'rookie', label: 'Rookie (1-2)' },
                  { val: 'explorer', label: 'Explorer (3-4)' },
                  { val: 'champion', label: 'Champion (5-6)' },
                  { val: 'master', label: 'Master (7+)' },
                ].map((g) => (
                  <button
                    key={g.val}
                    type="button"
                    onClick={() => setGrade(g.val as DifficultyGrade)}
                    className={`py-2 px-2 rounded-xl border-2 text-xs font-black transition text-center ${
                      grade === g.val
                        ? 'bg-amber-400 border-amber-900 text-amber-950 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sound toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border-2 border-slate-200">
              <div className="flex items-center gap-2">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-amber-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Audio Sound Effects</span>
              </div>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-12 h-6 flex items-center rounded-full p-1 border-2 border-slate-400 transition ${
                  soundEnabled ? 'bg-amber-400 border-amber-900' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: ACHIEVEMENTS & BADGES */}
        {activeTab === 'badges' && (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            <div className="p-3 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-between text-xs font-bold text-amber-950">
              <span>🏆 10 Competitive Record Badges — Seize badges by breaking records!</span>
              <span className="font-black px-2 py-0.5 rounded-md bg-amber-400 border border-amber-900 shadow-2xs">
                {unlockedCount} / {allBadges.length} Held
              </span>
            </div>

            <div className="space-y-2.5">
              {allBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition ${
                    badge.unlocked
                      ? 'bg-amber-100/90 border-amber-900 shadow-xs ring-2 ring-amber-400'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border-2 ${
                      badge.unlocked
                        ? 'bg-amber-300 border-amber-900 shadow-xs'
                        : 'bg-slate-100 border-slate-300 text-slate-400'
                    }`}
                  >
                    {badge.emoji || '🎖️'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-black text-sm text-slate-900 truncate">{badge.title}</h4>
                      {badge.unlocked ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 text-[9px] font-black uppercase">
                          You Hold Record
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[9px] font-black uppercase">
                          Record: {badge.currentHolderName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-medium line-clamp-1">{badge.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-mono font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                        {badge.recordValueDisplay || badge.requirementDescription}
                      </span>
                      {badge.currentHolderName && badge.currentHolderName !== 'Unclaimed Record' && (
                        <span className="text-[10px] text-slate-500 font-bold">
                          Held by {badge.currentHolderAvatar} {badge.currentHolderName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-2 pt-2">
          {activeTab === 'profile' && (
            <button
              onClick={handleSave}
              className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-900 text-amber-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_rgba(180,83,9,1)] transition active:translate-y-0.5 active:shadow-none"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Saved Profile!' : 'Save Profile Changes'}</span>
            </button>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onResetData}
              className="text-xs text-rose-600 hover:text-rose-800 font-black uppercase tracking-wider flex items-center gap-1 p-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Local Progress</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-800 font-black uppercase tracking-wider p-1"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
