import MovieSection from "./components/MovieSection";
import {
  getAllGenres,
  getComingSoonMovies,
  getCurrentlyPlayingMovies,
  getMovieSearchResults,
  type Genre,
  type Movie,
} from "@/lib/movies";
import { findShowtimesByMovieId, type ShowtimeRow } from "@/lib/repositories/showtimeRepository";
import { findFavoriteMovieIdsByUserId } from "@/lib/repositories/favoriteRepository";
import { getSession } from "@/lib/auth";
import ErrorPage from "./components/ErrorPage";
import TitleBar from "./components/TitleBar";

export const dynamic = "force-dynamic";

export type MovieWithShowtimes = Movie & { showtimes: ShowtimeRow[] };

export type HomeDataResult =
  | {
      ok: true;
      currentlyPlaying: MovieWithShowtimes[];
      comingSoon: MovieWithShowtimes[];
      genres: Genre[];
    }
  | {
      ok: false;
      message: string;
    };


function normalizeGenres(value?: string | string[]) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}


async function attachShowtimes(movies: Movie[]): Promise<MovieWithShowtimes[]> {
  const showtimes = await Promise.all(
    movies.map((movie) => findShowtimesByMovieId(movie.movieId)),
  );
  return movies.map((movie, i) => ({ ...movie, showtimes: showtimes[i] }));
}

async function loadHomeData(
  searchTerm: string,
  selectedGenres: string[],
  showDate: string,
): Promise<HomeDataResult> {
  try {
    const filters = {
      searchTerm: searchTerm || undefined,
      genres: selectedGenres,
      showDate: showDate || undefined,
    };

    const [currentlyPlaying, comingSoon, genres] = await Promise.all([
      getCurrentlyPlayingMovies(filters),
      getComingSoonMovies(filters),
      getAllGenres(),
    ]);

    const [currentlyPlayingWithShowtimes, comingSoonWithShowtimes] =
      await Promise.all([
        attachShowtimes(currentlyPlaying),
        attachShowtimes(comingSoon),
      ]);

    return {
      ok: true,
      currentlyPlaying: currentlyPlayingWithShowtimes,
      comingSoon: comingSoonWithShowtimes,
      genres,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Unknown database error",
    };
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    genre?: string | string[];
    showDate?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const searchTerm = resolvedSearchParams.search?.trim() ?? "";
  const selectedGenres = normalizeGenres(resolvedSearchParams.genre);
  const showDate = resolvedSearchParams.showDate?.trim() ?? "";

  const [result, session] = await Promise.all([
    loadHomeData(searchTerm, selectedGenres, showDate),
    getSession(),
  ]);

  if (!result.ok) {
    return <ErrorPage result={result} />;
  }

  const favoritedMovieIds = session
    ? await findFavoriteMovieIdsByUserId(session.userId)
    : [];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-12 sm:px-10">
      <TitleBar searchTerm={searchTerm} selectedGenres={selectedGenres} showDate={showDate} result={result} />

      <MovieSection
        title={
        searchTerm || selectedGenres.length > 0 || showDate
          ? "Currently Playing — Filtered Results"
          : "Currently Playing"
        }
        movies={result.currentlyPlaying}
        favoritedMovieIds={favoritedMovieIds}
        isAuthenticated={Boolean(session)}
      />

      <MovieSection
        title={
        searchTerm || selectedGenres.length > 0 || showDate
          ? "Coming Soon — Filtered Results"
          : "Coming Soon"
        }
        movies={result.comingSoon}
        favoritedMovieIds={favoritedMovieIds}
        isAuthenticated={Boolean(session)}
      />
    </main>
  );
}
