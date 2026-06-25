import "server-only";

export {
  getComingSoonMovies,
  getCurrentlyPlayingMovies,
  getMovieDetails,
  getMovieSearchResults,
  getMoviesByStatus,
} from "@/lib/services/movieService";

export { getAllGenres } from "@/lib/services/genreService";

export type { Movie, MovieStatus } from "@/lib/repositories/movieRepository";
export type { Genre } from "@/lib/repositories/genreRepository";