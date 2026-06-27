import { type HomeDataResult } from "../page";

export default function ErrorPage({
    result,
}: {
    result: Extract<HomeDataResult, { ok: false }>;
}) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-12 sm:px-10">
        <section className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
            Term Project Cinema
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            MySQL connection not ready yet.
          </h1>

          <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">
            Start the Docker database and load the schema and seed files, then
            refresh this page.
          </p>
        </section>

        <pre className="overflow-x-auto rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
          {result.message}
        </pre>
      </main>
    );
}