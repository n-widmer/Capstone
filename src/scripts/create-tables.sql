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
