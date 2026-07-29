USE term_project;

-- Use the earliest upcoming showtime for testing
SET @test_showtime_id = (
    SELECT showtime_id
    FROM showtimes
    WHERE start_time > NOW()
    ORDER BY start_time ASC
    LIMIT 1
);

-- Remove previous test statuses for this showtime
DELETE FROM showtime_seats
WHERE showtime_id = @test_showtime_id;

-- Mark A2 and A3 as booked
INSERT INTO showtime_seats (
    showtime_id,
    seat_id,
    status,
    reserved_at,
    reserved_until
)
SELECT
    st.showtime_id,
    s.seat_id,
    'booked',
    NULL,
    NULL
FROM showtimes st
JOIN seats s
    ON s.theater_room_id = st.theater_room_id
WHERE st.showtime_id = @test_showtime_id
  AND s.row_label = 'A'
  AND s.seat_number IN (2, 3);

-- Mark B4 as temporarily reserved
INSERT INTO showtime_seats (
    showtime_id,
    seat_id,
    status,
    reserved_at,
    reserved_until
)
SELECT
    st.showtime_id,
    s.seat_id,
    'reserved',
    NOW(),
    DATE_ADD(NOW(), INTERVAL 30 MINUTE)
FROM showtimes st
JOIN seats s
    ON s.theater_room_id = st.theater_room_id
WHERE st.showtime_id = @test_showtime_id
  AND s.row_label = 'B'
  AND s.seat_number = 4;

-- Show which showtime and seats were updated
SELECT
    ss.showtime_id,
    m.title,
    tr.room_name,
    s.row_label,
    s.seat_number,
    ss.status,
    ss.reserved_until
FROM showtime_seats ss
JOIN showtimes st
    ON st.showtime_id = ss.showtime_id
JOIN movies m
    ON m.movie_id = st.movie_id
JOIN theater_rooms tr
    ON tr.theater_room_id = st.theater_room_id
JOIN seats s
    ON s.seat_id = ss.seat_id
WHERE ss.showtime_id = @test_showtime_id
ORDER BY s.row_label, s.seat_number;