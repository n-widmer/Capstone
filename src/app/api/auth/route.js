import { NextResponse } from "next/server";

// POST /api/auth — validate access code or admin login
export async function POST() {
  // TODO: implement access code / admin authentication
  return NextResponse.json({ message: "Auth endpoint — not yet implemented" }, { status: 501 });
}
