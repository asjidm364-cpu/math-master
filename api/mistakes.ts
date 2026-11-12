import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getMistakes, saveMistakes } from "./_db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const studentId = req.query.studentId as string | undefined;
      const mistakes = await getMistakes(studentId);
      return res.status(200).json({ success: true, mistakes });
    }
    if (req.method === "POST") {
      const { mistakes } = req.body;
      await saveMistakes(mistakes || []);
      return res.status(200).json({ success: true });
    }
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: (e as Error).message });
  }
}
