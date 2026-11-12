import {
  StudentProfile,
  StudentStats,
  StudentAccount,
  DodgingTestAttempt,
  MistakeRecord,
  LeaderboardEntry,
  QuestStage,
  AchievementBadge,
  MathOperation,
  DifficultyGrade,
  GameSessionSummary,
  Question,
  AuthState,
  DayStreakItem,
  StudentStreakData,
} from "../types";

import { ApiService } from "./api";

// Admin credentials are validated server-side. Do NOT keep secrets in client code.

const STORAGE_KEYS = {
  AUTH: "math_masters_auth_v3",
  STUDENTS: "math_masters_students_v3",
  ATTEMPTS: "math_masters_attempts_v3",
  OFFLINE_QUEUE: "math_masters_offline_queue_v3",
  PROFILE_LEGACY: "math_masters_profile_v2",
  STATS_LEGACY: "math_masters_stats_v2",
  MISTAKES: "math_masters_mistakes_v3",
  QUEST_STAGES: "math_masters_quest_stages_v2",
  BADGES: "math_masters_badges_v3",
};

export const INITIAL_BADGES: AchievementBadge[] = [
  {
    id: "cheetah_speed",
    title: "Cheetah Sprint",
    description:
      "Fastest average time per question in a completed test (min 80% accuracy)",
    iconName: "Zap",
    emoji: "🐆",
    category: "speed",
    requirementDescription: "Lowest seconds / question record",
    unlocked: false,
  },
  {
    id: "deadshot_accuracy",
    title: "Deadshot Sniper",
    description: "Highest test accuracy record across official dodging tests",
    iconName: "Target",
    emoji: "🎯",
    category: "accuracy",
    requirementDescription: "Highest accuracy % record",
    unlocked: false,
  },
  {
    id: "apex_score",
    title: "Apex Grand Champion",
    description: "Highest single dodging test score achieved in the class",
    iconName: "Crown",
    emoji: "👑",
    category: "score",
    requirementDescription: "Highest single test score record",
    unlocked: false,
  },
  {
    id: "lightning_reaction",
    title: "Lightning Reaction",
    description: "Sub-1.5s ultra-speed response record on 10+ questions test",
    iconName: "Flame",
    emoji: "⚡",
    category: "speed",
    requirementDescription: "Fastest reaction speed record",
    unlocked: false,
  },
  {
    id: "streak_overlord",
    title: "Streak Overlord",
    description: "Longest active daily practice streak in the classroom",
    iconName: "Flame",
    emoji: "🔥",
    category: "streak",
    requirementDescription: "Highest active daily streak record",
    unlocked: false,
  },
  {
    id: "xp_titan",
    title: "XP Titan",
    description: "Highest total XP accumulated in the classroom",
    iconName: "Sparkles",
    emoji: "💎",
    category: "score",
    requirementDescription: "Highest total XP record",
    unlocked: false,
  },
  {
    id: "iron_wall",
    title: "Iron Wall Flawless",
    description: "Most 100% perfect (10/10) test clears without a single error",
    iconName: "Award",
    emoji: "🛡️",
    category: "accuracy",
    requirementDescription: "Most flawless 100% tests record",
    unlocked: false,
  },
  {
    id: "dodging_warlord",
    title: "Dodging Warlord",
    description: "Most official dodging tests completed overall",
    iconName: "Trophy",
    emoji: "⚔️",
    category: "dedication",
    requirementDescription: "Most tests completed record",
    unlocked: false,
  },
  {
    id: "supersonic_prodigy",
    title: "Supersonic Prodigy",
    description: "Fastest total test completion time with 90%+ accuracy",
    iconName: "Award",
    emoji: "🚀",
    category: "speed",
    requirementDescription: "Lowest total test duration record",
    unlocked: false,
  },
  {
    id: "the_centurion",
    title: "The Centurion",
    description:
      "Most total math questions answered correctly across all tests",
    iconName: "Award",
    emoji: "🌟",
    category: "dedication",
    requirementDescription: "Most math problems solved record",
    unlocked: false,
  },
];

export const INITIAL_QUEST_STAGES: QuestStage[] = [
  {
    id: "stage_1",
    stageNumber: 1,
    title: "Tables 2 to 5 Sprint",
    operation: "multiplication",
    difficulty: "rookie",
    description:
      "Master elementary multiplication tables 2, 3, 4, and 5 with high speed.",
    requiredXP: 0,
    targetQuestions: 8,
    starsEarned: 0,
    isUnlocked: true,
  },
  {
    id: "stage_2",
    stageNumber: 2,
    title: "Tables 6 to 9 Core Matrix",
    operation: "multiplication",
    difficulty: "explorer",
    description:
      "Conquer the tricky 6×, 7×, 8×, and 9× dodging table problems.",
    requiredXP: 60,
    targetQuestions: 10,
    starsEarned: 0,
    isUnlocked: false,
  },
  {
    id: "stage_3",
    stageNumber: 3,
    title: "Missing Factor Detective",
    operation: "missing_factor",
    difficulty: "explorer",
    description:
      "Find the missing multiplier in fast-paced dodging equations (e.g. ? × 8 = 56).",
    requiredXP: 150,
    targetQuestions: 10,
    starsEarned: 0,
    isUnlocked: false,
  },
  {
    id: "stage_4",
    stageNumber: 4,
    title: "Inverse Division Vault",
    operation: "division",
    difficulty: "explorer",
    description: "Reverse dodging tables to find quotients in record time.",
    requiredXP: 260,
    targetQuestions: 10,
    starsEarned: 0,
    isUnlocked: false,
  },
  {
    id: "stage_5",
    stageNumber: 5,
    title: "Tables 11 to 15 Heavyweights",
    operation: "multiplication",
    difficulty: "champion",
    description:
      "Advanced multiplication tables 11 through 15 with rapid calculation.",
    requiredXP: 400,
    targetQuestions: 12,
    starsEarned: 0,
    isUnlocked: false,
  },
  {
    id: "stage_6",
    stageNumber: 6,
    title: "Mixed Dodging Grand Prix (Boss Stage)",
    operation: "mixed",
    difficulty: "master",
    description:
      "The ultimate lightning dodging test mixing multiplication, division, and missing factors up to Table 20!",
    requiredXP: 650,
    targetQuestions: 15,
    starsEarned: 0,
    isUnlocked: false,
    isBossStage: true,
  },
];

// Pre-seeded students for immediate classroom demonstration
const DEFAULT_STUDENTS: StudentAccount[] = [
  {
    id: "std_alex",
    username: "alex.m",
    password: "password123",
    name: "Alex Mercer",
    avatar: "🧑‍🚀",
    grade: "explorer",
    classCode: "MATH-808",
    createdAt: "2026-08-20T10:00:00.000Z",
    assignedMinTable: 2,
    assignedMaxTable: 12,
    assignedTimePerQuestionSec: 10,
    assignedQuestionCount: 15,
    assignedMode: "multiplication",
    profile: {
      id: "std_alex",
      username: "alex.m",
      name: "Alex Mercer",
      avatar: "🧑‍🚀",
      grade: "explorer",
      classCode: "MATH-808",
      totalXP: 520,
      level: 4,
      title: "Arithmetic Knight",
      streakDays: 3,
      lastActiveDate: new Date().toISOString().split("T")[0],
      soundEnabled: true,
      unlockedBadges: ["first_dodging", "streak_5"],
      starsCollected: 6,
      assignedMinTable: 2,
      assignedMaxTable: 12,
      assignedTimePerQuestionSec: 10,
      assignedQuestionCount: 15,
      assignedMode: "multiplication",
      testsCompleted: 4,
      avgAccuracy: 93,
      avgSpeedSec: 4.8,
    },
  },
  {
    id: "std_aria",
    username: "aria.c",
    password: "password123",
    name: "Aria Chen",
    avatar: "🦊",
    grade: "champion",
    classCode: "MATH-808",
    createdAt: "2026-08-20T10:00:00.000Z",
    assignedMinTable: 2,
    assignedMaxTable: 15,
    assignedTimePerQuestionSec: 7,
    assignedQuestionCount: 20,
    assignedMode: "mixed",
    profile: {
      id: "std_aria",
      username: "aria.c",
      name: "Aria Chen",
      avatar: "🦊",
      grade: "champion",
      classCode: "MATH-808",
      totalXP: 1450,
      level: 6,
      title: "Algebra Specialist",
      streakDays: 5,
      lastActiveDate: new Date().toISOString().split("T")[0],
      soundEnabled: true,
      unlockedBadges: [
        "first_dodging",
        "streak_5",
        "streak_15",
        "table_master_7",
        "flawless_round",
      ],
      starsCollected: 12,
      assignedMinTable: 2,
      assignedMaxTable: 15,
      assignedTimePerQuestionSec: 7,
      assignedQuestionCount: 20,
      assignedMode: "mixed",
      testsCompleted: 11,
      avgAccuracy: 97,
      avgSpeedSec: 3.2,
    },
  },
  {
    id: "std_marcus",
    username: "marcus.v",
    password: "password123",
    name: "Marcus Vance",
    avatar: "🚀",
    grade: "master",
    classCode: "MATH-808",
    createdAt: "2026-08-20T10:00:00.000Z",
    assignedMinTable: 2,
    assignedMaxTable: 20,
    assignedTimePerQuestionSec: 5,
    assignedQuestionCount: 20,
    assignedMode: "multiplication",
    profile: {
      id: "std_marcus",
      username: "marcus.v",
      name: "Marcus Vance",
      avatar: "🚀",
      grade: "master",
      classCode: "MATH-808",
      totalXP: 1220,
      level: 5,
      title: "Fraction Wizard",
      streakDays: 4,
      lastActiveDate: new Date().toISOString().split("T")[0],
      soundEnabled: true,
      unlockedBadges: ["first_dodging", "streak_5", "speed_demon"],
      starsCollected: 9,
      assignedMinTable: 2,
      assignedMaxTable: 20,
      assignedTimePerQuestionSec: 5,
      assignedQuestionCount: 20,
      assignedMode: "multiplication",
      testsCompleted: 8,
      avgAccuracy: 94,
      avgSpeedSec: 2.8,
    },
  },
  {
    id: "std_sophia",
    username: "sophia.p",
    password: "password123",
    name: "Sophia Patel",
    avatar: "🦉",
    grade: "champion",
    classCode: "MATH-808",
    createdAt: "2026-08-20T10:00:00.000Z",
    assignedMinTable: 2,
    assignedMaxTable: 12,
    assignedTimePerQuestionSec: 8,
    assignedQuestionCount: 15,
    assignedMode: "missing_factor",
    profile: {
      id: "std_sophia",
      username: "sophia.p",
      name: "Sophia Patel",
      avatar: "🦉",
      grade: "champion",
      classCode: "MATH-808",
      totalXP: 980,
      level: 5,
      title: "Fraction Wizard",
      streakDays: 4,
      lastActiveDate: new Date().toISOString().split("T")[0],
      soundEnabled: true,
      unlockedBadges: ["first_dodging", "streak_5", "table_master_12"],
      starsCollected: 8,
      assignedMinTable: 2,
      assignedMaxTable: 12,
      assignedTimePerQuestionSec: 8,
      assignedQuestionCount: 15,
      assignedMode: "missing_factor",
      testsCompleted: 7,
      avgAccuracy: 96,
      avgSpeedSec: 3.9,
    },
  },
  {
    id: "std_kai",
    username: "kai.t",
    password: "password123",
    name: "Kai Takahashi",
    avatar: "🐉",
    grade: "explorer",
    classCode: "MATH-808",
    createdAt: "2026-08-21T10:00:00.000Z",
    assignedMinTable: 2,
    assignedMaxTable: 10,
    assignedTimePerQuestionSec: 12,
    assignedQuestionCount: 10,
    assignedMode: "multiplication",
    profile: {
      id: "std_kai",
      username: "kai.t",
      name: "Kai Takahashi",
      avatar: "🐉",
      grade: "explorer",
      classCode: "MATH-808",
      totalXP: 440,
      level: 3,
      title: "Equation Explorer",
      streakDays: 2,
      lastActiveDate: new Date().toISOString().split("T")[0],
      soundEnabled: true,
      unlockedBadges: ["first_dodging", "streak_5"],
      starsCollected: 4,
      assignedMinTable: 2,
      assignedMaxTable: 10,
      assignedTimePerQuestionSec: 12,
      assignedQuestionCount: 10,
      assignedMode: "multiplication",
      testsCompleted: 3,
      avgAccuracy: 90,
      avgSpeedSec: 5.4,
    },
  },
  {
    id: "std_zainab",
    username: "zainab.a",
    password: "password123",
    name: "Zainab Al-Mansoor",
    avatar: "🌟",
    grade: "rookie",
    classCode: "MATH-808",
    createdAt: "2026-08-22T10:00:00.000Z",
    assignedMinTable: 2,
    assignedMaxTable: 9,
    assignedTimePerQuestionSec: 15,
    assignedQuestionCount: 10,
    assignedMode: "multiplication",
    profile: {
      id: "std_zainab",
      username: "zainab.a",
      name: "Zainab Al-Mansoor",
      avatar: "🌟",
      grade: "rookie",
      classCode: "MATH-808",
      totalXP: 290,
      level: 2,
      title: "Number Scout",
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split("T")[0],
      soundEnabled: true,
      unlockedBadges: ["first_dodging"],
      starsCollected: 3,
      assignedMinTable: 2,
      assignedMaxTable: 9,
      assignedTimePerQuestionSec: 15,
      assignedQuestionCount: 10,
      assignedMode: "multiplication",
      testsCompleted: 2,
      avgAccuracy: 88,
      avgSpeedSec: 6.2,
    },
  },
];

const INITIAL_STATS_TEMPLATE: StudentStats = {
  totalQuestions: 0,
  totalCorrect: 0,
  totalTimeSec: 0,
  bestBlitzScore: 0,
  maxStreak: 0,
  currentStreak: 0,
  topicStats: {
    multiplication: { total: 0, correct: 0, totalTimeSec: 0 },
    division: { total: 0, correct: 0, totalTimeSec: 0 },
    missing_factor: { total: 0, correct: 0, totalTimeSec: 0 },
    mixed: { total: 0, correct: 0, totalTimeSec: 0 },
    addition: { total: 0, correct: 0, totalTimeSec: 0 },
    subtraction: { total: 0, correct: 0, totalTimeSec: 0 },
    fractions: { total: 0, correct: 0, totalTimeSec: 0 },
    algebra: { total: 0, correct: 0, totalTimeSec: 0 },
    geometry: { total: 0, correct: 0, totalTimeSec: 0 },
  },
  tableMastery: {},
  dailyHistory: {},
  recentSessions: [],
  dodgingAttempts: [],
};

export const StorageService = {
  // ==========================================
  // AUTHENTICATION & SESSION MANAGEMENT
  // ==========================================
  getAuthState(): AuthState {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.isAuthenticated === "boolean") {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    // Default to unauthenticated state so visitor sees Login Page first
    return {
      isAuthenticated: false,
      role: null,
      currentStudentId: null,
      username: null,
      name: null,
    };
  },

  setAuthState(state: AuthState) {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(state));
    } catch (e) {
      console.warn("Could not save auth state", e);
    }
  },

  login(
    username: string,
    pass: string,
  ): {
    success: boolean;
    role?: "admin" | "student";
    student?: StudentAccount;
    error?: string;
  } {
    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = pass.trim();
    const normalizeUsername = (value: string) =>
      value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

    // Admin authentication is performed server-side via ApiService.
    // Student (local) authentication continues to work below.

    // Check Student Login
    const students = this.getStudents();
    const student = students.find(
      (s) =>
        normalizeUsername(s.username) === normalizeUsername(trimmedUser) &&
        s.password === trimmedPass,
    );

    if (student) {
      const authState: AuthState = {
        isAuthenticated: true,
        role: "student",
        currentStudentId: student.id,
        username: student.username,
        name: student.name,
      };
      this.setAuthState(authState);
      return { success: true, role: "student", student };
    }

    return {
      success: false,
      error: "Invalid username or password. Please check your credentials.",
    };
  },

  logout() {
    this.setAuthState({
      isAuthenticated: false,
      role: null,
      currentStudentId: null,
      username: null,
      name: null,
    });
  },

  // ==========================================
  // STUDENT DATABASE MANAGEMENT (ADMIN & STORE)
  // ==========================================
  getStudents(): StudentAccount[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    // Initialize default seeded students
    this.saveStudents(DEFAULT_STUDENTS);
    return DEFAULT_STUDENTS;
  },

  saveStudents(students: StudentAccount[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.warn("Could not save students", e);
    }
  },

  getStudentById(id: string): StudentAccount | undefined {
    const students = this.getStudents();
    return students.find((s) => s.id === id);
  },

  getCurrentStudent(): StudentAccount {
    const auth = this.getAuthState();
    const students = this.getStudents();
    if (auth.currentStudentId) {
      const found = students.find((s) => s.id === auth.currentStudentId);
      if (found) {
        if (auth.name && found.name !== auth.name && auth.role === "student") {
          found.name = auth.name;
          found.profile.name = auth.name;
        }
        return found;
      }
      // If student ID is in auth but not yet in students array, create and preserve it
      if (auth.role === "student" && auth.username) {
        const synth: StudentAccount = {
          id: auth.currentStudentId,
          username: auth.username,
          name: auth.name || auth.username,
          password: "",
          avatar: "🧑‍🎓",
          grade: "explorer",
          classCode: "MATH-808",
          createdAt: new Date().toISOString(),
          assignedMinTable: 2,
          assignedMaxTable: 12,
          assignedTimePerQuestionSec: 10,
          assignedQuestionCount: 15,
          assignedMode: "multiplication",
          profile: {
            id: auth.currentStudentId,
            username: auth.username,
            name: auth.name || auth.username,
            avatar: "🧑‍🎓",
            grade: "explorer",
            classCode: "MATH-808",
            totalXP: 0,
            level: 1,
            title: "Math Rookie",
            streakDays: 1,
            lastActiveDate: new Date().toISOString().split("T")[0],
            soundEnabled: true,
            unlockedBadges: [],
            starsCollected: 0,
            assignedMinTable: 2,
            assignedMaxTable: 12,
            assignedTimePerQuestionSec: 10,
            assignedQuestionCount: 15,
            assignedMode: "multiplication",
            testsCompleted: 0,
            avgAccuracy: 0,
            avgSpeedSec: 0,
          },
        };
        students.push(synth);
        this.saveStudents(students);
        return synth;
      }
    }
    return students[0] || DEFAULT_STUDENTS[0];
  },

  saveOrUpdateStudent(
    student: Partial<StudentAccount> & {
      id?: string;
      username: string;
      name: string;
    },
  ): StudentAccount {
    const students = this.getStudents();
    const existingIdx = students.findIndex(
      (s) =>
        (student.id && s.id === student.id) ||
        s.username.toLowerCase() === student.username.toLowerCase(),
    );

    const minTable = student.assignedMinTable ?? 2;
    const maxTable = student.assignedMaxTable ?? 12;
    const timeSec = student.assignedTimePerQuestionSec ?? 10;
    const qCount = student.assignedQuestionCount ?? 15;
    const mode = student.assignedMode ?? "multiplication";
    const grade = student.grade ?? "explorer";
    const avatar = student.avatar ?? "🧑‍🎓";
    const classCode = student.classCode ?? "MATH-808";

    if (existingIdx >= 0) {
      const existing = students[existingIdx];
      const validName = student.name && student.name.trim().length > 0 ? student.name.trim() : existing.name;
      const validUsername = student.username && student.username.trim().length > 0
        ? student.username.trim().toLowerCase()
        : existing.username;
      const updated: StudentAccount = {
        ...existing,
        ...student,
        name: validName,
        username: validUsername,
        assignedMinTable: minTable,
        assignedMaxTable: maxTable,
        assignedTimePerQuestionSec: timeSec,
        assignedQuestionCount: qCount,
        assignedMode: mode,
        profile: {
          ...existing.profile,
          name: validName,
          avatar: avatar || existing.profile.avatar,
          grade: grade || existing.profile.grade,
          classCode: classCode || existing.profile.classCode,
          assignedMinTable: minTable,
          assignedMaxTable: maxTable,
          assignedTimePerQuestionSec: timeSec,
          assignedQuestionCount: qCount,
          assignedMode: mode,
        },
      };
      students[existingIdx] = updated;
      this.saveStudents(students);
      ApiService.updateStudent(updated.id, updated).catch((e) =>
        console.warn("Server sync update failed:", e),
      );
      return updated;
    } else {
      const newId = `std_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newStudent: StudentAccount = {
        id: newId,
        username: student.username.trim().toLowerCase(),
        password: student.password || "password123",
        name: student.name.trim(),
        avatar,
        grade,
        classCode,
        createdAt: new Date().toISOString(),
        assignedMinTable: minTable,
        assignedMaxTable: maxTable,
        assignedCustomTables: student.assignedCustomTables,
        assignedTimePerQuestionSec: timeSec,
        assignedQuestionCount: qCount,
        assignedMode: mode,
        profile: {
          id: newId,
          username: student.username.trim().toLowerCase(),
          name: student.name.trim(),
          avatar,
          grade,
          classCode,
          totalXP: 0,
          level: 1,
          title: "Math Rookie",
          streakDays: 1,
          lastActiveDate: new Date().toISOString().split("T")[0],
          soundEnabled: true,
          unlockedBadges: [],
          starsCollected: 0,
          assignedMinTable: minTable,
          assignedMaxTable: maxTable,
          assignedCustomTables: student.assignedCustomTables,
          assignedTimePerQuestionSec: timeSec,
          assignedQuestionCount: qCount,
          assignedMode: mode,
          testsCompleted: 0,
          avgAccuracy: 0,
          avgSpeedSec: 0,
        },
      };
      students.push(newStudent);
      this.saveStudents(students);
      ApiService.createStudent(newStudent).catch((e) =>
        console.warn("Server sync create failed:", e),
      );
      return newStudent;
    }
  },

  deleteStudent(id: string): boolean {
    const students = this.getStudents();
    const filtered = students.filter((s) => s.id !== id);
    if (filtered.length !== students.length) {
      this.saveStudents(filtered);
      ApiService.deleteStudent(id).catch((e) =>
        console.warn("Server sync delete failed:", e),
      );
      return true;
    }
    return false;
  },

  // ==========================================
  // PROFILE & STATS ACCESSORS (Current Student)
  // ==========================================
  getProfile(): StudentProfile {
    const current = this.getCurrentStudent();
    return current.profile;
  },

  saveProfile(profile: StudentProfile) {
    const students = this.getStudents();
    const idx = students.findIndex((s) => s.id === profile.id);
    if (idx >= 0) {
      students[idx].profile = profile;
      students[idx].name = profile.name;
      students[idx].avatar = profile.avatar;
      students[idx].grade = profile.grade;
      students[idx].classCode = profile.classCode;
      students[idx].assignedMinTable = profile.assignedMinTable;
      students[idx].assignedMaxTable = profile.assignedMaxTable;
      students[idx].assignedTimePerQuestionSec =
        profile.assignedTimePerQuestionSec;
      students[idx].assignedQuestionCount = profile.assignedQuestionCount;
      students[idx].assignedMode = profile.assignedMode;
      this.saveStudents(students);
      // Keep authState name in sync if current student
      const auth = this.getAuthState();
      if (auth.currentStudentId === profile.id && auth.name !== profile.name) {
        auth.name = profile.name;
        this.saveAuthState(auth);
      }
      // Persist XP/profile changes to the server so background sync doesn't overwrite them
      ApiService.updateStudent(students[idx].id, students[idx]).catch((e) =>
        console.warn("Server profile sync failed:", e),
      );
    }
  },

  getStats(): StudentStats {
    const current = this.getCurrentStudent();
    const key = `math_masters_stats_${current.id}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }

    // Return template populated with student's test history
    const allAttempts = this.getAllAttempts().filter(
      (a) => a.studentId === current.id,
    );
    const stats: StudentStats = {
      ...INITIAL_STATS_TEMPLATE,
      totalQuestions:
        current.profile.testsCompleted * (current.assignedQuestionCount || 10),
      totalCorrect: Math.round(
        (current.profile.testsCompleted *
          (current.assignedQuestionCount || 10) *
          (current.profile.avgAccuracy || 90)) /
          100,
      ),
      dodgingAttempts: allAttempts,
    };
    return stats;
  },

  saveStats(stats: StudentStats) {
    const current = this.getCurrentStudent();
    const key = `math_masters_stats_${current.id}`;
    try {
      localStorage.setItem(key, JSON.stringify(stats));
    } catch (e) {
      console.warn("Could not save stats", e);
    }
  },

  // ==========================================
  // DODGING TEST ATTEMPTS & OFFLINE SYNC VAULT
  // ==========================================
  getAllAttempts(): DodgingTestAttempt[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  },

  saveAllAttempts(attempts: DodgingTestAttempt[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
    } catch (e) {
      console.warn("Could not save attempts", e);
    }
  },

  getOfflineQueue(): DodgingTestAttempt[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  },

  saveOfflineQueue(queue: DodgingTestAttempt[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.warn("Could not save offline queue", e);
    }
  },

  getPendingOfflineCount(): number {
    return this.getOfflineQueue().length;
  },

  /**
   * Records a completed dodging test attempt.
   * If online, marks isSynced=true and flushes to central database.
   * If offline, stores in offline queue and marks isSynced=false.
   */
  recordDodgingAttempt(attempt: DodgingTestAttempt): {
    attempt: DodgingTestAttempt;
    isSynced: boolean;
    pendingSyncCount: number;
    updatedProfile: StudentProfile;
    updatedStats: StudentStats;
    newBadgesUnlocked: AchievementBadge[];
  } {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    // Always start as unsynced until the server actually confirms receipt.
    attempt.isSynced = false;

    // Save into the local attempts ledger immediately.
    const attempts = this.getAllAttempts();
    const existingLocalIdx = attempts.findIndex((a) => a.id === attempt.id);
    const isNewLocalAttempt = existingLocalIdx === -1;

    if (isNewLocalAttempt) {
      attempts.unshift(attempt);
      this.saveAllAttempts(attempts);
    }

    // Always put the attempt into the pending queue first.
    // It will be removed only after the server confirms successful sync.
    const queue = this.getOfflineQueue();

    if (!queue.some((queued) => queued.id === attempt.id)) {
      queue.unshift(attempt);
      this.saveOfflineQueue(queue);
    }

    // If online, try to sync immediately.
    // IMPORTANT: isSynced becomes true only after server success.
    if (isOnline) {
      ApiService.submitAttempt(attempt)
        .then((result) => {
          if (result.success) {
            const currentAttempts = this.getAllAttempts();
            const localIndex = currentAttempts.findIndex(
              (a) => a.id === attempt.id,
            );

            if (localIndex >= 0) {
              currentAttempts[localIndex].isSynced = true;
              currentAttempts[localIndex].syncedAt = new Date().toISOString();
              this.saveAllAttempts(currentAttempts);
            }

            const currentQueue = this.getOfflineQueue().filter(
              (a) => a.id !== attempt.id,
            );
            this.saveOfflineQueue(currentQueue);

            if (result.student && result.student.profile) {
              this.saveProfile(result.student.profile);
            }
          } else {
            console.warn(
              "Server rejected attempt; keeping it in offline queue.",
            );
          }
        })
        .catch((e) => {
          console.warn(
            "Server attempt submit failed; keeping attempt queued:",
            e,
          );
        });
    }

    // Update Student Profile & Stats locally.
    const student =
      this.getStudentById(attempt.studentId) || this.getCurrentStudent();

    const profile = student.profile;
    const stats = this.getStats();
    const today = new Date().toISOString().split("T")[0];

    // Compute updated aggregates. Only add XP for official dodging tests.
    if (isNewLocalAttempt && !attempt.isPractice) {
      profile.totalXP += Number(attempt.xpGained) || 0;
    }

    const levelInfo = this.calculateLevel(profile.totalXP);
    profile.level = levelInfo.level;
    profile.title = levelInfo.title;

    // Daily streak check.
    if (profile.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0];

      if (profile.lastActiveDate === yesterday) {
        profile.streakDays += 1;
      } else {
        profile.streakDays = 1;
      }

      profile.lastActiveDate = today;
    }

    // Recalculate student averages.
    const studentAttempts = attempts.filter(
      (a) => a.studentId === student.id && !a.isPractice,
    );

    profile.testsCompleted = studentAttempts.length;

    if (studentAttempts.length > 0) {
      const totalAcc = studentAttempts.reduce(
        (acc, a) => acc + (Number(a.accuracy) || 0),
        0,
      );

      profile.avgAccuracy = Math.round(totalAcc / studentAttempts.length);

      const totalSpeed = studentAttempts.reduce(
        (acc, a) => acc + (Number(a.avgTimePerQuestionSec) || 0),
        0,
      );

      profile.avgSpeedSec = parseFloat(
        (totalSpeed / studentAttempts.length).toFixed(1),
      );
    } else {
      profile.avgAccuracy = 0;
      profile.avgSpeedSec = 0;
    }

    // Update Stats only for official dodging tests.
    if (!attempt.isPractice) {
      stats.totalQuestions += Number(attempt.totalQuestions) || 0;
      stats.totalCorrect += Number(attempt.correctQuestions) || 0;
      stats.totalTimeSec += Number(attempt.totalTimeSpentSec) || 0;
    }
    stats.dodgingAttempts = studentAttempts;

    // Update Table Mastery only for official dodging tests.
    if (!attempt.isPractice) {
      if (!stats.tableMastery) {
        stats.tableMastery = {};
      }

      if (Array.isArray(attempt.questionLogs)) {
        attempt.questionLogs.forEach((log) => {
          const t = log.tableNumber;

          if (!stats.tableMastery[t]) {
            stats.tableMastery[t] = {
              total: 0,
              correct: 0,
            };
          }

          stats.tableMastery[t].total += 1;

          if (log.isCorrect) {
            stats.tableMastery[t].correct += 1;
          }
        });
      }
    }

    // Re-evaluate competitive badges only from official dodging tests.
    const evaluated = attempt.isPractice
      ? this.evaluateCompetitiveBadges()
      : this.evaluateCompetitiveBadges();
    const currentStudentBadges = evaluated.filter((b) => b.unlocked);

    profile.unlockedBadges = currentStudentBadges.map((b) => b.id);

    // Save local state.
    this.saveProfile(profile);
    this.saveStats(stats);
    this.saveBadges(evaluated);

    return {
      attempt,
      isSynced: false,
      pendingSyncCount: this.getPendingOfflineCount(),
      updatedProfile: profile,
      updatedStats: stats,
      newBadgesUnlocked: currentStudentBadges,
    };
  },

  /**
   * Returns current local date formatted as YYYY-MM-DD
   */
  getTodayDateString(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  },

  /**
   * Check if a student has completed their official daily dodging test for today
   */
  hasCompletedDailyDodgingTest(studentId?: string): {
    completed: boolean;
    todayAttempt?: DodgingTestAttempt;
    hoursUntilMidnight: number;
  } {
    const auth = this.getAuthState();
    const targetStudentId = studentId || auth.currentStudentId || "std_alex";
    const attempts = this.getAllAttempts().filter(
      (a) => a.studentId === targetStudentId && !a.isPractice,
    );
    const todayStr = this.getTodayDateString();

    const todayAttempt = attempts.find((a) => {
      const attemptDate = new Date(a.timestamp);
      const year = attemptDate.getFullYear();
      const month = String(attemptDate.getMonth() + 1).padStart(2, "0");
      const day = String(attemptDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      return dateStr === todayStr;
    });

    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msLeft = midnight.getTime() - now.getTime();
    const hoursLeft = Math.max(0, Math.round(msLeft / (1000 * 60 * 60)));

    return {
      completed: !!todayAttempt,
      todayAttempt,
      hoursUntilMidnight: hoursLeft,
    };
  },

  /**
   * Determine if a student is permitted to take a daily dodging test
   * (Strict 1 test per day per student policy)
   */
  canTakeDailyDodgingTest(studentId?: string): {
    allowed: boolean;
    todayAttempt?: DodgingTestAttempt;
    reason?: string;
  } {
    const auth = this.getAuthState();
    if (auth.role === "admin") {
      return { allowed: true };
    }

    const { completed, todayAttempt } =
      this.hasCompletedDailyDodgingTest(studentId);
    if (completed && todayAttempt) {
      return {
        allowed: false,
        todayAttempt,
        reason:
          "Daily Dodging Test already completed for today! Each student is allowed 1 official test per day.",
      };
    }

    return { allowed: true };
  },

  /**
   * Comprehensive daily streak, practice quota progress & 7-day calendar history
   */
  getStudentStreakData(studentId?: string): StudentStreakData {
    const auth = this.getAuthState();
    const targetStudentId = studentId || auth.currentStudentId || "std_alex";
    const student =
      this.getStudentById(targetStudentId) || this.getCurrentStudent();
    const attempts = this.getAllAttempts().filter(
      (a) => a.studentId === targetStudentId && !a.isPractice,
    );
    const todayStr = this.getTodayDateString();

    // Map attempts by date
    const attemptsByDate: Record<string, DodgingTestAttempt[]> = {};
    attempts.forEach((a) => {
      const d = new Date(a.timestamp);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      if (!attemptsByDate[dateStr]) attemptsByDate[dateStr] = [];
      attemptsByDate[dateStr].push(a);
    });

    const todayAttempts = attemptsByDate[todayStr] || [];
    const isTodayQuotaCompleted = todayAttempts.length > 0;
    const todayQuestionsSolved = todayAttempts.reduce(
      (sum, a) => sum + (a.totalQuestions || 0),
      0,
    );
    const todayQuotaTarget = student.profile.assignedQuestionCount || 15;
    const todayQuotaProgressPct = isTodayQuotaCompleted
      ? 100
      : Math.min(
          100,
          Math.round((todayQuestionsSolved / todayQuotaTarget) * 100),
        );

    // Calculate 7-day sliding window (last 6 days + today)
    const weekCalendar: DayStreakItem[] = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - i);
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, "0");
      const day = String(targetDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      const dayAttempts = attemptsByDate[dateStr] || [];
      const isCompleted = dayAttempts.length > 0;
      const isToday = dateStr === todayStr;
      const isPast = dateStr < todayStr;
      const testsCompleted = dayAttempts.length;
      const totalQuestions = dayAttempts.reduce(
        (s, a) => s + (a.totalQuestions || 0),
        0,
      );
      const totalCorrect = dayAttempts.reduce(
        (s, a) => s + (a.correctQuestions || 0),
        0,
      );
      const accuracy =
        totalQuestions > 0
          ? Math.round((totalCorrect / totalQuestions) * 100)
          : 0;
      const xpEarned = dayAttempts.reduce((s, a) => s + (a.xpGained || 0), 0);

      weekCalendar.push({
        dateStr,
        dayName: dayNames[targetDate.getDay()],
        dayNumber: targetDate.getDate(),
        isToday,
        isPast,
        isCompleted,
        testsCompleted,
        totalQuestions,
        accuracy,
        xpEarned,
      });
    }

    // Determine current streak
    let streakDays = student.profile.streakDays || 0;

    // Determine streak tier
    let streakTier: "none" | "ember" | "blaze" | "inferno" | "phoenix" = "none";
    let streakTierLabel = "Ignite Your Flame";
    let streakTierEmoji = "🔥";
    let xpMultiplier = 1.0;

    if (streakDays >= 14) {
      streakTier = "phoenix";
      streakTierLabel = "Cosmic Phoenix Streak";
      streakTierEmoji = "🌟🔥";
      xpMultiplier = 1.5;
    } else if (streakDays >= 7) {
      streakTier = "inferno";
      streakTierLabel = "Inferno Master";
      streakTierEmoji = "⚡🔥";
      xpMultiplier = 1.35;
    } else if (streakDays >= 3) {
      streakTier = "blaze";
      streakTierLabel = "Blazing Flame";
      streakTierEmoji = "🔥🔥";
      xpMultiplier = 1.2;
    } else if (streakDays >= 1) {
      streakTier = "ember";
      streakTierLabel = "Ember Spark";
      streakTierEmoji = "🔥";
      xpMultiplier = 1.1;
    }

    const milestones = [3, 5, 7, 10, 14, 21, 30, 50, 100];
    const nextMilestoneDays =
      milestones.find((m) => m > streakDays) || streakDays + 5;
    const daysToNextMilestone = Math.max(1, nextMilestoneDays - streakDays);

    return {
      streakDays,
      maxStreak: Math.max(streakDays, student.profile.testsCompleted || 0),
      isTodayQuotaCompleted,
      todayQuestionsSolved,
      todayQuotaTarget,
      todayQuotaProgressPct,
      weekCalendar,
      streakTier,
      streakTierLabel,
      streakTierEmoji,
      xpMultiplier,
      todayAttempt: todayAttempts[0],
      nextMilestoneDays,
      daysToNextMilestone,
    };
  },

  /**
   * Reset today's daily test lock for a student (Teacher/Admin privilege)
   */
  resetStudentDailyTest(studentId: string): boolean {
    const attempts = this.getAllAttempts();
    const todayStr = this.getTodayDateString();

    const filtered = attempts.filter((a) => {
      if (a.studentId !== studentId) return true;
      const attemptDate = new Date(a.timestamp);
      const year = attemptDate.getFullYear();
      const month = String(attemptDate.getMonth() + 1).padStart(2, "0");
      const day = String(attemptDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      return dateStr !== todayStr;
    });

    this.saveAllAttempts(filtered);
    ApiService.resetStudentDailyTest(studentId).catch((e) =>
      console.warn("Server reset daily failed:", e),
    );
    return true;
  },

  /**
   * Pulls latest students, attempts, and data from the central server
   */
  async syncWithServer(): Promise<void> {
    try {
      const [serverStudents, serverAttempts, serverMistakes] =
        await Promise.all([
          ApiService.getStudents(),
          ApiService.getAttempts(),
          ApiService.getMistakes(),
        ]);

      if (Array.isArray(serverStudents) && serverStudents.length > 0) {
        const localStudents = this.getStudents();
        const auth = this.getAuthState();
        const mergedStudents = serverStudents.map((ss) => {
          const loc = localStudents.find(
            (l) =>
              l.id === ss.id ||
              l.username.toLowerCase() === ss.username.toLowerCase(),
          );
          // If the current logged-in student has an active name, do not let server overwrite it
          if (
            loc &&
            loc.id === auth.currentStudentId &&
            auth.name &&
            auth.name.trim().length > 0
          ) {
            return {
              ...ss,
              name: auth.name,
              profile: {
                ...ss.profile,
                name: auth.name,
              },
            };
          }
          return ss;
        });
        // Also preserve any local students that haven't synced to server yet
        for (const ls of localStudents) {
          if (
            !mergedStudents.some(
              (s) =>
                s.id === ls.id ||
                s.username.toLowerCase() === ls.username.toLowerCase(),
            )
          ) {
            mergedStudents.push(ls);
          }
        }
        this.saveStudents(mergedStudents);
      }
      if (Array.isArray(serverAttempts)) {
        this.saveAllAttempts(serverAttempts);
      }
      if (Array.isArray(serverMistakes)) {
        const localMistakes = this.getMistakes();
        const mergedMistakes = serverMistakes.map((sm) => {
          const loc = localMistakes.find(
            (l) =>
              l.id === sm.id ||
              (l.question?.text === sm.question?.text &&
                l.studentId === sm.studentId),
          );
          if (loc && loc.mastered) {
            return {
              ...sm,
              mastered: true,
              masteredAt: loc.masteredAt || new Date().toISOString(),
            };
          }
          return sm;
        });
        // Also keep any local mistakes that might not have reached server yet
        for (const lm of localMistakes) {
          if (
            !mergedMistakes.some(
              (m) =>
                m.id === lm.id ||
                (m.question?.text === lm.question?.text &&
                  m.studentId === lm.studentId),
            )
          ) {
            mergedMistakes.push(lm);
          }
        }
        this.saveMistakes(mergedMistakes, false);
      }
    } catch (err) {
      console.warn("Background sync with server failed:", err);
    }
  },

  /**
   * Flushes and synchronizes all offline test attempts when connection is restored
   */
  syncOfflineData(): { syncedCount: number; remainingCount: number } {
    const queue = this.getOfflineQueue();
    if (queue.length === 0) {
      return { syncedCount: 0, remainingCount: 0 };
    }

    const now = new Date().toISOString();
    const count = queue.length;

    queue.forEach((q) => {
      ApiService.submitAttempt(q)
        .then((result) => {
          if (result.success) {
            const attempts = this.getAllAttempts();
            const idx = attempts.findIndex((a) => a.id === q.id);
            if (idx >= 0) {
              attempts[idx].isSynced = true;
              attempts[idx].syncedAt = now;
              this.saveAllAttempts(attempts);
            }

            const currentQueue = this.getOfflineQueue().filter(
              (item) => item.id !== q.id,
            );
            this.saveOfflineQueue(currentQueue);

            if (result.student && result.student.profile) {
              this.saveProfile(result.student.profile);
            }
          }
        })
        .catch((e) => {
          console.warn("Server attempt submit failed for offline attempt:", e);
        });
    });

    return { syncedCount: count, remainingCount: 0 };
  },

  // ==========================================
  // MISTAKES & REVIEW SYSTEM
  // ==========================================
  getMistakes(): MistakeRecord[] {
    const auth = this.getAuthState();
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MISTAKES);
      if (saved) {
        const all: MistakeRecord[] = JSON.parse(saved);
        if (auth.currentStudentId) {
          return all.filter(
            (m) => !m.studentId || m.studentId === auth.currentStudentId,
          );
        }
        return all;
      }
    } catch {
      // fallback
    }
    return [];
  },

  saveMistakes(mistakes: MistakeRecord[], pushToServer = true) {
    try {
      localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(mistakes));
      // Attempt to push mistakes to server when online and requested
      if (pushToServer) {
        try {
          if (typeof navigator !== "undefined" && navigator.onLine) {
            ApiService.saveMistakes(mistakes).catch(() => {
              // Ignore network errors; local copy remains authoritative until sync
            });
          }
        } catch {
          // ignore
        }
      }
    } catch (e) {
      console.warn("Could not save mistakes", e);
    }
  },

  addMistake(question: Question, studentAnswer: string) {
    const auth = this.getAuthState();
    const mistakes = this.getMistakes();
    const existingIndex = mistakes.findIndex(
      (m) =>
        m.question.text === question.text &&
        (!m.studentId || m.studentId === auth.currentStudentId),
    );
    if (existingIndex >= 0) {
      mistakes[existingIndex].studentAnswer = studentAnswer;
      mistakes[existingIndex].timestamp = new Date().toISOString();
      mistakes[existingIndex].retryCount += 1;
      mistakes[existingIndex].mastered = false;
    } else {
      mistakes.unshift({
        id: `mistake_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        studentId: auth.currentStudentId || "std_alex",
        question,
        studentAnswer,
        timestamp: new Date().toISOString(),
        retryCount: 1,
        mastered: false,
      });
    }
    this.saveMistakes(mistakes.slice(0, 50));
  },

  markMistakeMastered(mistakeId: string) {
    const mistakes = this.getMistakes();
    const idx = mistakes.findIndex((m) => m.id === mistakeId);
    if (idx >= 0) {
      mistakes[idx].mastered = true;
      mistakes[idx].masteredAt = new Date().toISOString();
      this.saveMistakes(mistakes, true);
    }
  },

  // ==========================================
  // QUEST STAGES & BADGES
  // ==========================================
  getQuestStages(): QuestStage[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUEST_STAGES);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_QUEST_STAGES;
  },

  saveQuestStages(stages: QuestStage[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.QUEST_STAGES, JSON.stringify(stages));
    } catch (e) {
      console.warn("Could not save quest stages", e);
    }
  },

  // ==========================================
  // COMPETITIVE 10 RECORD BADGES EVALUATION
  // ==========================================
  evaluateCompetitiveBadges(): AchievementBadge[] {
    const students = this.getStudents();
    const attempts = this.getAllAttempts().filter((a) => !a.isPractice);
    const auth = this.getAuthState();
    const currentStudentId = auth.currentStudentId;

    const studentBadgeMap: Record<string, Set<string>> = {};
    students.forEach((s) => {
      studentBadgeMap[s.id] = new Set<string>();
    });

    const studentMetrics = students.map((s) => {
      const sAttempts = attempts.filter((a) => a.studentId === s.id);

      const validSpeedAttempts = sAttempts.filter(
        (a) => (a.accuracy || 0) >= 80 && (a.avgTimePerQuestionSec || 0) > 0,
      );
      const bestSpeed =
        validSpeedAttempts.length > 0
          ? Math.min(...validSpeedAttempts.map((a) => a.avgTimePerQuestionSec))
          : s.profile.avgSpeedSec > 0 && s.profile.testsCompleted > 0
            ? s.profile.avgSpeedSec
            : 999;

      const avgAccuracy =
        sAttempts.length > 0
          ? Math.round(
              sAttempts.reduce((sum, a) => sum + (a.accuracy || 0), 0) /
                sAttempts.length,
            )
          : s.profile.testsCompleted > 0
            ? s.profile.avgAccuracy || 0
            : 0;

      const bestScore =
        sAttempts.length > 0
          ? Math.max(...sAttempts.map((a) => a.score || 0))
          : 0;

      const validReactionAttempts = sAttempts.filter(
        (a) => (a.accuracy || 0) >= 70 && (a.avgTimePerQuestionSec || 0) > 0,
      );
      const minTestTime =
        validReactionAttempts.length > 0
          ? Math.min(...validReactionAttempts.map((a) => a.avgTimePerQuestionSec || 999))
          : 999;

      const streak = s.profile.streakDays || 0;
      const totalXP = s.profile.totalXP || 0;
      const perfectTests = sAttempts.filter(
        (a) => a.accuracy === 100 && (a.totalQuestions || 0) >= 5,
      ).length;
      const testsCount = Math.max(sAttempts.length, s.profile.testsCompleted || 0);

      const highAccAttempts = sAttempts.filter(
        (a) => (a.accuracy || 0) >= 90 && (a.totalTimeSpentSec || 0) > 0,
      );
      const bestTotalTime =
        highAccAttempts.length > 0
          ? Math.min(...highAccAttempts.map((a) => a.totalTimeSpentSec))
          : 9999;

      const totalCorrect =
        sAttempts.length > 0
          ? sAttempts.reduce((sum, a) => sum + (a.correctQuestions || 0), 0)
          : (s.profile.testsCompleted || 0) * 5;

      return {
        student: s,
        bestSpeed,
        avgAccuracy,
        bestScore,
        minTestTime,
        streak,
        totalXP,
        perfectTests,
        testsCount,
        bestTotalTime,
        totalCorrect,
      };
    });

    const evaluatedBadges: AchievementBadge[] = INITIAL_BADGES.map((badge) => {
      let holder: { student: StudentAccount; recordDisplay: string } | null =
        null;

      if (badge.id === "cheetah_speed") {
        const candidates = studentMetrics.filter((m) => m.bestSpeed < 900);
        if (candidates.length > 0) {
          candidates.sort((a, b) => a.bestSpeed - b.bestSpeed);
          holder = {
            student: candidates[0].student,
            recordDisplay: `${candidates[0].bestSpeed.toFixed(1)}s / question`,
          };
        }
      } else if (badge.id === "deadshot_accuracy") {
        const candidates = studentMetrics.filter((m) => m.avgAccuracy > 0);
        if (candidates.length > 0) {
          candidates.sort(
            (a, b) =>
              b.avgAccuracy - a.avgAccuracy || b.bestScore - a.bestScore,
          );
          holder = {
            student: candidates[0].student,
            recordDisplay: `${candidates[0].avgAccuracy}% Accuracy`,
          };
        }
      } else if (badge.id === "apex_score") {
        const candidates = studentMetrics.filter((m) => m.bestScore > 0);
        if (candidates.length > 0) {
          candidates.sort((a, b) => b.bestScore - a.bestScore);
          holder = {
            student: candidates[0].student,
            recordDisplay: `${candidates[0].bestScore} pts Record`,
          };
        }
      } else if (badge.id === "lightning_reaction") {
        const candidates = studentMetrics.filter((m) => m.minTestTime < 900);
        if (candidates.length > 0) {
          candidates.sort((a, b) => a.minTestTime - b.minTestTime);
          holder = {
            student: candidates[0].student,
            recordDisplay: `${candidates[0].minTestTime.toFixed(1)}s reaction`,
          };
        }
      } else if (badge.id === "streak_overlord") {
        const candidates = studentMetrics.filter((m) => m.streak > 0);
        if (candidates.length > 0) {
          candidates.sort((a, b) => b.streak - a.streak);
          holder = {
            student: candidates[0].student,
            recordDisplay: `${candidates[0].streak} Day Streak`,
          };
        }
      } else if (badge.id === "xp_titan") {
        const candidates = studentMetrics.filter((m) => m.totalXP > 0);
        if (candidates.length > 0) {
          candidates.sort((a, b) => b.totalXP - a.totalXP);
          holder = {
            student: candidates[0].student,
            recordDisplay: `${candidates[0].totalXP.toLocaleString()} XP`,
          };
        }
      } else if (badge.id === "iron_wall") {
        const candidates = studentMetrics.filter((m) => m.perfectTests > 0);
        if (candidates.length > 0) {
          candidates.sort((a, b) => b.perfectTests - a.perfectTests);
          holder = {
            student: candidates[0].student,
            recordDisplay: `${candidates[0].perfectTests} Flawless 10/10s`,
          };
        }
      } else if (badge.id === "dodging_warlord") {
        const candidates = studentMetrics.filter((m) => m.testsCount > 0);
        if (candidates.length > 0) {
          candidates.sort((a, b) => b.testsCount - a.testsCount);
          holder = {
            student: candidates[0].student,
            recordDisplay: `${candidates[0].testsCount} Tests Done`,
          };
        }
      } else if (badge.id === "supersonic_prodigy") {
        const candidates = studentMetrics.filter((m) => m.bestTotalTime < 9000);
        if (candidates.length > 0) {
          candidates.sort((a, b) => a.bestTotalTime - b.bestTotalTime);
          holder = {
            student: candidates[0].student,
            recordDisplay: `${candidates[0].bestTotalTime.toFixed(1)}s Total Duration`,
          };
        }
      } else if (badge.id === "the_centurion") {
        const candidates = studentMetrics.filter((m) => m.totalCorrect > 0);
        if (candidates.length > 0) {
          candidates.sort((a, b) => b.totalCorrect - a.totalCorrect);
          holder = {
            student: candidates[0].student,
            recordDisplay: `${candidates[0].totalCorrect} Problems Solved`,
          };
        }
      }

      if (holder) {
        studentBadgeMap[holder.student.id].add(badge.id);
        return {
          ...badge,
          currentHolderId: holder.student.id,
          currentHolderName: holder.student.name,
          currentHolderAvatar: holder.student.avatar,
          recordValueDisplay: holder.recordDisplay,
          unlocked: currentStudentId
            ? holder.student.id === currentStudentId
            : false,
        };
      }

      return {
        ...badge,
        currentHolderId: null,
        currentHolderName: "Unclaimed Record",
        currentHolderAvatar: "👑",
        recordValueDisplay: "Set first record!",
        unlocked: false,
      };
    });

    // Save assigned badges to student profiles
    students.forEach((s) => {
      s.profile.unlockedBadges = Array.from(studentBadgeMap[s.id] || []);
    });
    this.saveStudents(students);

    return evaluatedBadges;
  },

  getBadges(): AchievementBadge[] {
    return this.evaluateCompetitiveBadges();
  },

  getAllBadges(studentId?: string): AchievementBadge[] {
    const badges = this.evaluateCompetitiveBadges();
    if (!studentId) return badges;
    return badges.map((b) => ({
      ...b,
      unlocked: b.currentHolderId === studentId,
    }));
  },

  saveBadges(badges: AchievementBadge[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
    } catch (e) {
      console.warn("Could not save badges", e);
    }
  },

  // ==========================================
  // LEADERBOARD COMPUTATION ENGINE
  // ==========================================
  getLeaderboard(
    timeframe: "daily" | "weekly" | "all-time" | "all" = "all-time",
  ): LeaderboardEntry[] {
    const students = this.getStudents();
    const attempts = this.getAllAttempts();
    const currentStudent = this.getCurrentStudent();

    // Re-evaluate competitive record badges
    this.evaluateCompetitiveBadges();

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);

    // Compute leaderboard entries
    const entries: LeaderboardEntry[] = students.map((s) => {
      const studentAttempts = attempts.filter(
        (a) => a.studentId === s.id && !a.isPractice,
      );

      let timeframeAttempts = studentAttempts;
      if (timeframe === "daily") {
        timeframeAttempts = studentAttempts.filter((a) =>
          a.timestamp.startsWith(todayStr),
        );
      } else if (timeframe === "weekly") {
        timeframeAttempts = studentAttempts.filter(
          (a) => new Date(a.timestamp) >= sevenDaysAgo,
        );
      }

      const timeframeXP = timeframeAttempts.reduce(
        (acc, a) => acc + a.xpGained,
        0,
      );
      const totalScore =
        timeframe === "all-time" || timeframe === "all"
          ? s.profile.totalXP || 0
          : timeframeXP;

      const acc =
        timeframeAttempts.length > 0
          ? Math.round(
              timeframeAttempts.reduce((sum, a) => sum + (a.accuracy || 0), 0) /
                timeframeAttempts.length,
            )
          : s.profile.avgAccuracy || 90;

      const avgSpd =
        timeframeAttempts.length > 0
          ? parseFloat(
              (
                timeframeAttempts.reduce(
                  (sum, a) => sum + (a.avgTimePerQuestionSec || 0),
                  0,
                ) / timeframeAttempts.length
              ).toFixed(1),
            )
          : s.profile.avgSpeedSec || 4.5;

      const highestTestScore =
        timeframeAttempts.length > 0
          ? Math.max(...timeframeAttempts.map((a) => a.score || 0))
          : timeframe === "all-time" || timeframe === "all"
            ? studentAttempts.length > 0
              ? Math.max(...studentAttempts.map((a) => a.score || 0))
              : 0
            : 0;

      return {
        id: `lb_${s.id}`,
        studentId: s.id,
        username: s.username,
        name: s.name,
        avatar: s.avatar,
        grade: s.grade,
        classCode: s.classCode,
        totalXP: totalScore,
        blitzHighScore: highestTestScore,
        streakHighScore: s.profile.streakDays || 0,
        accuracy: acc,
        badgeCount: s.profile.unlockedBadges?.length || 0,
        unlockedBadgeIds: s.profile.unlockedBadges || [],
        testsCompleted: timeframeAttempts.length,
        avgSpeedSec: avgSpd,
        isCurrentUser: s.id === currentStudent.id,
      };
    });

    // Primary sort: Only score of student in the test determines position in progress board
    entries.sort((a, b) => {
      if (b.blitzHighScore !== a.blitzHighScore) {
        return b.blitzHighScore - a.blitzHighScore;
      }
      if (b.accuracy !== a.accuracy) {
        return b.accuracy - a.accuracy;
      }
      if (
        a.avgSpeedSec !== b.avgSpeedSec &&
        a.avgSpeedSec > 0 &&
        b.avgSpeedSec > 0
      ) {
        return a.avgSpeedSec - b.avgSpeedSec; // Faster reaction speed ranks higher
      }
      return b.totalXP - a.totalXP;
    });

    // Assign rank positions
    entries.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });

    return entries;
  },

  calculateLevel(xp: number): {
    level: number;
    title: string;
    nextLevelXP: number;
    progressPercent: number;
  } {
    const thresholds = [
      { lvl: 1, xp: 0, title: "Math Rookie" },
      { lvl: 2, xp: 100, title: "Number Scout" },
      { lvl: 3, xp: 250, title: "Equation Explorer" },
      { lvl: 4, xp: 500, title: "Arithmetic Knight" },
      { lvl: 5, xp: 900, title: "Fraction Wizard" },
      { lvl: 6, xp: 1400, title: "Algebra Specialist" },
      { lvl: 7, xp: 2000, title: "Geometry Titan" },
      { lvl: 8, xp: 2800, title: "Math Master" },
      { lvl: 9, xp: 3800, title: "Grandmaster Champion" },
      { lvl: 10, xp: 5000, title: "Legendary Math God" },
    ];

    let current = thresholds[0];
    let next = thresholds[1];

    for (let i = 0; i < thresholds.length; i++) {
      if (xp >= thresholds[i].xp) {
        current = thresholds[i];
        next = thresholds[i + 1] || {
          lvl: current.lvl + 1,
          xp: current.xp + 1500,
          title: "Ascended Master",
        };
      } else {
        break;
      }
    }

    const range = next.xp - current.xp;
    const progressXP = xp - current.xp;
    const progressPercent = Math.min(
      100,
      Math.max(0, Math.round((progressXP / range) * 100)),
    );

    return {
      level: current.lvl,
      title: current.title,
      nextLevelXP: next.xp,
      progressPercent,
    };
  },

  // ==========================================
  // BACKUP & DATABASE MANAGEMENT (Export / Import)
  // ==========================================
  exportDatabase(): string {
    const data = {
      version: "3.0",
      exportedAt: new Date().toISOString(),
      admin: (this.getAuthState() && this.getAuthState().username) || "admin",
      students: this.getStudents(),
      attempts: this.getAllAttempts(),
      mistakes: this.getMistakes(),
      badges: this.getBadges(),
      stages: this.getQuestStages(),
    };
    return JSON.stringify(data, null, 2);
  },

  importDatabase(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.students && Array.isArray(data.students)) {
        this.saveStudents(data.students);
      }
      if (data.attempts && Array.isArray(data.attempts)) {
        this.saveAllAttempts(data.attempts);
      }
      if (data.mistakes && Array.isArray(data.mistakes)) {
        this.saveMistakes(data.mistakes);
      }
      if (data.badges && Array.isArray(data.badges)) {
        this.saveBadges(data.badges);
      }
      if (data.stages && Array.isArray(data.stages)) {
        this.saveQuestStages(data.stages);
      }
      return true;
    } catch (e) {
      console.error("Import database failed", e);
      return false;
    }
  },

  resetAllDatabase() {
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
    localStorage.removeItem(STORAGE_KEYS.MISTAKES);
    localStorage.removeItem(STORAGE_KEYS.BADGES);
    localStorage.removeItem(STORAGE_KEYS.QUEST_STAGES);
    this.saveStudents(DEFAULT_STUDENTS);
  },
};
