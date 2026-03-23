import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/photos?category=X&admin=true
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const category = (searchParams.get("category") || "").trim().toLowerCase();
  const admin = searchParams.get("admin") === "true";

  const conn = await pool.getConnection();
  try {
    let query = `
      SELECT p.id, p.filename, p.caption, p.category, p.approved, p.created_at,
             g.family_name AS uploaded_by
      FROM photos p
      JOIN \`groups\` g ON g.group_id = p.uploaded_by_group_id
    `;
    const conditions = [];
    const params = [];

    if (!admin) {
      conditions.push("p.approved = TRUE");
    }

    if (category && ["engagement", "wedding", "guest"].includes(category)) {
      conditions.push("p.category = ?");
      params.push(category);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY p.created_at DESC";

    const [photos] = await conn.execute(query, params);

    return NextResponse.json({
      ok: true,
      photos: photos.map((p) => ({
        id: p.id,
        filename: p.filename,
        caption: p.caption || "",
        category: p.category,
        approved: !!p.approved,
        created_at: p.created_at,
        uploaded_by: p.uploaded_by,
      })),
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
