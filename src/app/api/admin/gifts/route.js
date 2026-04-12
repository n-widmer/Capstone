import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      "SELECT * FROM gifts ORDER BY created_at DESC"
    );
    return NextResponse.json({ gifts: rows });
  } catch (e) {
    console.error("[gifts GET] error:", e);
    return NextResponse.json({ error: "An error occurred." }, { status: 500 });
  } finally {
    conn.release();
  }
}

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body || !body.guest_name) {
    return NextResponse.json({ error: "Guest name is required" }, { status: 400 });
  }
  const VALID_TYPES = ["gift", "card", "cash"];
  if (body.gift_type && !VALID_TYPES.includes(body.gift_type)) {
    return NextResponse.json({ error: "Invalid gift type" }, { status: 400 });
  }
  const amount = body.amount !== "" && body.amount != null ? Number(body.amount) : null;

  const conn = await pool.getConnection();
  try {
    const [result] = await conn.execute(
      "INSERT INTO gifts (guest_name, gift_type, description, amount, notes) VALUES (?, ?, ?, ?, ?)",
      [
        body.guest_name,
        body.gift_type || "gift",
        body.description || null,
        amount,
        body.notes || null,
      ]
    );
    return NextResponse.json({ ok: true, id: result.insertId });
  } catch (e) {
    console.error("[gifts POST] error:", e);
    return NextResponse.json({ error: "An error occurred." }, { status: 500 });
  } finally {
    conn.release();
  }
}
