import Link from "next/link";
import { notFound } from "next/navigation";
import { getShowtimeDetails } from "@/lib/services/showtimeService";
import { getSeatsForShowtime } from "@/lib/services/seatService";
import BookingExperience from "./BookingExperience";
import BookingDescription from "./components/BookingDescription";

export const dynamic = "force-dynamic";

export default async function BookingPrototypePage({params,}: {params: Promise<{ showtimeId: string }>;}) {
  const { showtimeId } = await params;
  const parsedShowtimeId = Number(showtimeId);

  if (!Number.isInteger(parsedShowtimeId) || parsedShowtimeId <= 0) {
    notFound();
  }

  const showtime = await getShowtimeDetails(parsedShowtimeId);

  if (!showtime) {
    notFound();
  }

  const seats = await getSeatsForShowtime(parsedShowtimeId);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <Link
        href={`/movies/${showtime.movieId}`}
        className="inline-flex w-fit items-center justify-center rounded-full border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-sky-500 hover:text-white"
      >
        ← Back to movie
      </Link>

      <BookingDescription showtime={showtime} />

      <BookingExperience seats={seats} />
    </main>
  );
}
