/**
 * @jest-environment node
 */
import { POST } from "@/app/api/songs/vote/route";

const { mockExecute, mockRelease, mockGetConnection } = require("../mocks/db");

jest.mock("@/lib/db", () => {
  const { pool } = require("../mocks/db");
  return { __esModule: true, default: pool };
});

beforeEach(() => {
  jest.clearAllMocks();
  const conn = {
    execute: mockExecute,
    release: mockRelease,
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
  };
  mockGetConnection.mockResolvedValue(conn);
});

function makeRequest(body) {
  return new Request("http://localhost/api/songs/vote", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/songs/vote", () => {
  it("returns 400 for missing group", async () => {
    const res = await POST(makeRequest({ song_id: 1 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for missing song_id", async () => {
    const res = await POST(makeRequest({ group_id: 1 }));
    expect(res.status).toBe(400);
  });

  it("returns 404 for an unknown group", async () => {
    mockExecute.mockResolvedValueOnce([[]]); // no group

    const res = await POST(makeRequest({ group_id: 999, song_id: 1 }));
    expect(res.status).toBe(404);
  });

  it("returns 404 for nonexistent song", async () => {
    mockExecute
      .mockResolvedValueOnce([[{ group_id: 1 }]]) // group found
      .mockResolvedValueOnce([[]]); // song not found

    const res = await POST(makeRequest({ group_id: 1, song_id: 999 }));
    expect(res.status).toBe(404);
  });

  it("adds vote and returns action: voted", async () => {
    mockExecute
      .mockResolvedValueOnce([[{ group_id: 1 }]]) // group
      .mockResolvedValueOnce([[{ id: 1, votes: 2 }]]) // song exists
      .mockResolvedValueOnce([[]]) // no existing vote
      .mockResolvedValueOnce([[{ vote_count: 2 }]]) // under limit
      .mockResolvedValueOnce([{ affectedRows: 1 }]) // insert vote
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // increment votes

    const res = await POST(makeRequest({ group_id: 1, song_id: 1 }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.action).toBe("voted");
  });

  it("removes vote and returns action: unvoted", async () => {
    mockExecute
      .mockResolvedValueOnce([[{ group_id: 1 }]]) // group
      .mockResolvedValueOnce([[{ id: 1, votes: 3 }]]) // song exists
      .mockResolvedValueOnce([[{ id: 10 }]]) // existing vote found
      .mockResolvedValueOnce([{ affectedRows: 1 }]) // delete vote
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // decrement votes

    const res = await POST(makeRequest({ group_id: 1, song_id: 1 }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.action).toBe("unvoted");
  });

  it("enforces max 5 votes per group", async () => {
    mockExecute
      .mockResolvedValueOnce([[{ group_id: 1 }]]) // group
      .mockResolvedValueOnce([[{ id: 1, votes: 0 }]]) // song exists
      .mockResolvedValueOnce([[]]) // no existing vote
      .mockResolvedValueOnce([[{ vote_count: 5 }]]); // at limit

    const res = await POST(makeRequest({ group_id: 1, song_id: 1 }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("5 votes");
  });

  it("returns 400 for invalid JSON", async () => {
    const req = new Request("http://localhost/api/songs/vote", {
      method: "POST",
      body: "not json",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
