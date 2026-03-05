-- =============================================
-- WeddingDB — MySQL Schema
-- =============================================

CREATE DATABASE IF NOT EXISTS WeddingDB;
USE WeddingDB;

-- Groups: family units with unique access codes
CREATE TABLE IF NOT EXISTS `groups` (
    group_id    INT AUTO_INCREMENT PRIMARY KEY,
    family_name VARCHAR(100) NOT NULL,
    section     VARCHAR(50),
    category    VARCHAR(50),
    access_code VARCHAR(20) UNIQUE NOT NULL
);

-- Users: individual guests belonging to a group
CREATE TABLE IF NOT EXISTS users (
    user_id          INT AUTO_INCREMENT PRIMARY KEY,
    group_id         INT NOT NULL,
    first_name       VARCHAR(50) NOT NULL,
    last_name        VARCHAR(50) NOT NULL,
    plus_one_allowed TINYINT(1) DEFAULT 0,
    is_child         TINYINT(1) DEFAULT 0,
    is_21            TINYINT(1) DEFAULT 0,
    list             VARCHAR(20),
    FOREIGN KEY (group_id) REFERENCES `groups`(group_id) ON DELETE CASCADE
);

-- RSVPs: guest responses
CREATE TABLE IF NOT EXISTS rsvps (
    rsvp_id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id              INT UNIQUE NOT NULL,
    attending            TINYINT(1),
    plus_one             TINYINT(1) DEFAULT 0,
    plus_one_name        VARCHAR(100),
    diet_restrictions    TEXT,
    dress_code           VARCHAR(100),
    song_recommendations TEXT,
    submitted_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Admin users for dashboard access
CREATE TABLE IF NOT EXISTS admins (
    admin_id       INT AUTO_INCREMENT PRIMARY KEY,
    username       VARCHAR(50) UNIQUE NOT NULL,
    password_hash  VARCHAR(255) NOT NULL
);
