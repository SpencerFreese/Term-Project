import { Movie } from "@/lib/movies"


export default async function MovieTrailer({movie} : {movie:Movie}) {
    return (
        <section className="space-y-4">
            <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-400">
                    Watch Preview
                </p>

                <h2 className="text-3xl font-bold tracking-tight text-white">
                    Trailer
                </h2>   
            </div>

        {movie.trailerUrl ? (
          <iframe
            src={movie.trailerUrl}
            title={`${movie.title} trailer`}
            className="aspect-video w-full rounded-3xl border border-zinc-800 bg-zinc-950 shadow-xl shadow-black/30"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-950 p-8 text-sm text-zinc-400">
            No trailer available.
          </div>
        )}
      </section>
    )
}