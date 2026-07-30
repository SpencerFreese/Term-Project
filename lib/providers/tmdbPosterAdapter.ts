import "server-only";

import type { PosterProvider } from "@/lib/providers/posterProvider";

const TMDB_SEARCH_URL =
  "https://api.themoviedb.org/3/search/movie";

const TMDB_IMAGE_BASE_URL =
  "https://image.tmdb.org/t/p/w500";

type TmdbSearchResponse = {
  results?: Array<{
    poster_path?: string | null;
  }>;
};

/**
 * Adapts the TMDB search API to the application's PosterProvider
 * interface. All TMDB-specific concerns (endpoint, API key, response
 * shape, image URL construction) are contained here so the rest of
 * the application only ever deals in plain poster URLs.
 */
export class TMDBPosterAdapter
  implements PosterProvider {
  constructor(
    private readonly apiKey:
      | string
      | undefined = process.env
      .TMDB_API_KEY,
    private readonly imageBaseUrl: string = TMDB_IMAGE_BASE_URL,
  ) {}

  async getPosterUrl(
    title: string,
  ): Promise<string | null> {
    if (!this.apiKey) {
      return null;
    }

    try {
      const response = await fetch(
        `${TMDB_SEARCH_URL}?api_key=${this.apiKey}&query=${encodeURIComponent(
          title,
        )}&language=en-US&page=1`,
      );

      if (!response.ok) {
        return null;
      }

      const data =
        (await response.json()) as TmdbSearchResponse;

      const posterPath =
        data.results?.[0]
          ?.poster_path;

      return posterPath
        ? `${this.imageBaseUrl}${posterPath}`
        : null;
    } catch {
      return null;
    }
  }
}
