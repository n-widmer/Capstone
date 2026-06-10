/**
 * @jest-environment node
 */
import { GET, POST } from "@/app/api/admin/gifts/route";

const { mockExecute, mockRelease } = require("../mocks/db");

jest.mock("@/lib/db", () => {
  const { pool } = require("../mocks/db");
  return { __esModule: true, default: pool };
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/admin/gifts", () => {
  it("returns all gifts", async () => {
    mockExecute.mockResolvedValueOnce([
      [
        { id: 1, guest_name: "Brady Family", gift_type: "gift", description: "Toaster", amount: null, notes: null, thank_you_sent: 0 },
        { id: 2, guest_name: "Aunt Sue", gift_type: "cash", description: null, amount: 100, notes: "In card", thank_you_sent: 1 },
      ],
    ]);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.gifts).toHaveLength(2);
    expect(data.gifts[0].guest_name).toBe("Brady Family");
    expect(mockRelease).toHaveBeenCalled();
  });

  it("returns empty array when no gifts", async () => {
    mockExecute.mockResolvedValueOnce([[]]);

    const res = await GET();
    const data = await res.json();

    expect(data.gifts).toEqual([]);
  });

  it("returns 500 on database error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("DB error"));

    const res = await GET();
    expect(res.status).toBe(500);
  });
});

describe("POST /api/admin/gifts", () => {
  function makeRequest(body) {
    return new Request("http://localhost/api/admin/gifts", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  it("creates gift with all fields", async () => {
    mockExecute.mockResolvedValueOnce([{ insertId: 1 }]);

    const res = await POST(makeRequest({
      guest_name: "Brady Family",
      gift_type: "gift",
      description: "KitchenAid Mixer",
      amount: 350,
      notes: "From registry",
    }));

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.id).toBe(1);
    expect(mockRelease).toHaveBeenCalled();
  });

  it("creates gift with only guest_name", async () => {
    mockExecute.mockResolvedValueOnce([{ insertId: 2 }]);

    const res = await POST(makeRequest({ guest_name: "Uncle Bob" }));
    const data = await res.json();

    expect(data.ok).toBe(true);
  });

  it("defaults gift_type to 'gift'", async () => {
    mockExecute.mockResolvedValueOnce([{ insertId: 3 }]);

    await POST(makeRequest({ guest_name: "Test" }));

    // Verify the execute call used "gift" as default
    const insertCall = mockExecute.mock.calls[0];
    expect(insertCall[1][1]).toBe("gift"); // gift_type param
  });

  it("returns 400 when guest_name is missing", async () => {
    const res = await POST(makeRequest({ gift_type: "cash", amount: 50 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid gift_type", async () => {
    const res = await POST(makeRequest({ guest_name: "Test", gift_type: "invalid" }));
    expect(res.status).toBe(400);
  });

  it("handles null amount correctly", async () => {
    mockExecute.mockResolvedValueOnce([{ insertId: 4 }]);

    const res = await POST(makeRequest({ guest_name: "Test", amount: "" }));
    expect(res.status).toBe(200);
  });

  it("returns 400 for malformed JSON", async () => {
    const req = new Request("http://localhost/api/admin/gifts", {
      method: "POST",
      body: "not json",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
