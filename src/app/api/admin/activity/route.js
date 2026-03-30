import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      `SELECT
        r.id,
        r.attending,
        r.updated_at,
        r.created_at,
        u.first_name,
        u.last_name,
        g.family_name,
        g.group_id,
        (SELECT COUNT(*) FROM rsvps r2 JOIN users u2 ON u2.user_id = r2.user_id WHERE u2.group_id = g.group_id AND r2.attending = 1) AS attending_count,
        (SELECT COUNT(*) FROM users u3 WHERE u3.group_id = g.group_id) AS member_count
      FROM rsvps r
      JOIN users u ON u.user_id = r.user_id
      JOIN \`groups\` g ON g.group_id = u.group_id
      ORDER BY r.updated_at DESC
      LIMIT 15`
    );

    const activity = rows.map((row) => ({
      id: row.id,
      family_name: row.family_name,
      member_name: `${row.first_name} ${row.last_name}`,
      attending: !!row.attending,
      attending_count: Number(row.attending_count),
      member_count: Number(row.member_count),
      timestamp: row.updated_at || row.created_at,
      is_update: row.updated_at && row.created_at && row.updated_at > row.created_at,
    }));

    return NextResponse.json({ activity });
  } catch (e) {
    console.error("[activity GET] error:", e);
    return NextResponse.json({ error: "An error occurred." }, { status: 500 });
  } finally {
    conn.release();
  }
}
