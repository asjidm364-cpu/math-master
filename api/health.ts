import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getCounts,
  getMode,
  getSupabaseInitDiagnostic,
  testSupabaseConnection,
} from "./_db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const isProduction =
      process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

    const supDiag = getSupabaseInitDiagnostic();
    const supTest = supDiag.hasSupabaseEnv
      ? await testSupabaseConnection()
      : { ok: false, result: null };
    const connected = supDiag.supabaseInitOk && supTest.ok;

    if (!connected) {
      return res.status(isProduction ? 503 : 200).json({
        ok: false,
        mode: supDiag.hasSupabaseEnv ? "supabase" : "unconfigured",
        supabase: {
          configured: supDiag.hasSupabaseEnv,
          connected: false,
        },
        error: supDiag.supabaseInitError || "Supabase connection unavailable",
      });
    }

    const counts = await getCounts();
    return res.status(200).json({
      ok: true,
      mode: "supabase",
      supabase: { configured: true, connected: true },
      counts,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      ok: false,
      mode: "supabase",
      supabase: { configured: false, connected: false },
      error: "Health check failed",
    });
  }
}
