/**
 * @jest-environment node
 */
import { middleware } from "@/middleware";
import { NextRequest } from "next/server";

jest.mock("next-auth/jwt", () => ({
  getToken: jest.fn(),
}));

const { getToken } = require("next-auth/jwt");

beforeEach(() => {
  jest.clearAllMocks();
});

function createRequest(path) {
  return new NextRequest(new URL(path, "http://localhost:3000"));
}

describe("Auth Middleware", () => {
  it("blocks unauthenticated access to /admin and redirects to login", async () => {
    getToken.mockResolvedValueOnce(null);

    const res = await middleware(createRequest("/admin"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin/login");
  });

  it("blocks unauthenticated access to /api/admin/* and returns 401", async () => {
    getToken.mockResolvedValueOnce(null);

    const res = await middleware(createRequest("/api/admin/stats"));

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("allows access to /admin/login without auth", async () => {
    const res = await middleware(createRequest("/admin/login"));

    expect(res.status).toBe(200);
    expect(getToken).not.toHaveBeenCalled();
  });

  it("allows authenticated requests through to /admin", async () => {
    getToken.mockResolvedValueOnce({ name: "Admin", email: "admin@wedding.local" });

    const res = await middleware(createRequest("/admin"));

    expect(res.status).toBe(200);
  });

  it("allows authenticated requests through to /api/admin/*", async () => {
    getToken.mockResolvedValueOnce({ name: "Admin", email: "admin@wedding.local" });

    const res = await middleware(createRequest("/api/admin/stats"));

    expect(res.status).toBe(200);
  });

  it("does not intercept non-admin routes for admin auth", async () => {
    const req = createRequest("/rsvp");
    // Add guest cookie so it passes through the guest gate
    req.cookies.set("guest_session", "VALIDCODE");

    const res = await middleware(req);

    expect(res.status).toBe(200);
  });
});

describe("Guest Access Gate", () => {
  beforeEach(() => {
    getToken.mockResolvedValue(null);
  });

  it("redirects to /access when no guest_session cookie on /rsvp", async () => {
    const res = await middleware(createRequest("/rsvp"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/access");
    expect(res.headers.get("location")).toContain("next=%2Frsvp");
  });

  it("redirects to /access when no guest_session cookie on /menu", async () => {
    const res = await middleware(createRequest("/menu"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/access");
  });

  it("redirects to /access when no guest_session cookie on /photos", async () => {
    const res = await middleware(createRequest("/photos"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/access");
  });

  it("allows through with valid guest_session cookie", async () => {
    const req = createRequest("/rsvp");
    req.cookies.set("guest_session", "VALIDCODE");

    const res = await middleware(req);

    expect(res.status).toBe(200);
  });

  it("allows /access page without cookie", async () => {
    const res = await middleware(createRequest("/access"));

    expect(res.status).toBe(200);
  });

  it("blocks guest API routes without a guest_session and returns 401", async () => {
    const res = await middleware(createRequest("/api/rsvp"));

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("allows guest API routes through with a valid guest_session", async () => {
    const req = createRequest("/api/rsvp");
    req.cookies.set("guest_session", "ok");

    const res = await middleware(req);

    expect(res.status).toBe(200);
  });

  it("allows the gate endpoint /api/guest-session without a cookie", async () => {
    const res = await middleware(createRequest("/api/guest-session"));

    expect(res.status).toBe(200);
  });

  it("allows static image files through without cookie", async () => {
    const res = await middleware(createRequest("/hero-photo.jpg"));

    expect(res.status).toBe(200);
  });

  it("allows /tulips path through without cookie", async () => {
    const res = await middleware(createRequest("/tulips/WhiteTulip.png"));

    expect(res.status).toBe(200);
  });

  it("bypasses guest gate for admin-authenticated users", async () => {
    getToken.mockResolvedValueOnce({ name: "Admin", email: "admin@wedding.local" });

    const res = await middleware(createRequest("/rsvp"));

    expect(res.status).toBe(200);
  });

  it("preserves destination path in ?next= param", async () => {
    const res = await middleware(createRequest("/photos"));

    expect(res.status).toBe(307);
    const location = res.headers.get("location");
    expect(location).toContain("/access");
    expect(location).toContain("next=%2Fphotos");
  });
});
