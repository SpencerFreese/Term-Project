import Link from "next/link";

export default function AdminPageHeader({
  title,
  description,
  backHref = "/admin",
}: {
  title: string;
  description?: string;
  backHref?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
          Admin Portal
        </p>

        <h1 className="text-3xl font-bold">
          {title}
        </h1>

        {description ? (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        ) : null}
      </div>

      <Link
        href={backHref}
        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
      >
        ← Back
      </Link>
    </div>
  );
}