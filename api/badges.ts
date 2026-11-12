import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getStudents, getAttempts, getBadges } from "./_db.js";
import { INITIAL_BADGES } from "./seeds.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const students = await getStudents();
    const attempts = await getAttempts();
    const badgesFromDb = await getBadges().catch(() => null);

    // Prefer badges stored in database; otherwise fall back to initial in-memory badges
    const badges =
      Array.isArray(badgesFromDb) && badgesFromDb.length > 0
        ? badgesFromDb
        : INITIAL_BADGES;
    res.status(200).json({ success: true, badges });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: (e as Error).message });
  }
}
