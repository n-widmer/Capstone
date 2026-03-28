import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/rsvp — fetch RSVP data (admin only)
export async function GET() {
  // TODO: fetch all RSVPs from database (requires admin auth)
  return NextResponse.json({ message: "RSVP GET endpoint — not yet implemented" }, { status: 501 });
}

// POST /api/rsvp
// Body:
// {
//   access_code: "TEST123",
//   attending_user_ids: [1,2],
//   plus_one: 0|1,
//   plus_one_name: "Name",
//   diet_restrictions: "...",
//   dress_code: "...",
//   song_recommendations: "..."
// }
export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const access_code = (body.access_code || "").trim();
  const attending_user_ids = Array.isArray(body.attending_user_ids) ? body.attending_user_ids : [];

  const plus_ones = body.plus_ones && typeof body.plus_ones === "object" ? body.plus_ones : {};
  const diet_restrictions = body.diet_restrictions ? String(body.diet_restrictions).trim() : null;
  const dress_code = body.dress_code ? String(body.dress_code).trim() : null;
  const song_recommendations = body.song_recommendations ? String(body.song_recommendations).trim() : null;

  if (!access_code) {
    return NextResponse.json({ ok: false, error: "Missing access code" }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Find group
     const [groups] = await conn.execute(
       `SELECT group_id FROM \`groups\` WHERE access_code = ? LIMIT 1`,
       [access_code]
     );

     if (!groups.length) {
       await conn.rollback();
       return NextResponse.json({ ok: false, error: "Invalid access code" }, { status: 403 });
    }

    const group_id = groups[0].group_id;

    // Get all members of group
    const [members] = await conn.execute(
      `SELECT user_id, plus_one_allowed
       FROM users
       WHERE group_id = ?`,
      [group_id]
    );

    if (!members.length) {
      await conn.rollback();
      return NextResponse.json({ ok: false, error: "No users found for this group" }, { status: 404 });
    }

    const memberById = new Map(members.map(m => [Number(m.user_id), m]));
    const plusOneEntries = Object.entries(plus_ones);

    // Validate every plus-one entry
    for (const [uidStr, guestNameRaw] of plusOneEntries) {
      const uid = Number(uidStr);
      const guestName = String(guestNameRaw ?? "").trim();

      if (!Number.isInteger(uid)) {
        await conn.rollback();
        return NextResponse.json({ ok: false, error: "Invalid plus_ones key (user_id)" }, { status: 400 });
      }

      const member = memberById.get(uid);
      if (!member) {
        await conn.rollback();
        return NextResponse.json({ ok: false, error: "Plus-one user must be in the group" }, { status: 403 });
      }

      if (Number(member.plus_one_allowed) !== 1) {
        await conn.rollback();
        return NextResponse.json({ ok: false, error: "Plus-one not allowed for one of the selected users" }, { status: 403 });
      }

      if (guestName.length === 0) {
        await conn.rollback();
        return NextResponse.json({ ok: false, error: "Plus-one name cannot be empty" }, { status: 400 });
      }
    }

    // Make sure the submitted attending_user_ids are all in this group
    const memberIdSet = new Set(members.map((m) => Number(m.user_id)));
    for (const id of attending_user_ids) {
      if (!memberIdSet.has(Number(id))) {
        await conn.rollback();
        return NextResponse.json({ ok: false, error: "Invalid member selection" }, { status: 403 });
      }
    }

    // Choose a "submitter" user_id for the rsvps table uniqueness.
    // Because your schema is 1 RSVP row per user_id, we will:
    // - delete existing RSVP rows for the group
    // - re-insert rows for all members (attending 1/0)
    //
    // (This is simplest now; later you can redesign to 1 RSVP per group.)
    const [existing] = await conn.execute(
      `SELECT id FROM rsvps r
       JOIN users u ON u.user_id = r.user_id
       WHERE u.group_id = ? LIMIT 1`,
      [group_id]
    );

    const attendingSet = new Set(attending_user_ids.map((x) => Number(x)));

    const upsertSql = `
      INSERT INTO rsvps
        (user_id, attending, plus_one, plus_one_name, diet_restrictions, dress_code, song_recommendations)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        attending = VALUES(attending),
        plus_one = VALUES(plus_one),
        plus_one_name = VALUES(plus_one_name),
        diet_restrictions = VALUES(diet_restrictions),
        dress_code = VALUES(dress_code),
        song_recommendations = VALUES(song_recommendations)
    `;

    for (const m of members) {
      const uid = Number(m.user_id);
      const attending = attendingSet.has(uid) ? 1 : 0;

      const guestName = plus_ones[uid] ?? plus_ones[String(uid)] ?? null;
      const normalizedGuestName = guestName ? String(guestName).trim() : "";

      const rowPlusOneAllowedByAttendance = attending === 1;
      const rowPlusOne = rowPlusOneAllowedByAttendance && normalizedGuestName.length > 0 ? 1 : 0;
      const rowPlusOneName = rowPlusOne ? normalizedGuestName : null;

      await conn.execute(upsertSql, [
        uid,
        attending,
        rowPlusOne,
        rowPlusOneName,
        diet_restrictions,
        dress_code,
        song_recommendations,
      ]);
    }

    // Save song request to song_requests table if provided
    const song_title = body.song_title ? String(body.song_title).trim() : null;
    const song_artist = body.song_artist ? String(body.song_artist).trim() : null;

    if (song_title) {
      await conn.execute(
        `INSERT INTO song_requests (group_id, song_title, artist) VALUES (?, ?, ?)`,
        [group_id, song_title, song_artist]
      );
    }

    await conn.commit();

    return NextResponse.json({
      ok: true,
      modified: existing.length > 0,
      created: existing.length === 0,
    });
  } catch (e) {
    await conn.rollback();
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  } finally {
    conn.release();
  }
}

// // GET /api/rsvp (admin later)
// export async function GET() {
//   return NextResponse.json(
//     { ok: false, error: "Admin GET not implemented yet" },
//     { status: 501 }
//   );
// }