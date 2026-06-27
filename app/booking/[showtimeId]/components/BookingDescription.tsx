import { ShowtimeRow } from "@/lib/repositories/showtimeRepository";

function formatDateTime(value: string | null) {
  if (!value) {
    return "Time TBD";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function BookingDescription({showtime} : {showtime: ShowtimeRow}) {
    return (
        <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">
            Booking Prototype
            </p>

            <h1 className="text-3xl font-bold text-zinc-950 dark:text-zinc-50">
            {showtime.movieTitle}
            </h1>

            <dl className="grid gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                <div>
                    <dt className="font-semibold text-zinc-950 dark:text-zinc-50">Showtime</dt>
                    <dd>{formatDateTime(showtime.startTime)}</dd>
                </div>

                <div>
                    <dt className="font-semibold text-zinc-950 dark:text-zinc-50">Room</dt>
                    <dd>{showtime.roomName}</dd>
                </div>

                <div>
                    <dt className="font-semibold text-zinc-950 dark:text-zinc-50">Format</dt>
                    <dd>{showtime.formatType ?? "Standard"}</dd>
                </div>
            </dl>
      </section>
    )
}