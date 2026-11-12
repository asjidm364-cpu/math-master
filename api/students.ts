import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "./_db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const students = await getStudents();
      return res.status(200).json({ success: true, students });
    }
    if (req.method === "POST") {
      const data = req.body;
      const newStudent = await createStudent(data);
      return res.status(201).json({ success: true, student: newStudent });
    }
    if (req.method === "PUT") {
      const id = req.query.id as string;
      const updated = await updateStudent(id, req.body);
      return res.status(200).json({ success: true, student: updated });
    }
    if (req.method === "DELETE") {
      const id = req.query.id as string;
      await deleteStudent(id);
      return res.status(200).json({ success: true });
    }
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  } catch (e) {
    // Try to parse safe JSON diagnostics from thrown Error messages
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
