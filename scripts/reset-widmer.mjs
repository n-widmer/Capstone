import { readFileSync } from 'fs';
import { resolve } from 'path';
import mysql from 'mysql2/promise';

// Load .env.local manually
const envPath = resolve(import.meta.dirname, '..', '.env.local');
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const match = line.match(/^\s*([\w]+)\s*=\s*(.*)\s*$/);
  if (match) process.env[match[1]] = match[2];
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'WeddingDB',
  connectionLimit: 2,
});

try {
  // Find the Widmer group
  const [groups] = await pool.query(
    "SELECT group_id, family_name FROM `groups` WHERE access_code = 'TESTDEV1'"
  );

  if (groups.length === 0) {
    console.log('No group found with access code TESTDEV1');
    process.exit(0);
  }

  const { group_id, family_name } = groups[0];
  console.log(`Found group: ${family_name} (id=${group_id})`);

  // Delete RSVPs
  const [rsvpResult] = await pool.query(
    'DELETE r FROM rsvps r JOIN users u ON r.user_id = u.user_id WHERE u.group_id = ?',
    [group_id]
  );
  console.log(`Deleted ${rsvpResult.affectedRows} RSVP(s)`);

  // Delete lodging reservations
  const [lodgingResult] = await pool.query(
    'DELETE FROM lodging_reservations WHERE group_id = ?',
    [group_id]
  );
  console.log(`Deleted ${lodgingResult.affectedRows} lodging reservation(s)`);

  // Delete song votes cast by this group (before song_requests due to FK)
  const [votesResult] = await pool.query(
    'DELETE FROM song_votes WHERE group_id = ?',
    [group_id]
  );
  console.log(`Deleted ${votesResult.affectedRows} song vote(s)`);

  // Delete song requests submitted by this group
  const [songsResult] = await pool.query(
    'DELETE FROM song_requests WHERE group_id = ?',
    [group_id]
  );
  console.log(`Deleted ${songsResult.affectedRows} song request(s)`);

  console.log('Done — Widmer family can now RSVP fresh.');
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
} finally {
  await pool.end();
}
