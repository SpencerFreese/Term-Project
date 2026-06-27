import { HomeDataResult } from "../page"


export default function GenreSelect({selectedGenres, result} : {
    selectedGenres: string[];
    result: Extract<HomeDataResult, { ok: true }>;
}) {
    return (
    <details className="rounded-2xl border border-zinc-300 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-black/50">
        <summary className="cursor-pointer text-sm font-semibold text-zinc-950 dark:text-zinc-100">
        Filter by genre
        {selectedGenres.length > 0
            ? `: ${selectedGenres.join(", ")}`
            : ""}
        </summary>

        <div className="mt-4 flex flex-wrap gap-3">
            {result.genres.map((genre) => (
                <label
                key={genre.genreId}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-700 transition hover:border-sky-500 hover:text-sky-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                >
                <input
                    type="checkbox"
                    name="genre"
                    value={genre.name}
                    defaultChecked={selectedGenres.includes(genre.name)}
                    className="h-4 w-4 accent-sky-500"
                />
                    {genre.name}
                </label>
            ))}
        </div>

        <p className="mt-3 text-xs text-zinc-500">
        Selecting multiple genres only shows movies that match all selected genres.
        </p>
    </details>
    )
}