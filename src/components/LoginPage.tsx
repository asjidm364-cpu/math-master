import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  GraduationCap,
  KeyRound,
  User,
  Lock,
  ArrowRight,
  ShieldCheck,
  Crown,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { AuthState, StudentAccount } from '../types';
import { ApiService } from '../utils/api';
import { StorageService } from '../utils/storage';
import { sounds } from '../utils/audio';

interface LoginPageProps {
  onLoginSuccess: (authState: AuthState) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [availableStudents, setAvailableStudents] = useState<StudentAccount[]>([]);

  // Load available students from the server for quick classroom login option
  useEffect(() => {
    let isMounted = true;
    ApiService.getStudents().then((students) => {
      if (isMounted && students.length > 0) {
        setAvailableStudents(students);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Please enter your username');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your password');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      // Authenticate with server API
      const result = await ApiService.login(username.trim(), password.trim());

      if (result.success) {
        sounds.playFanfare();
        let newAuthState: AuthState;

        if (result.role === 'admin') {
          newAuthState = {
            isAuthenticated: true,
            role: 'admin',
            currentStudentId: null,
            username: result.user?.username || 'abrash',
            name: result.user?.name || 'Abrash (Educator Admin)',
          };
        } else {
          const student = result.student!;
          newAuthState = {
            isAuthenticated: true,
            role: 'student',
            currentStudentId: student.id,
            username: student.username,
            name: student.name,
          };
        }

        StorageService.setAuthState(newAuthState);
        onLoginSuccess(newAuthState);
      } else {
        sounds.playWrong();
        setErrorMsg(result.error || 'Invalid username or password');
      }
    } catch (err: any) {
      sounds.playWrong();
      setErrorMsg('Unable to connect to login server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickStudentSelect = (student: StudentAccount) => {
    setUsername(student.username);
    setPassword(student.password);
    setErrorMsg('');
  };

  return (
    <div
      id="login-page-root"
      className="min-h-screen bg-[#FFFDF5] text-slate-900 flex flex-col justify-between selection:bg-amber-300 selection:text-amber-950 p-4 sm:p-6 md:p-10"
    >
      {/* Top Brand Bar */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-400 border-3 border-amber-900 flex items-center justify-center text-amber-950 shadow-pop-amber font-black text-xl">
            ∑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-xl tracking-tight text-amber-950">MATH MASTERS</h1>
              <span className="px-2 py-0.5 rounded-md bg-amber-200 border border-amber-400 text-amber-950 font-mono text-[10px] font-black tracking-widest uppercase">
                Live Server
              </span>
            </div>
            <p className="text-xs text-slate-600 font-bold">Dodging Tables Examination & Practice Station</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border-2 border-amber-200 text-xs font-bold text-slate-700 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Central Server Online • Real-Time Database</span>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="max-w-xl mx-auto w-full my-6 sm:my-10">
        <div className="bg-white rounded-[2.5rem] border-4 border-amber-900 shadow-pop-amber p-6 sm:p-10 space-y-6">
          {/* Header text */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Sign In to Your Account</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Welcome to Math Masters
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-600">
              Please enter your credentials to access your personal dashboard and tests.
            </p>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-amber-50 border-2 border-amber-200">
            <button
              type="button"
              id="tab-student-login"
              onClick={() => {
                setActiveTab('student');
                setErrorMsg('');
                if (username === 'abrash') setUsername('');
              }}
              className={`py-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition ${
                activeTab === 'student'
                  ? 'bg-amber-400 text-amber-950 border-2 border-amber-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Login</span>
            </button>

            <button
              type="button"
              id="tab-admin-login"
              onClick={() => {
                setActiveTab('admin');
                setErrorMsg('');
                if (!username) setUsername('abrash');
              }}
              className={`py-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition ${
                activeTab === 'admin'
                  ? 'bg-amber-950 text-amber-300 border-2 border-amber-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Educator Admin</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 flex items-start gap-2.5 text-rose-900 text-xs font-bold animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                {activeTab === 'student' ? 'Student Username' : 'Teacher / Admin Username'}
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="input-login-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={activeTab === 'student' ? 'e.g. alex, maya, liam...' : 'e.g. abrash'}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-slate-300 text-slate-900 font-bold text-sm focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition bg-slate-50/50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  id="input-login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={activeTab === 'student' ? 'Enter student password' : 'Enter admin password'}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-slate-300 text-slate-900 font-bold text-sm focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition bg-slate-50/50"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              id="btn-login-submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 border-3 border-amber-900 shadow-[3px_3px_0px_0px_rgba(180,83,9,1)] transition active:translate-y-0.5 active:shadow-none ${
                activeTab === 'student'
                  ? 'bg-amber-400 hover:bg-amber-300 text-amber-950'
                  : 'bg-amber-900 hover:bg-amber-800 text-amber-100'
              }`}
            >
              {isLoading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>
                    {activeTab === 'student' ? 'Sign In as Student' : 'Enter Admin Control Deck'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Student Selection Roster for Classroom Ease */}
          {activeTab === 'student' && availableStudents.length > 0 && (
            <div className="pt-2 border-t border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  <span>Enrolled Classroom Students (Tap to fill)</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 font-mono">
                  {availableStudents.length} Students
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {availableStudents.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleQuickStudentSelect(s)}
                    className={`p-2 rounded-xl border-2 flex items-center gap-2 text-left transition ${
                      username.toLowerCase() === s.username.toLowerCase()
                        ? 'bg-amber-200 border-amber-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-amber-50 hover:border-amber-300'
                    }`}
                  >
                    <span className="text-xl">{s.avatar || '🧑‍🎓'}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-slate-900 truncate">{s.name.split(' ')[0]}</p>
                      <p className="text-[10px] font-mono text-slate-500 truncate">@{s.username}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Admin Helper notice */}
          {activeTab === 'admin' && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-slate-700 text-xs font-bold space-y-1">
              <div className="flex items-center gap-1.5 text-amber-950 font-black">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Educator Admin Information</span>
              </div>
              <p className="leading-relaxed">
                Log in to manage students, create new student accounts, configure dodging table test parameters, and monitor live test submissions in real time.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full text-center py-3 text-xs text-slate-500 font-bold border-t border-amber-200">
        <p>Math Masters • Real-Time Dynamic Dodging Table Evaluation System</p>
      </footer>
    </div>
  );
};
