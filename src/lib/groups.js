// Shared helpers for loading a guest's wedding group and for reading the
// `guest_group` cookie that remembers which family a guest identified as.

export const GUEST_GROUP_COOKIE = "guest_group";

// Read and validate the remembered group id from a request's Cookie header.
// Works with both NextRequest and a plain Request (handy for tests).
export function readGuestGroupId(req) {
  const header = req.headers?.get?.("cookie") || "";
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === GUEST_GROUP_COOKIE) {
      const id = Number(decodeURIComponent(rest.join("=")));
      return Number.isInteger(id) && id > 0 ? id : null;
    }
  }
  return null;
}

// Coerce an incoming group_id (string or number) into a positive integer, or null.
export function parseGroupId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Load the full RSVP-facing payload for a single group: the family, its members
// (with any existing RSVP state) and previously-saved RSVP details.
// Returns null if the group does not exist. `conn` is an open pool connection.
export async function fetchGroupPayload(conn, groupId) {
  const [groups] = await conn.execute(
    "SELECT group_id, family_name FROM `groups` WHERE group_id = ? LIMIT 1",
    [groupId]
  );
  if (!groups.length) return null;
  const group = groups[0];

  const [members] = await conn.execute(
    `SELECT
        u.user_id,
        u.first_name,
        u.last_name,
        u.plus_one_allowed,
        r.attending AS attending,
        r.plus_one,
        r.plus_one_name,
        r.diet_restrictions
      FROM users u
      LEFT JOIN rsvps r ON r.user_id = u.user_id
      WHERE u.group_id = ?
      ORDER BY u.last_name, u.first_name`,
    [group.group_id]
  );

  const [existingRows] = await conn.execute(
    `SELECT r.id, r.user_id,
            u.first_name AS submitted_first, u.last_name AS submitted_last
     FROM rsvps r
     JOIN users u ON u.user_id = r.user_id
     WHERE u.group_id = ?
     ORDER BY r.user_id DESC
     LIMIT 1`,
    [group.group_id]
  );
  const existing = existingRows.length ? existingRows[0] : null;

  // Dress code and song are group-level; dietary is per-member (see members above).
  const [rsvpMetaRows] = await conn.execute(
    `SELECT dress_code, song_recommendations
     FROM rsvps r
     JOIN users u ON u.user_id = r.user_id
     WHERE u.group_id = ?
     LIMIT 1`,
    [group.group_id]
  );
  const meta = rsvpMetaRows.length ? rsvpMetaRows[0] : null;

  return {
    ok: true,
    group: { group_id: group.group_id, family_name: group.family_name },
    members: members.map((m) => ({
      user_id: m.user_id,
      name: `${m.first_name} ${m.last_name}`,
      plus_one_allowed: !!m.plus_one_allowed,
      attending: m.attending === null ? null : Number(m.attending),
      plus_one: m.plus_one === null ? null : Number(m.plus_one),
      plus_one_name: m.plus_one_name ?? null,
      diet_restrictions: m.diet_restrictions ?? null,
    })),
    rsvp: {
      exists: !!existing,
      submitted_by: existing
        ? `${existing.submitted_first} ${existing.submitted_last}`
        : null,
    },
    rsvp_meta: meta
      ? {
          dress_code: meta.dress_code,
          song_recommendations: meta.song_recommendations,
        }
      : null,
  };
}
