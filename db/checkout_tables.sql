USE term_project;

-- ============================================================
-- Cinema E-Booking Checkout Tables
--
-- This script is rerunnable:
-- 1. CREATE TABLE IF NOT EXISTS handles fresh databases.
-- 2. The migration section updates an existing booking_drafts
--    table without adding duplicate columns, indexes, or keys.
-- ============================================================


-- ------------------------------------------------------------
-- Temporary booking draft
--
-- Stores ticket quantities while a customer is redirected
-- through login, registration, or checkout.
--
-- user_id is nullable because a guest may create a draft before
-- logging in or registering.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS booking_drafts (
    booking_draft_id INT NOT NULL AUTO_INCREMENT,

    user_id INT NULL,

    checkout_token CHAR(64) NOT NULL,
    showtime_id INT NOT NULL,

    adult_quantity INT NOT NULL DEFAULT 0,
    senior_quantity INT NOT NULL DEFAULT 0,
    child_quantity INT NOT NULL DEFAULT 0,

    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (
        booking_draft_id
    ),

    UNIQUE KEY uq_booking_draft_token (
        checkout_token
    ),

    INDEX idx_booking_draft_expires (
        expires_at
    ),

    INDEX idx_booking_draft_user_showtime (
        user_id,
        showtime_id,
        expires_at
    ),

    CONSTRAINT fk_booking_draft_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_booking_draft_showtime
        FOREIGN KEY (showtime_id)
        REFERENCES showtimes(showtime_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_booking_draft_quantities
        CHECK (
            adult_quantity >= 0
            AND senior_quantity >= 0
            AND child_quantity >= 0
        )
);


-- ------------------------------------------------------------
-- Seats selected in a temporary booking draft
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS booking_draft_seats (
    booking_draft_id INT NOT NULL,
    seat_id INT NOT NULL,

    PRIMARY KEY (
        booking_draft_id,
        seat_id
    ),

    CONSTRAINT fk_booking_draft_seat_draft
        FOREIGN KEY (booking_draft_id)
        REFERENCES booking_drafts(booking_draft_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_booking_draft_seat_seat
        FOREIGN KEY (seat_id)
        REFERENCES seats(seat_id)
        ON DELETE CASCADE
);


-- ------------------------------------------------------------
-- Completed customer orders
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    order_id INT NOT NULL AUTO_INCREMENT,

    confirmation_code VARCHAR(24) NOT NULL,

    user_id INT NOT NULL,
    showtime_id INT NOT NULL,

    confirmation_email VARCHAR(255) NOT NULL,

    -- Reference to the saved card when it still exists
    payment_card_id INT NULL,

    -- Snapshots allow the order to remain readable even if the
    -- customer later deletes the saved payment card
    card_type_snapshot VARCHAR(20) NULL,
    card_last_four_snapshot CHAR(4) NOT NULL,

    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,

    status ENUM(
        'confirmed',
        'cancelled',
        'refunded'
    ) NOT NULL DEFAULT 'confirmed',

    email_status ENUM(
        'pending',
        'sent',
        'failed'
    ) NOT NULL DEFAULT 'pending',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (
        order_id
    ),

    UNIQUE KEY uq_order_confirmation_code (
        confirmation_code
    ),

    INDEX idx_orders_user (
        user_id
    ),

    INDEX idx_orders_showtime (
        showtime_id
    ),

    CONSTRAINT fk_order_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_order_showtime
        FOREIGN KEY (showtime_id)
        REFERENCES showtimes(showtime_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_order_payment_card
        FOREIGN KEY (payment_card_id)
        REFERENCES user_payment_cards(card_id)
        ON DELETE SET NULL
);


-- ------------------------------------------------------------
-- Ticket category breakdown for each order
--
-- Example:
-- Adult x 2 at $14.50
-- Child x 1 at $9.50
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_ticket_items (
    order_ticket_item_id INT NOT NULL AUTO_INCREMENT,

    order_id INT NOT NULL,

    ticket_category ENUM(
        'adult',
        'senior',
        'child'
    ) NOT NULL,

    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (
        order_ticket_item_id
    ),

    UNIQUE KEY uq_order_ticket_category (
        order_id,
        ticket_category
    ),

    CONSTRAINT fk_order_ticket_order
        FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_order_ticket_quantity
        CHECK (
            quantity > 0
        )
);


-- ------------------------------------------------------------
-- Seats purchased as part of an order
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_seats (
    order_id INT NOT NULL,
    showtime_id INT NOT NULL,
    seat_id INT NOT NULL,

    -- Snapshots preserve the seat label even if the room data
    -- is changed later
    row_label_snapshot VARCHAR(5) NOT NULL,
    seat_number_snapshot INT NOT NULL,
    seat_type_snapshot VARCHAR(20) NOT NULL,

    PRIMARY KEY (
        order_id,
        seat_id
    ),

    -- A physical seat can only be sold once per showtime
    UNIQUE KEY uq_order_showtime_seat (
        showtime_id,
        seat_id
    ),

    CONSTRAINT fk_order_seat_order
        FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_order_seat_showtime
        FOREIGN KEY (showtime_id)
        REFERENCES showtimes(showtime_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_order_seat_seat
        FOREIGN KEY (seat_id)
        REFERENCES seats(seat_id)
        ON DELETE RESTRICT
);


-- ============================================================
-- Rerunnable migration for existing booking_drafts tables
--
-- CREATE TABLE IF NOT EXISTS does not modify a table that
-- already exists. These checks add the new user ownership
-- column, index, and foreign key only when they are missing.
-- ============================================================


-- ------------------------------------------------------------
-- Add booking_drafts.user_id if it does not exist
-- ------------------------------------------------------------
SET @booking_draft_user_column_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'booking_drafts'
      AND column_name = 'user_id'
);

SET @booking_draft_user_column_sql = IF(
    @booking_draft_user_column_exists = 0,

    'ALTER TABLE booking_drafts
        ADD COLUMN user_id INT NULL
        AFTER booking_draft_id',

    'SELECT
        ''booking_drafts.user_id already exists''
        AS migration_status'
);

PREPARE booking_draft_user_column_statement
FROM @booking_draft_user_column_sql;

EXECUTE booking_draft_user_column_statement;

DEALLOCATE PREPARE
    booking_draft_user_column_statement;


-- ------------------------------------------------------------
-- Add the user/showtime/expiration index if it does not exist
-- ------------------------------------------------------------
SET @booking_draft_user_index_exists = (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'booking_drafts'
      AND index_name = 'idx_booking_draft_user_showtime'
);

SET @booking_draft_user_index_sql = IF(
    @booking_draft_user_index_exists = 0,

    'CREATE INDEX idx_booking_draft_user_showtime
        ON booking_drafts (
            user_id,
            showtime_id,
            expires_at
        )',

    'SELECT
        ''idx_booking_draft_user_showtime already exists''
        AS migration_status'
);

PREPARE booking_draft_user_index_statement
FROM @booking_draft_user_index_sql;

EXECUTE booking_draft_user_index_statement;

DEALLOCATE PREPARE
    booking_draft_user_index_statement;


-- ------------------------------------------------------------
-- Add the user foreign key if it does not exist
-- ------------------------------------------------------------
SET @booking_draft_user_fk_exists = (
    SELECT COUNT(*)
    FROM information_schema.table_constraints
    WHERE constraint_schema = DATABASE()
      AND table_name = 'booking_drafts'
      AND constraint_name = 'fk_booking_draft_user'
      AND constraint_type = 'FOREIGN KEY'
);

SET @booking_draft_user_fk_sql = IF(
    @booking_draft_user_fk_exists = 0,

    'ALTER TABLE booking_drafts
        ADD CONSTRAINT fk_booking_draft_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE SET NULL',

    'SELECT
        ''fk_booking_draft_user already exists''
        AS migration_status'
);

PREPARE booking_draft_user_fk_statement
FROM @booking_draft_user_fk_sql;

EXECUTE booking_draft_user_fk_statement;

DEALLOCATE PREPARE
    booking_draft_user_fk_statement;