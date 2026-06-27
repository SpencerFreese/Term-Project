import Link from "next/link"

export default function SearchInput({
    searchTerm,
    selectedGenres,
    showDate} :
{
    searchTerm: string;
    selectedGenres: string[];
    showDate: string;
}) {
    return (
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
            {/* typable search bar */}
            <input
                type="search"
                name="search"
                defaultValue={searchTerm}
                placeholder="Search movies by title..."
                className="min-h-11 rounded-lg border border-zinc-300 bg-white px-4 text-sm text-zinc-950 outline-none focus:border-sky-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-sky-500"
            />

            <div className="flex flex-col gap-1">
                <label
                    htmlFor="showDate"
                    className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                >
                    Show Date
                </label>

                {/* date selector to filter by date */}
                <input
                    type="date"
                    id="showDate"
                    name="showDate"
                    defaultValue={showDate}
                    className="min-h-11 cursor-pointer rounded-lg border border-zinc-300 bg-white px-4 text-sm text-zinc-950 outline-none focus:border-sky-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-sky-500 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:[filter:brightness(0)_saturate(100%)_invert(55%)_sepia(93%)_saturate(1432%)_hue-rotate(165deg)_brightness(96%)_contrast(94%)]"
                />
            </div>

            <button
            type="submit"
            className="min-h-11 rounded-lg bg-sky-600 px-5 text-sm font-medium text-white transition hover:bg-sky-500"
            >
            Apply Filters
            </button>

            {searchTerm || selectedGenres.length > 0 || showDate ? (
                <Link
                    href="/"
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-zinc-300 px-5 text-sm font-medium text-zinc-700 transition hover:border-sky-500 dark:border-zinc-700 dark:text-zinc-300"
                >
                    Clear All
                </Link>
            ) : null}
        </div>
    )
}