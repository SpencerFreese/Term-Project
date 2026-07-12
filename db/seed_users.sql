USE term_project;

DELETE FROM users
WHERE email IN ('admin@test.com', 'customer@test.com');

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
  false
),
(
  'Customer',
  'User',
  'customer@test.com',
  '555-222-2222',
  '$2b$10$S.lCAEJMOwZbaTxBKMsFr.ZsawDSuzMTkUCDNieAuO9fnmy1XWHmC',
  'active',
  'customer',
  true
);