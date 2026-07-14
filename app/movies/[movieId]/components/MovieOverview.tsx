import { Movie } from "@/lib/movies"
import FavoriteButton from "@/app/components/FavoriteButton";

export default async function MovieOverview({
    movie,
    genres,
    isFavorited,
    isAuthenticated,
}: {
    movie: Movie;
    genres: string[];
    isFavorited: boolean;
    isAuthenticated: boolean;
}) {
    return (
        <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/40">
            <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
                {movie.posterUrl ? (
                <img
                    src={movie.posterUrl}
                    alt={`${movie.title} poster`}
                    className="aspect-[2/3] w-full rounded-2xl object-cover shadow-2xl shadow-black/50"
                />
                ) : (
                <div className="flex aspect-[2/3] w-full items-center justify-center rounded-2xl border border-sky-400/40 bg-black/40 text-6xl font-black text-sky-300">
                    {movie.title.slice(0, 1)}
                </div>
                )}


                <div className="flex flex-col justify-center gap-6 p-6 sm:p-8">
                    <div className="space-y-4">
                        <p className="inline-flex rounded-full border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-sky-300">
                            Movie Details
                        </p>

                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                                {movie.title}
                            </h1>

                            <FavoriteButton
                                movieId={movie.movieId}
                                initialFavorited={isFavorited}
                                isAuthenticated={isAuthenticated}
                                className="static"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-sky-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                            {movie.mpaaRating ?? "Unrated"}
                            </span>

                            <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-300">
                            {movie.runtimeMinutes
                                ? `${movie.runtimeMinutes} min`
                                : "Runtime TBD"}
                            </span>
                        </div>

                        {genres.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                            {genres.map((genre) => (
                                <span
                                key={genre}
                                className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300"
                                >
                                {genre}
                                </span>
                            ))}
                            </div>
                            ) : (
                                <p className="text-sm text-zinc-500">Genres TBD</p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-xl font-bold text-white">Synopsis</h2>

                        <p className="max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
                            {movie.description ?? "Description coming soon."}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-black/40 p-5">
                        <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-300">
                            Cast
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-zinc-400">
                            {movie.castList ?? "Cast coming soon."}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}