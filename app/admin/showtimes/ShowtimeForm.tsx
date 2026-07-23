"use client";

import {
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import MovieSelectField from "@/app/admin/components/MovieSelectField";
import type { MovieSelectOption } from "@/lib/movieForm";

type RoomOption = {
  theaterRoomId: number;
  roomName: string;
  formatType: string | null;
  seatCount: number;
};

type ShowtimeItem = {
  showtimeId: number;
  movieTitle: string;
  roomName: string;
  startTime: string;
  endTime: string | null;
  formatType: string | null;
};

type CreatedShowtime = {
  movieTitle: string;
  roomName: string;
  startTime: string;
};

type ShowtimeApiResponse = {
  error?: string;
  showtime?: CreatedShowtime;
};

function getMinimumStartTime() {
  const date = new Date();

  /*
   * datetime-local expects a local date/time value
   * without a timezone suffix.
   */
  date.setMinutes(
    date.getMinutes() - date.getTimezoneOffset(),
  );

  return date.toISOString().slice(0, 16);
}

function displayDateTime(value: string | null) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function ShowtimeForm({
  movies,
  rooms,
  showtimes,
}: {
  movies: MovieSelectOption[];
  rooms: RoomOption[];
  showtimes: ShowtimeItem[];
}) {
  const router = useRouter();

  const [movieId, setMovieId] = useState("");
  const [theaterRoomId, setTheaterRoomId] =
    useState("");
  const [startTime, setStartTime] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] =
    useState(false);

  const [minimumStartTime] = useState(() =>
    getMinimumStartTime(),
  );

  const selectedMovie = useMemo(
    () =>
      movies.find(
        (movie) =>
          movie.movieId === Number(movieId),
      ) ?? null,
    [movieId, movies],
  );

  const selectedRoom = useMemo(
    () =>
      rooms.find(
        (room) =>
          room.theaterRoomId ===
          Number(theaterRoomId),
      ) ?? null,
    [rooms, theaterRoomId],
  );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!movieId) {
      setError("Select a movie.");
      return;
    }

    if (!startTime) {
      setError("Select a date and start time.");
      return;
    }

    if (!theaterRoomId) {
      setError("Select a showroom.");
      return;
    }

    if (!selectedMovie?.runtimeMinutes) {
      setError(
        "The selected movie needs a runtime before it can be scheduled.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        "/api/admin/showtimes",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            movieId: Number(movieId),
            theaterRoomId: Number(theaterRoomId),
            startTime,
          }),
        },
      );

      const contentType =
        response.headers.get("content-type") ?? "";

      if (
        !contentType.includes("application/json")
      ) {
        const responseText = await response.text();

        console.error(
          "Showtime API returned a non-JSON response:",
          responseText,
        );

        setError(
          `Server error (${response.status}). Check the pnpm dev terminal.`,
        );

        return;
      }

      const data: ShowtimeApiResponse =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ??
            `Unable to schedule the showtime (${response.status}).`,
        );

        return;
      }

      if (!data.showtime) {
        setError(
          "The showtime may have been created, but the server returned an invalid response.",
        );

        return;
      }

      setSuccess(
        `${data.showtime.movieTitle} was scheduled in ` +
          `${data.showtime.roomName} for ` +
          `${displayDateTime(
            data.showtime.startTime,
          )}.`,
      );

      setStartTime("");
      setTheaterRoomId("");

      /*
       * Reload the upcoming showtime list from the
       * database without performing a full page reload.
       */
      router.refresh();
    } catch (requestError) {
      console.error(
        "Add Showtime request failed:",
        requestError,
      );

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to contact the showtime API.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.9fr)]">
      <section className="rounded-2xl border border-zinc-300 p-6 dark:border-zinc-800">
        <h2 className="text-xl font-semibold">
          Add Showtime
        </h2>

        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          The ending time is calculated automatically
          from the movie runtime.
        </p>

        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
          >
            {error}
          </p>
        ) : null}

        {success ? (
          <p
            role="status"
            className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          >
            {success}
          </p>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col gap-5"
        >
          <MovieSelectField
            movies={movies}
            value={movieId}
            onChange={(value) => {
              setMovieId(value);
              setError("");
              setSuccess("");
            }}
            label="Movie to schedule"
            required
          />

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="startTime"
              className="text-sm font-semibold"
            >
              Date and start time{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              id="startTime"
              name="startTime"
              type="datetime-local"
              min={minimumStartTime}
              value={startTime}
              required
              onChange={(event) => {
                setStartTime(event.target.value);
                setError("");
                setSuccess("");
              }}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />

            <p className="text-xs text-zinc-500">
              The movie runtime determines the ending
              time.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="theaterRoomId"
              className="text-sm font-semibold"
            >
              Showroom{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <select
              id="theaterRoomId"
              name="theaterRoomId"
              value={theaterRoomId}
              required
              onChange={(event) => {
                setTheaterRoomId(event.target.value);
                setError("");
                setSuccess("");
              }}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="">
                Select a showroom
              </option>

              {rooms.map((room) => (
                <option
                  key={room.theaterRoomId}
                  value={room.theaterRoomId}
                >
                  {room.roomName} —{" "}
                  {room.formatType ?? "Standard"}
                </option>
              ))}
            </select>

            {selectedRoom ? (
              <p className="text-xs text-zinc-500">
                {selectedRoom.formatType ?? "Standard"}{" "}
                · approximately {selectedRoom.seatCount}{" "}
                seats
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={
              submitting ||
              movies.length === 0 ||
              rooms.length === 0
            }
            className="rounded-lg bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Scheduling..."
              : "Schedule Showtime"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-300 p-6 dark:border-zinc-800">
        <h2 className="text-xl font-semibold">
          Upcoming Showtimes
        </h2>

        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          These showtimes are loaded directly from the
          database.
        </p>

        {showtimes.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-500">
            No future showtimes are currently scheduled.
          </p>
        ) : (
          <div className="mt-5 max-h-[650px] space-y-3 overflow-y-auto">
            {showtimes.map((showtime) => (
              <article
                key={showtime.showtimeId}
                className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <h3 className="font-semibold">
                  {showtime.movieTitle}
                </h3>

                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {displayDateTime(
                    showtime.startTime,
                  )}
                </p>

                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {showtime.roomName}
                  {" · "}
                  {showtime.formatType ?? "Standard"}
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Ends{" "}
                  {displayDateTime(showtime.endTime)}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}