import { NextResponse } from "next/server";
import pool from "@/lib/db";

const GUEST_COOKIE = "guest_session";

export async function POST(req) {
  const body = await req.json().catch(() => null);
  const access_code = (body?.access_code || "").trim();

  if (!access_code) {
    return NextResponse.json({ ok: false, error: "Missing access code" }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      "SELECT group_id FROM `groups` WHERE access_code = ? LIMIT 1",
      [access_code]
    );
    if (!rows.length) {
      return NextResponse.json({ ok: false, error: "Invalid access code" }, { status: 403 });
    }

    const res = NextResponse.json({ ok: true });

    res.cookies.set({
      name: GUEST_COOKIE,
      value: access_code,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });

    return res;
  } finally {
    conn.release();
  }
}