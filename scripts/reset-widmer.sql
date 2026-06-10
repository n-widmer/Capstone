-- Reset RSVPs and lodging for the Widmer family (access code TESTDEV1)
USE WeddingDB;

SET @gid = (SELECT group_id FROM `groups` WHERE access_code = 'TESTDEV1');

DELETE r FROM rsvps r
JOIN users u ON r.user_id = u.user_id
WHERE u.group_id = @gid;

DELETE FROM lodging_reservations WHERE group_id = @gid;

DELETE FROM song_votes WHERE group_id = @gid;
DELETE FROM song_requests WHERE group_id = @gid;
