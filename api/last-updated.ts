import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getLastUpdated } from "./_db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const ts = await getLastUpdated();
    return res.status(200).json({ success: true, lastUpdated: ts });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ success: false, error: (e as Error).message });
  }
}
