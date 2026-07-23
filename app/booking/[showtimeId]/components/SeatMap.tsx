import type { Seat } from "@/lib/repositories/seatRepository";

export default function SeatMap({
  rows,
  selectedSeatIds,
  totalTickets,
  onToggleSeat,
}: {
  rows: Array<[string, Seat[]]>;
  selectedSeatIds: Set<number>;
  totalTickets: number;
  onToggleSeat: (seat: Seat) => void;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-600 dark:text-sky-400">
            Step 2
          </p>
          <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">
            Select Your Seats
          </h2>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {selectedSeatIds.size} / {totalTickets || 0} seats selected
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          Seat map is not configured for this room yet.
        </div>
      ) : (
        <div className="space-y-4 overflow-x-auto">
          <div className="mx-auto w-fit rounded-full bg-zinc-200 px-12 py-1 text-center text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            Screen
          </div>

          <div className="flex min-w-full flex-col items-center gap-2 px-2">
            {rows.map(([rowLabel, rowSeats]) => (
              <div key={rowLabel} className="flex items-center gap-3">
                <span className="w-5 shrink-0 text-center text-xs font-bold text-zinc-500 dark:text-zinc-400">
                  {rowLabel}
                </span>

                <div className="flex gap-2">
                  {rowSeats.map((seat) => {
                    const isSelected = selectedSeatIds.has(seat.seatId);
                    const isWheelchair = seat.seatType === "wheelchair";

                    const isBooked =
                      seat.availability === "booked";

                    const isReserved =
                      seat.availability === "reserved";

                    const isUnavailable =
                      seat.availability !== "available";

                    let seatClass =
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-[10px] font-semibold transition";

                    if (isBooked) {
                      seatClass +=
                        " cursor-not-allowed border-zinc-500 bg-zinc-700 text-zinc-300 opacity-70";
                    } else if (isReserved) {
                      seatClass +=
                        " cursor-not-allowed border-amber-500 bg-amber-500/25 text-amber-700 opacity-70 dark:text-amber-300";
                    } else if (isSelected) {
                      seatClass +=
                        " border-sky-500 bg-sky-600 text-white";
                    } else if (isWheelchair) {
                      seatClass +=
                        " border-emerald-400 bg-emerald-50 text-emerald-700 hover:border-emerald-500 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
                    } else {
                      seatClass +=
                        " border-zinc-300 bg-zinc-50 text-zinc-600 hover:border-sky-500 hover:text-sky-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300";
                    }

                    const availabilityLabel = isBooked
                      ? "booked"
                      : isReserved
                        ? "reserved"
                        : "available";


                    return (
                      <button
                        key={seat.seatId}
                        type="button"
                        disabled={isUnavailable}
                        onClick={() => onToggleSeat(seat)}
                        aria-pressed={isSelected}
                        aria-label={`Seat ${rowLabel}${seat.seatNumber}, ${availabilityLabel}${
                          isWheelchair
                            ? ", wheelchair accessible"
                            : ""
                        }`}
                        className={seatClass}
                        title={`Seat ${rowLabel}${seat.seatNumber}: ${availabilityLabel}`}
                      >
                        {seat.seatNumber}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Seat status key */}
          <div className="flex flex-wrap gap-4 pt-2 text-xs text-zinc-600 dark:text-zinc-400">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm border border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900" />
              Available
            </span>

            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm border border-sky-500 bg-sky-600" />
              Selected
            </span>

            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm border border-amber-500 bg-amber-500/25" />
              Reserved
            </span>

            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm border border-zinc-500 bg-zinc-700" />
              Booked
            </span>

            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm border border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/40" />
              Wheelchair Accessible
            </span>
          </div>
        </div>
      )}
    </section>
  );
}