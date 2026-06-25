import Link from "next/link";
import { notFound } from "next/navigation";
import { getShowtimeDetails } from "@/lib/services/showtimeService";

export const dynamic = "force-dynamic";

function formatDateTime(value: string | null) {
  if (!value) {
    return "Time TBD";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function BookingPrototypePage({
  params,
}: {
  params: Promise<{ showtimeId: string }>;
}) {
  const { showtimeId } = await params;
  const showtime = await getShowtimeDetails(Number(showtimeId));

  if (!showtime) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <Link
        href={`/movies/${showtime.movieId}`}
        className="text-sm text-blue-600 underline"
      >
        ← Back to movie
      </Link>

      <section className="space-y-3 rounded-2xl border p-6">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">
          Booking Prototype
        </p>

        <h1 className="text-3xl font-bold">{showtime.movieTitle}</h1>

        <dl className="grid gap-3 text-sm">
          <div>
            <dt className="font-semibold">Showtime</dt>
            <dd>{formatDateTime(showtime.startTime)}</dd>
          </div>

          <div>
            <dt className="font-semibold">Room</dt>
            <dd>{showtime.roomName}</dd>
          </div>

          <div>
            <dt className="font-semibold">Format</dt>
            <dd>{showtime.formatType ?? "Standard"}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-dashed p-6 text-zinc-600 dark:text-zinc-400">
        Seat selection, ticket quantities, and checkout will be implemented in a later sprint.
      </section>
    </main>
  );
}