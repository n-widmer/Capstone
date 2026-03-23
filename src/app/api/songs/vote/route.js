import { NextResponse } from "next/server";
import pool from "@/lib/db";

const MAX_VOTES = 5;

// POST /api/songs/vote — toggle vote
export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const code = (body.access_code || "").trim();
  const songId = body.song_id;

  if (!code) {
    return NextResponse.json({ ok: false, error: "Missing access code" }, { status: 400 });
  }
  if (!songId) {
    return NextResponse.json({ ok: false, error: "Missing song_id" }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Validate access code
    const [groups] = await conn.execute(
      `SELECT group_id FROM \`groups\` WHERE access_code = ? LIMIT 1`,
      [code]
    );

    if (!groups.length) {
      await conn.rollback();
      return NextResponse.json({ ok: false, error: "Invalid access code" }, { status: 404 });
    }

    const groupId = groups[0].group_id;

    // Check if song exists
    const [songs] = await conn.execute(
      `SELECT id, votes FROM song_requests WHERE id = ? FOR UPDATE`,
      [songId]
    );

    if (!songs.length) {
      await conn.rollback();
      return NextResponse.json({ ok: false, error: "Song not found" }, { status: 404 });
    }

    // Check if already voted
    const [existingVotes] = await conn.execute(
      `SELECT id FROM song_votes WHERE song_id = ? AND group_id = ?`,
      [songId, groupId]
    );

    if (existingVotes.length) {
      // Unvote: remove vote and decrement
      await conn.execute(`DELETE FROM song_votes WHERE song_id = ? AND group_id = ?`, [songId, groupId]);
      await conn.execute(`UPDATE song_requests SET votes = GREATEST(votes - 1, 0) WHERE id = ?`, [songId]);
      await conn.commit();

      return NextResponse.json({ ok: true, action: "unvoted" });
    } else {
      // Check vote limit
      const [[{ vote_count }]] = await conn.execute(
        `SELECT COUNT(*) AS vote_count FROM song_votes WHERE group_id = ?`,
        [groupId]
      );

      if (vote_count >= MAX_VOTES) {
        await conn.rollback();
        return NextResponse.json(
          { ok: false, error: `You have already used all ${MAX_VOTES} votes` },
          { status: 400 }
        );
      }

      // Vote: insert vote and increment
      await conn.execute(`INSERT INTO song_votes (song_id, group_id) VALUES (?, ?)`, [songId, groupId]);
      await conn.execute(`UPDATE song_requests SET votes = votes + 1 WHERE id = ?`, [songId]);
      await conn.commit();

      return NextResponse.json({ ok: true, action: "voted" });
    }
  } catch (e) {
    await conn.rollback();
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  } finally {
    conn.release();
  }
}
