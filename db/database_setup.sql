-- ============================================================
-- term_project: User tables
-- ============================================================

-- I don't know if all of you have taken the database management course, but I'm going to assume you have a basic understanding of SQL and database concepts.
-- I used Docker and MySQL for the database management. 
-- If you haven't used docker or MySQL before, say so in the discord and I'll try to help you set it up.

CREATE DATABASE IF NOT EXISTS term_project;
USE term_project;

-- ------------------------------------------------------------
-- users table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    user_id          INT             NOT NULL AUTO_INCREMENT,
    first_name       VARCHAR(50)     NOT NULL,
    last_name        VARCHAR(50)     NOT NULL,
    email            VARCHAR(255)    NOT NULL,
    phone_number     VARCHAR(20),
    password_hash    VARCHAR(255)    NOT NULL,
    status           ENUM('unverified', 'active', 'suspended') NOT NULL DEFAULT 'unverified',
    role             ENUM('customer', 'admin')                 NOT NULL DEFAULT 'customer',
    promo_subscribed BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id),
    UNIQUE KEY uq_users_email (email)
);

-- ------------------------------------------------------------
-- user_addresses  (one per user, requirement 8)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_addresses (
    address_id   INT          NOT NULL AUTO_INCREMENT,
    user_id      INT          NOT NULL,
    street       VARCHAR(255) NOT NULL,
    city         VARCHAR(100) NOT NULL,
    state        VARCHAR(100) NOT NULL,
    zip_code     VARCHAR(20)  NOT NULL,
    country      VARCHAR(100) NOT NULL DEFAULT 'US',
    PRIMARY KEY (address_id),
    UNIQUE KEY uq_address_user (user_id),
    CONSTRAINT fk_addr_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- user_payment_cards  (up to 3 per user, requirement 8)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_payment_cards (
    card_id               INT          NOT NULL AUTO_INCREMENT,
    user_id               INT          NOT NULL,
    card_number_encrypted VARCHAR(512) NOT NULL,
    cardholder_name       VARCHAR(100) NOT NULL,
    expiry_month          CHAR(2)      NOT NULL,
    expiry_year           CHAR(4)      NOT NULL,
    card_type             VARCHAR(20),
    card_order            TINYINT      NOT NULL DEFAULT 1,
    PRIMARY KEY (card_id),
    CONSTRAINT fk_card_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE,
    CONSTRAINT chk_card_order
        CHECK (card_order BETWEEN 1 AND 3)
);


-- ------------------------------------------------------------
-- movie Table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS movies (
    movie_id        INT NOT NULL AUTO_INCREMENT,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    poster_url      VARCHAR(500),
    trailer_url     VARCHAR(500),
    mpaa_rating     VARCHAR(10),
    cast_list VARCHAR(500),
    runtime_minutes INT,
    release_date    DATE,
    status          ENUM('currently_playing', 'coming_soon', 'inactive')
                    NOT NULL DEFAULT 'coming_soon',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (movie_id),
    UNIQUE KEY uq_movie_title_release (title, release_date),
    INDEX idx_movies_title (title),
    INDEX idx_movies_status (status)
);

-- ------------------------------------------------------------
-- genres
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS genres (
    genre_id INT NOT NULL AUTO_INCREMENT,
    name     VARCHAR(50) NOT NULL,
    PRIMARY KEY (genre_id),
    UNIQUE KEY uq_genre_name (name)
);

-- ------------------------------------------------------------
--  movie genres
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS movie_genres (
    movie_id INT NOT NULL,
    genre_id INT NOT NULL,
    PRIMARY KEY (movie_id, genre_id),
    CONSTRAINT fk_movie_genres_movie
        FOREIGN KEY (movie_id) REFERENCES movies(movie_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_movie_genres_genre
        FOREIGN KEY (genre_id) REFERENCES genres(genre_id)
        ON DELETE CASCADE
);

-- ------------------------------------------------------------
--  theater rooms
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS theater_rooms (
    theater_room_id INT NOT NULL AUTO_INCREMENT,
    room_name       VARCHAR(100) NOT NULL,
    seat_rows       INT NOT NULL,
    seat_cols       INT NOT NULL,
    format_type     VARCHAR(50), -- Standard, IMAX, Dolby, 3D, etc.
    PRIMARY KEY (theater_room_id),
    UNIQUE KEY uq_room_name (room_name)
);

-- ------------------------------------------------------------
--  seats (seats per thearter room)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS seats (
    seat_id         INT NOT NULL AUTO_INCREMENT,
    theater_room_id INT NOT NULL,
    row_label       VARCHAR(5) NOT NULL,
    seat_number     INT NOT NULL,
    seat_type       ENUM('standard', 'wheelchair', 'companion')
                    NOT NULL DEFAULT 'standard',
    PRIMARY KEY (seat_id),
    UNIQUE KEY uq_room_seat (theater_room_id, row_label, seat_number),
    CONSTRAINT fk_seat_theater_room
        FOREIGN KEY (theater_room_id) REFERENCES theater_rooms(theater_room_id)
        ON DELETE CASCADE
);

-- ------------------------------------------------------------
--  Showtimes 
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS showtimes (
    showtime_id     INT NOT NULL AUTO_INCREMENT,
    movie_id        INT NOT NULL,
    theater_room_id INT NOT NULL,
    start_time      DATETIME NOT NULL,
    end_time        DATETIME,
    format_type     VARCHAR(50),
    status          ENUM('scheduled', 'cancelled', 'sold_out')
                    NOT NULL DEFAULT 'scheduled',
    PRIMARY KEY (showtime_id),
    UNIQUE KEY uq_room_start_time (theater_room_id, start_time),
    INDEX idx_showtimes_movie (movie_id),
    INDEX idx_showtimes_room (theater_room_id),
    INDEX idx_showtimes_start (start_time),
    CONSTRAINT fk_showtime_movie
        FOREIGN KEY (movie_id) REFERENCES movies(movie_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_showtime_theater_room
        FOREIGN KEY (theater_room_id) REFERENCES theater_rooms(theater_room_id)
        ON DELETE CASCADE
);
