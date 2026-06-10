/**
 * @jest-environment node
 */
import { POST } from "@/app/api/rsvp/route";

const { mockExecute, mockRelease, mockGetConnection } = require("../mocks/db");

jest.mock("@/lib/db", () => {
  const { pool } = require("../mocks/db");
  return { __esModule: true, default: pool };
});

beforeEach(() => {
  jest.clearAllMocks();
  // Reset the connection mock to include transaction methods
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
  return new Request("http://localhost/api/rsvp", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/rsvp", () => {
  it("returns 400 for invalid JSON", async () => {
    const res = await POST(makeRequest("not json"));
    expect(res.status).toBe(400);
  });

  it("returns 400 for missing group", async () => {
    const res = await POST(makeRequest({ attending_user_ids: [1] }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("group");
  });

  it("returns 404 when the group has no members", async () => {
    mockExecute.mockResolvedValueOnce([[]]); // no members

    const res = await POST(makeRequest({ group_id: 999, attending_user_ids: [] }));
    expect(res.status).toBe(404);
  });

  it("creates RSVP rows for group members", async () => {
    mockExecute
      .mockResolvedValueOnce([[{ user_id: 1, plus_one_allowed: 0 }, { user_id: 2, plus_one_allowed: 0 }]]) // members
      .mockResolvedValueOnce([[]]) // no existing RSVPs
      .mockResolvedValueOnce([{ affectedRows: 1 }]) // upsert user 1
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // upsert user 2

    const res = await POST(makeRequest({
      group_id: 1,
      attending_user_ids: [1],
    }));

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.created).toBe(true);
  });

  it("returns modified: true on re-submission", async () => {
    mockExecute
      .mockResolvedValueOnce([[{ user_id: 1, plus_one_allowed: 0 }]]) // members
      .mockResolvedValueOnce([[{ id: 99 }]]) // existing RSVP found
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await POST(makeRequest({
      group_id: 1,
      attending_user_ids: [1],
    }));

    const data = await res.json();
    expect(data.modified).toBe(true);
    expect(data.created).toBe(false);
  });

  it("rejects plus-one for user not in group", async () => {
    mockExecute
      .mockResolvedValueOnce([[{ user_id: 1, plus_one_allowed: 1 }]]); // members

    const res = await POST(makeRequest({
      group_id: 1,
      attending_user_ids: [1],
      plus_ones: { 999: "Ghost Guest" },
    }));

    expect(res.status).toBe(403);
  });

  it("rejects plus-one when not allowed for user", async () => {
    mockExecute
      .mockResolvedValueOnce([[{ user_id: 1, plus_one_allowed: 0 }]]); // members

    const res = await POST(makeRequest({
      group_id: 1,
      attending_user_ids: [1],
      plus_ones: { 1: "Extra Guest" },
    }));

    expect(res.status).toBe(403);
  });

  it("rejects plus-one with empty name", async () => {
    mockExecute
      .mockResolvedValueOnce([[{ user_id: 1, plus_one_allowed: 1 }]]); // members

    const res = await POST(makeRequest({
      group_id: 1,
      attending_user_ids: [1],
      plus_ones: { 1: "" },
    }));

    expect(res.status).toBe(400);
  });

  it("rejects attending_user_ids not in the group", async () => {
    mockExecute
      .mockResolvedValueOnce([[{ user_id: 1, plus_one_allowed: 0 }]]); // members

    const res = await POST(makeRequest({
      group_id: 1,
      attending_user_ids: [1, 999],
    }));

    expect(res.status).toBe(403);
  });

  it("saves song request when provided", async () => {
    mockExecute
      .mockResolvedValueOnce([[{ user_id: 1, plus_one_allowed: 0 }]]) // members
      .mockResolvedValueOnce([[]]) // no existing
      .mockResolvedValueOnce([{ affectedRows: 1 }]) // upsert
      .mockResolvedValueOnce([{ insertId: 1 }]); // song insert

    const res = await POST(makeRequest({
      group_id: 1,
      attending_user_ids: [1],
      song_title: "September",
      song_artist: "Earth Wind & Fire",
    }));

    expect(res.status).toBe(200);
    // members, existing-check, upsert, song insert
    expect(mockExecute).toHaveBeenCalledTimes(4);
  });

  it("stores each attending member's own dietary restriction", async () => {
    mockExecute
      .mockResolvedValueOnce([[{ user_id: 1, plus_one_allowed: 0 }, { user_id: 2, plus_one_allowed: 0 }]]) // members
      .mockResolvedValueOnce([[]]) // no existing
      .mockResolvedValueOnce([{ affectedRows: 1 }]) // upsert user 1
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // upsert user 2

    const res = await POST(makeRequest({
      group_id: 1,
      attending_user_ids: [1, 2],
      diets: { 1: "Allergic to shellfish", 2: "" },
    }));

    expect(res.status).toBe(200);

    // The per-member diet is the 5th positional param of each rsvps upsert.
    const upserts = mockExecute.mock.calls.filter(([sql]) => /INSERT INTO\s+rsvps/i.test(sql));
    const dietByUid = Object.fromEntries(upserts.map(([, params]) => [params[0], params[4]]));
    expect(dietByUid[1]).toBe("Allergic to shellfish");
    expect(dietByUid[2]).toBeNull(); // empty input → no restriction
  });

  it("does not store a dietary restriction for a non-attending member", async () => {
    mockExecute
      .mockResolvedValueOnce([[{ user_id: 1, plus_one_allowed: 0 }]]) // members
      .mockResolvedValueOnce([[]]) // no existing
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // upsert user 1

    const res = await POST(makeRequest({
      group_id: 1,
      attending_user_ids: [], // user 1 not attending
      diets: { 1: "Vegetarian" },
    }));

    expect(res.status).toBe(200);
    const upserts = mockExecute.mock.calls.filter(([sql]) => /INSERT INTO\s+rsvps/i.test(sql));
    expect(upserts[0][1][4]).toBeNull(); // diet cleared when not attending
  });
});
