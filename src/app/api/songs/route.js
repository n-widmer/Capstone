import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/songs?code=ACCESSCODE
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = (searchParams.get("code") || "").trim();

  if (!code) {
    return NextResponse.json({ ok: false, error: "Missing access code" }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    const [groups] = await conn.execute(
      `SELECT group_id, family_name FROM \`groups\` WHERE access_code = ? LIMIT 1`,
      [code]
    );

    if (!groups.length) {
      return NextResponse.json({ ok: false, error: "Invalid access code" }, { status: 404 });
    }

    const group = groups[0];

    // All songs with vote counts and whether this group voted for each
    const [songs] = await conn.execute(
      `SELECT
         s.id,
         s.song_title,
         s.artist,
         s.votes,
         g.family_name AS requested_by,
         EXISTS(
           SELECT 1 FROM song_votes sv
           WHERE sv.song_id = s.id AND sv.group_id = ?
         ) AS voted_by_me
       FROM song_requests s
       JOIN \`groups\` g ON g.group_id = s.group_id
       ORDER BY s.votes DESC, s.song_title`,
      [group.group_id]
    );

    // How many votes this group has used
    const [[{ my_votes_used }]] = await conn.execute(
      `SELECT COUNT(*) AS my_votes_used FROM song_votes WHERE group_id = ?`,
      [group.group_id]
    );

    return NextResponse.json({
      ok: true,
      group_id: group.group_id,
      songs: songs.map((s) => ({
        id: s.id,
        song_title: s.song_title,
        artist: s.artist || "",
        votes: s.votes,
        requested_by: s.requested_by,
        voted_by_me: !!s.voted_by_me,
      })),
      my_votes_used,
      max_votes: 5,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  } finally {
    conn.release();
  }
}

// POST /api/songs — submit a new song
export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const code = (body.access_code || "").trim();
  const songTitle = (body.song_title || "").trim();
  const artist = (body.artist || "").trim();

  if (!code) {
    return NextResponse.json({ ok: false, error: "Missing access code" }, { status: 400 });
  }
  if (!songTitle) {
    return NextResponse.json({ ok: false, error: "Song title is required" }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    const [groups] = await conn.execute(
      `SELECT group_id FROM \`groups\` WHERE access_code = ? LIMIT 1`,
      [code]
    );

    if (!groups.length) {
      return NextResponse.json({ ok: false, error: "Invalid access code" }, { status: 404 });
    }

    const groupId = groups[0].group_id;

    const [result] = await conn.execute(
      `INSERT INTO song_requests (group_id, song_title, artist, votes) VALUES (?, ?, ?, 0)`,
      [groupId, songTitle, artist || null]
    );

    return NextResponse.json({
      ok: true,
      song_id: result.insertId,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  } finally {
    conn.release();
  }
}
