import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getStudents, getAttempts } from "./_db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const students = await getStudents();
    const attempts = await getAttempts();

    // replicate server leaderboard logic briefly
    const list = students.map((s: any) => {
      const a = (attempts || []).filter((at: any) => at.studentId === s.id);
      const avgAcc =
        a.length > 0
          ? Math.round(
              a.reduce((sum: any, aa: any) => sum + (aa.accuracy || 0), 0) /
                a.length,
            )
          : s.profile?.avgAccuracy || 0;
      const avgSpeed =
        a.length > 0
          ? parseFloat(
              (
                a.reduce(
                  (sum: any, aa: any) => sum + (aa.avgTimePerQuestionSec || 0),
                  0,
                ) / a.length
              ).toFixed(1),
            )
          : s.profile?.avgSpeedSec || 0;
      const highest =
        a.length > 0 ? Math.max(...a.map((x: any) => x.score || 0)) : 0;
      return {
        id: s.id,
        studentId: s.id,
        username: s.username,
        name: s.name,
        avatar: s.avatar,
        grade: s.grade,
        classCode: s.classCode,
        totalXP: s.profile?.totalXP || 0,
        blitzHighScore: highest,
        streakHighScore: s.profile?.streakDays || 0,
        accuracy: avgAcc,
        badgeCount: (s.profile?.unlockedBadges || []).length,
        unlockedBadgeIds: s.profile?.unlockedBadges || [],
        testsCompleted: a.length || s.profile?.testsCompleted || 0,
        avgSpeedSec: avgSpeed,
      };
    });

    list.sort((a: any, b: any) => {
      if (b.blitzHighScore !== a.blitzHighScore)
        return b.blitzHighScore - a.blitzHighScore;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      if (
        a.avgSpeedSec !== b.avgSpeedSec &&
        a.avgSpeedSec > 0 &&
        b.avgSpeedSec > 0
      )
        return a.avgSpeedSec - b.avgSpeedSec;
      return b.totalXP - a.totalXP;
    });
    const ranked = list.map((item: any, idx: number) => ({
      ...item,
      rank: idx + 1,
    }));
    res.status(200).json({ success: true, leaderboard: ranked });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: (e as Error).message });
  }
}
