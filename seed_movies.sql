-- ============================================================
-- Term_Project: Movie seed data
-- 10 real 2026 movies with genres
-- ============================================================

USE Term_Project;

-- ------------------------------------------------------------
-- Genres
-- ------------------------------------------------------------
INSERT IGNORE INTO genres (name) VALUES
    ('Action'),
    ('Adventure'),
    ('Animation'),
    ('Comedy'),
    ('Drama'),
    ('Family'),
    ('Horror'),
    ('Mystery'),
    ('Romance'),
    ('Sci-Fi'),
    ('Thriller');

-- ------------------------------------------------------------
-- Movies
-- For sprint 1, we need 6 currently_playing, 4 coming_soon
-- ------------------------------------------------------------
INSERT INTO movies (title, description, poster_url, trailer_url, mpaa_rating, cast_list, runtime_minutes, release_date, status)
VALUES

-- 1
('Project Hail Mary',
 'Science teacher Ryland Grace wakes up alone on a spaceship light-years from Earth with no memory of how he got there. As his memory returns, he uncovers his mission: solve the riddle of a mysterious substance killing the sun and save Earth from extinction.',
 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7e/Project_Hail_Mary_film_poster.jpg/220px-Project_Hail_Mary_film_poster.jpg',
 'https://www.youtube.com/embed/dQw4w9WgXcQ',
 'PG-13',
 'Ryan Gosling, Sandra Hüller, James Ortiz, Lionel Boyce',
 156,
 '2026-03-20',
 'currently_playing'),

-- 2
('Toy Story 5',
 'Jessie, Woody, and Buzz Lightyear face a new challenge when Bonnie becomes obsessed with Lilypad, a smart tablet that threatens to replace the toys in her life forever.',
 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9e/Toy_Story_5_poster.jpg/220px-Toy_Story_5_poster.jpg',
 'https://www.youtube.com/embed/dQw4w9WgXcQ',
 'PG',
 'Tom Hanks, Tim Allen, Joan Cusack, Conan O''Brien, Greta Lee',
 102,
 '2026-06-19',
 'currently_playing'),

-- 3
('Star Wars: The Mandalorian and Grogu',
 'Legendary Mandalorian bounty hunter Din Djarin and his young apprentice Grogu are enlisted by the New Republic to rescue Jabba the Hutt''s son in exchange for intel on a dangerous warlord.',
 'https://upload.wikimedia.org/wikipedia/en/thumb/4/46/The_Mandalorian_and_Grogu_poster.jpg/220px-The_Mandalorian_and_Grogu_poster.jpg',
 'https://www.youtube.com/embed/dQw4w9WgXcQ',
 'PG-13',
 'Pedro Pascal, Sigourney Weaver, Jeremy Allen White',
 132,
 '2026-05-22',
 'currently_playing'),

-- 4
('Scream 7',
 'A new Ghostface killer emerges in the quiet town where Sidney Prescott has built a new life. When her teenage daughter becomes the next target, Sidney must face the horrors of her past once and for all.',
 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Scream_7_poster.jpg/220px-Scream_7_poster.jpg',
 'https://www.youtube.com/embed/dQw4w9WgXcQ',
 'R',
 'Neve Campbell, Courteney Cox, David Arquette, Isabel May',
 114,
 '2026-02-27',
 'currently_playing'),

-- 5
('Mortal Kombat II',
 'Johnny Cage leads a new generation of Earth''s champions into a brutal inter-realm tournament, facing the most dangerous fighters in the universe to defend humanity''s survival.',
 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2e/Mortal_Kombat_2_2026_poster.jpg/220px-Mortal_Kombat_2_2026_poster.jpg',
 'https://www.youtube.com/embed/dQw4w9WgXcQ',
 'R',
 'Karl Urban, Jessica McNamee, Josh Lawson, Hiroyuki Sanada',
 120,
 '2026-05-08',
 'currently_playing'),

-- 6
('The Super Mario Galaxy Movie',
 'Mario and his friends blast off into space to stop Bowser from seizing the power of the Grand Stars and remaking the universe in his image.',
 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3e/Super_Mario_Galaxy_Movie_poster.jpg/220px-Super_Mario_Galaxy_Movie_poster.jpg',
 'https://www.youtube.com/embed/dQw4w9WgXcQ',
 'PG',
 'Chris Pratt, Anya Taylor-Joy, Jack Black, Charlie Day',
 104,
 '2026-04-01',
 'currently_playing'),

-- 7 (coming soon)
('Minions & Monsters',
 'The Minions accidentally unleash a horde of ancient monsters from a hidden vault beneath Gru''s lair, forcing them into an unlikely alliance with the creatures to set things right.',
 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1e/Minions_and_Monsters_poster.jpg/220px-Minions_and_Monsters_poster.jpg',
 'https://www.youtube.com/embed/dQw4w9WgXcQ',
 'PG',
 'Steve Carell, Pierre Coffin, Miranda Cosgrove',
 95,
 '2026-07-10',
 'coming_soon'),

-- 8 (coming soon)
('Spider-Man: Brand New Day',
 'Peter Parker faces a radically altered world after a deal with the devil erases his marriage from existence, forcing him to rediscover who he is as both a man and a hero.',
 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6e/Spider_Man_Brand_New_Day_poster.jpg/220px-Spider_Man_Brand_New_Day_poster.jpg',
 'https://www.youtube.com/embed/dQw4w9WgXcQ',
 'PG-13',
 'Tom Holland, Zendaya, Benedict Cumberbatch',
 135,
 '2026-07-24',
 'coming_soon'),

-- 9 (coming soon)
('The Hunger Games: Sunrise on the Reaping',
 'Set during the 50th Hunger Games, a young Haymitch Abernathy fights for his life in the deadly arena while uncovering the Capitol''s darkest secrets.',
 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/Sunrise_on_the_Reaping_poster.jpg/220px-Sunrise_on_the_Reaping_poster.jpg',
 'https://www.youtube.com/embed/dQw4w9WgXcQ',
 'PG-13',
 'Joseph Zada, Maya Hawke, Lola Kirke',
 140,
 '2026-11-20',
 'coming_soon'),

-- 10 (coming soon)
('Avengers: Doomsday',
 'The Avengers face their greatest threat yet as Doctor Doom harnesses a power that could reshape all of reality, forcing heroes from across the multiverse to unite for one final stand.',
 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9e/Avengers_Doomsday_poster.jpg/220px-Avengers_Doomsday_poster.jpg',
 'https://www.youtube.com/embed/dQw4w9WgXcQ',
 'PG-13',
 'Robert Downey Jr., Chris Evans, Scarlett Johansson',
 150,
 '2026-12-18',
 'coming_soon');

-- ------------------------------------------------------------
-- Movie <-> Genre links
-- The movie_genres table is what connects a movie to its genres since a movie can have multiple genres and a genre can belong to multiple movies.
-- ------------------------------------------------------------
INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id FROM movies m, genres g
WHERE m.title = 'Project Hail Mary'         AND g.name IN ('Sci-Fi', 'Adventure', 'Drama');

INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id FROM movies m, genres g
WHERE m.title = 'Toy Story 5'               AND g.name IN ('Animation', 'Family', 'Comedy');

INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id FROM movies m, genres g
WHERE m.title = 'Star Wars: The Mandalorian and Grogu' AND g.name IN ('Action', 'Adventure', 'Sci-Fi');

INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id FROM movies m, genres g
WHERE m.title = 'Scream 7'                  AND g.name IN ('Horror', 'Mystery', 'Thriller');

INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id FROM movies m, genres g
WHERE m.title = 'Mortal Kombat II'          AND g.name IN ('Action', 'Adventure');

INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id FROM movies m, genres g
WHERE m.title = 'The Super Mario Galaxy Movie' AND g.name IN ('Animation', 'Adventure', 'Comedy', 'Family');

INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id FROM movies m, genres g
WHERE m.title = 'Minions & Monsters'        AND g.name IN ('Animation', 'Comedy', 'Family');

INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id FROM movies m, genres g
WHERE m.title = 'Spider-Man: Brand New Day' AND g.name IN ('Action', 'Adventure', 'Sci-Fi');

INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id FROM movies m, genres g
WHERE m.title = 'The Hunger Games: Sunrise on the Reaping' AND g.name IN ('Action', 'Adventure', 'Drama');

INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id FROM movies m, genres g
WHERE m.title = 'Avengers: Doomsday'        AND g.name IN ('Action', 'Adventure', 'Sci-Fi');
