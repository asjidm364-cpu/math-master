import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAttempts, createAttempt } from "./_db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const studentId = req.query.studentId as string | undefined;
      const attempts = await getAttempts(studentId);
      return res.status(200).json({ success: true, attempts });
    }
    if (req.method === "POST") {
      const attempt = req.body;
      const a = await createAttempt(attempt);
      return res.status(201).json({ success: true, attempt: a });
    }
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: (e as Error).message });
  }
}
