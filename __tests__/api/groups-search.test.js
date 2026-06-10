/**
 * @jest-environment node
 */
import { GET } from "@/app/api/groups/search/route";

const { mockExecute, mockRelease } = require("../mocks/db");

jest.mock("@/lib/db", () => {
  const { pool } = require("../mocks/db");
  return { __esModule: true, default: pool };
});

beforeEach(() => {
  jest.clearAllMocks();
});

function makeRequest(q) {
  const url = q === undefined
    ? "http://localhost/api/groups/search"
    : `http://localhost/api/groups/search?q=${encodeURIComponent(q)}`;
  return new Request(url);
}

describe("GET /api/groups/search", () => {
  it("returns 400 when the query is too short", async () => {
    const res = await GET(makeRequest("a"));
    expect(res.status).toBe(400);
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it("returns an empty list when nothing matches", async () => {
    mockExecute.mockResolvedValueOnce([[]]); // no groups

    const res = await GET(makeRequest("zzzz"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.matches).toEqual([]);
    expect(mockRelease).toHaveBeenCalled();
  });

  it("returns matching groups with their members", async () => {
    mockExecute
      .mockResolvedValueOnce([[
        { group_id: 1, family_name: "Smith" },
        { group_id: 2, family_name: "Campbell" },
      ]])
      .mockResolvedValueOnce([[
        { group_id: 1, first_name: "John", last_name: "Smith" },
        { group_id: 1, first_name: "Jane", last_name: "Smith" },
        { group_id: 2, first_name: "Al", last_name: "Campbell" },
      ]]);

    const res = await GET(makeRequest("sm"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.matches).toHaveLength(2);
    expect(data.matches[0]).toEqual({
      group_id: 1,
      family_name: "Smith",
      members: ["John Smith", "Jane Smith"],
    });
    expect(data.matches[1].members).toEqual(["Al Campbell"]);
    expect(mockRelease).toHaveBeenCalled();
  });
});
