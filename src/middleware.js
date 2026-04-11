import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const GUEST_COOKIE = "guest_session";

export async function middleware(req) {
  const path = req.nextUrl.pathname;

  // admin protection
  if (
    (path.startsWith("/admin") || path.startsWith("/api/admin")) &&
    !path.startsWith("/admin/login")
  ) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      if (path.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  // guest access protection
  if (
    path.startsWith("/_next") ||
    path === "/favicon.ico" ||
    path.startsWith("/api") || // let API routes handle their own auth (including /api/groups, /api/rsvp)
    path === "/access" ||      // access code entry page
    path.startsWith("/admin")
  ) {
    return NextResponse.next();
  }

  // if admin is logged in, bypass access gate
  const adminToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (adminToken) {
    return NextResponse.next();
  }

  // if no guest session cookie, redirect to /access and preserve destination
  const guestCookie = req.cookies.get(GUEST_COOKIE)?.value;
  if (!guestCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/access";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
