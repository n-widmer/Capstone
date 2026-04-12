import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET — return all reservations with guest names, keyed by lodging_embed_id
export async function GET() {
  const conn = await pool.getConnection();
  try {
    const [reservations] = await conn.execute(
      `SELECT lr.lodging_embed_id, lr.group_id, lr.guest_ids, g.family_name
       FROM lodging_reservations lr
       JOIN \`groups\` g ON g.group_id = lr.group_id`
    );

    if (!reservations.length) {
      return NextResponse.json({ ok: true, reservations: {} });
    }

    const allUserIds = [];
    for (const r of reservations) {
      const ids = Array.isArray(r.guest_ids) ? r.guest_ids : JSON.parse(r.guest_ids);
      allUserIds.push(...ids);
    }

    // fetch names for all guests in one query
    const uniqueIds = [...new Set(allUserIds)];
    const placeholders = uniqueIds.map(() => "?").join(",");
    const [users] = await conn.execute(
      `SELECT user_id, first_name, last_name FROM users WHERE user_id IN (${placeholders})`,
      uniqueIds
    );

    const userMap = {};
    for (const u of users) {
      userMap[u.user_id] = `${u.first_name} ${u.last_name}`;
    }

    const result = {};
    for (const r of reservations) {
      const guestIds = Array.isArray(r.guest_ids) ? r.guest_ids : JSON.parse(r.guest_ids);
      result[r.lodging_embed_id] = {
        family_name: r.family_name,
        guest_names: guestIds.map((id) => userMap[id] || `Guest #${id}`),
      };
    }

    return NextResponse.json({ ok: true, reservations: result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  } finally {
    conn.release();
  }
}

// DELETE — remove all guests from a listing and mark it as available again
export async function DELETE(req) {
  const { lodging_embed_id } = await req.json().catch(() => ({}));
  if (!lodging_embed_id) {
    return NextResponse.json({ ok: false, error: "Missing lodging_embed_id" }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    await conn.execute(
      `DELETE FROM lodging_reservations WHERE lodging_embed_id = ?`,
      [lodging_embed_id]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  } finally {
    conn.release();
  }
}
