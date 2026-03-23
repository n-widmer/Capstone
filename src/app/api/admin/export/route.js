import { NextResponse } from "next/server";
import pool from "@/lib/db";

function escapeCSV(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function csvResponse(rows, filename) {
  const csv = rows.map((r) => r.map(escapeCSV).join(",")).join("\n");
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

async function exportGuests(conn) {
  const [rows] = await conn.execute(
    `SELECT g.family_name,
            u.first_name, u.last_name,
            r.attending, r.plus_one, r.plus_one_name,
            r.diet_restrictions, r.dress_code, r.song_recommendations
     FROM \`groups\` g
     JOIN users u ON u.group_id = g.group_id
     LEFT JOIN rsvps r ON r.user_id = u.user_id
     ORDER BY g.family_name, u.last_name, u.first_name`
  );

  const header = [
    "Family",
    "First Name",
    "Last Name",
    "Attending",
    "Plus One",
    "Plus One Name",
    "Dietary Restrictions",
    "Dress Code",
    "Song Recommendations",
  ];

  const data = rows.map((r) => [
    r.family_name,
    r.first_name,
    r.last_name,
    r.attending === null ? "No Response" : Number(r.attending) === 1 ? "Yes" : "No",
    Number(r.plus_one) === 1 ? "Yes" : "No",
    r.plus_one_name || "",
    r.diet_restrictions || "",
    r.dress_code || "",
    r.song_recommendations || "",
  ]);

  return csvResponse([header, ...data], "guests.csv");
}

async function exportDietary(conn) {
  const [rows] = await conn.execute(
    `SELECT g.family_name,
            u.first_name, u.last_name,
            r.diet_restrictions
     FROM rsvps r
     JOIN users u ON u.user_id = r.user_id
     JOIN \`groups\` g ON g.group_id = u.group_id
     WHERE r.diet_restrictions IS NOT NULL AND r.diet_restrictions != ''
     ORDER BY g.family_name, u.last_name, u.first_name`
  );

  const header = ["Family", "First Name", "Last Name", "Dietary Restrictions"];

  const data = rows.map((r) => [
    r.family_name,
    r.first_name,
    r.last_name,
    r.diet_restrictions,
  ]);

  return csvResponse([header, ...data], "dietary_restrictions.csv");
}

async function exportSongs(conn) {
  const [rows] = await conn.execute(
    `SELECT s.song_title, s.artist, s.votes, g.family_name
     FROM song_requests s
     JOIN \`groups\` g ON g.group_id = s.group_id
     ORDER BY s.votes DESC, s.song_title`
  );

  const header = ["Song Title", "Artist", "Votes", "Requested By Family"];

  const data = rows.map((r) => [
    r.song_title,
    r.artist || "",
    r.votes,
    r.family_name,
  ]);

  return csvResponse([header, ...data], "song_requests.csv");
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (!type || !["guests", "dietary", "songs"].includes(type)) {
    return NextResponse.json(
      { error: 'Invalid type. Use ?type=guests, ?type=dietary, or ?type=songs' },
      { status: 400 }
    );
  }

  const conn = await pool.getConnection();
  try {
    switch (type) {
      case "guests":
        return await exportGuests(conn);
      case "dietary":
        return await exportDietary(conn);
      case "songs":
        return await exportSongs(conn);
    }
  } catch (e) {
    return NextResponse.json(
      { error: String(e?.message || e) },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
