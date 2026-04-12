-- Song requests table
CREATE TABLE IF NOT EXISTS song_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  song_title VARCHAR(200) NOT NULL,
  artist VARCHAR(200),
  votes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES `groups`(group_id)
);

-- Song votes tracking (prevents double-voting)
CREATE TABLE IF NOT EXISTS song_votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  song_id INT NOT NULL,
  group_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (song_id) REFERENCES song_requests(id),
  FOREIGN KEY (group_id) REFERENCES `groups`(group_id),
  UNIQUE KEY unique_vote (song_id, group_id)
);

-- Settings table (client-editable config)
CREATE TABLE IF NOT EXISTS settings (
  key_name VARCHAR(50) PRIMARY KEY,
  value TEXT NOT NULL
);
INSERT IGNORE INTO settings (key_name, value) VALUES ('rsvp_deadline', '2027-04-15');
INSERT IGNORE INTO settings (key_name, value) VALUES ('wedding_budget', '25000');

-- Expenses table (budget tracker)
CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  description VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(500) NOT NULL,
  uploaded_by_group_id INT,
  caption VARCHAR(500),
  category ENUM('engagement', 'wedding', 'guest') DEFAULT 'guest',
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by_group_id) REFERENCES `groups`(group_id)
);

-- Gifts / cards tracker
CREATE TABLE IF NOT EXISTS gifts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  guest_name VARCHAR(200) NOT NULL,
  gift_type ENUM('gift', 'card', 'cash') DEFAULT 'gift',
  description VARCHAR(500),
  amount DECIMAL(10,2),
  thank_you_sent BOOLEAN DEFAULT FALSE,
  notes VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
