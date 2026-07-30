/**
 * Application-owned abstraction for looking up a movie poster image.
 *
 * AdminMovieService depends on this interface instead of any specific
 * external API, so the poster source can be swapped or supplemented
 * (e.g. a different provider than TMDB) without changing the service.
 */
export interface PosterProvider {
  /**
   * Resolves a movie title to a fully-qualified poster image URL,
   * or null if no poster could be found.
   */
  getPosterUrl(
    title: string,
  ): Promise<string | null>;
}
