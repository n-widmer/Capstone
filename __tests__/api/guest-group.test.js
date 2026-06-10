/**
 * @jest-environment node
 */
import { GET, POST } from "@/app/api/guest-group/route";

const { mockExecute, mockRelease } = require("../mocks/db");

jest.mock("@/lib/db", () => {
  const { pool } = require("../mocks/db");
  return { __esModule: true, default: pool };
});

beforeEach(() => {
  jest.clearAllMocks();
});

// fetchGroupPayload issues 4 queries: group, members, existing-rsvp, rsvp-meta.
function mockGroupPayload() {
  mockExecute
    .mockResolvedValueOnce([[{ group_id: 1, family_name: "Smith" }]]) // group
    .mockResolvedValueOnce([[
      { user_id: 1, first_name: "John", last_name: "Smith", plus_one_allowed: 0, attending: null, plus_one: null, plus_one_name: null },
    ]]) // members
    .mockResolvedValueOnce([[]]) // existing rsvp
    .mockResolvedValueOnce([[]]); // rsvp meta
}

describe("POST /api/guest-group", () => {
  function makeRequest(body) {
    return new Request("http://localhost/api/guest-group", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  it("returns 400 for a missing group_id", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns 404 when the group does not exist", async () => {
    mockExecute.mockResolvedValueOnce([[]]); // group lookup empty

    const res = await POST(makeRequest({ group_id: 999 }));
    expect(res.status).toBe(404);
    expect(mockRelease).toHaveBeenCalled();
  });

  it("remembers the group in a cookie and returns its payload", async () => {
    mockGroupPayload();

    const res = await POST(makeRequest({ group_id: 1 }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.group.family_name).toBe("Smith");
    expect(data.members).toHaveLength(1);
    expect(res.headers.get("set-cookie")).toContain("guest_group=1");
    expect(mockRelease).toHaveBeenCalled();
  });
});

describe("GET /api/guest-group", () => {
  it("returns group: null when no cookie is set", async () => {
    const req = new Request("http://localhost/api/guest-group");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.group).toBeNull();
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it("returns the remembered group's payload", async () => {
    mockGroupPayload();

    const req = new Request("http://localhost/api/guest-group", {
      headers: { cookie: "guest_group=1" },
    });
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.group.family_name).toBe("Smith");
  });

  it("clears a stale cookie when the group no longer exists", async () => {
    mockExecute.mockResolvedValueOnce([[]]); // group lookup empty

    const req = new Request("http://localhost/api/guest-group", {
      headers: { cookie: "guest_group=42" },
    });
    const res = await GET(req);
    const data = await res.json();

    expect(data.group).toBeNull();
    expect(res.headers.get("set-cookie")).toContain("guest_group=;");
  });
});
