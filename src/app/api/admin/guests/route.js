import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      `SELECT g.group_id, g.family_name, g.access_code,
              u.user_id, u.first_name, u.last_name, u.plus_one_allowed,
              r.attending, r.plus_one, r.plus_one_name,
              r.diet_restrictions, r.dress_code, r.song_recommendations
       FROM \`groups\` g
       JOIN users u ON u.group_id = g.group_id
       LEFT JOIN rsvps r ON r.user_id = u.user_id
       ORDER BY g.family_name, u.last_name, u.first_name`
    );

    // Group rows by family
    const familyMap = new Map();
    for (const row of rows) {
      if (!familyMap.has(row.group_id)) {
        familyMap.set(row.group_id, {
          group_id: row.group_id,
          family_name: row.family_name,
          access_code: row.access_code,
          members: [],
        });
      }
      familyMap.get(row.group_id).members.push({
        user_id: row.user_id,
        first_name: row.first_name,
        last_name: row.last_name,
        plus_one_allowed: row.plus_one_allowed,
        attending: row.attending,
        plus_one: row.plus_one,
        plus_one_name: row.plus_one_name,
        diet_restrictions: row.diet_restrictions,
        dress_code: row.dress_code,
        song_recommendations: row.song_recommendations,
      });
    }

    const families = Array.from(familyMap.values());

    return NextResponse.json({ ok: true, families });
  } catch (e) {
    return NextResponse.json(
      { error: String(e?.message || e) },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
