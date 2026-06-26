# ----------------------------------------------------------------
# Setup Instructions
# ----------------------------------------------------------------
# 1. Install required libraries (run these in your terminal):
#       pip install requests
#       pip install mysql-connector-python
#
# 2. Create a file called tmdb.env in the project root with:
#       TMDB_API_KEY=your_tmdb_api_key_here
#       MYSQL_HOST=127.0.0.1
#       MYSQL_PORT=3307
#       MYSQL_USER=root
#       MYSQL_PASSWORD=term_project_root
#       MYSQL_DATABASE=term_project
#
#    Get a free TMDB API key at https://www.themoviedb.org/settings/api
#    Note: tmdb.env is gitignored so each teammate needs their own copy.
#
# 3. Run the script from the project root:
#       python scripts/fetch_posters.py
#
#    The script will automatically find any movies in the database
#    that are missing a poster URL and update them from TMDB.


import requests
import mysql.connector

# ----------------------------------------------------------------
# Load config from tmdb.env
# ----------------------------------------------------------------
def load_env(filepath="tmdb.env"):
    config = {}
    with open(filepath) as f:
        for line in f:
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                key, value = line.split("=", 1)
                config[key.strip()] = value.strip()
    return config

# ----------------------------------------------------------------
# Fetch poster URL from TMDB for a given title
# ----------------------------------------------------------------
def get_poster_url(title, api_key):
    url = "https://api.themoviedb.org/3/search/movie"
    params = {
        "api_key": api_key,
        "query": title,
        "language": "en-US",
        "page": 1
    }

    response = requests.get(url, params=params)
    response.raise_for_status()
    results = response.json().get("results", [])

    if not results:
        return None

    poster_path = results[0].get("poster_path")
    if not poster_path:
        return None

    return f"https://image.tmdb.org/t/p/w500{poster_path}"

# ----------------------------------------------------------------
# Main
# ----------------------------------------------------------------
def main():
    env = load_env()

    api_key = env.get("TMDB_API_KEY")
    if not api_key:
        raise Exception("TMDB_API_KEY not found in tmdb.env")

    # DB connection — reads from tmdb.env so teammates just fill in their own
    db = mysql.connector.connect(
        host=env.get("MYSQL_HOST", "127.0.0.1"),
        port=int(env.get("MYSQL_PORT", 3307)),
        user=env.get("MYSQL_USER", "root"),
        password=env.get("MYSQL_PASSWORD", "term_project_root"),
        database=env.get("MYSQL_DATABASE", "term_project")
    )
    cursor = db.cursor()

    # Fetch all movies that need a poster update:
    # either no poster_url or still using the old Wikipedia placeholder
    cursor.execute("""
        SELECT movie_id, title FROM movies
        WHERE poster_url IS NULL
           OR poster_url LIKE '%wikipedia%'
           OR poster_url = ''
    """)
    movies = cursor.fetchall()

    if not movies:
        print("All movies already have poster URLs. Nothing to update.")
        db.close()
        return

    print(f"Found {len(movies)} movie(s) to update.\n")

    updated = 0
    skipped = 0

    for movie_id, title in movies:
        poster_url = get_poster_url(title, api_key)

        if poster_url:
            cursor.execute(
                "UPDATE movies SET poster_url = %s WHERE movie_id = %s",
                (poster_url, movie_id)
            )
            print(f"  Updated : {title}")
            updated += 1
        else:
            print(f"  WARNING : No poster found for '{title}' — skipping")
            skipped += 1

    db.commit()
    cursor.close()
    db.close()

    print(f"\nDone. {updated} updated, {skipped} skipped.")

if __name__ == "__main__":
    main()