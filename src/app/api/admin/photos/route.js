import { NextResponse } from "next/server";
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

    // action === "reject" — delete from database (image data is stored in the row)
    const [result] = await conn.execute(
      `DELETE FROM photos WHERE id = ?`,
      [photo_id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { ok: false, error: "Photo not found" },
        { status: 404 }
      );
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
