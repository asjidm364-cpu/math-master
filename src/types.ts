export type MathOperation =
  | "multiplication"
  | "division"
  | "missing_factor"
  | "mixed"
  | "addition"
  | "subtraction"
  | "fractions"
  | "algebra"
  | "geometry";

export type DifficultyGrade = "rookie" | "explorer" | "champion" | "master";

export type GameMode =
  | "blitz"
  | "quest"
  | "streak"
  | "daily"
  | "custom"
  | "dodging_test";

export interface Question {
  id: string;
  operation: MathOperation;
  difficulty: DifficultyGrade;
  text: string;
  promptLatex?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  hint: string;
  tableNumber?: number; // e.g. 7 for 7 x 8
  multiplier?: number; // e.g. 8
  diagramType?: "triangle" | "rectangle" | "circle" | "fraction_pie";
  diagramProps?: Record<string, number | string>;
}

export interface StudentProfile {
  id: string;
  username: string;
  name: string;
  avatar: string;
  grade: DifficultyGrade;
  classCode: string;
  totalXP: number;
  level: number;
  title: string;
  streakDays: number;
  lastActiveDate: string;
  soundEnabled: boolean;
  unlockedBadges: string[];
  starsCollected: number;
  // Dodging table configurations assigned by Admin
  assignedMinTable: number;
  assignedMaxTable: number;
  assignedCustomTables?: number[];
  assignedTimePerQuestionSec: number;
  assignedQuestionCount: number;
  assignedMode: "multiplication" | "division" | "missing_factor" | "mixed";
  testsCompleted: number;
  avgAccuracy: number;
  avgSpeedSec: number;
}

export interface StudentAccount {
  id: string;
  username: string;
  password: string; // Plaintext for school classroom simplicity & admin management
  name: string;
  avatar: string;
  grade: DifficultyGrade;
  classCode: string;
  createdAt: string;
  assignedMinTable: number;
  assignedMaxTable: number;
  assignedCustomTables?: number[];
  assignedTimePerQuestionSec: number;
  assignedQuestionCount: number;
  assignedMode: "multiplication" | "division" | "missing_factor" | "mixed";
  profile: StudentProfile;
}

export interface DodgingQuestionLog {
  id: string;
  questionText: string;
  tableNumber: number;
  multiplier: number;
  correctAnswer: string;
  studentAnswer: string;
  isCorrect: boolean;
  timeSpentSec: number;
  timedOut?: boolean;
}

export interface DodgingTestAttempt {
  id: string;
  studentId: string;
  studentUsername: string;
  studentName: string;
  timestamp: string;
  timeLimitPerQuestionSec: number;
  tableRange: {
    min: number;
    max: number;
    custom?: number[];
  };
  mode: "multiplication" | "division" | "missing_factor" | "mixed";
  totalQuestions: number;
  correctQuestions: number;
  score: number;
  accuracy: number;
  totalTimeSpentSec: number;
  avgTimePerQuestionSec: number;
  xpGained: number;
  isPractice?: boolean;
  isSynced: boolean; // Offline progress tracking flag
  syncedAt?: string;
  questionLogs: DodgingQuestionLog[];
}

export interface TopicStat {
  total: number;
  correct: number;
  totalTimeSec: number;
}

export interface DailyLog {
  date: string;
  questionsSolved: number;
  correctCount: number;
  xpEarned: number;
  timeSpentSec: number;
}

export interface StudentStats {
  totalQuestions: number;
  totalCorrect: number;
  totalTimeSec: number;
  bestBlitzScore: number;
  maxStreak: number;
  currentStreak: number;
  topicStats: Record<MathOperation, TopicStat>;
  tableMastery: Record<number, { total: number; correct: number }>;
  dailyHistory: Record<string, DailyLog>;
  recentSessions: GameSessionSummary[];
  dodgingAttempts: DodgingTestAttempt[];
}

export interface GameSessionSummary {
  id: string;
  timestamp: string;
  mode: GameMode;
  operation: MathOperation;
  difficulty: DifficultyGrade;
  score: number;
  totalQuestions: number;
  correctQuestions: number;
  timeSpentSec: number;
  accuracy: number;
  xpGained: number;
  isSynced?: boolean;
}

export interface MistakeRecord {
  id: string;
  question: Question;
  studentAnswer: string;
  timestamp: string;
  retryCount: number;
  mastered: boolean;
  studentId?: string;
}

export interface LeaderboardEntry {
  id: string;
  studentId: string;
  username: string;
  name: string;
  avatar: string;
  grade: DifficultyGrade;
  classCode: string;
  totalXP: number;
  blitzHighScore: number; // Highest dodging test score (Primary ranking metric)
  streakHighScore: number;
  accuracy: number;
  badgeCount: number;
  unlockedBadgeIds?: string[];
  testsCompleted: number;
  avgSpeedSec: number;
  country?: string;
  countryFlag?: string;
  isCurrentUser?: boolean;
  rank?: number;
  dailyXP?: number;
  weeklyXP?: number;
}

export interface QuestStage {
  id: string;
  stageNumber: number;
  title: string;
  operation: MathOperation;
  difficulty: DifficultyGrade;
  description: string;
  requiredXP: number;
  targetQuestions: number;
  starsEarned: number; // 0 to 3
  isUnlocked: boolean;
  isBossStage?: boolean;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  emoji: string;
  category: "speed" | "accuracy" | "score" | "streak" | "dedication";
  requirementDescription: string;
  currentHolderId?: string | null;
  currentHolderName?: string | null;
  currentHolderAvatar?: string | null;
  recordValueDisplay?: string | null;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  role: "admin" | "student" | null;
  currentStudentId: string | null;
  username: string | null;
  name: string | null;
}

export interface DayStreakItem {
  dateStr: string;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  isPast: boolean;
  isCompleted: boolean;
  testsCompleted: number;
  totalQuestions: number;
  accuracy: number;
  xpEarned: number;
}

export interface StudentStreakData {
  streakDays: number;
  maxStreak: number;
  isTodayQuotaCompleted: boolean;
  todayQuestionsSolved: number;
  todayQuotaTarget: number;
  todayQuotaProgressPct: number;
  weekCalendar: DayStreakItem[];
  streakTier: "none" | "ember" | "blaze" | "inferno" | "phoenix";
  streakTierLabel: string;
  streakTierEmoji: string;
  xpMultiplier: number;
  todayAttempt?: DodgingTestAttempt;
  nextMilestoneDays: number;
  daysToNextMilestone: number;
}
