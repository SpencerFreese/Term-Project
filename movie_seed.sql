USE term_project;

-- ============================================================
-- Clear old seed data
-- get rid of this submission version 
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE showtimes;
TRUNCATE TABLE seats;
TRUNCATE TABLE theater_rooms;
TRUNCATE TABLE movie_genres;
TRUNCATE TABLE genres;
TRUNCATE TABLE movies;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Genres
-- ============================================================

INSERT INTO genres (name) VALUES
('Action'),
('Adventure'),
('Animation'),
('Romance'),
('Comedy'),
('Drama'),
('Fantasy'),
('Sci-Fi'),
('Superhero'),
('Thriller'),
('Horror'),
('Family');

-- ============================================================
-- movies
-- 5 currently_playing, 5 coming_soon
-- ============================================================

INSERT INTO movies (
    title,
    description,
    poster_url,
    trailer_url,
    mpaa_rating,
    cast_list,
    runtime_minutes,
    release_date,
    status
)
VALUES
-- currently playing
(
    'Obsession',
    'After breaking the mysterious "One Wish Willow" to win his crushs heart, a hopeless romantic finds himself getting exactly what he asked for but soon discovers that some desires come at a dark, sinister price.',
    'placehold Poster',
    'https://www.youtube.com/watch?v=xJYoN-fX2j0',
    'R',
    'Michael Jonhston, Inde Navarrette, Cooper Tomlinson, Megan Lawless, Andy Richter, Haley Fitzgerald, Darin Toonder, Anthony Pavone, Anthony Casabianca, Chloe Breen, Malcom Kelner',
    108,
    '2026-05-15',
    'currently_playing'
),
(
    'Scary Movie',
    'Twenty-six years after outrunning a suspiciously familiar masked killer, Shorty, Ray, Cindy and Brenda find themselves targeted by another mad slasher..',
    'placehold Poster',
    'https://www.youtube.com/watch?v=0fZ58S-7QP0',
    'R',
    'Marlon Wayans, Shawn Wayans, Anna Faris, Regina Hall, Kenan Thompson, Dave Sheridan, Lochlyn Munro, Kim Wayans, Cheri Oteri, Chris Elliott, Damon Wayans Jr, Heidi Gardner, Olivia Rose Keegan, Cameron Scott Roberts, Savannah Lee May, Sydney Park, Cregg Wayans, Benny Zielke .',
    96,
    '2026-07-21',
    'currently_playing'
),
(
    'Toy Story 5',
    'Woody (voice of Tom Hanks), Buzz Lightyear (voice of Tim Allen), Jessie (voice of Joan Cusack) and the rest of the gangs jobs are challenged when they come face-to-face with Lilypad (voice of Greta Lee), a brand-new tablet device that arrives with her own disruptive ideas about what is best for their kid, Bonnie. Will playtime ever be the same?.',
    'placehold Poster',
    'https://www.youtube.com/watch?v=c51ND9Hdbw0',
    'PG',
    'Tom Hanks, Tim Allen, Joan Cusack, Tony Hate, Conan OBrien, Greta Lee, Ernie Hudson.',
    102,
    '2026-06-13',
    'currently_playing'
),
(
    'Disclosure Day',
    'If you found out we werent alone, if someone showed you, proved it to you, would that frighten you? This summer, the truth belongs to eight billion people. Today is... Disclosure Day.',
    'placehold Poster',
    'https://www.youtube.com/watch?v=SCYT8vb2siQ',
    'PG-13',
    'Emily Blunt, Josh OConnor, Colin Firth, Eve Hewson, Colman Domingo, Wyatt Russell, Henry Lloyd-Hughes, Elizabeth Marvel.',
    145,
    '2026-06-12',
    'currently_playing'
),
(
    'Star Wars: The Mandalorian and Grogu',
    'The evil Empire has fallen, and Imperial warlords remain scattered throughout the galaxy. As the fledgling New Republic works to protect everything the Rebellion fought for, they have enlisted the help of legendary Mandalorian bounty hunter Din Djarin (Pedro Pascal) and his young apprentice Grogu..',
    'placehold Poster',
    'https://www.youtube.com/watch?v=IHWlvwu8t1w',
    'PG-13',
    'Pedro Pascal, Sigourney Weaver, Jermey Allen White, Jonathan Coyne',
    172,
    '2026-05-22',
    'currently_playing'
),

-- Comming soon section
(
    'Spider-Man: Brand New Day',
    'It is a BRAND NEW DAY for Peter Parker. Fighting crime full-time as Spider-Man in a world that doesn’t remember him.',
    'placehold Poster',
    'https://www.youtube.com/watch?v=8TZMtslA3UY',
    'PG-13',
    'Tom Holland, Zendaya, Jacob Batalon, Sadie Sink, Mark Ruffalo, Jon Bernthal',
    140,
    '2026-06-30',
    'coming_soon'
),
(
    'Moana',
    'Moana (Catherine Lagaaia) answers the Oceans call and, for the first time, voyages beyond the reef of her island of Motunui with the infamous demigod Maui (Dwayne Johnson) on an unforgettable journey to restore prosperity to her people.',
    'placehold Poster',
    'https://www.youtube.com/watch?v=EEz5xbzYPKI',
    'PG',
    'Catherine Lagaaia, Dwayne Johnson, Rena Owen, John Tui, Frankie Adams',
    115,
    '2026-07-10',
    'coming_soon'
),
(
    'Minions & Monsters',
    'This is the rambunctious, ridiculous and totally true story of how the Minions conquered Hollywood, became movie stars, lost everything, unleashed monsters onto the world and then banded together to try and save the planet from the mayhem they had just created..',
    'placehold Poster',
    'phttps://www.youtube.com/watch?v=ZSdOwt-G49w',
    'PG-13',
    'Pierre Coffine, Allison Janney, Christoph Waltz, Jeff Bridges, Jesse Elsenberg, Zoey Deutch, Bobby Moynihan, Phill LaMarr, Try Parker',
    90,
    '2026-07-1',
    'coming_soon'
),
(
    'The Invite',
    'Joe and Angelas marriage is on thin ice. When they invite their enigmatic upstairs neighbors for a dinner party, the night spirals into unexpected places. Have they reignited the spark or lit the match that burns it all down?.',
    'placehold Poster',
    'https://www.youtube.com/watch?v=OJ19I9q_hOQ',
    'R',
    'Olivia Wilde, Seth Rogan, Penelope Cruz, Edward Norton',
    107,
    '2026-07-10',
    'coming_soon'
),
(
    'Supergirl',
    'When an unexpected and ruthless adversary strikes too close to home, Kara Zor-El, aka Supergirl, reluctantly joins forces with an unlikely companion on an epic, interstellar journey of vengeance and justice..',
    'placehold Poster',
    'https://www.youtube.com/watch?v=s1-pfiVMKAs',
    'PG-13',
    'Milly Alcock, Jason Momoa, Matthias Schoenaerts, Eve Ridley, David Krumholtz, Emily Beecham',
    169,
    '2026-06-26',
    'coming_soon'
);

-- ============================================================
-- Movie genre relationships
-- ============================================================

INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id
FROM movies m
JOIN genres g ON g.name IN ('Horror', 'Romance', 'Thriller')
WHERE m.title = 'Obsession';

INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id
FROM movies m
JOIN genres g ON g.name IN ('Comedy', 'Horror')
WHERE m.title = 'Scary Movie';

INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id
FROM movies m
JOIN genres g ON g.name IN ('Animation', 'Adventure', 'Comedy', 'Family')
WHERE m.title = 'Toy Story 5';

INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id
FROM movies m
JOIN genres g ON g.name IN ('Drama', 'Sci-Fi', 'Thriller')
WHERE m.title = 'Disclosure Day';

INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id
FROM movies m
JOIN genres g ON g.name IN ('Action', 'Adventure', 'Sci-Fi')
WHERE m.title = 'Star Wars: The Mandalorian and Grogu';


-- comming soon 

INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id
FROM movies m
JOIN genres g ON g.name IN ('Action', 'Adventure', 'Superhero')
WHERE m.title = 'Spider-Man: Brand New Day';

INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id
FROM movies m
JOIN genres g ON g.name IN ('Adventure', 'Family', 'Fantasy')
WHERE m.title = 'Moana';

INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id
FROM movies m
JOIN genres g ON g.name IN ('Animation', 'Comedy', 'Family')
WHERE m.title = 'Minions & Monsters';

INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id
FROM movies m
JOIN genres g ON g.name IN ('Comedy', 'Drama', 'Thriller')
WHERE m.title = 'The Invite';

INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id
FROM movies m
JOIN genres g ON g.name IN ('Action', 'Adventure', 'Sci-Fi', 'Superhero')
WHERE m.title = 'Supergirl';

-- ============================================================
-- Theater rooms
-- ============================================================

INSERT INTO theater_rooms (
    room_name,
    seat_rows,
    seat_cols,
    format_type
)
VALUES
('Theater Room 1', 5, 8, 'Standard'),
('Theater Room 2', 5, 8, 'IMAX'),
('Theater Room 3', 5, 8, 'Dolby');

-- ============================================================
-- Seats
-- 5 rows x 8 seats = 40 seats per room
-- 3 rooms = 120 seats total
-- ============================================================

INSERT INTO seats (
    theater_room_id,
    row_label,
    seat_number,
    seat_type
)
SELECT 
    tr.theater_room_id,
    rows_table.row_label,
    numbers_table.seat_number,
    'standard'
FROM theater_rooms tr
JOIN (
    SELECT 'A' AS row_label
    UNION SELECT 'B'
    UNION SELECT 'C'
    UNION SELECT 'D'
    UNION SELECT 'E'
) rows_table
JOIN (
    SELECT 1 AS seat_number
    UNION SELECT 2
    UNION SELECT 3
    UNION SELECT 4
    UNION SELECT 5
    UNION SELECT 6
    UNION SELECT 7
    UNION SELECT 8
) numbers_table;

-- ============================================================
-- Showtimes
-- Only currently_playing movies get showtimes
-- ============================================================

INSERT INTO showtimes (
    movie_id,
    theater_room_id,
    start_time,
    end_time,
    format_type,
    status
)
SELECT m.movie_id, tr.theater_room_id, '2026-07-01 14:00:00', '2026-07-01 15:48:00', 'Standard', 'scheduled'
FROM movies m
JOIN theater_rooms tr ON tr.room_name = 'Theater Room 1'
WHERE m.title = 'Obsession';

INSERT INTO showtimes (
    movie_id,
    theater_room_id,
    start_time,
    end_time,
    format_type,
    status
)
SELECT m.movie_id, tr.theater_room_id, '2026-07-01 17:00:00', '2026-07-01 18:48:00', 'Standard', 'scheduled'
FROM movies m
JOIN theater_rooms tr ON tr.room_name = 'Theater Room 1'
WHERE m.title = 'Obsession';

INSERT INTO showtimes (
    movie_id,
    theater_room_id,
    start_time,
    end_time,
    format_type,
    status
)
SELECT m.movie_id, tr.theater_room_id, '2026-07-01 20:00:00', '2026-07-01 21:48:00', 'Standard', 'scheduled'
FROM movies m
JOIN theater_rooms tr ON tr.room_name = 'Theater Room 1'
WHERE m.title = 'Obsession';


INSERT INTO showtimes (
    movie_id,
    theater_room_id,
    start_time,
    end_time,
    format_type,
    status
)
SELECT m.movie_id, tr.theater_room_id, '2026-07-02 14:00:00', '2026-07-02 15:36:00', 'Standard', 'scheduled'
FROM movies m
JOIN theater_rooms tr ON tr.room_name = 'Theater Room 1'
WHERE m.title = 'Scary Movie';

INSERT INTO showtimes (
    movie_id,
    theater_room_id,
    start_time,
    end_time,
    format_type,
    status
)
SELECT m.movie_id, tr.theater_room_id, '2026-07-02 17:00:00', '2026-07-02 18:36:00', 'Standard', 'scheduled'
FROM movies m
JOIN theater_rooms tr ON tr.room_name = 'Theater Room 1'
WHERE m.title = 'Scary Movie';

INSERT INTO showtimes (
    movie_id,
    theater_room_id,
    start_time,
    end_time,
    format_type,
    status
)
SELECT m.movie_id, tr.theater_room_id, '2026-07-02 20:00:00', '2026-07-02 21:36:00', 'Standard', 'scheduled'
FROM movies m
JOIN theater_rooms tr ON tr.room_name = 'Theater Room 1'
WHERE m.title = 'Scary Movie';


INSERT INTO showtimes (
    movie_id,
    theater_room_id,
    start_time,
    end_time,
    format_type,
    status
)
SELECT m.movie_id, tr.theater_room_id, '2026-07-03 13:00:00', '2026-07-03 14:42:00', 'Standard', 'scheduled'
FROM movies m
JOIN theater_rooms tr ON tr.room_name = 'Theater Room 1'
WHERE m.title = 'Toy Story 5';

INSERT INTO showtimes (
    movie_id,
    theater_room_id,
    start_time,
    end_time,
    format_type,
    status
)
SELECT m.movie_id, tr.theater_room_id, '2026-07-03 16:00:00', '2026-07-03 17:42:00', 'Standard', 'scheduled'
FROM movies m
JOIN theater_rooms tr ON tr.room_name = 'Theater Room 1'
WHERE m.title = 'Toy Story 5';


INSERT INTO showtimes (
    movie_id,
    theater_room_id,
    start_time,
    end_time,
    format_type,
    status
)
SELECT m.movie_id, tr.theater_room_id, '2026-07-04 14:00:00', '2026-07-04 16:25:00', 'IMAX', 'scheduled'
FROM movies m
JOIN theater_rooms tr ON tr.room_name = 'Theater Room 2'
WHERE m.title = 'Disclosure Day';

INSERT INTO showtimes (
    movie_id,
    theater_room_id,
    start_time,
    end_time,
    format_type,
    status
)
SELECT m.movie_id, tr.theater_room_id, '2026-07-04 18:00:00', '2026-07-04 20:25:00', 'IMAX', 'scheduled'
FROM movies m
JOIN theater_rooms tr ON tr.room_name = 'Theater Room 2'
WHERE m.title = 'Disclosure Day';


INSERT INTO showtimes (
    movie_id,
    theater_room_id,
    start_time,
    end_time,
    format_type,
    status
)
SELECT m.movie_id, tr.theater_room_id, '2026-07-05 14:00:00', '2026-07-05 16:52:00', 'Dolby', 'scheduled'
FROM movies m
JOIN theater_rooms tr ON tr.room_name = 'Theater Room 3'
WHERE m.title = 'Star Wars: The Mandalorian and Grogu';

INSERT INTO showtimes (
    movie_id,
    theater_room_id,
    start_time,
    end_time,
    format_type,
    status
)
SELECT m.movie_id, tr.theater_room_id, '2026-07-05 18:00:00', '2026-07-05 20:52:00', 'Dolby', 'scheduled'
FROM movies m
JOIN theater_rooms tr ON tr.room_name = 'Theater Room 3'
WHERE m.title = 'Star Wars: The Mandalorian and Grogu';
