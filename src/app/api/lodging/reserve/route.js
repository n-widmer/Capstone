import { NextResponse } from "next/server";
import pool from "@/lib/db";

// POST — submit a lodging reservation
export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });

  const { access_code, lodging_embed_id, guest_ids } = body;

  if (!access_code) return NextResponse.json({ ok: false, error: "Missing access code" }, { status: 400 });
  if (!lodging_embed_id) return NextResponse.json({ ok: false, error: "Missing listing" }, { status: 400 });
  if (!Array.isArray(guest_ids) || guest_ids.length === 0)
    return NextResponse.json({ ok: false, error: "Please select at least one guest" }, { status: 400 });

  const conn = await pool.getConnection();
  try {
    // validate access code and get the group
    const [groups] = await conn.execute(
      `SELECT group_id FROM \`groups\` WHERE access_code = ? LIMIT 1`,
      [access_code.trim()]
    );
    if (!groups.length) {
      return NextResponse.json({ ok: false, error: "Invalid access code" }, { status: 403 });
    }
    const { group_id } = groups[0];

    // block if any group has already reserved this listing
    const [existing] = await conn.execute(
      `SELECT group_id FROM lodging_reservations WHERE lodging_embed_id = ? LIMIT 1`,
      [lodging_embed_id]
    );
    if (existing.length) {
      return NextResponse.json({ ok: false, error: "This listing has already been reserved" }, { status: 409 });
    }

    // save the reservation
    await conn.execute(
      `INSERT INTO lodging_reservations (lodging_embed_id, group_id, guest_ids) VALUES (?, ?, ?)`,
      [lodging_embed_id, group_id, JSON.stringify(guest_ids)]
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  } finally {
    conn.release();
  }
}
