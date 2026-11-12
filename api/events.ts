import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getLastUpdated } from "./_db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  const lastUpdated = await getLastUpdated();
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res
    .status(200)
    .write(`data: ${JSON.stringify({ type: "CONNECTED", lastUpdated })}\n\n`);
  res.end();
}
