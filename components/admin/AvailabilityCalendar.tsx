"use client";

import { Lock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { blockDatesAction, unblockDateAction } from "@/app/admin/actions";
import type { DayState } from "@/lib/availability";
import { cn } from "@/lib/utils";

type Props = {
  apartments: { id: string; name: string }[];
  /** Day states per apartment id (server-loaded, one year each). */
  daysByApartment: Record<string, DayState[]>;
};

const STATUS_LABELS: Record<DayState["status"], string> = {
  available: "Available",
  booked: "Confirmed booking",
  blocked: "Blocked by admin",
  held: "Pending payment",
  past: "Past date",
};

const statusClasses: Record<DayState["status"], string> = {
  available: "bg-emerald-50 text-emerald-900 hover:bg-emerald-100",
  booked: "bg-blue-100 text-blue-900",
  blocked: "bg-red-100 text-red-900",
  held: "bg-amber-100 text-amber-900",
  past: "bg-charcoal/5 text-muted",
};

function toDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function todayKey(): string {
  return toDayKey(new Date());
}

function formatDay(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isDateInCursor(dateKey: string, cursor: { year: number; month: number }): boolean {
  const [y, m] = dateKey.split("-").map(Number);
  return y === cursor.year && m - 1 === cursor.month;
}

export function AvailabilityCalendar({ apartments, daysByApartment }: Props) {
  const [apartmentId, setApartmentId] = useState(apartments[0]?.id ?? "");
  const days = daysByApartment[apartmentId] ?? [];
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selected, setSelected] = useState<DayState | null>(null);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, setPending] = useState(false);

  const dayMap = useMemo(() => new Map(days.map((day) => [day.date, day])), [days]);

  // Month grid (Sunday-first), padded to whole weeks.
  const grid = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const cells: { key: string; inMonth: boolean; date: Date }[] = [];
    for (let i = 0; i < startPad; i += 1) {
      cells.push({ key: `pad-${i}`, inMonth: false, date: new Date() });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(cursor.year, cursor.month, day);
      cells.push({ key: toDayKey(date), inMonth: true, date });
    }
    return cells;
  }, [cursor]);

  // Group blocked days into ranges for the unblock list.
  const blockGroups = useMemo(() => {
    const groups = new Map<string, { reason: string; dates: string[] }>();
    for (const day of days) {
      if (day.status !== "blocked" || !day.blockId) continue;
      const group = groups.get(day.blockId) ?? {
        reason: day.blockReason ?? "Unavailable",
        dates: [],
      };
      group.dates.push(day.date);
      groups.set(day.blockId, group);
    }
    return Array.from(groups.entries()).map(([id, group]) => ({
      id,
      reason: group.reason,
      start: group.dates[0],
      end: group.dates[group.dates.length - 1],
      inMonth: group.dates.some((date: string) => isDateInCursor(date, cursor)),
    }));
  }, [days, cursor]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  function shiftMonth(delta: number) {
    setCursor((previous) => {
      const date = new Date(previous.year, previous.month + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  }

  async function handleUnblock(blockId: string) {
    setPending(true);
    const result = await unblockDateAction({ blockId });
    setPending(false);
    setToast(result ?? { ok: false, message: "Something went wrong." });
    if (result?.ok) setSelected(null);
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {apartments.map((apartment) => (
            <button
              key={apartment.id}
              type="button"
              onClick={() => setApartmentId(apartment.id)}
              aria-pressed={apartmentId === apartment.id}
              className={cn(
                "border px-4 py-2 text-sm transition-colors",
                apartmentId === apartment.id
                  ? "border-brand-red bg-brand-red/5 font-medium text-charcoal"
                  : "border-charcoal/15 text-muted hover:border-charcoal/40"
              )}
            >
              {apartment.name}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setBlockModalOpen(true)} className="btn-primary">
          <Lock className="h-4 w-4" aria-hidden="true" />
          Block Dates
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted">
        <LegendDot className="border-emerald-500 bg-emerald-100" label="Available" />
        <LegendDot className="border-blue-500 bg-blue-100" label="Confirmed booking" />
        <LegendDot className="border-red-500 bg-red-100" label="Blocked by admin" />
        <LegendDot className="border-amber-500 bg-amber-100" label="Pending payment" />
        <LegendDot className="border-charcoal/20 bg-charcoal/5" label="Past" />
      </div>

      {/* Calendar */}
      <div className="border border-charcoal/10 bg-white">
        <div className="flex items-center justify-between border-b border-charcoal/10 px-4 py-3">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
            className="border border-charcoal/15 px-3 py-1.5 text-sm text-charcoal transition-colors hover:border-brand-red"
          >
            ←
          </button>
          <h2 className="font-serif text-xl text-charcoal">
            {new Date(cursor.year, cursor.month, 1).toLocaleDateString("en-NG", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setCursor({ year: now.getFullYear(), month: now.getMonth() });
              }}
              className="hidden border border-charcoal/15 px-3 py-1.5 text-sm text-charcoal transition-colors hover:border-brand-red sm:block"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
              className="border border-charcoal/15 px-3 py-1.5 text-sm text-charcoal transition-colors hover:border-brand-red"
            >
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-charcoal/10 bg-cream/50 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((name) => (
            <div key={name} className="py-2 text-[10px] uppercase tracking-label text-muted">
              {name}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {grid.map((cell) => {
            if (!cell.inMonth) {
              return (
                <div
                  key={cell.key}
                  aria-hidden="true"
                  className="min-h-16 border-b border-r border-charcoal/5 bg-cream/30"
                />
              );
            }
            const day = dayMap.get(cell.key);
            const status = day?.status ?? "available";
            return (
              <button
                key={cell.key}
                type="button"
                onClick={() => setSelected(day ?? { date: cell.key, status: "available" })}
                aria-label={`${cell.date.getDate()} ${STATUS_LABELS[status]}`}
                className={cn(
                  "relative flex min-h-16 flex-col items-center justify-center border-b border-r border-charcoal/5 p-1 text-sm transition-colors",
                  statusClasses[status]
                )}
              >
                <span>{cell.date.getDate()}</span>
                {status === "blocked" ? (
                  <Lock className="absolute right-1 top-1 h-3 w-3" aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Blocked ranges */}
      {blockGroups.length > 0 ? (
        <div className="border border-charcoal/10 bg-white">
          <h3 className="border-b border-charcoal/10 px-4 py-3 font-sans text-[10px] uppercase tracking-label text-muted">
            Blocked ranges
          </h3>
          <ul className="divide-y divide-charcoal/5">
            {blockGroups.map((group) => (
              <li key={group.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <div>
                  <p className="text-charcoal">
                    {formatDay(group.start)}
                    {group.start !== group.end ? ` → ${formatDay(group.end)}` : ""}
                  </p>
                  <p className="text-xs text-muted">{group.reason}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUnblock(group.id)}
                  disabled={pending}
                  className="border border-charcoal/15 px-3 py-1.5 text-xs text-charcoal transition-colors hover:border-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  Unblock
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Day detail dialog */}
      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-warmblack/60 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-label="Day details"
            className="w-full max-w-sm bg-white p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="font-sans text-[10px] uppercase tracking-label text-muted">
              {formatDay(selected.date)}
            </p>
            <h3 className="mt-1 font-serif text-2xl text-charcoal">
              {STATUS_LABELS[selected.status]}
            </h3>
            {selected.status === "blocked" && selected.blockId ? (
              <>
                <p className="mt-2 text-sm text-muted">
                  Reason: {selected.blockReason ?? "Unavailable"}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Removing this block makes the dates available again on the website.
                </p>
                <button
                  type="button"
                  onClick={() => selected.blockId && handleUnblock(selected.blockId)}
                  disabled={pending}
                  className="mt-6 w-full bg-red-700 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-red-800 disabled:opacity-50"
                >
                  Unblock Dates
                </button>
              </>
            ) : selected.status === "booked" ? (
              <p className="mt-2 text-sm text-muted">
                {selected.bookingReference
                  ? `Booking ${selected.bookingReference}`
                  : "Reserved by a confirmed guest."}
              </p>
            ) : selected.status === "held" ? (
              <p className="mt-2 text-sm text-muted">
                A guest is completing payment for these dates. The hold expires automatically if
                payment is not verified in time.
              </p>
            ) : selected.status === "available" ? (
              <p className="mt-2 text-sm text-muted">These dates are open for bookings.</p>
            ) : (
              <p className="mt-2 text-sm text-muted">This date is in the past.</p>
            )}
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="btn-outline mt-4 w-full text-charcoal"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      {/* Block modal */}
      {blockModalOpen ? (
        <BlockDateModal
          apartments={apartments}
          defaultApartmentId={apartmentId}
          onClose={() => setBlockModalOpen(false)}
          onDone={(result) => {
            setToast(result);
            if (result?.ok) setBlockModalOpen(false);
          }}
        />
      ) : null}

      {/* Toast */}
      {toast ? (
        <div
          role="status"
          className={cn(
            "fixed bottom-6 right-6 z-50 px-5 py-3 text-sm text-white shadow-lg",
            toast.ok ? "bg-emerald-700" : "bg-red-700"
          )}
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn("h-3.5 w-3.5 border", className)} aria-hidden="true" />
      {label}
    </span>
  );
}

function BlockDateModal({
  apartments,
  defaultApartmentId,
  onClose,
  onDone,
}: {
  apartments: { id: string; name: string }[];
  defaultApartmentId: string;
  onClose: () => void;
  onDone: (result: { ok: boolean; message: string }) => void;
}) {
  const [state, setState] = useState<{ ok: boolean; message: string } | null>(null);
  const [isPending, setPending] = useState(false);

  useEffect(() => {
    if (state) onDone(state);
  }, [state, onDone]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPending(true);
    setState(null);
    const result = await blockDatesAction(null, formData);
    setPending(false);
    setState(result);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-warmblack/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Block dates"
        className="w-full max-w-md bg-white p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="font-serif text-2xl text-charcoal">Block Dates</h3>
        <p className="mt-1 text-sm text-muted">
          Blocked dates are removed from the public booking calendar immediately.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <label className="block">
            <span className="font-sans text-[10px] uppercase tracking-label text-muted">
              Apartment
            </span>
            <select
              name="apartmentId"
              defaultValue={defaultApartmentId}
              className="mt-2 w-full border border-charcoal/15 bg-white px-4 py-3 text-sm"
            >
              {apartments.map((apartment) => (
                <option key={apartment.id} value={apartment.id}>
                  {apartment.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="font-sans text-[10px] uppercase tracking-label text-muted">
                Start date
              </span>
              <input
                type="date"
                name="startDate"
                required
                min={todayKey()}
                className="mt-2 w-full border border-charcoal/15 px-4 py-3 text-sm"
              />
            </label>
            <label className="block">
              <span className="font-sans text-[10px] uppercase tracking-label text-muted">
                End date
              </span>
              <input
                type="date"
                name="endDate"
                required
                min={todayKey()}
                className="mt-2 w-full border border-charcoal/15 px-4 py-3 text-sm"
              />
            </label>
          </div>

          <label className="block">
            <span className="font-sans text-[10px] uppercase tracking-label text-muted">
              Reason (optional)
            </span>
            <input
              type="text"
              name="reason"
              maxLength={200}
              placeholder="Maintenance, private use…"
              className="mt-2 w-full border border-charcoal/15 px-4 py-3 text-sm"
            />
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1 text-charcoal">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="btn-primary flex-1 disabled:opacity-50">
              {isPending ? "Blocking…" : "Block Dates"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
