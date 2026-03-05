import { NextResponse } from "next/server";

// GET /api/rsvp — fetch RSVP data (admin only)
export async function GET() {
  // TODO: fetch all RSVPs from database (requires admin auth)
  return NextResponse.json({ message: "RSVP GET endpoint — not yet implemented" }, { status: 501 });
}

// POST /api/rsvp — submit an RSVP
export async function POST() {
  // TODO: validate and insert RSVP into database
  return NextResponse.json({ message: "RSVP POST endpoint — not yet implemented" }, { status: 501 });
}
