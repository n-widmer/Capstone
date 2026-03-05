-- =============================================
-- WeddingDB — View Queries for MySQL Workbench
-- =============================================

USE WeddingDB;

-- 1. View all groups (family units with access codes)
SELECT * FROM `groups` ORDER BY section, category, family_name;

-- 2. View all users with their group info
SELECT
    u.user_id,
    g.family_name AS group_name,
    g.section,
    g.category,
    u.first_name,
    u.last_name,
    u.plus_one_allowed,
    u.is_child,
    u.is_21,
    u.list,
    g.access_code
FROM users u
JOIN `groups` g ON u.group_id = g.group_id
ORDER BY g.section, g.family_name, u.user_id;

-- 3. Summary: member count per group
SELECT
    g.group_id,
    g.family_name,
    g.section,
    g.category,
    g.access_code,
    COUNT(u.user_id) AS total_members,
    SUM(u.plus_one_allowed) AS plus_ones,
    SUM(u.is_child) AS children
FROM `groups` g
JOIN users u ON g.group_id = u.group_id
GROUP BY g.group_id
ORDER BY g.section, g.family_name;

-- 4. View only guests with plus-one allowed
SELECT u.first_name, u.last_name, g.family_name, g.section
FROM users u
JOIN `groups` g ON u.group_id = g.group_id
WHERE u.plus_one_allowed = 1
ORDER BY g.section, u.last_name;

-- 5. View only children
SELECT u.first_name, u.last_name, g.family_name, g.section
FROM users u
JOIN `groups` g ON u.group_id = g.group_id
WHERE u.is_child = 1
ORDER BY g.section, u.last_name;

-- 6. View RSVPs (will be empty until guests start responding)
SELECT
    u.first_name,
    u.last_name,
    g.family_name,
    r.attending,
    r.plus_one,
    r.plus_one_name,
    r.diet_restrictions,
    r.dress_code,
    r.song_recommendations
FROM rsvps r
JOIN users u ON r.user_id = u.user_id
JOIN `groups` g ON u.group_id = g.group_id
ORDER BY g.section, g.family_name;

-- 7. Grand totals
SELECT
    COUNT(DISTINCT g.group_id) AS total_groups,
    COUNT(u.user_id) AS total_guests,
    SUM(u.plus_one_allowed) AS total_plus_ones,
    SUM(u.is_child) AS total_children
FROM `groups` g
JOIN users u ON g.group_id = u.group_id;
