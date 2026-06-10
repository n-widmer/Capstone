/**
 * @jest-environment node
 */
import { GET } from "@/app/api/lodging/route";

const { mockExecute, mockRelease } = require("../mocks/db");

jest.mock("@/lib/db", () => {
  const { pool } = require("../mocks/db");
  return { __esModule: true, default: pool };
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/lodging", () => {
  it("returns lodging embeds with reservation status", async () => {
    mockExecute.mockResolvedValueOnce([
      [
        { id: 1, embed_id: "abc123", label: "Lakeside Cabin", display_order: 1, is_reserved: 0 },
        { id: 2, embed_id: "def456", label: "Downtown Loft", display_order: 2, is_reserved: 1 },
      ],
    ]);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.embeds).toHaveLength(2);
    expect(data.embeds[0].label).toBe("Lakeside Cabin");
    expect(data.embeds[0].is_reserved).toBe(0);
    expect(data.embeds[1].is_reserved).toBe(1);
    expect(mockRelease).toHaveBeenCalled();
  });

  it("returns empty array when no listings", async () => {
    mockExecute.mockResolvedValueOnce([[]]);

    const res = await GET();
    const data = await res.json();

    expect(data.ok).toBe(true);
    expect(data.embeds).toEqual([]);
  });

  it("returns 500 on database error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("Connection lost"));

    const res = await GET();
    expect(res.status).toBe(500);
    expect(mockRelease).toHaveBeenCalled();
  });
});
