-- ============================================================
-- Term_Project: Seat seed data
-- Theater Room 1: 5 rows (A-E) x 8 seats = 40 seats
-- Theater Room 2: 6 rows (A-F) x 10 seats = 60 seats
-- Last seat in each row is wheelchair accessible
-- ============================================================

USE term_project; 

-- ------------------------------------------------------------
-- Theater Room 1 (Standard, 5x8)
-- ------------------------------------------------------------
INSERT INTO seats (theater_room_id, row_label, seat_number, seat_type) VALUES
(1, 'A', 1, 'standard'), (1, 'A', 2, 'standard'), (1, 'A', 3, 'standard'),
(1, 'A', 4, 'standard'), (1, 'A', 5, 'standard'), (1, 'A', 6, 'standard'),
(1, 'A', 7, 'standard'), (1, 'A', 8, 'wheelchair'),

(1, 'B', 1, 'standard'), (1, 'B', 2, 'standard'), (1, 'B', 3, 'standard'),
(1, 'B', 4, 'standard'), (1, 'B', 5, 'standard'), (1, 'B', 6, 'standard'),
(1, 'B', 7, 'standard'), (1, 'B', 8, 'wheelchair'),

(1, 'C', 1, 'standard'), (1, 'C', 2, 'standard'), (1, 'C', 3, 'standard'),
(1, 'C', 4, 'standard'), (1, 'C', 5, 'standard'), (1, 'C', 6, 'standard'),
(1, 'C', 7, 'standard'), (1, 'C', 8, 'wheelchair'),

(1, 'D', 1, 'standard'), (1, 'D', 2, 'standard'), (1, 'D', 3, 'standard'),
(1, 'D', 4, 'standard'), (1, 'D', 5, 'standard'), (1, 'D', 6, 'standard'),
(1, 'D', 7, 'standard'), (1, 'D', 8, 'wheelchair'),

(1, 'E', 1, 'standard'), (1, 'E', 2, 'standard'), (1, 'E', 3, 'standard'),
(1, 'E', 4, 'standard'), (1, 'E', 5, 'standard'), (1, 'E', 6, 'standard'),
(1, 'E', 7, 'standard'), (1, 'E', 8, 'wheelchair');
-- ------------------------------------------------------------
-- Theater Room 2 (IMAX, 6x10)
-- ------------------------------------------------------------
INSERT INTO seats (theater_room_id, row_label, seat_number, seat_type) VALUES
(2, 'A', 1, 'standard'), (2, 'A', 2, 'standard'), (2, 'A', 3, 'standard'),
(2, 'A', 4, 'standard'), (2, 'A', 5, 'standard'), (2, 'A', 6, 'standard'),
(2, 'A', 7, 'standard'), (2, 'A', 8, 'standard'), (2, 'A', 9, 'standard'),
(2, 'A', 10, 'wheelchair'),

(2, 'B', 1, 'standard'), (2, 'B', 2, 'standard'), (2, 'B', 3, 'standard'),
(2, 'B', 4, 'standard'), (2, 'B', 5, 'standard'), (2, 'B', 6, 'standard'),
(2, 'B', 7, 'standard'), (2, 'B', 8, 'standard'), (2, 'B', 9, 'standard'),
(2, 'B', 10, 'wheelchair'),

(2, 'C', 1, 'standard'), (2, 'C', 2, 'standard'), (2, 'C', 3, 'standard'),
(2, 'C', 4, 'standard'), (2, 'C', 5, 'standard'), (2, 'C', 6, 'standard'),
(2, 'C', 7, 'standard'), (2, 'C', 8, 'standard'), (2, 'C', 9, 'standard'),
(2, 'C', 10, 'wheelchair'),

(2, 'D', 1, 'standard'), (2, 'D', 2, 'standard'), (2, 'D', 3, 'standard'),
(2, 'D', 4, 'standard'), (2, 'D', 5, 'standard'), (2, 'D', 6, 'standard'),
(2, 'D', 7, 'standard'), (2, 'D', 8, 'standard'), (2, 'D', 9, 'standard'),
(2, 'D', 10, 'wheelchair'),

(2, 'E', 1, 'standard'), (2, 'E', 2, 'standard'), (2, 'E', 3, 'standard'),
(2, 'E', 4, 'standard'), (2, 'E', 5, 'standard'), (2, 'E', 6, 'standard'),
(2, 'E', 7, 'standard'), (2, 'E', 8, 'standard'), (2, 'E', 9, 'standard'),
(2, 'E', 10, 'wheelchair'),

(2, 'F', 1, 'standard'), (2, 'F', 2, 'standard'), (2, 'F', 3, 'standard'),
(2, 'F', 4, 'standard'), (2, 'F', 5, 'standard'), (2, 'F', 6, 'standard'),
(2, 'F', 7, 'standard'), (2, 'F', 8, 'standard'), (2, 'F', 9, 'standard'),
(2, 'F', 10, 'wheelchair');