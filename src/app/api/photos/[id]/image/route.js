import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/photos/:id/image — serve photo binary from database
export async function GET(_req, { params }) {
  const { id } = await params;

  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: "Invalid photo ID" }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      "SELECT image_data, mime_type FROM photos WHERE id = ? LIMIT 1",
      [id]
    );

    if (!rows.length || !rows[0].image_data) {
      return new NextResponse("Not found", { status: 404 });
    }

    const { image_data, mime_type } = rows[0];

    return new NextResponse(image_data, {
      headers: {
        "Content-Type": mime_type || "image/jpeg",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } finally {
    conn.release();
  }
}
