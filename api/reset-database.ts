import type { VercelRequest, VercelResponse } from "@vercel/node";
import { resetDatabase } from "./_db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST")
      return res
        .status(405)
        .json({ success: false, error: "Method not allowed" });
    const ok = await resetDatabase();
    return res.status(200).json({ success: ok });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: (e as Error).message });
  }
}
