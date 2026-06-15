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
