import "server-only";

export {
  getComingSoonMovies,
  getCurrentlyPlayingMovies,
  getMovieDetails,
  getMovieSearchResults,
  getMoviesByStatus,
} from "@/lib/services/movieService";

export type { Movie, MovieStatus } from "@/lib/repositories/movieRepository";