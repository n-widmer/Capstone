/**
 * @jest-environment node
 */
import { POST } from "@/app/api/guest-session/route";

const { mockExecute, mockRelease } = require("../mocks/db");

jest.mock("@/lib/db", () => {
  const { pool } = require("../mocks/db");
  return { __esModule: true, default: pool };
});

beforeEach(() => {
  jest.clearAllMocks();
});

function makeRequest(body) {
  return new Request("http://localhost/api/guest-session", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// The route reads the universal code from the settings table.
function mockConfiguredCode(code) {
  mockExecute.mockResolvedValueOnce([[{ value: code }]]);
}

describe("POST /api/guest-session", () => {
  it("returns 400 for missing access code", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Missing");
  });

  it("returns 400 for empty access code", async () => {
    const res = await POST(makeRequest({ access_code: "   " }));
    expect(res.status).toBe(400);
  });

  it("returns 403 for an incorrect access code", async () => {
    mockConfiguredCode("tori&connor");

    const res = await POST(makeRequest({ access_code: "BADCODE" }));
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain("Invalid");
    expect(mockRelease).toHaveBeenCalled();
  });

  it("returns 200 and sets the gate cookie for the correct code", async () => {
    mockConfiguredCode("tori&connor");

    const res = await POST(makeRequest({ access_code: "tori&connor" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(mockRelease).toHaveBeenCalled();
  });

  it("sets guest_session cookie with correct attributes", async () => {
    mockConfiguredCode("tori&connor");

    const res = await POST(makeRequest({ access_code: "tori&connor" }));
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("guest_session=ok");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Path=/");
  });

  it("matches the code case-insensitively and trims whitespace", async () => {
    mockConfiguredCode("tori&connor");

    const res = await POST(makeRequest({ access_code: "  Tori&Connor  " }));
    expect(res.status).toBe(200);
  });

  it("falls back to the default code when the setting is missing", async () => {
    mockExecute.mockResolvedValueOnce([[]]); // no setting row

    const res = await POST(makeRequest({ access_code: "tori&connor" }));
    expect(res.status).toBe(200);
  });
});
