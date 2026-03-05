import { NextResponse } from "next/server";

// GET /api/groups — fetch group info by access code
export async function GET() {
  // TODO: look up group + members by access code
  return NextResponse.json({ message: "Groups endpoint — not yet implemented" }, { status: 501 });
}
