-- CyberTrak MySQL schema. Run against a new, empty MySQL database.
-- Python handles authentication, authorization, validation, and event cleanup.

CREATE TABLE users (
    user_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    fname VARCHAR(50) NOT NULL,
    lname VARCHAR(50) NOT NULL,
    email VARCHAR(254) NOT NULL,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phase VARCHAR(50),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY users_email_uq (email),
    UNIQUE KEY users_username_uq (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Saved venue/event locations. These are separate from temporary member GPS.
CREATE TABLE locations (
    location_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    location_name VARCHAR(100) NOT NULL,
    address VARCHAR(150),
    city VARCHAR(50),
    state VARCHAR(50),
    zip VARCHAR(10),
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
    CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE events (
    event_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    creator_id INT NOT NULL,
    location_id INT,
    event_name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    ends_at DATETIME,
    radius_meters INT NOT NULL DEFAULT 100
        CHECK (radius_meters > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'ended', 'cancelled')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY events_creator_idx (creator_id),
    KEY events_status_end_idx (status, ends_at),
    CONSTRAINT events_creator_fk FOREIGN KEY (creator_id)
        REFERENCES users(user_id),
    CONSTRAINT events_location_fk FOREIGN KEY (location_id)
        REFERENCES locations(location_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE friends (
    friendship_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY friends_pair_uq (user_id, friend_id),
    KEY friends_friend_idx (friend_id, status),
    CHECK (user_id <> friend_id),
    CONSTRAINT friends_user_fk FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT friends_friend_fk FOREIGN KEY (friend_id)
        REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE eventmembers (
    eventmember_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'member'
        CHECK (role IN ('host', 'member')),
    status VARCHAR(30) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'left')),
    joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    left_at DATETIME,
    UNIQUE KEY eventmembers_event_user_uq (event_id, user_id),
    KEY eventmembers_user_status_idx (user_id, status),
    CONSTRAINT eventmembers_event_fk FOREIGN KEY (event_id)
        REFERENCES events(event_id) ON DELETE CASCADE,
    CONSTRAINT eventmembers_user_fk FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Store only the latest position for each active event member, never a trail.
-- Python must delete this row when a member leaves and when an event ends.
CREATE TABLE location_updates (
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    accuracy_meters DECIMAL(7, 2),
    recorded_at DATETIME NOT NULL,
    PRIMARY KEY (event_id, user_id),
    KEY location_updates_event_time_idx (event_id, recorded_at),
    CHECK (latitude BETWEEN -90 AND 90),
    CHECK (longitude BETWEEN -180 AND 180),
    CHECK (accuracy_meters IS NULL OR accuracy_meters >= 0),
    CONSTRAINT location_updates_member_fk FOREIGN KEY (event_id, user_id)
        REFERENCES eventmembers(event_id, user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notifications (
    notification_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT,
    notification_type VARCHAR(50) NOT NULL,
    message VARCHAR(255) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY notifications_user_read_idx (user_id, is_read, created_at),
    CONSTRAINT notifications_user_fk FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT notifications_event_fk FOREIGN KEY (event_id)
        REFERENCES events(event_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Planned group messaging support (Version 2 in the PRD).
CREATE TABLE messages (
    message_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    sender_id INT NOT NULL,
    message_text VARCHAR(2000) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY messages_event_time_idx (event_id, created_at),
    CONSTRAINT messages_event_fk FOREIGN KEY (event_id)
        REFERENCES events(event_id) ON DELETE CASCADE,
    CONSTRAINT messages_sender_fk FOREIGN KEY (sender_id)
        REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Planned event polls (Version 2 in the PRD).
CREATE TABLE polls (
    poll_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    created_by INT NOT NULL,
    question VARCHAR(500) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closes_at DATETIME,
    KEY polls_event_idx (event_id, created_at),
    CONSTRAINT polls_event_fk FOREIGN KEY (event_id)
        REFERENCES events(event_id) ON DELETE CASCADE,
    CONSTRAINT polls_creator_fk FOREIGN KEY (created_by)
        REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE poll_options (
    option_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    poll_id INT NOT NULL,
    option_text VARCHAR(255) NOT NULL,
    UNIQUE KEY poll_options_text_uq (poll_id, option_text),
    UNIQUE KEY poll_options_poll_option_uq (poll_id, option_id),
    CONSTRAINT poll_options_poll_fk FOREIGN KEY (poll_id)
        REFERENCES polls(poll_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE poll_votes (
    poll_id INT NOT NULL,
    option_id INT NOT NULL,
    user_id INT NOT NULL,
    voted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (poll_id, user_id),
    CONSTRAINT poll_votes_option_fk FOREIGN KEY (poll_id, option_id)
        REFERENCES poll_options(poll_id, option_id) ON DELETE CASCADE,
    CONSTRAINT poll_votes_user_fk FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
