import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/lodging — public endpoint to list lodging embeds
export async function GET() {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      `SELECT e.id, e.embed_id, e.label, e.display_order,
              EXISTS(SELECT 1 FROM lodging_reservations lr WHERE lr.lodging_embed_id = e.id) AS is_reserved
       FROM lodging_embeds e
       ORDER BY e.display_order ASC, e.created_at ASC`
    );
    return NextResponse.json({ ok: true, embeds: rows });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  } finally {
    conn.release();
  }
}
