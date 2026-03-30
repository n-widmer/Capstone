import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute("SELECT key_name, value FROM settings");
    const settings = {};
    for (const row of rows) {
      settings[row.key_name] = row.value;
    }
    return NextResponse.json(settings);
  } catch (e) {
    console.error("[settings GET] error:", e);
    return NextResponse.json({ error: "An error occurred." }, { status: 500 });
  } finally {
    conn.release();
  }
}

export async function PUT(req) {
  const body = await req.json().catch(() => null);
  if (!body || !body.key_name || body.value === undefined) {
    return NextResponse.json({ error: "Missing key_name or value" }, { status: 400 });
  }

  const allowed = ["rsvp_deadline", "wedding_budget"];
  if (!allowed.includes(body.key_name)) {
    return NextResponse.json({ error: "Invalid setting key" }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    await conn.execute(
      "INSERT INTO settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?",
      [body.key_name, String(body.value), String(body.value)]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[settings PUT] error:", e);
    return NextResponse.json({ error: "An error occurred." }, { status: 500 });
  } finally {
    conn.release();
  }
}
