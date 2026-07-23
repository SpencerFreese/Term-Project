"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MovieSelectField from "@/app/admin/components/MovieSelectField";
import type { MovieSelectOption} from "@/lib/movieForm";

export default function EditMoviePicker({
  movies,
}: {
  movies: MovieSelectOption[];
}) {
  const router = useRouter();

  const [movieId, setMovieId] =
    useState("");

  return (
    <div className="mt-5 flex flex-col gap-4">
      <MovieSelectField
        movies={movies}
        value={movieId}
        onChange={setMovieId}
        label="Movie to edit"
      />

      <button
        type="button"
        disabled={!movieId}
        onClick={() =>
          router.push(
            `/admin/movies/${movieId}/edit`,
          )
        }
        className="rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Edit Selected Movie
      </button>
    </div>
  );
}