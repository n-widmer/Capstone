import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/admin/songs — all songs ranked by votes
export async function GET() {
  const conn = await pool.getConnection();
  try {
    const [songs] = await conn.execute(
      `SELECT s.id, s.song_title, s.artist, s.votes, g.family_name AS requested_by
       FROM song_requests s
       JOIN \`groups\` g ON g.group_id = s.group_id
       ORDER BY s.votes DESC, s.song_title`
    );

    return NextResponse.json({
      ok: true,
      songs: songs.map((s) => ({
        id: s.id,
        song_title: s.song_title,
        artist: s.artist || "",
        votes: s.votes,
        requested_by: s.requested_by,
      })),
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  } finally {
    conn.release();
  }
}
