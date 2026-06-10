import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { parseGroupId, readGuestGroupId } from "@/lib/groups";

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

// POST /api/photos/upload — FormData: file, group_id, caption
export async function POST(req) {
  let formData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid form data" },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  const groupId = parseGroupId(formData.get("group_id")) || readGuestGroupId(req);
  const caption = (formData.get("caption") || "").toString().trim();

  if (!groupId) {
    return NextResponse.json(
      { ok: false, error: "Missing group" },
      { status: 400 }
    );
  }

  if (!file || typeof file === "string") {
    return NextResponse.json(
      { ok: false, error: "No file uploaded" },
      { status: 400 }
    );
  }

  // Validate file type
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { ok: false, error: "Only JPEG, PNG, and WebP images are allowed" },
      { status: 400 }
    );
  }

  // Validate file size
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { ok: false, error: "File size must be under 10 MB" },
      { status: 400 }
    );
  }

  const conn = await pool.getConnection();
  try {
    // Validate the group exists
    const [groups] = await conn.execute(
      `SELECT group_id FROM \`groups\` WHERE group_id = ? LIMIT 1`,
      [groupId]
    );

    if (!groups.length) {
      return NextResponse.json(
        { ok: false, error: "Group not found" },
        { status: 404 }
      );
    }

    // Generate unique filename (kept for reference)
    const random = Math.random().toString(36).slice(2, 10);
    const filename = `${Date.now()}-${random}.${ext}`;

    // Read file into buffer and store in database
    const buffer = Buffer.from(await file.arrayBuffer());

    await conn.execute(
      `INSERT INTO photos (filename, uploaded_by_group_id, caption, category, approved, created_at, image_data, mime_type)
       VALUES (?, ?, ?, 'guest', FALSE, NOW(), ?, ?)`,
      [filename, groupId, caption || null, buffer, file.type]
    );

    return NextResponse.json({ ok: true, filename });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
