import Link from "next/link"
import { ShowtimeRow } from "@/lib/repositories/showtimeRepository";
import { MovieStatus } from "@/lib/movies";

function formatDateTime(value: string | null) {
  if (!value) {
    return "Time TBD";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function Showtimes({movie} : {movie: {
    showtimes: ShowtimeRow[];
    constructor: {
        name: "RowDataPacket";
    };
    movieId: number;
    title: string;
    description: string | null;
    posterUrl: string | null;
    trailerUrl: string | null;
    mpaaRating: string | null;
    castList: string | null;
    runtimeMinutes: number | null;
    releaseDate: string | null;
    status: MovieStatus;
    genres: string | null;
}

}) {
    return (
        <section className="space-y-4">
            <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-400">
                    Choose a Time
                </p>

                <h2 className="text-3xl font-bold tracking-tight text-white">
                    Showtimes
                </h2>
            </div>

            {movie.showtimes.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-950 p-8 text-sm text-zinc-400">
                    No showtimes have been added yet.
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {movie.showtimes.map((showtime) => (
                        <Link
                            key={showtime.showtimeId}
                            href={`/booking/${showtime.showtimeId}`}
                            className="group rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-sm transition hover:-translate-y-1 hover:border-sky-500 hover:shadow-xl hover:shadow-sky-950/30"
                        >
                            <p className="text-lg font-bold text-white">
                                {formatDateTime(showtime.startTime)}
                            </p>

                            <p className="mt-2 text-sm text-zinc-400">
                                {showtime.roomName}
                            </p>

                            <div className="mt-4 flex items-center justify-between gap-3">
                                <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
                                    {showtime.formatType ?? "Standard"}
                                </span>

                                <span className="text-sm font-semibold text-sky-400 group-hover:text-sky-300">
                                    Book Seats →
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
      </section>
    )
}