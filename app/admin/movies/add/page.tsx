"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MPAA_RATINGS = ["G", "PG", "PG-13", "R", "NC-17"];

const ALL_GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Drama",
  "Family",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
];

export default function AddMoviePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    posterUrl: "",
    trailerUrl: "",
    mpaaRating: "",
    castList: "",
    runtimeMinutes: "",
    releaseDate: "",
    status: "coming_soon" as "coming_soon" | "currently_playing",
    genreIds: [] as number[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Genre ID map — matches the order genres were seeded
  const genreMap: Record<string, number> = {
    Action: 1,
    Adventure: 2,
    Animation: 3,
    Comedy: 4,
    Drama: 5,
    Family: 6,
    Horror: 7,
    Mystery: 8,
    Romance: 9,
    "Sci-Fi": 10,
    Thriller: 11,
  };

  function toggleGenre(genreName: string) {
    const id = genreMap[genreName];
    setForm((prev) => ({
      ...prev,
      genreIds: prev.genreIds.includes(id)
        ? prev.genreIds.filter((g) => g !== id)
        : [...prev.genreIds, id],
    }));
  }

  function validate() {
    const newErrors: Record<string, string> = {};

    if (!form.title.trim()) {
      newErrors.title = "Title is required.";
    }

    if (form.runtimeMinutes) {
      const parsed = Number(form.runtimeMinutes);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        newErrors.runtimeMinutes = "Runtime must be a positive whole number.";
      }
    }

    if (form.releaseDate && !/^\d{4}-\d{2}-\d{2}$/.test(form.releaseDate)) {
      newErrors.releaseDate = "Date must be in YYYY-MM-DD format.";
    }

    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          runtimeMinutes: form.runtimeMinutes ? Number(form.runtimeMinutes) : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong.");
        return;
      }

      // Redirect to admin home on success
      router.push("/admin");
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
            Admin Portal
          </p>
          <h1 className="text-3xl font-bold">Add Movie</h1>
        </div>
        <Link
          href="/admin"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          ← Back
        </Link>
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Avengers: Doomsday"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          {errors.title && (
            <p className="text-xs text-red-500">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Brief synopsis of the movie..."
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="coming_soon">Coming Soon</option>
            <option value="currently_playing">Currently Playing</option>
          </select>
        </div>

        {/* MPAA Rating */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold">MPAA Rating</label>
          <select
            name="mpaaRating"
            value={form.mpaaRating}
            onChange={handleChange}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">Select a rating</option>
            {MPAA_RATINGS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Runtime */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold">Runtime (minutes)</label>
          <input
            name="runtimeMinutes"
            type="number"
            min="1"
            value={form.runtimeMinutes}
            onChange={handleChange}
            placeholder="e.g. 120"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          {errors.runtimeMinutes && (
            <p className="text-xs text-red-500">{errors.runtimeMinutes}</p>
          )}
        </div>

        {/* Release Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold">Release Date</label>
          <input
            name="releaseDate"
            type="date"
            value={form.releaseDate}
            onChange={handleChange}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          {errors.releaseDate && (
            <p className="text-xs text-red-500">{errors.releaseDate}</p>
          )}
        </div>

        {/* Cast */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold">Cast</label>
          <input
            name="castList"
            value={form.castList}
            onChange={handleChange}
            placeholder="e.g. Tom Hanks, Scarlett Johansson"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        {/* Poster URL */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold">Poster URL</label>
          <input
            name="posterUrl"
            value={form.posterUrl}
            onChange={handleChange}
            placeholder="https://..."
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        {/* Trailer URL */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold">Trailer URL</label>
          <input
            name="trailerUrl"
            value={form.trailerUrl}
            onChange={handleChange}
            placeholder="https://www.youtube.com/embed/..."
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        {/* Genres */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Genres</label>
          <div className="flex flex-wrap gap-2">
            {ALL_GENRES.map((genre) => {
              const selected = form.genreIds.includes(genreMap[genre]);
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                    selected
                      ? "border-sky-500 bg-sky-500 text-white"
                      : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  }`}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-sky-500 px-6 py-3 font-semibold text-white transition-opacity hover:bg-sky-600 disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Add Movie"}
        </button>
      </form>
    </main>
  );
}
