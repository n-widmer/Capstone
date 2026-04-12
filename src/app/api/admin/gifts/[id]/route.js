import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PUT(req, { params }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body || !body.guest_name) {
    return NextResponse.json({ error: "Guest name is required" }, { status: 400 });
  }
  const VALID_TYPES = ["gift", "card", "cash"];
  if (body.gift_type && !VALID_TYPES.includes(body.gift_type)) {
    return NextResponse.json({ error: "Invalid gift type" }, { status: 400 });
  }
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId) || parsedId < 1) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
  const amount = body.amount !== "" && body.amount != null ? Number(body.amount) : null;

  const conn = await pool.getConnection();
  try {
    await conn.execute(
      "UPDATE gifts SET guest_name = ?, gift_type = ?, description = ?, amount = ?, thank_you_sent = ?, notes = ? WHERE id = ?",
      [
        body.guest_name,
        body.gift_type || "gift",
        body.description || null,
        amount,
        body.thank_you_sent ? 1 : 0,
        body.notes || null,
        parsedId,
      ]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[gifts PUT] error:", e);
    return NextResponse.json({ error: "An error occurred." }, { status: 500 });
  } finally {
    conn.release();
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId) || parsedId < 1) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
  const conn = await pool.getConnection();
  try {
    await conn.execute("DELETE FROM gifts WHERE id = ?", [parsedId]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[gifts DELETE] error:", e);
    return NextResponse.json({ error: "An error occurred." }, { status: 500 });
  } finally {
    conn.release();
  }
}
