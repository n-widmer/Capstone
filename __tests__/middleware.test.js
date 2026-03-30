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

    const res = await middleware(createRequest("/api/admin/budget"));

    expect(res.status).toBe(200);
  });

  it("does not intercept non-admin routes", async () => {
    const res = await middleware(createRequest("/rsvp"));

    expect(res.status).toBe(200);
    expect(getToken).not.toHaveBeenCalled();
  });
});
