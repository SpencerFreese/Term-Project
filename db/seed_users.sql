USE term_project;

-- ============================================================
-- Remove All test accounts.
-- ON DELETE CASCADE removes their tokens, cards, addresses,
-- and favorites before they are recreated.
-- ============================================================
DELETE FROM users;
ALTER TABLE users AUTO_INCREMENT = 1;


-- ============================================================
-- Seeded test users
--
-- Password for every account:
-- Password123!
-- ============================================================
INSERT INTO users (
    first_name,
    last_name,
    email,
    phone_number,
    password_hash,
    status,
    role,
    promo_subscribed
)
VALUES
(
    'Admin',
    'User',
    'admin@test.com',
    '555-111-1111',
    '$2b$10$S.lCAEJMOwZbaTxBKMsFr.ZsawDSuzMTkUCDNieAuO9fnmy1XWHmC',
    'active',
    'admin',
    FALSE
),
(
    'Blank',
    'Customer',
    'customer@test.com',
    '555-222-2222',
    '$2b$10$S.lCAEJMOwZbaTxBKMsFr.ZsawDSuzMTkUCDNieAuO9fnmy1XWHmC',
    'active',
    'customer',
    FALSE
),
(
    'Profile',
    'Customer',
    'profile@test.com',
    '555-333-3333',
    '$2b$10$S.lCAEJMOwZbaTxBKMsFr.ZsawDSuzMTkUCDNieAuO9fnmy1XWHmC',
    'active',
    'customer',
    TRUE
);

-- ============================================================
-- Address for the populated profile customer
-- ============================================================
INSERT INTO user_addresses (
    user_id,
    street,
    city,
    state,
    zip_code,
    country
)
SELECT
    user_id,
    '123 Cinema Lane',
    'Athens',
    'Georgia',
    '30601',
    'US'
FROM users
WHERE email = 'profile@test.com';

-- ============================================================
-- Favorites for the populated profile customer
--
-- Run seed_movies.sql before seed_users.sql.
-- ============================================================
INSERT IGNORE INTO favorite_movies (
    user_id,
    movie_id
)
SELECT
    u.user_id,
    m.movie_id
FROM users u
JOIN movies m
    ON m.title IN (
        'Project Hail Mary',
        'Toy Story 5',
        'The Super Mario Galaxy Movie'
    )
WHERE u.email = 'profile@test.com';



