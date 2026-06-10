/**
 * @jest-environment node
 */
import { GET, POST } from "@/app/api/songs/route";

const { mockExecute, mockRelease } = require("../mocks/db");

jest.mock("@/lib/db", () => {
  const { pool } = require("../mocks/db");
  return { __esModule: true, default: pool };
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/songs", () => {
  function makeGetRequest(groupId) {
    const url = groupId
      ? `http://localhost/api/songs?group_id=${groupId}`
      : "http://localhost/api/songs";
    return new Request(url);
  }

  it("returns 400 without a group", async () => {
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(400);
  });

  it("returns 404 for an unknown group", async () => {
    mockExecute.mockResolvedValueOnce([[]]);

    const res = await GET(makeGetRequest(999));
    expect(res.status).toBe(404);
    expect(mockRelease).toHaveBeenCalled();
  });

  it("returns songs with vote counts", async () => {
    mockExecute
      .mockResolvedValueOnce([[{ group_id: 1, family_name: "Smith" }]]) // group lookup
      .mockResolvedValueOnce([[ // songs
        { id: 1, song_title: "September", artist: "EWF", votes: 3, requested_by: "Brady", voted_by_me: 1 },
        { id: 2, song_title: "Crazy in Love", artist: "Beyoncé", votes: 1, requested_by: "Smith", voted_by_me: 0 },
      ]])
      .mockResolvedValueOnce([[{ my_votes_used: 2 }]]); // vote count

    const res = await GET(makeGetRequest(1));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.songs).toHaveLength(2);
    expect(data.songs[0].voted_by_me).toBe(true);
    expect(data.songs[1].voted_by_me).toBe(false);
    expect(data.my_votes_used).toBe(2);
    expect(data.max_votes).toBe(5);
    expect(mockRelease).toHaveBeenCalled();
  });
});

describe("POST /api/songs", () => {
  function makePostRequest(body) {
    return new Request("http://localhost/api/songs", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  it("returns 400 without a group", async () => {
    const res = await POST(makePostRequest({ song_title: "Test" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 without song title", async () => {
    const res = await POST(makePostRequest({ group_id: 1 }));
    expect(res.status).toBe(400);
  });

  it("returns 404 for an unknown group", async () => {
    mockExecute.mockResolvedValueOnce([[]]);

    const res = await POST(makePostRequest({ group_id: 999, song_title: "Test" }));
    expect(res.status).toBe(404);
    expect(mockRelease).toHaveBeenCalled();
  });

  it("creates song request and returns song_id", async () => {
    mockExecute
      .mockResolvedValueOnce([[{ group_id: 1 }]])
      .mockResolvedValueOnce([{ insertId: 42 }]);

    const res = await POST(makePostRequest({
      group_id: 1,
      song_title: "September",
      artist: "Earth Wind & Fire",
    }));

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.song_id).toBe(42);
    expect(mockRelease).toHaveBeenCalled();
  });

  it("creates song without artist", async () => {
    mockExecute
      .mockResolvedValueOnce([[{ group_id: 1 }]])
      .mockResolvedValueOnce([{ insertId: 43 }]);

    const res = await POST(makePostRequest({
      group_id: 1,
      song_title: "Mystery Song",
    }));

    expect(res.status).toBe(200);
  });

  it("returns 400 for invalid JSON", async () => {
    const req = new Request("http://localhost/api/songs", {
      method: "POST",
      body: "not json",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
