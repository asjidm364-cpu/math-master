-- Supabase / Postgres schema for Math-MAster
-- Paste this into the Supabase SQL editor and run.

-- 1) Helper: timestamp trigger to keep updated_at current
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2) Admin table
CREATE TABLE IF NOT EXISTS admin (
  id serial PRIMARY KEY,
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE TRIGGER admin_set_updated_at BEFORE UPDATE ON admin FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 3) Students table
CREATE TABLE IF NOT EXISTS students (
  id text PRIMARY KEY,
  username text UNIQUE,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_students_username ON students(username);
CREATE TRIGGER students_set_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4) Attempts table
CREATE TABLE IF NOT EXISTS attempts (
  id text PRIMARY KEY,
  student_id text,
  data jsonb NOT NULL,
  timestamp timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_attempts_student_id ON attempts(student_id);
CREATE TRIGGER attempts_set_updated_at BEFORE UPDATE ON attempts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 5) Mistakes table
CREATE TABLE IF NOT EXISTS mistakes (
  id text PRIMARY KEY,
  student_id text,
  data jsonb NOT NULL,
  timestamp timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mistakes_student_id ON mistakes(student_id);
CREATE TRIGGER mistakes_set_updated_at BEFORE UPDATE ON mistakes FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 6) Quest stages
CREATE TABLE IF NOT EXISTS quest_stages (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE TRIGGER quest_stages_set_updated_at BEFORE UPDATE ON quest_stages FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 7) Badges
CREATE TABLE IF NOT EXISTS badges (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE TRIGGER badges_set_updated_at BEFORE UPDATE ON badges FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 8) Optional metadata table for last-updated tracking
CREATE TABLE IF NOT EXISTS metadata (
  key text PRIMARY KEY,
  value jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE TRIGGER metadata_set_updated_at BEFORE UPDATE ON metadata FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 9) Seed admin entry (useful default; replace with secure credentials afterwards)
INSERT INTO admin (username, password, name)
VALUES ('abrash', '123oPm78', 'Abrash (Educator Admin)')
ON CONFLICT (username) DO NOTHING;

-- 10) Seed default quest stages and badges from application.
-- The application ships with initial quest stages and badges; insert them as JSON.

-- Example: insert quest stages (you can replace these with full app data if desired)
INSERT INTO quest_stages (id, data)
VALUES
  ('stage_1', $$
  {
    "id": "stage_1",
    "stageNumber": 1,
    "title": "Tables 2 to 5 Sprint",
    "operation": "multiplication",
    "difficulty": "rookie",
    "description": "Master elementary multiplication tables 2, 3, 4, and 5 with high speed.",
    "requiredXP": 0,
    "targetQuestions": 8,
    "starsEarned": 0,
    "isUnlocked": true
  }
  $$),
  ('stage_2', $$
  {
    "id": "stage_2",
    "stageNumber": 2,
    "title": "Tables 6 to 9 Core Matrix",
    "operation": "multiplication",
    "difficulty": "explorer",
    "description": "Conquer the tricky 6×, 7×, 8×, and 9× dodging table problems.",
    "requiredXP": 60,
    "targetQuestions": 10,
    "starsEarned": 0,
    "isUnlocked": false
  }
  $$)
ON CONFLICT (id) DO NOTHING;

-- Example: insert initial badges (a subset; extend as needed)
INSERT INTO badges (id, data)
VALUES
  ('cheetah_speed', $$ {"id":"cheetah_speed","title":"Cheetah Sprint","description":"Fastest average time per question in a completed test (min 80% accuracy)","iconName":"Zap","emoji":"🐆","category":"speed","requirementDescription":"Lowest seconds / question record","unlocked":false} $$),
  ('deadshot_accuracy', $$ {"id":"deadshot_accuracy","title":"Deadshot Sniper","description":"Highest test accuracy record across official dodging tests","iconName":"Target","emoji":"🎯","category":"accuracy","requirementDescription":"Highest accuracy % record","unlocked":false} $$)
ON CONFLICT (id) DO NOTHING;

-- 11) Notes:
-- - After running this migration, use the Supabase Table Editor to inspect and edit records.
-- - Replace the seeded admin account with a secure password immediately by running:
--     UPDATE admin SET password = '<your_secure_password>' WHERE username = 'abrash';

-- End of migration
