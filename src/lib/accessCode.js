import pool from "@/lib/db";

// The single, shared access code every guest uses to enter the site.
// Stored in the `settings` table so it can be changed from the admin dashboard,
// but we keep a hard-coded fallback so the gate keeps working even if the row
// is missing (e.g. on a database that predates this setting).
export const GUEST_ACCESS_CODE_KEY = "guest_access_code";
export const DEFAULT_GUEST_ACCESS_CODE = "tori&connor";

// Read the active universal access code from settings, falling back to the default.
export async function getGuestAccessCode() {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      "SELECT value FROM settings WHERE key_name = ? LIMIT 1",
      [GUEST_ACCESS_CODE_KEY]
    );
    const value = rows.length ? String(rows[0].value).trim() : "";
    return value || DEFAULT_GUEST_ACCESS_CODE;
  } finally {
    conn.release();
  }
}

// Compare a guest-entered code against the expected one. Case-insensitive and
// whitespace-tolerant so guests aren't tripped up by capitalization.
export function codesMatch(input, expected) {
  return (
    String(input ?? "").trim().toLowerCase() ===
    String(expected ?? "").trim().toLowerCase()
  );
}
