import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      "SELECT * FROM expenses ORDER BY created_at DESC"
    );
    return NextResponse.json({ expenses: rows });
  } catch (e) {
    console.error("[budget GET] error:", e);
    return NextResponse.json({ error: "An error occurred." }, { status: 500 });
  } finally {
    conn.release();
  }
}

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body || !body.category || body.amount === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    const [result] = await conn.execute(
      "INSERT INTO expenses (category, description, amount, paid) VALUES (?, ?, ?, ?)",
      [body.category, body.description || null, Number(body.amount), body.paid ? 1 : 0]
    );
    return NextResponse.json({ ok: true, id: result.insertId });
  } catch (e) {
    console.error("[budget POST] error:", e);
    return NextResponse.json({ error: "An error occurred." }, { status: 500 });
  } finally {
    conn.release();
  }
}
