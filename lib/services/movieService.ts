import "server-only";

import {
  findMovieById,
  findMoviesByGenre,
  findMoviesByStatus,
  searchMovies,
  type MovieStatus,
} from "@/lib/repositories/movieRepository";
import { findShowtimesByMovieId } from "@/lib/repositories/showtimeRepository";

export async function getMoviesByStatus(status: MovieStatus) {
  return findMoviesByStatus(status);
}

export async function getCurrentlyPlayingMovies() {
  return getMoviesByStatus("currently_playing");
}

export async function getComingSoonMovies() {
  return getMoviesByStatus("coming_soon");
}

export async function getMovieSearchResults(searchTerm?: string, genre?: string) {
  if (searchTerm && searchTerm.trim()) {
    return searchMovies(searchTerm.trim());
  }

  if (genre && genre.trim()) {
    return findMoviesByGenre(genre.trim());
  }

  const [currentlyPlaying, comingSoon] = await Promise.all([
    getCurrentlyPlayingMovies(),
    getComingSoonMovies(),
  ]);

  return [...currentlyPlaying, ...comingSoon];
}

export async function getMovieDetails(movieId: number) {
  if (!Number.isInteger(movieId) || movieId <= 0) {
    return null;
  }

  const movie = await findMovieById(movieId);

  if (!movie) {
    return null;
  }

  const showtimes = await findShowtimesByMovieId(movieId);

  return {
    ...movie,
    showtimes,
  };
}