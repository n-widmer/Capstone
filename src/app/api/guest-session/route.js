import { NextResponse } from "next/server";
import { getGuestAccessCode, codesMatch } from "@/lib/accessCode";

const GUEST_COOKIE = "guest_session";

// POST /api/guest-session  { access_code }
// Validates the single universal access code (configurable in admin settings)
// and, on success, sets the gate cookie that lets the guest browse the site.
export async function POST(req) {
  const body = await req.json().catch(() => null);
  const access_code = (body?.access_code || "").trim();

  if (!access_code) {
    return NextResponse.json({ ok: false, error: "Missing access code" }, { status: 400 });
  }

  const expected = await getGuestAccessCode();
  if (!codesMatch(access_code, expected)) {
    return NextResponse.json({ ok: false, error: "Invalid access code" }, { status: 403 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: GUEST_COOKIE,
    value: "ok",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  return res;
}
