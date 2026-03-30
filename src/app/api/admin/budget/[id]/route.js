import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PUT(req, { params }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    await conn.execute(
      "UPDATE expenses SET category = ?, description = ?, amount = ?, paid = ? WHERE id = ?",
      [body.category, body.description || null, Number(body.amount), body.paid ? 1 : 0, id]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[budget PUT] error:", e);
    return NextResponse.json({ error: "An error occurred." }, { status: 500 });
  } finally {
    conn.release();
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const conn = await pool.getConnection();
  try {
    await conn.execute("DELETE FROM expenses WHERE id = ?", [id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[budget DELETE] error:", e);
    return NextResponse.json({ error: "An error occurred." }, { status: 500 });
  } finally {
    conn.release();
  }
}
