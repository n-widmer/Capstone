/**
 * @jest-environment node
 */
import { GET } from "@/app/api/photos/route";

const { mockExecute, mockRelease } = require("../mocks/db");

jest.mock("@/lib/db", () => {
  const { pool } = require("../mocks/db");
  return { __esModule: true, default: pool };
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/photos", () => {
  const samplePhotos = [
    { id: 1, filename: "photo1.jpg", caption: "Fun times", category: "guest", approved: 1, created_at: "2026-04-01", uploaded_by: "Brady" },
    { id: 2, filename: "photo2.jpg", caption: "", category: "wedding", approved: 1, created_at: "2026-04-02", uploaded_by: "Smith" },
  ];

  it("returns only approved photos by default", async () => {
    mockExecute.mockResolvedValueOnce([samplePhotos]);

    const req = new Request("http://localhost/api/photos");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.photos).toHaveLength(2);
    expect(data.photos[0].approved).toBe(true);
    expect(mockRelease).toHaveBeenCalled();
  });

  it("returns all photos when admin=true", async () => {
    const allPhotos = [
      ...samplePhotos,
      { id: 3, filename: "pending.jpg", caption: "", category: "guest", approved: 0, created_at: "2026-04-03", uploaded_by: "Jones" },
    ];
    mockExecute.mockResolvedValueOnce([allPhotos]);

    const req = new Request("http://localhost/api/photos?admin=true");
    const res = await GET(req);
    const data = await res.json();

    expect(data.photos).toHaveLength(3);
  });

  it("filters by category when provided", async () => {
    mockExecute.mockResolvedValueOnce([[samplePhotos[1]]]);

    const req = new Request("http://localhost/api/photos?category=wedding");
    const res = await GET(req);
    const data = await res.json();

    expect(data.photos).toHaveLength(1);
    expect(data.photos[0].category).toBe("wedding");
  });

  it("returns empty array when no photos", async () => {
    mockExecute.mockResolvedValueOnce([[]]);

    const req = new Request("http://localhost/api/photos");
    const res = await GET(req);
    const data = await res.json();

    expect(data.photos).toEqual([]);
  });

  it("returns 500 on database error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("DB error"));

    const req = new Request("http://localhost/api/photos");
    const res = await GET(req);

    expect(res.status).toBe(500);
    expect(mockRelease).toHaveBeenCalled();
  });
});
