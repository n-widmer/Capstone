import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET — check if a family already has a lodging reservation
export async function GET(req) {
  const code = new URL(req.url).searchParams.get("code");
  if (!code) return NextResponse.json({ ok: false, error: "Missing code" }, { status: 400 });

  const conn = await pool.getConnection();
  try {
    const [groups] = await conn.execute(
      `SELECT group_id FROM \`groups\` WHERE access_code = ? LIMIT 1`,
      [code.trim()]
    );
    if (!groups.length) {
      return NextResponse.json({ ok: true, hasReservation: false });
    }

    const [reservations] = await conn.execute(
      `SELECT id FROM lodging_reservations WHERE group_id = ? LIMIT 1`,
      [groups[0].group_id]
    );

    return NextResponse.json({ ok: true, hasReservation: reservations.length > 0 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  } finally {
    conn.release();
  }
}
