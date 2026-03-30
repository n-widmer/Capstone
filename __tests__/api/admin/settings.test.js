/**
 * @jest-environment node
 */
import { GET, PUT } from "@/app/api/admin/settings/route";

const { mockExecute, mockRelease } = require("../../mocks/db");

jest.mock("@/lib/db", () => {
  const { pool } = require("../../mocks/db");
  return { __esModule: true, default: pool };
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/admin/settings", () => {
  it("returns all settings as key-value object", async () => {
    mockExecute.mockResolvedValueOnce([
      [
        { key_name: "rsvp_deadline", value: "2027-04-15" },
        { key_name: "wedding_budget", value: "25000" },
      ],
    ]);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.rsvp_deadline).toBe("2027-04-15");
    expect(data.wedding_budget).toBe("25000");
    expect(mockRelease).toHaveBeenCalled();
  });

  it("returns empty object when no settings exist", async () => {
    mockExecute.mockResolvedValueOnce([[]]);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({});
  });

  it("returns 500 on database error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("DB connection failed"));

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBeDefined();
  });
});

describe("PUT /api/admin/settings", () => {
  it("updates rsvp_deadline successfully", async () => {
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const req = new Request("http://localhost/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify({ key_name: "rsvp_deadline", value: "2027-05-01" }),
    });

    const res = await PUT(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
  });

  it("updates wedding_budget successfully", async () => {
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const req = new Request("http://localhost/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify({ key_name: "wedding_budget", value: "30000" }),
    });

    const res = await PUT(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
  });

  it("rejects invalid key_name not in whitelist", async () => {
    const req = new Request("http://localhost/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify({ key_name: "hacker_setting", value: "malicious" }),
    });

    const res = await PUT(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("Invalid");
  });

  it("rejects missing key_name", async () => {
    const req = new Request("http://localhost/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify({ value: "test" }),
    });

    const res = await PUT(req);
    expect(res.status).toBe(400);
  });

  it("rejects missing value", async () => {
    const req = new Request("http://localhost/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify({ key_name: "rsvp_deadline" }),
    });

    const res = await PUT(req);
    expect(res.status).toBe(400);
  });

  it("rejects malformed JSON body", async () => {
    const req = new Request("http://localhost/api/admin/settings", {
      method: "PUT",
      body: "not json",
      headers: { "Content-Type": "application/json" },
    });

    const res = await PUT(req);
    expect(res.status).toBe(400);
  });
});
