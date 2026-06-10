import { NextResponse } from "next/server";
import pool from "@/lib/db";
import {
  GUEST_GROUP_COOKIE,
  readGuestGroupId,
  parseGroupId,
  fetchGroupPayload,
} from "@/lib/groups";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 14; // 14 days

// GET /api/guest-group
// Returns the group the guest previously identified as (remembered in a cookie),
// or { group: null } if they haven't picked their family yet.
export async function GET(req) {
  const groupId = readGuestGroupId(req);
  if (!groupId) {
    return NextResponse.json({ ok: true, group: null });
  }

  const conn = await pool.getConnection();
  try {
    const payload = await fetchGroupPayload(conn, groupId);
    if (!payload) {
      // Stale cookie (group deleted) — clear it.
      const res = NextResponse.json({ ok: true, group: null });
      res.cookies.set({ name: GUEST_GROUP_COOKIE, value: "", path: "/", maxAge: 0 });
      return res;
    }
    return NextResponse.json(payload);
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}

// POST /api/guest-group  { group_id }
// Remembers the guest's chosen family for the session and returns its full
// RSVP payload so the caller can render immediately.
export async function POST(req) {
  const body = await req.json().catch(() => null);
  const groupId = parseGroupId(body?.group_id);
  if (!groupId) {
    return NextResponse.json(
      { ok: false, error: "Missing or invalid group" },
      { status: 400 }
    );
  }

  const conn = await pool.getConnection();
  try {
    const payload = await fetchGroupPayload(conn, groupId);
    if (!payload) {
      return NextResponse.json(
        { ok: false, error: "We couldn't find that family. Please try again." },
        { status: 404 }
      );
    }

    const res = NextResponse.json(payload);
    res.cookies.set({
      name: GUEST_GROUP_COOKIE,
      value: String(groupId),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
    return res;
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}

// DELETE /api/guest-group — forget the remembered family ("not your family?").
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: GUEST_GROUP_COOKIE, value: "", path: "/", maxAge: 0 });
  return res;
}
