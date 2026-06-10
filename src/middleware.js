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

  // guest access protection — skip static assets and public routes
  const isStaticFile = /\.(jpg|jpeg|png|gif|svg|webp|ico|woff2?|ttf|eot|mp4|webm)$/i.test(path);
  const isPublicApi =
    path === "/api/guest-session" || // the access-code gate itself
    path.startsWith("/api/auth");    // next-auth endpoints
  if (
    isStaticFile ||
    path.startsWith("/_next") ||
    path === "/favicon.ico" ||
    isPublicApi ||
    path === "/access" ||      // access code entry page
    path.startsWith("/admin") ||
    path.startsWith("/tulips")  // public tulip images
  ) {
    return NextResponse.next();
  }

  // if admin is logged in, bypass access gate (e.g. previewing guest pages)
  const adminToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (adminToken) {
    return NextResponse.next();
  }

  // Everything else — including the guest data APIs — requires the universal
  // access code. Without it, redirect pages to /access and reject API calls.
  const guestCookie = req.cookies.get(GUEST_COOKIE)?.value;
  if (!guestCookie) {
    if (path.startsWith("/api")) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
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
