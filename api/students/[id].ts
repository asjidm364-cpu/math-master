import type { VercelRequest, VercelResponse } from "@vercel/node";
import { updateStudent, deleteStudent, getStudents } from "../_db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const id = req.query.id as string;
    if (!id)
      return res.status(400).json({ success: false, error: "Missing id" });

    if (req.method === "PUT") {
      const updated = await updateStudent(id, req.body);
      return res.status(200).json({ success: true, student: updated });
    }

    if (req.method === "DELETE") {
      await deleteStudent(id);
      return res.status(200).json({ success: true });
    }

    if (req.method === "GET") {
      const students = await getStudents();
      const s = students.find((x: any) => x.id === id);
      return res.status(200).json({ success: true, student: s });
    }

    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  } catch (e) {
    console.error(e);
    const msg = (e as Error).message || "";
    try {
      const parsed = JSON.parse(msg);
      return res.status(500).json({ success: false, error: parsed });
    } catch {
      return res.status(500).json({ success: false, error: msg });
    }
  }
}
