import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import pool from "@/lib/db";

// PATCH /api/admin/photos — { photo_id, action: "approve"|"reject" }
export async function PATCH(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const { photo_id, action } = body;

  if (!photo_id || !["approve", "reject"].includes(action)) {
    return NextResponse.json(
      { ok: false, error: "photo_id and action (approve|reject) are required" },
      { status: 400 }
    );
  }

  const conn = await pool.getConnection();
  try {
    if (action === "approve") {
      const [result] = await conn.execute(
        `UPDATE photos SET approved = TRUE WHERE id = ?`,
        [photo_id]
      );
      if (result.affectedRows === 0) {
        return NextResponse.json(
          { ok: false, error: "Photo not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ ok: true });
    }

    // action === "reject"
    const [photos] = await conn.execute(
      `SELECT filename FROM photos WHERE id = ? LIMIT 1`,
      [photo_id]
    );

    if (!photos.length) {
      return NextResponse.json(
        { ok: false, error: "Photo not found" },
        { status: 404 }
      );
    }

    const filename = photos[0].filename;

    // Delete from database
    await conn.execute(`DELETE FROM photos WHERE id = ?`, [photo_id]);

    // Delete file from disk
    try {
      const filePath = path.join(process.cwd(), "public", "gallery", filename);
      await unlink(filePath);
    } catch {
      // File may already be missing — not critical
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
