import React, { useState } from "react";
import {
  Shield,
  User,
  Lock,
  Key,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { StorageService } from "../utils/storage";
import { ApiService } from "../utils/api";
import { sounds } from "../utils/audio";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: "admin" | "student") => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"student" | "admin">("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      // Prefer server-side auth for admin and student validation
      const resp = await ApiService.login(username, password);
      setIsLoading(false);
      if (resp.success && resp.role) {
        sounds.playCorrect();
        if (resp.role === "admin" && resp.user) {
          // set auth state for admin
          const authState = {
            isAuthenticated: true,
            role: "admin" as const,
            currentStudentId: null,
            username: resp.user.username,
            name: resp.user.name,
          };
          StorageService.setAuthState(authState);
          onLoginSuccess("admin");
          onClose();
          return;
        }

        if (resp.role === "student" && resp.student) {
          const student = resp.student;
          // Save or sync student locally
          StorageService.saveOrUpdateStudent(student);
          const authState = {
            isAuthenticated: true,
            role: "student" as const,
            currentStudentId: student.id,
            username: student.username,
            name: student.name,
          };
          StorageService.setAuthState(authState);
          onLoginSuccess("student");
          onClose();
          return;
        }
      }

      sounds.playIncorrect();
      setErrorMsg(
        resp.error || "Invalid username or password. Please try again.",
      );
    } catch (e) {
      setIsLoading(false);
      sounds.playIncorrect();
      setErrorMsg("Authentication failed. Please try again.");
    }
  };

  const handleQuickStudentLogin = (demoUser: string, demoPass: string) => {
    setUsername(demoUser);
    setPassword(demoPass);
    const result = StorageService.login(demoUser, demoPass);
    if (result.success && result.role) {
      sounds.playCorrect();
      onLoginSuccess(result.role);
      onClose();
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-[2rem] max-w-md w-full p-6 sm:p-8 shadow-pop-amber border-4 border-amber-900 space-y-5 my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-amber-200 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 border-2 border-amber-900 text-amber-950 flex items-center justify-center font-black text-xl shadow-xs">
              {activeTab === "admin" ? "👑" : "🧑‍🎓"}
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">
                {activeTab === "admin"
                  ? "Teacher & Admin Login"
                  : "Student Test Portal Login"}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {activeTab === "admin"
                  ? "Enter educator credentials"
                  : "Enter assigned student username & password"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-amber-100 text-slate-500 hover:text-slate-900 transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-amber-100/60 border-2 border-amber-300">
          <button
            type="button"
            onClick={() => {
              setActiveTab("student");
              setUsername("");
              setPassword("");
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition ${
              activeTab === "student"
                ? "bg-amber-400 text-amber-950 border-2 border-amber-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Student Portal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("admin");
              setUsername("");
              setPassword("");
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition ${
              activeTab === "admin"
                ? "bg-amber-950 text-amber-300 border-2 border-amber-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Teacher Admin Deck</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs font-black flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={
                  activeTab === "admin" ? "Enter admin username" : "e.g. alex.m"
                }
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-xs font-mono font-bold focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-xs font-mono font-bold focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-2xl border-2 border-amber-900 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_rgba(180,83,9,1)] transition active:translate-y-0.5 ${
              activeTab === "admin"
                ? "bg-amber-950 text-amber-300 hover:bg-amber-900"
                : "bg-amber-400 text-amber-950 hover:bg-amber-300"
            }`}
          >
            <span>
              {isLoading
                ? "Authenticating..."
                : activeTab === "admin"
                  ? "Log In to Admin Panel"
                  : "Log In & Take Dodging Test"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Student Quick Switcher */}
        {activeTab === "student" && (
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <p className="text-[10px] font-black uppercase text-slate-400 text-center tracking-wider">
              Student Classroom Switcher (Demo)
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickStudentLogin("alex.m", "password123")}
                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-left transition"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🧑‍🚀</span>
                  <span className="text-xs font-black text-slate-800">
                    Alex Mercer
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-500">
                  alex.m (Tables 2-12)
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickStudentLogin("aria.c", "password123")}
                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-left transition"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🦊</span>
                  <span className="text-xs font-black text-slate-800">
                    Aria Chen
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-500">
                  aria.c (Tables 2-15)
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickStudentLogin("marcus.v", "password123")
                }
                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-left transition"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🚀</span>
                  <span className="text-xs font-black text-slate-800">
                    Marcus Vance
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-500">
                  marcus.v (5s Speed)
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickStudentLogin("sophia.p", "password123")
                }
                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-left transition"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🦉</span>
                  <span className="text-xs font-black text-slate-800">
                    Sophia Patel
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-500">
                  sophia.p (Missing Factor)
                </p>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
