import MovieSection from "./components/MovieSection";
import {
  getAllGenres,
  getComingSoonMovies,
  getCurrentlyPlayingMovies,
  getMovieSearchResults,
  type Genre,
  type Movie,
} from "@/lib/movies";
import ErrorPage from "./components/ErrorPage";
import TitleBar from "./components/TitleBar";

export const dynamic = "force-dynamic";

export type HomeDataResult =
  | {
      ok: true;
      currentlyPlaying: Movie[];
      comingSoon: Movie[];
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

    return {
      ok: true,
      currentlyPlaying,
      comingSoon,
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

  const result = await loadHomeData(searchTerm, selectedGenres, showDate);

  if (!result.ok) {
    return <ErrorPage result={result} />;
  }

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
      />

      <MovieSection
        title={
        searchTerm || selectedGenres.length > 0 || showDate
          ? "Coming Soon — Filtered Results"
          : "Coming Soon"
        }
        movies={result.comingSoon}
      />
    </main>
  );
}
