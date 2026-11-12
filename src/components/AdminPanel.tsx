import React, { useState } from "react";
import {
  Users,
  Clock,
  Sliders,
  Plus,
  Trash2,
  Edit2,
  Key,
  Database,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  BarChart2,
  History,
  ShieldCheck,
  Search,
  BookOpen,
  Award,
  Zap,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
} from "lucide-react";
import { StudentAccount, DodgingTestAttempt, DifficultyGrade } from "../types";
import { StorageService } from "../utils/storage";
import { sounds } from "../utils/audio";

interface AdminPanelProps {
  onRefreshData: () => void;
  onSwitchToStudent?: (studentId: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onRefreshData,
  onSwitchToStudent,
}) => {
  const [activeTab, setActiveTab] = useState<
    "students" | "records" | "settings" | "database"
  >("students");
  const [students, setStudents] = useState<StudentAccount[]>(() =>
    StorageService.getStudents(),
  );
  const [attempts, setAttempts] = useState<DodgingTestAttempt[]>(() =>
    StorageService.getAllAttempts(),
  );

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStudentForHistory, setSelectedStudentForHistory] =
    useState<StudentAccount | null>(null);
  const [inspectAttempt, setInspectAttempt] =
    useState<DodgingTestAttempt | null>(null);

  // Student Edit / Create Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<StudentAccount | null>(
    null,
  );
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {},
  );

  // Form states
  const [formName, setFormName] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formAvatar, setFormAvatar] = useState("🧑‍🎓");
  const [formGrade, setFormGrade] = useState<DifficultyGrade>("explorer");
  const [formClassCode, setFormClassCode] = useState("MATH-808");
  const [formMinTable, setFormMinTable] = useState(2);
  const [formMaxTable, setFormMaxTable] = useState(12);
  const [formTimeSec, setFormTimeSec] = useState(10);
  const [formQuestionCount, setFormQuestionCount] = useState(15);
  const [formMode, setFormMode] = useState<
    "multiplication" | "division" | "missing_factor" | "mixed"
  >("multiplication");
  const [formError, setFormError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 3500);
  };

  const refreshState = () => {
    setStudents(StorageService.getStudents());
    setAttempts(StorageService.getAllAttempts());
    onRefreshData();
  };

  const handleOpenCreateModal = () => {
    setEditingStudent(null);
    setFormName("");
    setFormUsername("");
    setFormPassword("pass123");
    setFormAvatar("🧑‍🎓");
    setFormGrade("explorer");
    setFormClassCode("MATH-808");
    setFormMinTable(2);
    setFormMaxTable(12);
    setFormTimeSec(10);
    setFormQuestionCount(15);
    setFormMode("multiplication");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: StudentAccount) => {
    setEditingStudent(student);
    setFormName(student.name);
    setFormUsername(student.username);
    setFormPassword(student.password);
    setFormAvatar(student.avatar);
    setFormGrade(student.grade);
    setFormClassCode(student.classCode);
    setFormMinTable(student.assignedMinTable || 2);
    setFormMaxTable(student.assignedMaxTable || 12);
    setFormTimeSec(student.assignedTimePerQuestionSec || 10);
    setFormQuestionCount(student.assignedQuestionCount || 15);
    setFormMode(student.assignedMode || "multiplication");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formUsername.trim() || !formPassword.trim()) {
      setFormError("Please fill in student name, username, and password.");
      return;
    }

    // Check duplicate username if new
    const existing = students.find(
      (s) =>
        s.username.toLowerCase() === formUsername.trim().toLowerCase() &&
        s.id !== editingStudent?.id,
    );
    if (existing) {
      setFormError(
        `Username "${formUsername}" is already in use by another student.`,
      );
      return;
    }

    if (formMinTable > formMaxTable) {
      setFormError("Minimum table cannot exceed Maximum table.");
      return;
    }

    const saved = StorageService.saveOrUpdateStudent({
      id: editingStudent?.id,
      name: formName.trim(),
      username: formUsername.trim().toLowerCase(),
      password: formPassword.trim(),
      avatar: formAvatar,
      grade: formGrade,
      classCode: formClassCode.trim().toUpperCase() || "MATH-808",
      assignedMinTable: formMinTable,
      assignedMaxTable: formMaxTable,
      assignedTimePerQuestionSec: formTimeSec,
      assignedQuestionCount: formQuestionCount,
      assignedMode: formMode,
    });

    sounds.playCorrect();
    showSuccess(
      editingStudent
        ? `Updated student ${saved.name} successfully!`
        : `Created student ${saved.name}!`,
    );
    setIsModalOpen(false);
    refreshState();
  };

  const handleDeleteStudent = (student: StudentAccount) => {
    if (
      window.confirm(
        `Are you sure you want to delete student "${student.name}" (@${student.username})?`,
      )
    ) {
      StorageService.deleteStudent(student.id);
      sounds.playPop();
      showSuccess(`Deleted student ${student.name}.`);
      refreshState();
    }
  };

  const togglePasswordVisibility = (studentId: string) => {
    setShowPasswords((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const handleExportJSON = () => {
    const jsonStr = StorageService.exportDatabase();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `math_masters_database_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showSuccess("Database exported successfully as JSON file!");
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = StorageService.importDatabase(content);
      if (ok) {
        sounds.playFanfare();
        showSuccess("Database successfully restored and imported!");
        refreshState();
      } else {
        alert(
          "Failed to parse database file. Ensure it is a valid Math Masters JSON export.",
        );
      }
    };
    reader.readAsText(file);
  };

  const handleResetDatabase = () => {
    if (
      window.confirm(
        "Reset database to clean initial demonstration student accounts?",
      )
    ) {
      StorageService.resetAllDatabase();
      sounds.playPop();
      showSuccess("Database reset to standard classroom roster.");
      refreshState();
    }
  };

  // Filter students
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.classCode.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Classroom stats calculations
  const totalTestsAcrossClass = attempts.length;
  const avgClassAccuracy =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((sum, a) => sum + a.accuracy, 0) / attempts.length,
        )
      : 92;
  const avgClassSpeed =
    attempts.length > 0
      ? (
          attempts.reduce((sum, a) => sum + a.avgTimePerQuestionSec, 0) /
          attempts.length
        ).toFixed(1)
      : "4.2";

  return (
    <div id="admin-panel-container" className="space-y-6">
      {/* Top Banner / Title */}
      <div className="p-6 sm:p-8 rounded-3xl bg-amber-400 border-4 border-amber-900 shadow-pop-amber flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-950 text-amber-300 flex items-center justify-center font-black text-2xl shadow-inner border-2 border-amber-900">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 text-[11px] font-black uppercase tracking-wider">
                Admin Control Deck
              </span>
              <span className="text-xs font-bold text-amber-950/80">
                Logged in as {StorageService.getAuthState().name || "Admin"}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-950 tracking-tight">
              Dodging Table Test Manager
            </h2>
            <p className="text-xs sm:text-sm font-bold text-amber-900/90">
              Configure question timers, table ranges, student passwords &
              inspect classroom test records.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="btn-add-student-top"
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-2xl bg-amber-950 hover:bg-amber-900 text-amber-200 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(245,158,11,1)] transition active:translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-amber-100 text-amber-950 border-2 border-amber-900 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xs transition active:translate-y-0.5"
          >
            <Download className="w-4 h-4 text-amber-700" />
            <span>Export Database</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-100 border-2 border-emerald-600 text-emerald-950 text-xs font-black flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-700" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-800 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border-3 border-amber-900 shadow-pop-amber space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
              Enrolled Students
            </span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {students.length}
          </p>
          <p className="text-[10px] font-bold text-emerald-600">
            Active Classroom Roster
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border-3 border-amber-900 shadow-pop-amber space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
              Dodging Tests Taken
            </span>
            <BarChart2 className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {totalTestsAcrossClass}
          </p>
          <p className="text-[10px] font-bold text-indigo-600">
            Completed Submissions
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border-3 border-amber-900 shadow-pop-amber space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
              Classroom Accuracy
            </span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {avgClassAccuracy}%
          </p>
          <p className="text-[10px] font-bold text-slate-500">
            Average across all tables
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border-3 border-amber-900 shadow-pop-amber space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
              Average Dodging Speed
            </span>
            <Clock className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {avgClassSpeed}s
          </p>
          <p className="text-[10px] font-bold text-orange-600">
            Per question response time
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b-2 border-amber-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("students")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition ${
            activeTab === "students"
              ? "bg-amber-400 text-amber-950 border-2 border-amber-900 shadow-xs"
              : "bg-white text-slate-600 border-2 border-slate-200 hover:bg-amber-50"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Students Roster & Config ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("records")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition ${
            activeTab === "records"
              ? "bg-amber-400 text-amber-950 border-2 border-amber-900 shadow-xs"
              : "bg-white text-slate-600 border-2 border-slate-200 hover:bg-amber-50"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Test Submissions & Audit Logs ({attempts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("database")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition ${
            activeTab === "database"
              ? "bg-amber-400 text-amber-950 border-2 border-amber-900 shadow-xs"
              : "bg-white text-slate-600 border-2 border-slate-200 hover:bg-amber-50"
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Database & Backup Tools</span>
        </button>
      </div>

      {/* TAB 1: STUDENTS ROSTER & CONFIG */}
      {activeTab === "students" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search students, usernames or classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border-2 border-slate-300 text-xs font-black focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-amber-400 border-2 border-amber-900 text-amber-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(180,83,9,1)] active:translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Student Account</span>
            </button>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-3xl border-3 border-amber-900 shadow-pop-amber overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-amber-100/70 border-b-2 border-amber-200 text-slate-700 font-black uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Login Username</th>
                    <th className="py-3.5 px-4">Password</th>
                    <th className="py-3.5 px-4">Assigned Table Range</th>
                    <th className="py-3.5 px-4">Timer / Question</th>
                    <th className="py-3.5 px-4">Length & Mode</th>
                    <th className="py-3.5 px-4">Tests Done</th>
                    <th className="py-3.5 px-4">Accuracy</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredStudents.map((student) => {
                    const isPassVisible = showPasswords[student.id] || false;
                    return (
                      <tr
                        key={student.id}
                        className="hover:bg-amber-50/50 transition"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl filter drop-shadow-xs">
                              {student.avatar}
                            </span>
                            <div>
                              <p className="font-black text-slate-900">
                                {student.name}
                              </p>
                              <span className="text-[10px] font-bold text-amber-800 uppercase px-1.5 py-0.5 rounded-md bg-amber-100">
                                {student.classCode} • {student.grade}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-black text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-200">
                            @{student.username}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-slate-800 bg-slate-100 px-2 py-1 rounded-lg border border-slate-300">
                              {isPassVisible ? student.password : "••••••••"}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                togglePasswordVisibility(student.id)
                              }
                              title={
                                isPassVisible
                                  ? "Hide password"
                                  : "Show password"
                              }
                              className="p-1 text-slate-400 hover:text-slate-700"
                            >
                              {isPassVisible ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-black text-amber-950 bg-amber-200 px-2.5 py-1 rounded-xl border border-amber-400">
                            Table {student.assignedMinTable || 2} to{" "}
                            {student.assignedMaxTable || 12}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200 flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3" />
                            {student.assignedTimePerQuestionSec || 10}s / Q
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-[11px] font-bold text-slate-700">
                            <p className="font-black">
                              {student.assignedQuestionCount || 15} Questions
                            </p>
                            <p className="text-[10px] text-slate-500 capitalize">
                              {student.assignedMode || "multiplication"}
                            </p>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-black text-slate-800">
                            {student.profile.testsCompleted || 0}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`font-black px-2 py-0.5 rounded-lg text-[11px] ${
                              (student.profile.avgAccuracy || 0) >= 90
                                ? "bg-emerald-100 text-emerald-800"
                                : (student.profile.avgAccuracy || 0) >= 75
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {student.profile.avgAccuracy || 90}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                StorageService.resetStudentDailyTest(
                                  student.id,
                                );
                                refreshState();
                                showSuccess(
                                  `Reset daily test quota for ${student.name}. They can now take today's test!`,
                                );
                              }}
                              title="Reset today's test limit (allows student to retake today's test)"
                              className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 transition"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            {onSwitchToStudent && (
                              <button
                                onClick={() => onSwitchToStudent(student.id)}
                                title="Login / View as this student"
                                className="p-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition"
                              >
                                <Zap className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenEditModal(student)}
                              title="Edit Config, Table Range, Timer or Password"
                              className="p-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student)}
                              title="Delete Student"
                              className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TEST RECORDS & AUDIT */}
      {activeTab === "records" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
              Recent Dodging Table Test Submissions ({attempts.length})
            </h3>
            <span className="text-xs text-slate-500 font-bold">
              Click any attempt to inspect question-by-question response
              breakdown
            </span>
          </div>

          {attempts.length === 0 ? (
            <div className="p-10 rounded-3xl bg-white border-3 border-amber-900 text-center space-y-3">
              <p className="text-4xl">📝</p>
              <h4 className="font-black text-slate-800 text-base">
                No Dodging Table Tests Completed Yet
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Once students take tests on their portal, every submission with
                exact response times, accuracy, and question logs will appear
                here.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border-3 border-amber-900 shadow-pop-amber overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-amber-100/70 border-b-2 border-amber-200 text-slate-700 font-black uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4">Date & Time</th>
                      <th className="py-3.5 px-4">Student</th>
                      <th className="py-3.5 px-4">Table Range Tested</th>
                      <th className="py-3.5 px-4">Time Limit / Q</th>
                      <th className="py-3.5 px-4">Score</th>
                      <th className="py-3.5 px-4">Accuracy</th>
                      <th className="py-3.5 px-4">Avg Speed</th>
                      <th className="py-3.5 px-4">Sync Status</th>
                      <th className="py-3.5 px-4 text-right">Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {attempts.map((attempt) => (
                      <tr
                        key={attempt.id}
                        onClick={() => setInspectAttempt(attempt)}
                        className="hover:bg-amber-50/70 transition cursor-pointer"
                      >
                        <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                          {new Date(attempt.timestamp).toLocaleDateString()}{" "}
                          {new Date(attempt.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3.5 px-4 font-black text-slate-900">
                          {attempt.studentName}{" "}
                          <span className="text-slate-400 font-normal">
                            (@{attempt.studentUsername})
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-black text-amber-950">
                          Table {attempt.tableRange?.min || 2} to{" "}
                          {attempt.tableRange?.max || 12}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                          {attempt.timeLimitPerQuestionSec}s
                        </td>
                        <td className="py-3.5 px-4 font-mono font-black text-indigo-700">
                          {attempt.correctQuestions}/{attempt.totalQuestions} (
                          {attempt.score} pts)
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`font-black px-2 py-0.5 rounded-lg text-[11px] ${
                              attempt.accuracy >= 90
                                ? "bg-emerald-100 text-emerald-800"
                                : attempt.accuracy >= 70
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {attempt.accuracy}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                          {attempt.avgTimePerQuestionSec}s/Q
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              attempt.isSynced
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-orange-100 text-orange-800 border border-orange-300"
                            }`}
                          >
                            {attempt.isSynced
                              ? "🟢 Synced"
                              : "🟠 Offline Cached"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-indigo-600 hover:text-indigo-900">
                          Inspect &rarr;
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DATABASE & BACKUP TOOLS */}
      {activeTab === "database" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white border-3 border-amber-900 shadow-pop-amber space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-black">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  Export Student Records & Database
                </h3>
                <p className="text-xs text-slate-500">
                  Download complete database as a portable JSON file
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Back up student accounts, login credentials, assigned dodging
              table ranges, question timers, test records, and offline sync
              logs.
            </p>
            <button
              onClick={handleExportJSON}
              className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-900 text-amber-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(180,83,9,1)] transition active:translate-y-0.5"
            >
              <Download className="w-4 h-4" />
              <span>Download Database JSON Backup</span>
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-white border-3 border-amber-900 shadow-pop-amber space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-900 flex items-center justify-center font-black">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  Restore / Import Database
                </h3>
                <p className="text-xs text-slate-500">
                  Upload an existing backup file to restore records
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Import student lists and historical test data from an exported
              file across classroom devices.
            </p>
            <label className="w-full py-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-300 text-indigo-900 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition">
              <Upload className="w-4 h-4" />
              <span>Select & Restore JSON File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>

          <div className="p-6 rounded-3xl bg-white border-3 border-rose-900/40 shadow-xs space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-900 flex items-center justify-center font-black">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-rose-950 text-base">
                  Reset Classroom Roster
                </h3>
                <p className="text-xs text-slate-500">
                  Restore default demo classroom students (Alex, Aria, Marcus,
                  Sophia, Kai, Zainab)
                </p>
              </div>
            </div>
            <button
              onClick={handleResetDatabase}
              className="px-5 py-2.5 rounded-2xl bg-rose-100 hover:bg-rose-200 border-2 border-rose-300 text-rose-900 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Sample Classroom</span>
            </button>
          </div>
        </div>
      )}

      {/* STUDENT CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] max-w-xl w-full p-6 sm:p-8 shadow-pop-amber border-4 border-amber-900 space-y-5 my-8">
            <div className="flex items-center justify-between border-b-2 border-amber-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 border-2 border-amber-900 text-amber-950 flex items-center justify-center font-black shadow-xs">
                  {editingStudent ? (
                    <Edit2 className="w-5 h-5" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">
                    {editingStudent
                      ? "Edit Student Configuration"
                      : "Add New Student"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Assign student password, table range, and seconds per
                    question
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-amber-100 text-slate-500 hover:text-slate-900 transition"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs font-black flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveStudent} className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Leo Garcia"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-xs font-bold focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                    Class Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MATH-808"
                    value={formClassCode}
                    onChange={(e) => setFormClassCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-xs font-bold uppercase focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Login Credentials */}
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 space-y-3">
                <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-700" />
                  <span>Student Login Credentials</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-1">
                      Username (to login) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. leo.g"
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 text-xs font-mono font-black focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-1">
                      Password (give to student) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. pass123"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 text-xs font-mono font-black focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Dodging Table Test Configuration */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border-2 border-indigo-200 space-y-3">
                <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Assigned Dodging Test Settings</span>
                </h4>

                {/* Range of Tables */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-1">
                      Min Table (Start)
                    </label>
                    <select
                      value={formMinTable}
                      onChange={(e) => setFormMinTable(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 text-xs font-bold focus:border-indigo-500 focus:outline-hidden"
                    >
                      {[
                        2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
                        18, 19, 20,
                      ].map((t) => (
                        <option key={t} value={t}>
                          Table of {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-1">
                      Max Table (End)
                    </label>
                    <select
                      value={formMaxTable}
                      onChange={(e) => setFormMaxTable(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 text-xs font-bold focus:border-indigo-500 focus:outline-hidden"
                    >
                      {[
                        2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
                        18, 19, 20, 25,
                      ].map((t) => (
                        <option key={t} value={t}>
                          Table of {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Time Per Question and Count */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-1">
                      Time to Attempt Each Question (Seconds)
                    </label>
                    <select
                      value={formTimeSec}
                      onChange={(e) => setFormTimeSec(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 text-xs font-bold focus:border-indigo-500 focus:outline-hidden"
                    >
                      {[3, 5, 7, 8, 10, 12, 15, 20, 30, 45, 60].map((sec) => (
                        <option key={sec} value={sec}>
                          {sec} seconds per question
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-1">
                      Questions per Test
                    </label>
                    <select
                      value={formQuestionCount}
                      onChange={(e) =>
                        setFormQuestionCount(Number(e.target.value))
                      }
                      className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 text-xs font-bold focus:border-indigo-500 focus:outline-hidden"
                    >
                      {[5, 10, 15, 20, 25, 30, 50].map((count) => (
                        <option key={count} value={count}>
                          {count} Questions
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dodging Test Mode */}
                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-1">
                    Dodging Test Mode
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "multiplication", label: "Multiplication" },
                      { id: "missing_factor", label: "Missing Factor" },
                      { id: "division", label: "Division" },
                      { id: "mixed", label: "Mixed Grand" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setFormMode(m.id as any)}
                        className={`py-2 px-2 rounded-xl border-2 text-[11px] font-black transition text-center ${
                          formMode === m.id
                            ? "bg-amber-400 border-amber-900 text-amber-950 shadow-2xs"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-amber-50"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Avatar Picker */}
              <div>
                <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-1">
                  Choose Avatar
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {[
                    "🧑‍🎓",
                    "🦊",
                    "🚀",
                    "🦉",
                    "🐉",
                    "⚡",
                    "🌟",
                    "🦁",
                    "👑",
                    "🧑‍🚀",
                    "🦄",
                    "🐯",
                  ].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setFormAvatar(em)}
                      className={`p-2 rounded-xl text-xl border-2 transition ${
                        formAvatar === em
                          ? "bg-amber-300 border-amber-900 scale-110 shadow-xs"
                          : "bg-slate-50 border-slate-200 hover:bg-amber-50"
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border-2 border-slate-300 text-slate-600 font-black text-xs uppercase tracking-wider hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-900 text-amber-950 font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(180,83,9,1)] active:translate-y-0.5"
                >
                  {editingStudent ? "Save Changes" : "Create Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED ATTEMPT AUDIT MODAL */}
      {inspectAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] max-w-2xl w-full p-6 sm:p-8 shadow-pop-amber border-4 border-amber-900 space-y-5 my-8">
            <div className="flex items-center justify-between border-b-2 border-amber-200 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase">
                  Test Audit Log #{inspectAttempt.id.slice(-6)}
                </span>
                <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight mt-1">
                  {inspectAttempt.studentName}'s Dodging Test
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {new Date(inspectAttempt.timestamp).toLocaleString()} • Limit:{" "}
                  {inspectAttempt.timeLimitPerQuestionSec}s/Q
                </p>
              </div>
              <button
                onClick={() => setInspectAttempt(null)}
                className="p-2 rounded-xl hover:bg-amber-100 text-slate-500 hover:text-slate-900 transition"
              >
                ✕
              </button>
            </div>

            {/* Performance Summary Bar */}
            <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-2xl bg-amber-50 border-2 border-amber-300">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-500">
                  Score
                </p>
                <p className="text-lg font-black text-indigo-700 font-mono">
                  {inspectAttempt.correctQuestions}/
                  {inspectAttempt.totalQuestions}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-500">
                  Accuracy
                </p>
                <p className="text-lg font-black text-emerald-700 font-mono">
                  {inspectAttempt.accuracy}%
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-500">
                  Avg Speed
                </p>
                <p className="text-lg font-black text-orange-700 font-mono">
                  {inspectAttempt.avgTimePerQuestionSec}s
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-500">
                  XP Gained
                </p>
                <p className="text-lg font-black text-amber-800 font-mono">
                  +{inspectAttempt.xpGained}
                </p>
              </div>
            </div>

            {/* Question by question log */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Question Responses ({inspectAttempt.questionLogs?.length || 0})
              </h4>
              <div className="space-y-2">
                {inspectAttempt.questionLogs?.map((log, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-xl border-2 flex items-center justify-between text-xs ${
                      log.isCorrect
                        ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
                        : "bg-rose-50/70 border-rose-300 text-rose-950"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-slate-400 text-xs">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-black text-sm">{log.questionText}</p>
                        <p className="text-[10px] font-bold text-slate-600">
                          Table of {log.tableNumber} • Answered:{" "}
                          <span className="font-mono font-black">
                            {log.studentAnswer || "(Timed out)"}
                          </span>{" "}
                          (Correct:{" "}
                          <span className="font-mono font-black">
                            {log.correctAnswer}
                          </span>
                          )
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-md font-black text-[10px] uppercase ${
                          log.isCorrect
                            ? "bg-emerald-200 text-emerald-900"
                            : "bg-rose-200 text-rose-900"
                        }`}
                      >
                        {log.isCorrect
                          ? "Correct"
                          : log.timedOut
                            ? "Timed Out"
                            : "Incorrect"}
                      </span>
                      <p className="text-[10px] font-mono font-bold text-slate-500 mt-0.5">
                        {log.timeSpentSec}s
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                onClick={() => setInspectAttempt(null)}
                className="px-5 py-2 rounded-xl bg-amber-400 border-2 border-amber-900 text-amber-950 font-black text-xs uppercase"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
