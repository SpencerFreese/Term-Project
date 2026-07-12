import SearchBar from "./SearchBar";
import { HomeDataResult } from "../page";

export default function TitleBar({
    searchTerm,
    selectedGenres,
    showDate,
    result,
}: {
    searchTerm: string;
    selectedGenres: string[];
    showDate: string;
    result: Extract<HomeDataResult, { ok: true }>;
}) {
    return (
        <div>
            <section className="space-y-3">
        <p className="inline-flex rounded-full border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-sky-300">
          Term Project Cinema-E-Booking
        </p>
        <nav className="mb-8 flex items-center justify-between">
          <a href="/" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Cinema E-Booking
          </a>

          <div className="flex gap-4 text-sm font-medium">
            <a href="/login" className="text-sky-600 hover:underline">
              Login / Account
            </a>
          </div>
        </nav>

        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-5xl">
          Watch a movie Today
        </h1>

        <p className="max-w-3xl text-base leading-7 text-zinc-600 dark:text-zinc-400 sm:text-lg">
          Browse currently playing and coming soon movies, search by title,
          filter by genre, and view details before booking your seats.
        </p>
      </section>

    <SearchBar searchTerm={searchTerm} selectedGenres={selectedGenres} showDate={showDate} result={result}/>
    </div>
      
    )
}