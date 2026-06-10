import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { parseGroupId, readGuestGroupId } from "@/lib/groups";

// GET /api/lodging/check?group_id=<id>
// Check whether a family already has a lodging reservation.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const groupId = parseGroupId(searchParams.get("group_id")) || readGuestGroupId(req);
  if (!groupId) return NextResponse.json({ ok: false, error: "Missing group" }, { status: 400 });

  const conn = await pool.getConnection();
  try {
    const [reservations] = await conn.execute(
      `SELECT id FROM lodging_reservations WHERE group_id = ? LIMIT 1`,
      [groupId]
    );

    return NextResponse.json({ ok: true, hasReservation: reservations.length > 0 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  } finally {
    conn.release();
  }
}
