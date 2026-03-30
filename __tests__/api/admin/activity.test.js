/**
 * @jest-environment node
 */
import { GET } from "@/app/api/admin/activity/route";

const { mockExecute, mockRelease } = require("../../mocks/db");

jest.mock("@/lib/db", () => {
  const { pool } = require("../../mocks/db");
  return { __esModule: true, default: pool };
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/admin/activity", () => {
  it("returns array of recent activity", async () => {
    mockExecute.mockResolvedValueOnce([
      [
        {
          id: 1,
          attending: 1,
          updated_at: "2026-03-30T10:00:00",
          created_at: "2026-03-30T09:00:00",
          first_name: "Layla",
          last_name: "Brady",
          family_name: "Brady",
          group_id: 1,
          attending_count: 2,
          member_count: 3,
        },
      ],
    ]);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.activity).toHaveLength(1);
    expect(data.activity[0].family_name).toBe("Brady");
    expect(data.activity[0].member_name).toBe("Layla Brady");
    expect(data.activity[0].attending).toBe(true);
    expect(data.activity[0].attending_count).toBe(2);
    expect(data.activity[0].member_count).toBe(3);
    expect(mockRelease).toHaveBeenCalled();
  });

  it("returns empty array when no RSVPs exist", async () => {
    mockExecute.mockResolvedValueOnce([[]]);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.activity).toEqual([]);
  });

  it("identifies updated RSVPs with is_update flag", async () => {
    mockExecute.mockResolvedValueOnce([
      [
        {
          id: 1,
          attending: 1,
          updated_at: "2026-03-30T12:00:00",
          created_at: "2026-03-30T09:00:00",
          first_name: "Test",
          last_name: "User",
          family_name: "TestFamily",
          group_id: 1,
          attending_count: 1,
          member_count: 1,
        },
      ],
    ]);

    const res = await GET();
    const data = await res.json();

    expect(data.activity[0].is_update).toBe(true);
  });

  it("handles null updated_at gracefully", async () => {
    mockExecute.mockResolvedValueOnce([
      [
        {
          id: 1,
          attending: 0,
          updated_at: null,
          created_at: "2026-03-30T09:00:00",
          first_name: "Test",
          last_name: "User",
          family_name: "TestFamily",
          group_id: 1,
          attending_count: 0,
          member_count: 1,
        },
      ],
    ]);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.activity[0].attending).toBe(false);
    expect(data.activity[0].timestamp).toBe("2026-03-30T09:00:00");
  });

  it("returns 500 on database error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("DB error"));

    const res = await GET();
    expect(res.status).toBe(500);
  });
});
