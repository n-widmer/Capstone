import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import pool from "@/lib/db";

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

// POST /api/photos/upload — FormData: file, access_code, caption
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
  const accessCode = (formData.get("access_code") || "").toString().trim();
  const caption = (formData.get("caption") || "").toString().trim();

  if (!accessCode) {
    return NextResponse.json(
      { ok: false, error: "Missing access code" },
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
    // Validate access code
    const [groups] = await conn.execute(
      `SELECT group_id FROM \`groups\` WHERE access_code = ? LIMIT 1`,
      [accessCode]
    );

    if (!groups.length) {
      return NextResponse.json(
        { ok: false, error: "Invalid access code" },
        { status: 404 }
      );
    }

    const groupId = groups[0].group_id;

    // Generate unique filename
    const random = Math.random().toString(36).slice(2, 10);
    const filename = `${Date.now()}-${random}.${ext}`;

    // Ensure gallery directory exists
    const galleryDir = path.join(process.cwd(), "public", "gallery");
    await mkdir(galleryDir, { recursive: true });

    // Write file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(galleryDir, filename), buffer);

    // Insert into database
    await conn.execute(
      `INSERT INTO photos (filename, uploaded_by_group_id, caption, category, approved, created_at)
       VALUES (?, ?, ?, 'guest', FALSE, NOW())`,
      [filename, groupId, caption || null]
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
