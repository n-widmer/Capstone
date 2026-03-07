import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/groups?code=ACCESSCODE
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = (searchParams.get("code") || "").trim();

  if (!code) {
    return NextResponse.json({ ok: false, error: "Missing access code" }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    // User finds group by access code
    const [groups] = await conn.execute(
      `SELECT group_id, family_name FROM \`groups\` WHERE access_code = ? LIMIT 1`,
      [code]
    );

    if (!groups.length) {
      return NextResponse.json({ ok: false, error: "Invalid access code" }, { status: 404 });
    }

    const group = groups[0];

    // Load members
    const [members] = await conn.execute(
      `SELECT
        u.user_id,
        u.first_name,
        u.last_name,
        u.plus_one_allowed,
        r.attending AS attending
      FROM users u
      LEFT JOIN rsvps r ON r.user_id = u.user_id
      WHERE u.group_id = ?
      ORDER BY u.last_name, u.first_name`,
      [group.group_id]
    );

    // Check if RSVPs exist for any member in group
    const [existingRows] = await conn.execute(
      `SELECT r.id, r.user_id,
              u.first_name AS submitted_first, u.last_name AS submitted_last
       FROM rsvps r
       JOIN users u ON u.user_id = r.user_id
       WHERE u.group_id = ?
       ORDER BY r.user_id DESC
       LIMIT 1`,
      [group.group_id]
    );

    const existing = existingRows.length ? existingRows[0] : null;

    // Load other RSVP data if it exists
    const [rsvpMetaRows] = await conn.execute(
      `SELECT diet_restrictions, dress_code, song_recommendations, plus_one, plus_one_name
      FROM rsvps r
      JOIN users u ON u.user_id = r.user_id
      WHERE u.group_id = ?
      LIMIT 1`,
      [group.group_id]
    );

    const meta = rsvpMetaRows.length ? rsvpMetaRows[0] : null;

    return NextResponse.json({
      ok: true,
      group: { group_id: group.group_id, family_name: group.family_name },
      members: members.map((m) => ({
        user_id: m.user_id,
        name: `${m.first_name} ${m.last_name}`,
        plus_one_allowed: !!m.plus_one_allowed,
        attending: m.attending === null ? null : Number(m.attending), // null if not in RSVP 
      })),
      rsvp: {
        exists: !!existing,
        submitted_at: existing?.submitted_at || null,
        submitted_by: existing ? `${existing.submitted_first} ${existing.submitted_last}` : null,
      },
      rsvp_meta: meta ? {
        plus_one: Number(meta.plus_one),
        plus_one_name: meta.plus_one_name,
        diet_restrictions: meta.diet_restrictions,
        dress_code: meta.dress_code,
        song_recommendations: meta.song_recommendations,
      } : null,
    });
  } finally {
    conn.release();
  }
}