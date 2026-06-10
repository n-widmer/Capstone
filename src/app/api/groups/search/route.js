import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/groups/search?q=<name>
// Finds wedding groups that contain a guest matching the search term (by first
// name, last name, full name, or family name). Returns each matching group with
// all of its members so guests can recognize and pick their own family — this
// replaces the old per-family access code lookup.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  if (q.length < 2) {
    return NextResponse.json(
      { ok: false, error: "Please enter at least 2 letters of your name." },
      { status: 400 }
    );
  }

  const like = `%${q}%`;

  const conn = await pool.getConnection();
  try {
    const [groups] = await conn.execute(
      `SELECT DISTINCT g.group_id, g.family_name
         FROM \`groups\` g
         JOIN users u ON u.group_id = g.group_id
        WHERE u.first_name LIKE ?
           OR u.last_name LIKE ?
           OR CONCAT(u.first_name, ' ', u.last_name) LIKE ?
           OR g.family_name LIKE ?
        ORDER BY g.family_name
        LIMIT 25`,
      [like, like, like, like]
    );

    if (!groups.length) {
      return NextResponse.json({ ok: true, matches: [] });
    }

    const ids = groups.map((g) => g.group_id);
    const placeholders = ids.map(() => "?").join(", ");
    const [members] = await conn.execute(
      `SELECT group_id, first_name, last_name
         FROM users
        WHERE group_id IN (${placeholders})
        ORDER BY last_name, first_name`,
      ids
    );

    const membersByGroup = new Map();
    for (const m of members) {
      const list = membersByGroup.get(m.group_id) || [];
      list.push(`${m.first_name} ${m.last_name}`);
      membersByGroup.set(m.group_id, list);
    }

    const matches = groups.map((g) => ({
      group_id: g.group_id,
      family_name: g.family_name,
      members: membersByGroup.get(g.group_id) || [],
    }));

    return NextResponse.json({ ok: true, matches });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
