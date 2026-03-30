/**
 * @jest-environment node
 */
import { GET, POST } from "@/app/api/admin/budget/route";
import { PUT, DELETE } from "@/app/api/admin/budget/[id]/route";

const { mockExecute, mockRelease } = require("../../mocks/db");

jest.mock("@/lib/db", () => {
  const { pool } = require("../../mocks/db");
  return { __esModule: true, default: pool };
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/admin/budget", () => {
  it("returns all expenses", async () => {
    mockExecute.mockResolvedValueOnce([
      [
        { id: 1, category: "Venue", description: "Deposit", amount: 5000, paid: 1 },
        { id: 2, category: "Catering", description: "Theo's", amount: 6000, paid: 0 },
      ],
    ]);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.expenses).toHaveLength(2);
    expect(data.expenses[0].category).toBe("Venue");
    expect(mockRelease).toHaveBeenCalled();
  });

  it("returns empty array when no expenses", async () => {
    mockExecute.mockResolvedValueOnce([[]]);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.expenses).toEqual([]);
  });
});

describe("POST /api/admin/budget", () => {
  it("creates expense with all fields", async () => {
    mockExecute.mockResolvedValueOnce([{ insertId: 1 }]);

    const req = new Request("http://localhost/api/admin/budget", {
      method: "POST",
      body: JSON.stringify({
        category: "Venue",
        description: "Deposit for Yellowbrick",
        amount: 5000,
        paid: true,
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.id).toBe(1);
  });

  it("creates expense with only required fields", async () => {
    mockExecute.mockResolvedValueOnce([{ insertId: 2 }]);

    const req = new Request("http://localhost/api/admin/budget", {
      method: "POST",
      body: JSON.stringify({ category: "Other", amount: 100 }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
  });

  it("rejects missing category", async () => {
    const req = new Request("http://localhost/api/admin/budget", {
      method: "POST",
      body: JSON.stringify({ amount: 100 }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rejects missing amount", async () => {
    const req = new Request("http://localhost/api/admin/budget", {
      method: "POST",
      body: JSON.stringify({ category: "Venue" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rejects malformed JSON", async () => {
    const req = new Request("http://localhost/api/admin/budget", {
      method: "POST",
      body: "not json",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe("PUT /api/admin/budget/:id", () => {
  it("updates expense by ID", async () => {
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const req = new Request("http://localhost/api/admin/budget/1", {
      method: "PUT",
      body: JSON.stringify({
        category: "Venue",
        description: "Updated deposit",
        amount: 5500,
        paid: true,
      }),
    });

    const res = await PUT(req, { params: Promise.resolve({ id: "1" }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
  });

  it("rejects invalid body", async () => {
    const req = new Request("http://localhost/api/admin/budget/1", {
      method: "PUT",
      body: "not json",
    });

    const res = await PUT(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/admin/budget/:id", () => {
  it("deletes expense by ID", async () => {
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const req = new Request("http://localhost/api/admin/budget/1", {
      method: "DELETE",
    });

    const res = await DELETE(req, { params: Promise.resolve({ id: "1" }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
  });

  it("does not error on non-existent ID", async () => {
    mockExecute.mockResolvedValueOnce([{ affectedRows: 0 }]);

    const req = new Request("http://localhost/api/admin/budget/999", {
      method: "DELETE",
    });

    const res = await DELETE(req, { params: Promise.resolve({ id: "999" }) });
    expect(res.status).toBe(200);
  });
});
