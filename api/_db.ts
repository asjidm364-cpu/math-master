import { createClient } from "@supabase/supabase-js";
// `fs` and `path` are only needed for local (dev) mode. Lazy-load them
// to avoid importing Node built-ins at module load time in restricted runtimes.

type AnyObject = Record<string, any>;

let supabase: any = null;
let useSupabase = false;
let _supabaseInitAttempted = false;
let _supabaseInitError: string | null = null; // safe message only

function initSupabaseIfNeeded() {
  if (_supabaseInitAttempted) return;
  _supabaseInitAttempted = true;

  const SUPABASE_URL = process.env.SUPABASE_URL || "";
  const SUPABASE_SERVICE_KEY =
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || "";

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    _supabaseInitError = "Supabase env vars missing";
    useSupabase = false;
    supabase = null;
    return;
  }

  try {
    // createClient should not throw normally; guard it anyway and record safe error
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    useSupabase = true;
    _supabaseInitError = null;
  } catch (err) {
    const e = err as Error;
    // record safe diagnostic (type + message) but NEVER include the URL or key
    _supabaseInitError = `${e.name}: ${e.message}`.slice(0, 200);
    // eslint-disable-next-line no-console
    console.error("[api/_db] Supabase init error:", _supabaseInitError);
    useSupabase = false;
    supabase = null;
  }
}

// Diagnostic (safe): expose runtime config flags without secrets
try {
  // eslint-disable-next-line no-console
  console.log(
    `[api/_db] initialized: useSupabase=${useSupabase} IS_PRODUCTION=${
      process.env.VERCEL === "1" || process.env.NODE_ENV === "production"
    }`,
  );
} catch (e) {
  // ignore logging errors
}

const IS_PRODUCTION =
  process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

function ensureNotMissingSupabase() {
  initSupabaseIfNeeded();
  const hasSupabaseEnv = Boolean(
    process.env.SUPABASE_URL &&
    (process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY),
  );
  if (IS_PRODUCTION) {
    if (!hasSupabaseEnv) {
      throw new Error(
        "SUPABASE_URL and SUPABASE_SERVICE_KEY are required in production (set them in Vercel environment variables).",
      );
    }
    if (!useSupabase) {
      const msg = _supabaseInitError
        ? `Supabase initialization failed: ${_supabaseInitError}`
        : "Supabase client not initialized";
      throw new Error(msg);
    }
  }
}

// Helper to validate the SUPABASE_URL hostname looks like a real project ref
function hostnameLooksInvalid(hostname: string | null) {
  if (!hostname) return true;
  // reject hostnames containing underscores or suspicious 'sb_publishable' prefix
  if (hostname.indexOf("_") !== -1) return true;
  if (/^sb_publishable/i.test(hostname)) return true;
  // basic project ref pattern: alphanumeric + hyphens, then .supabase.co
  if (!/^[a-z0-9-]+\.supabase\.co$/.test(hostname)) return true;
  return false;
}

export function getSupabaseInitDiagnostic() {
  initSupabaseIfNeeded();
  const hasSupabaseEnv = Boolean(
    process.env.SUPABASE_URL &&
    (process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY),
  );
  let hostname: string | null = null;
  try {
    hostname = new URL(process.env.SUPABASE_URL || "").hostname;
  } catch {
    hostname = null;
  }
  const hostnameInvalid = hostnameLooksInvalid(hostname);
  return {
    hasSupabaseEnv,
    supabaseInitOk: useSupabase,
    supabaseInitError: _supabaseInitError,
    supabaseHostname: hostname,
    supabaseHostnameInvalid: hostnameInvalid,
  };
}

export async function testSupabaseConnection() {
  initSupabaseIfNeeded();
  const hasSupabaseEnv = Boolean(
    process.env.SUPABASE_URL &&
    (process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY),
  );
  if (!hasSupabaseEnv) return { ok: false, reason: "missing_env" };
  if (!useSupabase)
    return {
      ok: false,
      reason: _supabaseInitError || "client_not_initialized",
    };
  // Prefer a direct REST fetch diagnostic against the Supabase REST endpoint
  const rawUrl = process.env.SUPABASE_URL || "";
  let hostname: string | null = null;
  try {
    hostname = new URL(rawUrl).hostname;
  } catch {
    hostname = null;
  }
  const restUrl =
    rawUrl.replace(/\/$/, "") + "/rest/v1/students?select=id&limit=1";
  const key =
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || "";
  const safeResult: any = { urlValid: !!rawUrl, hostname };
  try {
    const controller =
      typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeout = controller
      ? setTimeout(() => controller.abort(), 8000)
      : null;
    const res = await fetch(restUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
        Accept: "application/json",
      },
      signal: controller ? controller.signal : undefined,
    });
    if (timeout) clearTimeout(timeout);
    safeResult.fetchOk = res.ok;
    safeResult.httpStatus = res.status;
    safeResult.statusText = res.statusText;
    return { ok: res.ok, result: safeResult };
  } catch (err) {
    if (typeof err === "object" && err !== null) {
      const e = err as any;
      // Extract recursive causes safely
      function extractCause(x: any, depth = 0): any {
        if (!x || depth > 6) return null;
        const out: any = {};
        if (x.name) out.name = String(x.name);
        if (x.code) out.code = String(x.code);
        if (x.errno) out.errno = String(x.errno);
        if (x.syscall) out.syscall = String(x.syscall);
        if (x.hostname) out.hostname = String(x.hostname);
        if (x.message) out.message = String(x.message).slice(0, 400);
        if (x.cause) out.cause = extractCause(x.cause, depth + 1);
        return Object.keys(out).length ? out : null;
      }
      const cause = extractCause(e) || {
        name: e.name || "Error",
        message: String(e.message || e),
      };
      safeResult.fetchOk = false;
      safeResult.httpStatus = null;
      safeResult.errorName = cause.name || "Error";
      safeResult.errorMessage = (cause.message || String(e)).slice(0, 400);
      safeResult.cause = cause.cause || null;
      // eslint-disable-next-line no-console
      console.error("[api/_db] supabase fetch diagnostic failed", {
        hostname,
        operation: "rest:students:select",
        name: safeResult.errorName,
        message: safeResult.errorMessage,
      });
      return { ok: false, result: safeResult };
    }
    return {
      ok: false,
      result: {
        fetchOk: false,
        httpStatus: null,
        errorName: String(err),
        errorMessage: String(err),
      },
    };
  }
}

const DATA_DIR = process.env.DATA_DIR || null; // resolved lazily when needed

async function ensureLocalDb() {
  const fs = await import("fs");
  const path = await import("path");
  const resolvedDataDir =
    process.env.DATA_DIR || path.join(process.cwd(), "data");
  const dbFile = path.join(resolvedDataDir, "db.json");
  if (!fs.existsSync(resolvedDataDir))
    fs.mkdirSync(resolvedDataDir, { recursive: true });
  if (!fs.existsSync(dbFile)) {
    const initial = {
      admin: {
        username: process.env.ADMIN_USERNAME || "abrash",
        password: process.env.ADMIN_PASSWORD || "123oPm78",
        name: process.env.ADMIN_NAME || "Abrash (Educator Admin)",
      },
      students: [],
      attempts: [],
      mistakes: [],
      questStages: [],
      badges: [],
      lastUpdated: Date.now(),
    };
    fs.writeFileSync(dbFile, JSON.stringify(initial, null, 2), "utf-8");
  }
  return { DATA_DIR: resolvedDataDir, DB_FILE: dbFile };
}

async function readLocalDb() {
  const { DATA_DIR: resolvedDataDir, DB_FILE: dbFile } = await ensureLocalDb();
  const fs = await import("fs");
  const raw = fs.readFileSync(dbFile, "utf-8");
  return JSON.parse(raw);
}

async function writeLocalDb(db: AnyObject) {
  const { DB_FILE: dbFile } = await ensureLocalDb();
  const fs = await import("fs");
  db.lastUpdated = Date.now();
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), "utf-8");
}

export async function getMode() {
  initSupabaseIfNeeded();
  const hasSupabaseEnv = Boolean(
    process.env.SUPABASE_URL &&
    (process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY),
  );
  // If envs are present, report 'supabase' mode even if init failed — health will surface init errors.
  if (hasSupabaseEnv) return "supabase";
  return useSupabase ? "supabase" : "local";
}

// Students
export async function getStudents() {
  ensureNotMissingSupabase();
  if (useSupabase) {
    const { data, error } = await supabase
      .from("students")
      .select("id, username, data, updated_at, created_at");
    if (error) throw error;
    return (data || []).map((r: any) => {
      const out = r.data || {};
      if (!out.id && r.id) out.id = r.id;
      if (!out.username && r.username) out.username = r.username;
      return out;
    });
  }
  const db = await readLocalDb();
  return db.students || [];
}

export async function createStudent(student: AnyObject) {
  ensureNotMissingSupabase();
  if (useSupabase) {
    try {
      const op = "insert:students";
      const { data, error } = await supabase
        .from("students")
        .insert([
          { id: student.id, username: student.username, data: student },
        ]);
      if (error) {
        const host = (() => {
          try {
            return new URL(process.env.SUPABASE_URL || "").hostname;
          } catch {
            return null;
          }
        })();
        const safe = {
          host,
          operation: op,
          name: error.name || "SupabaseError",
          message: (error.message || String(error)).slice(0, 200),
        };
        // eslint-disable-next-line no-console
        console.error("[api/_db] supabase error", safe);
        throw new Error(JSON.stringify(safe));
      }
      return student;
    } catch (err) {
      const e = err as Error;
      const host = (() => {
        try {
          return new URL(process.env.SUPABASE_URL || "").hostname;
        } catch {
          return null;
        }
      })();
      const safe = {
        host,
        operation: "insert:students",
        name: e.name,
        message: (e.message || String(e)).slice(0, 200),
      };
      // eslint-disable-next-line no-console
      console.error("[api/_db] supabase exception", safe);
      throw new Error(JSON.stringify(safe));
    }
  }
  const db = await readLocalDb();
  db.students = db.students || [];
  db.students.push(student);
  await writeLocalDb(db);
  return student;
}

export async function updateStudent(id: string, student: AnyObject) {
  ensureNotMissingSupabase();
  if (useSupabase) {
    const { error } = await supabase
      .from("students")
      .update({ data: student, username: student.username })
      .eq("id", id);
    if (error) throw error;
    return student;
  }
  const db = await readLocalDb();
  db.students = db.students || [];
  const idx = db.students.findIndex((s: any) => s.id === id);
  if (idx !== -1) db.students[idx] = { ...db.students[idx], ...student };
  await writeLocalDb(db);
  return db.students[idx];
}

export async function deleteStudent(id: string) {
  ensureNotMissingSupabase();
  if (useSupabase) {
    try {
      const op = "delete:students";
      const { data, error } = await supabase
        .from("students")
        .delete()
        .eq("id", id);
      if (error) {
        const host = (() => {
          try {
            return new URL(process.env.SUPABASE_URL || "").hostname;
          } catch {
            return null;
          }
        })();
        const safe = {
          host,
          operation: op,
          name: error.name || "SupabaseError",
          message: (error.message || String(error)).slice(0, 200),
        };
        // eslint-disable-next-line no-console
        console.error("[api/_db] supabase error", safe);
        throw new Error(JSON.stringify(safe));
      }
      return true;
    } catch (err) {
      const e = err as Error;
      const host = (() => {
        try {
          return new URL(process.env.SUPABASE_URL || "").hostname;
        } catch {
          return null;
        }
      })();
      const safe = {
        host,
        operation: "delete:students",
        name: e.name,
        message: (e.message || String(e)).slice(0, 200),
      };
      // eslint-disable-next-line no-console
      console.error("[api/_db] supabase exception", safe);
      throw new Error(JSON.stringify(safe));
    }
  }
  const db = await readLocalDb();
  db.students = (db.students || []).filter((s: any) => s.id !== id);
  db.attempts = (db.attempts || []).filter((a: any) => a.studentId !== id);
  db.mistakes = (db.mistakes || []).filter((m: any) => m.studentId !== id);
  await writeLocalDb(db);
  return true;
}

// Attempts
export async function getAttempts(studentId?: string) {
  ensureNotMissingSupabase();
  if (useSupabase) {
    const { data, error } = await supabase
      .from("attempts")
      .select("id, student_id, data, timestamp, updated_at, created_at");
    if (error) throw error;
    const attempts = (data || []).map((r: any) => {
      const out = r.data || {};
      if (!out.id && r.id) out.id = r.id;
      if (!out.studentId && r.student_id) out.studentId = r.student_id;
      if (!out.timestamp && r.timestamp) out.timestamp = r.timestamp;
      return out;
    });
    return studentId
      ? attempts.filter((a: any) => a.studentId === studentId)
      : attempts;
  }
  const db = await readLocalDb();
  const attempts = db.attempts || [];
  return studentId
    ? attempts.filter((a: any) => a.studentId === studentId)
    : attempts;
}

export async function createAttempt(attempt: AnyObject) {
  ensureNotMissingSupabase();
  if (useSupabase) {
    const { error } = await supabase.from("attempts").insert([
      {
        id: attempt.id,
        student_id: attempt.studentId || attempt.student_id || null,
        data: attempt,
        timestamp: attempt.timestamp || new Date().toISOString(),
      },
    ]);
    if (error) throw error;
    return attempt;
  }
  const db = await readLocalDb();
  db.attempts = db.attempts || [];
  const existingIdx = db.attempts.findIndex((a: any) => a.id === attempt.id);
  if (existingIdx !== -1) {
    return db.attempts[existingIdx];
  }
  db.attempts.push(attempt);
  await writeLocalDb(db);
  return attempt;
}

// Mistakes
export async function getMistakes(studentId?: string) {
  ensureNotMissingSupabase();
  if (useSupabase) {
    const { data, error } = await supabase
      .from("mistakes")
      .select("id, student_id, data, timestamp, updated_at, created_at");
    if (error) throw error;
    const mistakes = (data || []).map((r: any) => {
      const out = r.data || {};
      if (!out.id && r.id) out.id = r.id;
      if (!out.studentId && r.student_id) out.studentId = r.student_id;
      if (!out.timestamp && r.timestamp) out.timestamp = r.timestamp;
      return out;
    });
    return studentId
      ? mistakes.filter((m: any) => m.studentId === studentId)
      : mistakes;
  }
  const db = await readLocalDb();
  const mistakes = db.mistakes || [];
  return studentId
    ? mistakes.filter((m: any) => m.studentId === studentId)
    : mistakes;
}

export async function saveMistakes(mistakes: AnyObject[]) {
  ensureNotMissingSupabase();
  if (useSupabase) {
    for (const m of mistakes) {
      const { error } = await supabase.from("mistakes").upsert({
        id: m.id,
        student_id: m.studentId || m.student_id || null,
        data: m,
        timestamp: m.timestamp || new Date().toISOString(),
      });
      if (error) console.error("Supabase saveMistake error", error);
    }
    return true;
  }
  const db = await readLocalDb();
  db.mistakes = db.mistakes || [];
  for (const m of mistakes) {
    const idx = db.mistakes.findIndex((x: any) => x.id === m.id);
    if (idx !== -1) db.mistakes[idx] = m;
    else db.mistakes.push(m);
  }
  await writeLocalDb(db);
  return true;
}

export async function resetDatabase() {
  ensureNotMissingSupabase();
  if (useSupabase) {
    try {
      // Delete rows
      await supabase.from("attempts").delete().neq("id", "");
      await supabase.from("mistakes").delete().neq("id", "");
      await supabase.from("students").delete().neq("id", "");
      // Recreate admin
      await supabase.from("admin").upsert([
        {
          id: 1,
          username: process.env.ADMIN_USERNAME || "abrash",
          password: process.env.ADMIN_PASSWORD || "123oPm78",
          name: process.env.ADMIN_NAME || "Abrash (Educator Admin)",
        },
      ]);
      return true;
    } catch (e) {
      console.error("Supabase reset error", e);
      return false;
    }
  }
  const db = {
    admin: {
      username: process.env.ADMIN_USERNAME || "abrash",
      password: process.env.ADMIN_PASSWORD || "123oPm78",
      name: process.env.ADMIN_NAME || "Abrash (Educator Admin)",
    },
    students: [],
    attempts: [],
    mistakes: [],
    questStages: [],
    badges: [],
    lastUpdated: Date.now(),
  };
  await writeLocalDb(db);
  return true;
}

export async function resetStudentDailyTest(studentId: string) {
  ensureNotMissingSupabase();
  if (useSupabase) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { error } = await supabase
        .from("attempts")
        .delete()
        .eq("student_id", studentId)
        .gte("timestamp", today.toISOString())
        .lt("timestamp", tomorrow.toISOString());
      if (error) throw error;
      return true;
    } catch (e) {
      console.error("resetStudentDailyTest error", e);
      return false;
    }
  }
  const db = await readLocalDb();
  db.attempts = (db.attempts || []).filter((a: any) => {
    if (a.studentId !== studentId) return true;
    const d = new Date(a.timestamp);
    const y = d.getFullYear();
    const m = d.getMonth();
    const day = d.getDate();
    const today2 = new Date();
    return !(
      y === today2.getFullYear() &&
      m === today2.getMonth() &&
      day === today2.getDate()
    );
  });
  await writeLocalDb(db);
  return true;
}

// Quest stages & badges
export async function getQuestStages() {
  ensureNotMissingSupabase();
  if (useSupabase) {
    const { data, error } = await supabase
      .from("quest_stages")
      .select("id, data, updated_at, created_at");
    if (error) throw error;
    return (data || []).map((r: any) => {
      const out = r.data || {};
      if (!out.id && r.id) out.id = r.id;
      return out;
    });
  }
  const db = await readLocalDb();
  return db.questStages || [];
}

export async function getBadges() {
  ensureNotMissingSupabase();
  if (useSupabase) {
    const { data, error } = await supabase
      .from("badges")
      .select("id, data, updated_at, created_at");
    if (error) throw error;
    return (data || []).map((r: any) => {
      const out = r.data || {};
      if (!out.id && r.id) out.id = r.id;
      return out;
    });
  }
  const db = await readLocalDb();
  return db.badges || [];
}

export async function getCounts() {
  ensureNotMissingSupabase();
  if (useSupabase) {
    const { count: s } = await supabase
      .from("students")
      .select("*", { count: "exact" });
    const { count: a } = await supabase
      .from("attempts")
      .select("*", { count: "exact" });
    return { studentsCount: s || 0, attemptsCount: a || 0 };
  }
  const db = await readLocalDb();
  return {
    studentsCount: (db.students || []).length,
    attemptsCount: (db.attempts || []).length,
  };
}

export async function getLastUpdated() {
  ensureNotMissingSupabase();
  if (useSupabase) {
    try {
      // Check updated_at across key tables and return the most recent timestamp
      const tables = [
        "students",
        "attempts",
        "mistakes",
        "badges",
        "quest_stages",
      ];
      let maxTs = 0;
      for (const t of tables) {
        const { data, error } = await supabase
          .from(t)
          .select("updated_at")
          .order("updated_at", { ascending: false })
          .limit(1);
        if (error) {
          // ignore per-table errors
          continue;
        }
        if (Array.isArray(data) && data.length > 0) {
          const val = data[0].updated_at || data[0].timestamp || null;
          if (val) {
            const ts = new Date(val).getTime();
            if (!isNaN(ts) && ts > maxTs) maxTs = ts;
          }
        }
      }
      return maxTs || Date.now();
    } catch (e) {
      return Date.now();
    }
  }
  const db = await readLocalDb();
  return db.lastUpdated || Date.now();
}

export { useSupabase };
