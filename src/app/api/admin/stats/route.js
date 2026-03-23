import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const conn = await pool.getConnection();
  try {
    // Total invited (all users)
    const [[{ total_invited }]] = await conn.execute(
      `SELECT COUNT(*) AS total_invited FROM users`
    );

    // Total responded (users who have an RSVP row)
    const [[{ total_responded }]] = await conn.execute(
      `SELECT COUNT(*) AS total_responded FROM rsvps`
    );

    // Total attending
    const [[{ total_attending }]] = await conn.execute(
      `SELECT COUNT(*) AS total_attending FROM rsvps WHERE attending = 1`
    );

    // Total declined
    const [[{ total_declined }]] = await conn.execute(
      `SELECT COUNT(*) AS total_declined FROM rsvps WHERE attending = 0`
    );

    // Total plus-ones
    const [[{ total_plus_ones }]] = await conn.execute(
      `SELECT COUNT(*) AS total_plus_ones FROM rsvps WHERE plus_one = 1`
    );

    // Total families (groups)
    const [[{ total_families }]] = await conn.execute(
      "SELECT COUNT(*) AS total_families FROM `groups`"
    );

    // Families that have at least one RSVP
    const [[{ families_responded }]] = await conn.execute(
      `SELECT COUNT(DISTINCT u.group_id) AS families_responded
       FROM rsvps r
       JOIN users u ON u.user_id = r.user_id`
    );

    // Dietary restrictions breakdown
    const [dietary] = await conn.execute(
      `SELECT diet_restrictions, COUNT(*) AS count
       FROM rsvps
       WHERE diet_restrictions IS NOT NULL AND diet_restrictions != ''
       GROUP BY diet_restrictions
       ORDER BY count DESC`
    );

    // Per-family breakdown
    const [families] = await conn.execute(
      `SELECT
         g.family_name,
         g.group_id,
         COUNT(u.user_id) AS member_count,
         SUM(CASE WHEN r.id IS NOT NULL THEN 1 ELSE 0 END) AS responded_count,
         SUM(CASE WHEN r.attending = 1 THEN 1 ELSE 0 END) AS attending_count
       FROM \`groups\` g
       LEFT JOIN users u ON u.group_id = g.group_id
       LEFT JOIN rsvps r ON r.user_id = u.user_id
       GROUP BY g.group_id, g.family_name
       ORDER BY g.family_name`
    );

    const not_responded = total_invited - total_responded;

    return NextResponse.json({
      total_invited,
      total_responded,
      total_attending,
      total_declined,
      total_plus_ones,
      total_families,
      families_responded,
      not_responded,
      dietary,
      families,
    });
  } catch (e) {
    return NextResponse.json(
      { error: String(e?.message || e) },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
