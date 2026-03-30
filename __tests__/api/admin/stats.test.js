/**
 * @jest-environment node
 */
import { GET } from "@/app/api/admin/stats/route";

const { mockExecute, mockRelease } = require("../../mocks/db");

jest.mock("@/lib/db", () => {
  const { pool } = require("../../mocks/db");
  return { __esModule: true, default: pool };
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/admin/stats", () => {
  function setupMockStats({
    total_invited = 50,
    total_responded = 30,
    total_attending = 25,
    total_declined = 5,
    total_plus_ones = 3,
    total_families = 15,
    families_responded = 10,
    dietary = [],
    families = [],
  } = {}) {
    mockExecute
      .mockResolvedValueOnce([[{ total_invited }]])
      .mockResolvedValueOnce([[{ total_responded }]])
      .mockResolvedValueOnce([[{ total_attending }]])
      .mockResolvedValueOnce([[{ total_declined }]])
      .mockResolvedValueOnce([[{ total_plus_ones }]])
      .mockResolvedValueOnce([[{ total_families }]])
      .mockResolvedValueOnce([[{ families_responded }]])
      .mockResolvedValueOnce([dietary])
      .mockResolvedValueOnce([families]);
  }

  it("returns correct total_invited count", async () => {
    setupMockStats({ total_invited: 185 });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.total_invited).toBe(185);
  });

  it("returns correct total_attending count", async () => {
    setupMockStats({ total_attending: 42 });

    const res = await GET();
    const data = await res.json();

    expect(data.total_attending).toBe(42);
  });

  it("calculates not_responded correctly", async () => {
    setupMockStats({ total_invited: 50, total_responded: 30 });

    const res = await GET();
    const data = await res.json();

    expect(data.not_responded).toBe(20);
  });

  it("returns families array with per-family breakdown", async () => {
    setupMockStats({
      families: [
        { family_name: "Brady", group_id: 1, member_count: 4, responded_count: 3, attending_count: 2 },
        { family_name: "Smith", group_id: 2, member_count: 2, responded_count: 0, attending_count: 0 },
      ],
    });

    const res = await GET();
    const data = await res.json();

    expect(data.families).toHaveLength(2);
    expect(data.families[0].family_name).toBe("Brady");
    expect(data.families[1].attending_count).toBe(0);
  });

  it("handles zero RSVPs gracefully", async () => {
    setupMockStats({
      total_invited: 50,
      total_responded: 0,
      total_attending: 0,
      total_declined: 0,
      total_plus_ones: 0,
    });

    const res = await GET();
    const data = await res.json();

    expect(data.total_responded).toBe(0);
    expect(data.not_responded).toBe(50);
  });

  it("returns dietary restrictions breakdown", async () => {
    setupMockStats({
      dietary: [
        { diet_restrictions: "Vegetarian", count: 5 },
        { diet_restrictions: "Gluten-free", count: 2 },
      ],
    });

    const res = await GET();
    const data = await res.json();

    expect(data.dietary).toHaveLength(2);
    expect(data.dietary[0].diet_restrictions).toBe("Vegetarian");
    expect(data.dietary[0].count).toBe(5);
  });

  it("returns 500 on database error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("Connection lost"));

    const res = await GET();
    expect(res.status).toBe(500);
    expect(mockRelease).toHaveBeenCalled();
  });
});
