-- =============================================
-- WeddingDB — PostgreSQL Schema
-- =============================================

-- Groups: family units with unique access codes
CREATE TABLE groups (
    group_id    SERIAL PRIMARY KEY,
    family_name VARCHAR(100) NOT NULL,
    section     VARCHAR(50),
    category    VARCHAR(50),
    access_code VARCHAR(20) UNIQUE NOT NULL
);

-- Users: individual guests belonging to a group
CREATE TABLE users (
    user_id          SERIAL PRIMARY KEY,
    group_id         INT NOT NULL REFERENCES groups(group_id) ON DELETE CASCADE,
    first_name       VARCHAR(50) NOT NULL,
    last_name        VARCHAR(50) NOT NULL,
    plus_one_allowed BOOLEAN DEFAULT FALSE,
    is_child         BOOLEAN DEFAULT FALSE,
    is_21            BOOLEAN DEFAULT FALSE,
    list             VARCHAR(20)
);

-- RSVPs: guest responses
CREATE TABLE rsvps (
    rsvp_id              SERIAL PRIMARY KEY,
    user_id              INT UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    attending            BOOLEAN,
    plus_one             BOOLEAN DEFAULT FALSE,
    plus_one_name        VARCHAR(100),
    diet_restrictions    TEXT,
    dress_code           VARCHAR(100),
    song_recommendations TEXT,
    submitted_at         TIMESTAMP DEFAULT NOW()
);

-- Admin users for dashboard access
CREATE TABLE admins (
    admin_id       SERIAL PRIMARY KEY,
    username       VARCHAR(50) UNIQUE NOT NULL,
    password_hash  VARCHAR(255) NOT NULL
);
