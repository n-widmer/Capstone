import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET — return all lodging embeds
export async function GET() {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      `SELECT e.id, e.embed_id, e.label, e.display_order,
              EXISTS(SELECT 1 FROM lodging_reservations lr WHERE lr.lodging_embed_id = e.id) AS is_reserved
       FROM lodging_embeds e
       ORDER BY e.display_order ASC, e.created_at ASC`
    );
    return NextResponse.json({ ok: true, embeds: rows });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  } finally {
    conn.release();
  }
}

// POST — add a new embed 
export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });

  const { embed_code, label } = body;
  if (!embed_code) return NextResponse.json({ ok: false, error: "Missing embed code" }, { status: 400 });

  const match = embed_code.match(/data-id="(\d+)"/);
  if (!match) return NextResponse.json({ ok: false, error: "Could not find a valid Airbnb data-id in the embed code" }, { status: 400 });

  const embed_id = match[1];

  const conn = await pool.getConnection();
  try {
    const [existing] = await conn.execute(
      `SELECT id FROM lodging_embeds WHERE embed_id = ? LIMIT 1`,
      [embed_id]
    );
    if (existing.length) {
      return NextResponse.json({ ok: false, error: "This Airbnb listing has already been added" }, { status: 409 });
    }
    await conn.execute(
      `INSERT INTO lodging_embeds (embed_id, label) VALUES (?, ?)`,
      [embed_id, label || null]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  } finally {
    conn.release();
  }
}

// DELETE — remove an embed by id 
export async function DELETE(req) {
  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

  const conn = await pool.getConnection();
  try {
    // remove any reservation first, then the listing
    await conn.execute(`DELETE FROM lodging_reservations WHERE lodging_embed_id = ?`, [id]);
    await conn.execute(`DELETE FROM lodging_embeds WHERE id = ?`, [id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  } finally {
    conn.release();
  }
}
