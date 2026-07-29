"use client";

import type {
  MovieSelectOption,
} from "@/lib/movieForm";

export default function MovieSelectField({
  movies,
  value,
  onChange,
  label = "Movie",
  id = "movieId",
  required = false,
  helperText,
}: {
  movies: MovieSelectOption[];
  value: string;
  onChange: (movieId: string) => void;
  label?: string;
  id?: string;
  required?: boolean;
  helperText?: string;
}) {
  const selectedMovie = movies.find(
    (movie) =>
      movie.movieId === Number(value),
  );

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-semibold"
      >
        {label}

        {required ? (
          <span className="text-red-500">
            {" "}*
          </span>
        ) : null}
      </label>

      <select
        id={id}
        name={id}
        value={value}
        required={required}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      >
        <option value="">
          Select a movie
        </option>

        {movies.map((movie) => (
          <option
            key={movie.movieId}
            value={movie.movieId}
          >
            {movie.title} —{" "}
            {movie.status.replace("_", " ")}
          </option>
        ))}
      </select>

      {helperText ? (
        <p className="text-xs text-zinc-500">
          {helperText}
        </p>
      ) : selectedMovie ? (
        <p className="text-xs text-zinc-500">
          Runtime:{" "}
          {selectedMovie.runtimeMinutes ??
            "Not entered"}{" "}
          minutes
        </p>
      ) : null}
    </div>
  );
}