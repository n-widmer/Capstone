-- =============================================
-- WeddingDB — MySQL Schema
-- =============================================

CREATE DATABASE IF NOT EXISTS WeddingDB;
USE WeddingDB;

-- Groups: family units with unique access codes
CREATE TABLE IF NOT EXISTS `groups` (
    group_id    INT AUTO_INCREMENT PRIMARY KEY,
    family_name VARCHAR(100) NOT NULL,
    section     VARCHAR(50) NOT NULL,
    category    VARCHAR(50) NOT NULL,
    access_code VARCHAR(50) UNIQUE NOT NULL,
    UNIQUE KEY uq_group (family_name, section, category)
);

-- Users: individual guests belonging to a group
CREATE TABLE IF NOT EXISTS users (
    user_id          INT AUTO_INCREMENT PRIMARY KEY,
    group_id         INT NOT NULL,
    first_name       VARCHAR(100) NOT NULL,
    last_name        VARCHAR(100) NOT NULL,
    phone_number     VARCHAR(20) DEFAULT NULL,
    address          VARCHAR(255) DEFAULT NULL,
    plus_one_allowed TINYINT(1) DEFAULT 0,
    is_child         TINYINT(1) DEFAULT 0,
    is_21            TINYINT(1) DEFAULT NULL,
    list             VARCHAR(20),
    FOREIGN KEY (group_id) REFERENCES `groups`(group_id)
);

-- RSVPs: guest responses
CREATE TABLE IF NOT EXISTS rsvps (
    id                   INT AUTO_INCREMENT PRIMARY KEY,
    user_id              INT UNIQUE NOT NULL,
    attending            TINYINT(1) NOT NULL,
    plus_one             TINYINT(1) DEFAULT 0,
    plus_one_name        VARCHAR(100) DEFAULT NULL,
    diet_restrictions    TEXT,
    dress_code           VARCHAR(100) DEFAULT NULL,
    song_recommendations TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT rsvps_chk_1 CHECK (
        ((plus_one = false) AND (plus_one_name IS NULL)) OR
        ((plus_one = true) AND (plus_one_name IS NOT NULL))
    )
);

-- Admin users for dashboard access
CREATE TABLE IF NOT EXISTS admins (
    admin_id       INT AUTO_INCREMENT PRIMARY KEY,
    username       VARCHAR(50) UNIQUE NOT NULL,
    password_hash  VARCHAR(255) NOT NULL
);

-- Store uploaded photos for the gallery
CREATE TABLE IF NOT EXISTS photos (
    photo_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    group_id INT NOT NULL,
    photo_url VARCHAR(255) NOT NULL,
    photo_type ENUM('gallery', 'user_upload') DEFAULT 'gallery',
    caption TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (group_id) REFERENCES `groups`(group_id) ON DELETE CASCADE,
    INDEX idx_group_id (group_id),
    INDEX idx_photo_type (photo_type),
    INDEX idx_uploaded_at (uploaded_at)
);

-- Track thank-you card delivery status
CREATE TABLE IF NOT EXISTS thank_you_cards (
    card_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    delivery_method ENUM('email', 'physical') NOT NULL,
    card_status ENUM('draft', 'sent', 'delivered') DEFAULT 'draft',
    custom_message TEXT,
    sent_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_status (card_status),
    INDEX idx_sent_at (sent_at)
);

-- Track admin login sessions
CREATE TABLE IF NOT EXISTS admin_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_admin_id (admin_id),
    INDEX idx_expires_at (expires_at)
);

-- Store donations and guest messages/well-wishes
CREATE TABLE IF NOT EXISTS wishing_well_messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    user_id INT,
    message_type ENUM('donation', 'message') NOT NULL,
    amount DECIMAL(10, 2),  -- NULL for messages
    message_text TEXT,      -- NULL for donations
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES `groups`(group_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_group_id (group_id),
    INDEX idx_message_type (message_type),
    INDEX idx_submitted_at (submitted_at)
);
