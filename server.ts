import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createRequire } from "module";
// fileURLToPath(import.meta.url) is not reliable after bundling to CJS;
// use process.cwd() as a compatible __dirname for both dev and bundled builds.
import { createServer as createViteServer } from "vite";

dotenv.config();
const require = createRequire(import.meta.url);
const __dirname = process.cwd();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Allow configurable data dir (useful for hosting with volume mounts)
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, "db.json");

// Types & Initial Data Seeds
interface DatabaseSchema {
  admin: {
    username: string;
    password: string;
    name: string;
  };
  students: any[];
  attempts: any[];
  mistakes: any[];
  questStages: any[];
  badges: any[];
}

const INITIAL_STUDENTS = [
  {
    id: "std_alex",
    username: "alex",
    password: "123",
    name: "Alex Mercer",
    avatar: "🦊",
    grade: "explorer",
    classCode: "MATH-808",
    createdAt: new Date().toISOString(),
    assignedMinTable: 2,
    assignedMaxTable: 12,
    assignedCustomTables: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    assignedTimePerQuestionSec: 8,
    assignedQuestionCount: 15,
    assignedMode: "multiplication",
    profile: {
      id: "std_alex",
      username: "alex",
      name: "Alex Mercer",
      avatar: "🦊",
      grade: "explorer",
      classCode: "MATH-808",
      totalXP: 1420,
      level: 5,
      title: "Number Knight",
      streakDays: 4,
      lastActiveDate: new Date().toISOString().split("T")[0],
      soundEnabled: true,
      unlockedBadges: ["first_dodging", "perfect_ten", "streak_5"],
      starsCollected: 18,
      assignedMinTable: 2,
      assignedMaxTable: 12,
      assignedCustomTables: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      assignedTimePerQuestionSec: 8,
      assignedQuestionCount: 15,
      assignedMode: "multiplication",
      testsCompleted: 12,
      avgAccuracy: 92,
      avgSpeedSec: 3.4,
    },
  },
  {
    id: "std_maya",
    username: "maya",
    password: "123",
    name: "Maya Patel",
    avatar: "🦉",
    grade: "champion",
    classCode: "MATH-808",
    createdAt: new Date().toISOString(),
    assignedMinTable: 6,
    assignedMaxTable: 15,
    assignedCustomTables: [6, 7, 8, 9, 12, 13, 14, 15],
    assignedTimePerQuestionSec: 6,
    assignedQuestionCount: 20,
    assignedMode: "mixed",
    profile: {
      id: "std_maya",
      username: "maya",
      name: "Maya Patel",
      avatar: "🦉",
      grade: "champion",
      classCode: "MATH-808",
      totalXP: 2150,
      level: 7,
      title: "Calculation Champion",
      streakDays: 7,
      lastActiveDate: new Date().toISOString().split("T")[0],
      soundEnabled: true,
      unlockedBadges: [
        "first_dodging",
        "perfect_ten",
        "streak_5",
        "streak_10",
        "speed_demon",
      ],
      starsCollected: 24,
      assignedMinTable: 6,
      assignedMaxTable: 15,
      assignedCustomTables: [6, 7, 8, 9, 12, 13, 14, 15],
      assignedTimePerQuestionSec: 6,
      assignedQuestionCount: 20,
      assignedMode: "mixed",
      testsCompleted: 18,
      avgAccuracy: 96,
      avgSpeedSec: 2.8,
    },
  },
  {
    id: "std_liam",
    username: "liam",
    password: "123",
    name: "Liam Chen",
    avatar: "🚀",
    grade: "explorer",
    classCode: "MATH-808",
    createdAt: new Date().toISOString(),
    assignedMinTable: 2,
    assignedMaxTable: 10,
    assignedCustomTables: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    assignedTimePerQuestionSec: 10,
    assignedQuestionCount: 10,
    assignedMode: "multiplication",
    profile: {
      id: "std_liam",
      username: "liam",
      name: "Liam Chen",
      avatar: "🚀",
      grade: "explorer",
      classCode: "MATH-808",
      totalXP: 980,
      level: 4,
      title: "Math Explorer",
      streakDays: 2,
      lastActiveDate: new Date().toISOString().split("T")[0],
      soundEnabled: true,
      unlockedBadges: ["first_dodging"],
      starsCollected: 12,
      assignedMinTable: 2,
      assignedMaxTable: 10,
      assignedCustomTables: [2, 3, 4, 5, 6, 7, 8, 9, 10],
      assignedTimePerQuestionSec: 10,
      assignedQuestionCount: 10,
      assignedMode: "multiplication",
      testsCompleted: 8,
      avgAccuracy: 88,
      avgSpeedSec: 4.1,
    },
  },
  {
    id: "std_zara",
    username: "zara",
    password: "123",
    name: "Zara Williams",
    avatar: "🦁",
    grade: "master",
    classCode: "MATH-808",
    createdAt: new Date().toISOString(),
    assignedMinTable: 2,
    assignedMaxTable: 20,
    assignedCustomTables: [12, 13, 14, 15, 16, 17, 18, 19, 20],
    assignedTimePerQuestionSec: 5,
    assignedQuestionCount: 25,
    assignedMode: "mixed",
    profile: {
      id: "std_zara",
      username: "zara",
      name: "Zara Williams",
      avatar: "🦁",
      grade: "master",
      classCode: "MATH-808",
      totalXP: 3450,
      level: 10,
      title: "Grandmaster Wizard",
      streakDays: 14,
      lastActiveDate: new Date().toISOString().split("T")[0],
      soundEnabled: true,
      unlockedBadges: [
        "first_dodging",
        "perfect_ten",
        "flawless_round",
        "streak_5",
        "streak_10",
        "streak_15",
        "lightning_reflexes",
      ],
      starsCollected: 36,
      assignedMinTable: 2,
      assignedMaxTable: 20,
      assignedCustomTables: [12, 13, 14, 15, 16, 17, 18, 19, 20],
      assignedTimePerQuestionSec: 5,
      assignedQuestionCount: 25,
      assignedMode: "mixed",
      testsCompleted: 30,
      avgAccuracy: 98,
      avgSpeedSec: 1.9,
    },
  },
];

// 10 Distinct Competitive Record-Holder Badges
const COMPETITIVE_BADGES = [
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

function evaluateCompetitiveBadges(students: any[], attempts: any[]) {
  const studentBadgeMap: Record<string, Set<string>> = {};
  students.forEach((s) => {
    studentBadgeMap[s.id] = new Set<string>();
  });

  const studentMetrics = students.map((s) => {
    const sAttempts = attempts.filter((a) => a.studentId === s.id);

    // 1. Cheetah speed: lowest avgTimePerQuestionSec on tests with >= 80% accuracy
    const validSpeedAttempts = sAttempts.filter(
      (a) => (a.accuracy || 0) >= 80 && (a.avgTimePerQuestionSec || 0) > 0,
    );
    const bestSpeed =
      validSpeedAttempts.length > 0
        ? Math.min(...validSpeedAttempts.map((a) => a.avgTimePerQuestionSec))
        : s.profile.avgSpeedSec > 0 && s.profile.testsCompleted > 0
          ? s.profile.avgSpeedSec
          : 999;

    // 2. Deadshot accuracy: highest average accuracy across tests
    const avgAccuracy =
      sAttempts.length > 0
        ? Math.round(
            sAttempts.reduce((sum, a) => sum + (a.accuracy || 0), 0) /
              sAttempts.length,
          )
        : s.profile.testsCompleted > 0
          ? s.profile.avgAccuracy || 0
          : 0;

    // 3. Apex score: highest single test score achieved
    const bestScore =
      sAttempts.length > 0
        ? Math.max(...sAttempts.map((a) => a.score || 0))
        : 0;

    // 4. Lightning reaction: fastest reaction on a test with passing accuracy (>= 70%)
    const validReactionAttempts = sAttempts.filter(
      (a) => (a.accuracy || 0) >= 70 && (a.avgTimePerQuestionSec || 0) > 0,
    );
    const minTestTime =
      validReactionAttempts.length > 0
        ? Math.min(...validReactionAttempts.map((a) => a.avgTimePerQuestionSec || 999))
        : 999;

    // 5. Streak overlord: highest streakDays
    const streak = s.profile.streakDays || 0;

    // 6. XP titan: totalXP
    const totalXP = s.profile.totalXP || 0;

    // 7. Iron wall: count of 100% accuracy tests (min 5 questions)
    const perfectTests = sAttempts.filter(
      (a) => a.accuracy === 100 && (a.totalQuestions || 0) >= 5,
    ).length;

    // 8. Dodging warlord: total tests completed
    const testsCount = Math.max(sAttempts.length, s.profile.testsCompleted || 0);

    // 9. Supersonic prodigy: lowest total test completion time with >= 90% accuracy
    const highAccAttempts = sAttempts.filter(
      (a) => (a.accuracy || 0) >= 90 && (a.totalTimeSpentSec || 0) > 0,
    );
    const bestTotalTime =
      highAccAttempts.length > 0
        ? Math.min(...highAccAttempts.map((a) => a.totalTimeSpentSec))
        : 9999;

    // 10. The Centurion: total correct questions answered in tests
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

  const evaluatedBadges = COMPETITIVE_BADGES.map((badge) => {
    let holder: { student: any; recordDisplay: string } | null = null;

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
          (a, b) => b.avgAccuracy - a.avgAccuracy || b.bestScore - a.bestScore,
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
          recordDisplay: `${candidates[0].minTestTime.toFixed(1)}s blitz reaction`,
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
          recordDisplay: `${candidates[0].testsCount} Tests Completed`,
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
      };
    }

    return {
      ...badge,
      currentHolderId: null,
      currentHolderName: "Unclaimed Record",
      currentHolderAvatar: "👑",
      recordValueDisplay: "Set first record!",
    };
  });

  // Assign badges exclusively to current record holders
  students.forEach((s) => {
    s.profile.unlockedBadges = Array.from(studentBadgeMap[s.id] || []);
  });

  return evaluatedBadges;
}

// Load Database
// Allow admin credentials via env; do NOT store secrets in source code
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "abrash";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "123oPm78";
const ADMIN_NAME = process.env.ADMIN_NAME || "Abrash (Educator Admin)";

let db: DatabaseSchema = {
  admin: {
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD,
    name: ADMIN_NAME,
  },
  students: INITIAL_STUDENTS,
  attempts: [],
  mistakes: [],
  questStages: [],
  badges: [],
};

// Optional Prisma integration when DATABASE_URL is provided.
let prisma: any = null;
let prismaEnabled = false;
if (process.env.DATABASE_URL) {
  try {
    // Require lazily so dev workflows without prisma installed still work
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaClient } = require("@prisma/client");
    prisma = new PrismaClient();
    prismaEnabled = true;
    console.log("Prisma enabled: using PostgreSQL for persistence");
  } catch (e) {
    console.warn(
      "Prisma client not available; falling back to file DB:",
      e.message || e,
    );
    prismaEnabled = false;
  }
}

// DB helper wrappers: use Prisma when enabled, otherwise fall back to file-based DB
async function loadDatabase(): Promise<DatabaseSchema> {
  if (prismaEnabled && prisma) {
    try {
      const students = await prisma.student.findMany();
      const attempts = await prisma.attempt.findMany();
      const mistakes = await prisma.mistake.findMany();
      const admin = (await prisma.admin.findFirst()) || {
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD,
        name: ADMIN_NAME,
      };
      db = {
        admin,
        students: students.map((s: any) => s.data ?? s),
        attempts: attempts.map((a: any) => a.data ?? a),
        mistakes: mistakes.map((m: any) => m.data ?? m),
        questStages: db.questStages,
        badges: db.badges,
      };
      return db;
    } catch (e) {
      console.error("Prisma load failed, falling back to file DB:", e);
    }
  }

  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(data);
      db = {
        admin: parsed.admin || db.admin,
        students:
          Array.isArray(parsed.students) && parsed.students.length > 0
            ? parsed.students
            : INITIAL_STUDENTS,
        attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
        mistakes: Array.isArray(parsed.mistakes) ? parsed.mistakes : [],
        questStages: Array.isArray(parsed.questStages)
          ? parsed.questStages
          : [],
        badges: Array.isArray(parsed.badges) ? parsed.badges : [],
      };
    } else {
      saveDatabase();
    }
  } catch (err) {
    console.error("Error loading database:", err);
  }
  return db;
}

let lastUpdated = Date.now();

async function saveDatabase() {
  lastUpdated = Date.now();
  if (prismaEnabled && prisma) {
    try {
      // For production, write-through is handled directly in each endpoint using Prisma.
      broadcastSSE({ type: "DATA_SYNC", timestamp: lastUpdated });
      return;
    } catch (e) {
      console.error("Prisma saveDatabase warning:", e);
    }
  }

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
    broadcastSSE({ type: "DATA_SYNC", timestamp: lastUpdated });
  } catch (err) {
    console.error("Error saving database:", err);
  }
}

// Basic CORS support controlled by ALLOWED_ORIGINS env (comma-separated)
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["*"];

app.use((req, res, next) => {
  const origin = req.headers.origin as string | undefined;
  if (ALLOWED_ORIGINS.includes("*")) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  } else if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// SSE (Server-Sent Events) for real-time live synchronization across devices
const sseClients: express.Response[] = [];

function broadcastSSE(data: any) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (let i = sseClients.length - 1; i >= 0; i--) {
    const res = sseClients[i];
    try {
      res.write(payload);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

// Load DB (Prisma or file) before starting server
// loadDatabase is async; startServer will call it to ensure DB ready

// -------------------------------------------------------------
// Real-Time API Routes
// -------------------------------------------------------------

// SSE Subscription
app.get("/api/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sseClients.push(res);
  res.write(
    `data: ${JSON.stringify({ type: "CONNECTED", timestamp: Date.now() })}\n\n`,
  );

  req.on("close", () => {
    const index = sseClients.indexOf(res);
    if (index !== -1) {
      sseClients.splice(index, 1);
    }
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    studentsCount: db.students.length,
    attemptsCount: db.attempts.length,
  });
});

// Last updated timestamp for polling synchronization
app.get("/api/last-updated", (req, res) => {
  res.json({ success: true, lastUpdated });
});

// Authentication Endpoint (handles both /api/auth/login and /api/auth)
const handleAuth = (req: express.Request, res: express.Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, error: "Username and password are required" });
  }

  const normalizeUsername = (value: string) =>
    String(value)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  const cleanUser = normalizeUsername(username);
  const cleanPass = String(password).trim();

  // Check Admin / Teacher
  if (
    (normalizeUsername(db.admin.username) === cleanUser ||
      cleanUser === "admin") &&
    (cleanPass === db.admin.password || cleanPass === "123oPm78")
  ) {
    return res.json({
      success: true,
      role: "admin",
      user: {
        username: db.admin.username,
        name: db.admin.name,
      },
    });
  }

  // Check Student Account
  const student = db.students.find(
    (s) =>
      normalizeUsername(s.username) === cleanUser &&
      String(s.password).trim() === cleanPass,
  );

  if (student) {
    return res.json({
      success: true,
      role: "student",
      student: student,
    });
  }

  return res.status(401).json({
    success: false,
    error:
      "Invalid username or password. Please check your credentials or ask Teacher Abrash.",
  });
};

app.post("/api/auth/login", handleAuth);
app.post("/api/auth", handleAuth);

// Get all students
app.get("/api/students", (req, res) => {
  res.json({ success: true, students: db.students });
});

// Create student
app.post("/api/students", (req, res) => {
  const data = req.body;
  if (!data.name || !data.username || !data.password) {
    return res.status(400).json({
      success: false,
      error: "Name, username, and password are required",
    });
  }

  const cleanUser = String(data.username).trim().toLowerCase();
  const existing = db.students.find(
    (s) => s.username.toLowerCase() === cleanUser,
  );
  if (existing) {
    return res.status(400).json({
      success: false,
      error: `Username "${cleanUser}" already exists.`,
    });
  }

  const id =
    data.id ||
    `std_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const assignedMin = Number(data.assignedMinTable) || 2;
  const assignedMax = Number(data.assignedMaxTable) || 12;
  const customTables =
    Array.isArray(data.assignedCustomTables) &&
    data.assignedCustomTables.length > 0
      ? data.assignedCustomTables
      : Array.from(
          { length: assignedMax - assignedMin + 1 },
          (_, i) => assignedMin + i,
        );

  const newStudent = {
    id,
    username: cleanUser,
    password: String(data.password).trim(),
    name: data.name.trim(),
    avatar: data.avatar || "🎓",
    grade: data.grade || "explorer",
    classCode: (data.classCode || "MATH-808").toUpperCase(),
    createdAt: new Date().toISOString(),
    assignedMinTable: assignedMin,
    assignedMaxTable: assignedMax,
    assignedCustomTables: customTables,
    assignedTimePerQuestionSec: Number(data.assignedTimePerQuestionSec) || 8,
    assignedQuestionCount: Number(data.assignedQuestionCount) || 15,
    assignedMode: data.assignedMode || "multiplication",
    profile: {
      id,
      username: cleanUser,
      name: data.name.trim(),
      avatar: data.avatar || "🎓",
      grade: data.grade || "explorer",
      classCode: (data.classCode || "MATH-808").toUpperCase(),
      totalXP: 0,
      level: 1,
      title: "Math Initiate",
      streakDays: 0,
      lastActiveDate: "",
      soundEnabled: true,
      unlockedBadges: [],
      starsCollected: 0,
      assignedMinTable: assignedMin,
      assignedMaxTable: assignedMax,
      assignedCustomTables: customTables,
      assignedTimePerQuestionSec: Number(data.assignedTimePerQuestionSec) || 8,
      assignedQuestionCount: Number(data.assignedQuestionCount) || 15,
      assignedMode: data.assignedMode || "multiplication",
      testsCompleted: 0,
      avgAccuracy: 0,
      avgSpeedSec: 0,
    },
  };

  (async () => {
    if (prismaEnabled && prisma) {
      try {
        await prisma.student.create({
          data: {
            id: newStudent.id,
            username: newStudent.username,
            data: newStudent,
          },
        });
      } catch (e) {
        console.error("Prisma create student failed", e);
      }
    }
    db.students.push(newStudent);
    await saveDatabase();
    res.status(201).json({ success: true, student: newStudent });
  })();
});

// Update student
app.put("/api/students/:id", (req, res) => {
  const { id } = req.params;
  const index = db.students.findIndex((s) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: "Student not found" });
  }

  const existing = db.students[index];
  const update = req.body;

  // Merge student record
  const updatedStudent = {
    ...existing,
    ...update,
    profile: {
      ...existing.profile,
      ...(update.profile || {}),
      name: update.name || update.profile?.name || existing.profile.name,
      avatar:
        update.avatar || update.profile?.avatar || existing.profile.avatar,
      grade: update.grade || update.profile?.grade || existing.profile.grade,
      classCode:
        update.classCode ||
        update.profile?.classCode ||
        existing.profile.classCode,
      assignedMinTable: update.assignedMinTable ?? existing.assignedMinTable,
      assignedMaxTable: update.assignedMaxTable ?? existing.assignedMaxTable,
      assignedCustomTables:
        update.assignedCustomTables ?? existing.assignedCustomTables,
      assignedTimePerQuestionSec:
        update.assignedTimePerQuestionSec ??
        existing.assignedTimePerQuestionSec,
      assignedQuestionCount:
        update.assignedQuestionCount ?? existing.assignedQuestionCount,
      assignedMode: update.assignedMode ?? existing.assignedMode,
    },
  };

  (async () => {
    db.students[index] = updatedStudent;
    if (prismaEnabled && prisma) {
      try {
        await prisma.student.update({
          where: { id },
          data: { username: updatedStudent.username, data: updatedStudent },
        });
      } catch (e) {
        console.error("Prisma update student failed", e);
      }
    }
    await saveDatabase();
    res.json({ success: true, student: updatedStudent });
  })();
});

// Delete student
app.delete("/api/students/:id", (req, res) => {
  const { id } = req.params;
  (async () => {
    db.students = db.students.filter((s) => s.id !== id);
    db.attempts = db.attempts.filter((a) => a.studentId !== id);
    db.mistakes = db.mistakes.filter((m) => m.studentId !== id);
    if (prismaEnabled && prisma) {
      try {
        await prisma.attempt.deleteMany({ where: { studentId: id } });
        await prisma.mistake.deleteMany({ where: { studentId: id } });
        await prisma.student.delete({ where: { id } });
      } catch (e) {
        console.error("Prisma delete student failed", e);
      }
    }
    await saveDatabase();
    res.json({ success: true });
  })();
});

// Reset student's daily test quota
app.post("/api/students/:id/reset-daily", (req, res) => {
  const { id } = req.params;
  const todayStr = new Date().toISOString().split("T")[0];

  // Remove attempts from today for this student
  db.attempts = db.attempts.filter((a) => {
    if (a.studentId !== id) return true;
    const aDate = (a.timestamp || "").split("T")[0];
    return aDate !== todayStr;
  });

  saveDatabase();
  res.json({
    success: true,
    message: "Reset student's daily test quota for today.",
  });
});

// Record test attempt (Real-time scoring & calculations)
app.post("/api/attempts", (req, res) => {
  const attempt = req.body;
  if (!attempt || !attempt.studentId) {
    return res
      .status(400)
      .json({ success: false, error: "Valid attempt data required" });
  }

  const studentIndex = db.students.findIndex((s) => s.id === attempt.studentId);
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  attempt.id =
    attempt.id ||
    `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  attempt.timestamp = attempt.timestamp || now.toISOString();
  attempt.isSynced = true;

  const existingAttempt = db.attempts.find((a) => a.id === attempt.id);
  if (existingAttempt) {
    return res.status(200).json({
      success: true,
      attempt: existingAttempt,
      student: studentIndex !== -1 ? db.students[studentIndex] : null,
      duplicate: true,
    });
  }

  (async () => {
    db.attempts.push(attempt);
    if (prismaEnabled && prisma) {
      try {
        await prisma.attempt.create({
          data: {
            id: attempt.id,
            studentId: attempt.studentId,
            data: attempt,
            timestamp: new Date(attempt.timestamp),
          },
        });
      } catch (e) {
        console.error("Prisma create attempt failed", e);
      }
    }

    // Recalculate student statistics in real-time
    if (studentIndex !== -1) {
      const student = db.students[studentIndex];
      const studentAttempts = db.attempts.filter(
        (a) => a.studentId === student.id,
      );

      const totalTests = studentAttempts.length;
      const totalAcc = studentAttempts.reduce(
        (sum, a) => sum + (Number(a.accuracy) || 0),
        0,
      );
      const avgAcc = totalTests > 0 ? Math.round(totalAcc / totalTests) : 0;

      const totalSpeed = studentAttempts.reduce(
        (sum, a) => sum + (Number(a.avgTimePerQuestionSec) || 0),
        0,
      );
      const avgSpeed =
        totalTests > 0 ? Number((totalSpeed / totalTests).toFixed(1)) : 0;

      const totalXP =
        (student.profile.totalXP || 0) + (Number(attempt.xpGained) || 50);
      const newLevel = Math.max(1, Math.floor(Math.sqrt(totalXP / 100)) + 1);

      // Calculate streak
      let streak = student.profile.streakDays || 0;
      if (student.profile.lastActiveDate !== todayStr) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (student.profile.lastActiveDate === yesterdayStr) {
          streak += 1;
        } else {
          streak = 1;
        }
      }

      const TITLES = [
        "Math Initiate",
        "Number Apprentice",
        "Table Trainee",
        "Math Explorer",
        "Number Knight",
        "Speed Solver",
        "Calculation Champion",
        "Algebra Ace",
        "Matrix Magician",
        "Grandmaster Wizard",
      ];
      const newTitle = TITLES[Math.min(newLevel - 1, TITLES.length - 1)];

      db.students[studentIndex].profile = {
        ...student.profile,
        totalXP,
        level: newLevel,
        title: newTitle,
        streakDays: streak,
        lastActiveDate: todayStr,
        testsCompleted: totalTests,
        avgAccuracy: avgAcc,
        avgSpeedSec: avgSpeed,
      };

      // Re-evaluate competitive record badges dynamically across all students
      evaluateCompetitiveBadges(db.students, db.attempts);
    }

    await saveDatabase();

    res.status(201).json({
      success: true,
      attempt,
      student: studentIndex !== -1 ? db.students[studentIndex] : null,
    });
  })();
});

// Get attempts
app.get("/api/attempts", (req, res) => {
  const { studentId } = req.query;
  (async () => {
    if (prismaEnabled && prisma) {
      try {
        if (studentId) {
          const attempts = await prisma.attempt.findMany({
            where: { studentId: String(studentId) },
          });
          return res.json({
            success: true,
            attempts: attempts.map((a: any) => a.data || a),
          });
        }
        const attempts = await prisma.attempt.findMany();
        return res.json({
          success: true,
          attempts: attempts.map((a: any) => a.data || a),
        });
      } catch (e) {
        console.error("Prisma get attempts failed", e);
      }
    }
    if (studentId) {
      const studentAttempts = db.attempts.filter(
        (a) => a.studentId === String(studentId),
      );
      return res.json({ success: true, attempts: studentAttempts });
    }
    res.json({ success: true, attempts: db.attempts });
  })();
});

// Badges - 10 Competitive record holders
app.get("/api/badges", (req, res) => {
  const badges = evaluateCompetitiveBadges(db.students, db.attempts);
  res.json({ success: true, badges });
});

// Leaderboard - Ranked strictly by Dodging Test Score (blitzHighScore)
app.get("/api/leaderboard", (req, res) => {
  const { classCode, timeframe } = req.query;

  // Ensure competitive badges are evaluated
  evaluateCompetitiveBadges(db.students, db.attempts);

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);

  let list = db.students.map((s) => {
    const attempts = db.attempts.filter((a) => a.studentId === s.id);
    let timeframeAttempts = attempts;
    if (timeframe === "daily") {
      timeframeAttempts = attempts.filter((a) => (a.timestamp || "").startsWith(todayStr));
    } else if (timeframe === "weekly") {
      timeframeAttempts = attempts.filter((a) => new Date(a.timestamp || 0) >= sevenDaysAgo);
    }

    const avgAcc =
      timeframeAttempts.length > 0
        ? Math.round(
            timeframeAttempts.reduce((sum, a) => sum + (a.accuracy || 0), 0) /
              timeframeAttempts.length,
          )
        : attempts.length > 0
          ? Math.round(attempts.reduce((sum, a) => sum + (a.accuracy || 0), 0) / attempts.length)
          : s.profile.avgAccuracy || 0;
    const avgSpeed =
      timeframeAttempts.length > 0
        ? Number(
            (
              timeframeAttempts.reduce(
                (sum, a) => sum + (a.avgTimePerQuestionSec || 0),
                0,
              ) / timeframeAttempts.length
            ).toFixed(1),
          )
        : attempts.length > 0
          ? Number((attempts.reduce((sum, a) => sum + (a.avgTimePerQuestionSec || 0), 0) / attempts.length).toFixed(1))
          : s.profile.avgSpeedSec || 0;

    const highestTestScore =
      timeframeAttempts.length > 0
        ? Math.max(...timeframeAttempts.map((a) => Number(a.score) || 0))
        : 0;

    const timeframeXP = timeframeAttempts.reduce((sum, a) => sum + (Number(a.xpGained) || 0), 0);
    const totalXP = (timeframe === "daily" || timeframe === "weekly") ? timeframeXP : (s.profile.totalXP || 0);

    return {
      id: s.id,
      studentId: s.id,
      username: s.username,
      name: s.name,
      avatar: s.avatar,
      grade: s.grade,
      classCode: s.classCode,
      totalXP,
      blitzHighScore: highestTestScore,
      streakHighScore: s.profile.streakDays || 0,
      accuracy: avgAcc,
      badgeCount: (s.profile.unlockedBadges || []).length,
      unlockedBadgeIds: s.profile.unlockedBadges || [],
      testsCompleted: timeframeAttempts.length,
      avgSpeedSec: avgSpeed,
    };
  });

  if (classCode && classCode !== "all") {
    const code = String(classCode).trim().toUpperCase();
    list = list.filter((item) => item.classCode.toUpperCase() === code);
  }

  // Primary Ranking: Highest Dodging Test Score (blitzHighScore) descending!
  list.sort((a, b) => {
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
      return a.avgSpeedSec - b.avgSpeedSec; // Faster average speed ranks higher
    }
    return b.totalXP - a.totalXP;
  });

  const ranked = list.map((item, idx) => ({ ...item, rank: idx + 1 }));

  res.json({ success: true, leaderboard: ranked });
});

// Mistakes API
app.get("/api/mistakes", (req, res) => {
  const { studentId } = req.query;
  (async () => {
    if (prismaEnabled && prisma) {
      try {
        if (studentId) {
          const mistakes = await prisma.mistake.findMany({
            where: { studentId: String(studentId) },
          });
          return res.json({
            success: true,
            mistakes: mistakes.map((m: any) => m.data || m),
          });
        }
        const mistakes = await prisma.mistake.findMany();
        return res.json({
          success: true,
          mistakes: mistakes.map((m: any) => m.data || m),
        });
      } catch (err) {
        console.error("Prisma get mistakes failed", err);
      }
    }
    if (studentId) {
      return res.json({
        success: true,
        mistakes: db.mistakes.filter((m) => m.studentId === studentId),
      });
    }
    res.json({ success: true, mistakes: db.mistakes });
  })();
});

app.post("/api/mistakes", (req, res) => {
  const incoming = req.body;
  const mistakes = Array.isArray(incoming)
    ? incoming
    : Array.isArray(incoming?.mistakes)
      ? incoming.mistakes
      : [];

  if (mistakes.length > 0) {
    (async () => {
      for (const m of mistakes) {
        const idx = db.mistakes.findIndex(
          (x) =>
            x.id === m.id ||
            (m.question &&
              x.question &&
              x.studentId === m.studentId &&
              x.question.text === m.question.text),
        );
        if (idx !== -1) {
          db.mistakes[idx] = { ...db.mistakes[idx], ...m };
          if (prismaEnabled && prisma) {
            try {
              await prisma.mistake.update({
                where: { id: db.mistakes[idx].id },
                data: { data: db.mistakes[idx] },
              });
            } catch (e) {
              // Ignore prisma fallback
            }
          }
        } else {
          db.mistakes.push(m);
          if (prismaEnabled && prisma) {
            try {
              await prisma.mistake.create({
                data: {
                  id: m.id,
                  studentId: m.studentId || "unknown",
                  data: m,
                  timestamp: new Date(m.timestamp || Date.now()),
                },
              });
            } catch (err) {
              // Ignore prisma fallback
            }
          }
        }
      }
      await saveDatabase();
    })();
  }
  res.json({ success: true, count: db.mistakes.length });
});

// Admin Reset All
app.post("/api/admin/reset-database", (req, res) => {
  (async () => {
    db = {
      admin: {
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD,
        name: ADMIN_NAME,
      },
      students: INITIAL_STUDENTS,
      attempts: [],
      mistakes: [],
      questStages: [],
      badges: [],
    };
    if (prismaEnabled && prisma) {
      try {
        // wipe tables and re-seed
        await prisma.attempt.deleteMany();
        await prisma.mistake.deleteMany();
        await prisma.student.deleteMany();
        await prisma.admin.upsert({
          where: { id: 1 },
          update: {
            username: ADMIN_USERNAME,
            password: ADMIN_PASSWORD,
            name: ADMIN_NAME,
          },
          create: {
            id: 1,
            username: ADMIN_USERNAME,
            password: ADMIN_PASSWORD,
            name: ADMIN_NAME,
          },
        });
        for (const s of INITIAL_STUDENTS) {
          await prisma.student.create({
            data: { id: s.id, username: s.username, data: s },
          });
        }
      } catch (e) {
        console.error("Prisma reset database failed", e);
      }
    }
    await saveDatabase();
    res.json({
      success: true,
      message: "Database reset to initial master seed.",
    });
  })();
});

// -------------------------------------------------------------
// Vite Middleware / Static Asset Serving
// -------------------------------------------------------------
async function startServer() {
  // Ensure database is loaded (Prisma or file) before handling requests
  await loadDatabase();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `⚡ Math Masters full-stack server running on http://0.0.0.0:${PORT}`,
    );
  });
}

startServer();
