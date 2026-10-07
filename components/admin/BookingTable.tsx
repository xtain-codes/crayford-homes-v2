"use client";

import { useEffect, useMemo, useState } from "react";

import { updateBookingStatusAction } from "@/app/admin/actions";
import { formatNaira } from "@/lib/booking";
import { cn } from "@/lib/utils";

export type AdminBooking = {
  id: string;
  reference: string;
  guestName: string;
  email: string;
  phone: string;
  apartmentName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  amount: number;
  paymentStatus: string;
  bookingStatus: string;
  paymentReference: string;
  notes: string;
  holdExpiresAt: string | null;
  paidAt: string | null;
  createdAt: string;
};

const STATUS_STYLES: Record<string, string> = {
  pending_payment: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
};

const FILTERS = ["all", "pending_payment", "confirmed", "cancelled", "completed"] as const;

export function AdminBookingsTable({ bookings }: { bookings: AdminBooking[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [selected, setSelected] = useState<AdminBooking | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, setPending] = useState(false);

  const filtered = useMemo(
    () => (filter === "all" ? bookings : bookings.filter((booking) => booking.bookingStatus === filter)),
    [bookings, filter]
  );

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function changeStatus(bookingId: string, bookingStatus: string) {
    setPending(true);
    const result = await updateBookingStatusAction({ bookingId, bookingStatus });
    setPending(false);
    setToast(result ?? { ok: false, message: "Something went wrong." });
    if (result?.ok) setSelected(null);
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            aria-pressed={filter === status}
            className={cn(
              "border px-4 py-2 text-sm capitalize transition-colors",
              filter === status
                ? "border-brand-red bg-brand-red/5 font-medium text-charcoal"
                : "border-charcoal/15 text-muted hover:border-charcoal/40"
            )}
          >
            {status === "all" ? "All" : status.replace("_", " ")}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="border border-dashed border-charcoal/20 bg-white p-8 text-center text-sm text-muted">
          No bookings in this view yet.
        </p>
      ) : (
        <div className="overflow-x-auto border border-charcoal/10 bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-charcoal/10 bg-cream/40">
              <tr className="font-sans text-[10px] uppercase tracking-label text-muted">
                <th className="px-4 py-3">Booking ID</th>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Stay</th>
                <th className="px-4 py-3">Guests</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {filtered.map((booking) => (
                <tr key={booking.id} className="hover:bg-cream/30">
                  <td className="px-4 py-3 font-mono text-xs text-charcoal">{booking.reference}</td>
                  <td className="px-4 py-3">
                    <p className="text-charcoal">{booking.guestName}</p>
                    <p className="text-xs text-muted">{booking.apartmentName}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{booking.phone || "—"}</td>
                  <td className="px-4 py-3 text-muted">
                    {formatShort(booking.checkIn)} → {formatShort(booking.checkOut)}
                  </td>
                  <td className="px-4 py-3 text-muted">{booking.guests}</td>
                  <td className="px-4 py-3 text-charcoal">{formatNaira(booking.amount)}</td>
                  <td className="px-4 py-3">
                    <span className="capitalize text-muted">{booking.paymentStatus}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[booking.bookingStatus] ?? "bg-charcoal/10"}`}>
                      {booking.bookingStatus.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setSelected(booking)}
                      className="text-sm text-brand-red underline-offset-4 hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details dialog */}
      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-warmblack/60 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-label="Booking details"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-white p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs text-muted">{selected.reference}</p>
                <h3 className="mt-1 font-serif text-2xl text-charcoal">{selected.guestName}</h3>
                <p className="text-sm text-muted">{selected.apartmentName}</p>
              </div>
              <span className={`px-3 py-1 text-[11px] font-medium ${STATUS_STYLES[selected.bookingStatus] ?? "bg-charcoal/10"}`}>
                {selected.bookingStatus.replace("_", " ")}
              </span>
            </div>

            <div className="mt-8 grid gap-8 sm:grid-cols-3">
              <Section title="Guest">
                <Line label="Name" value={selected.guestName} />
                <Line label="Email" value={selected.email} />
                <Line label="Phone" value={selected.phone || "—"} />
                <Line label="Party size" value={String(selected.guests)} />
              </Section>
              <Section title="Stay">
                <Line label="Check-in" value={formatShort(selected.checkIn)} />
                <Line label="Check-out" value={formatShort(selected.checkOut)} />
                <Line label="Nights" value={String(selected.nights)} />
              </Section>
              <Section title="Payment">
                <Line label="Amount" value={formatNaira(selected.amount)} />
                <Line label="Status" value={selected.paymentStatus} />
                <Line label="Reference" value={selected.paymentReference || "—"} />
                <Line label="Paid at" value={selected.paidAt ? formatShort(selected.paidAt) : "—"} />
              </Section>
            </div>

            {selected.notes ? (
              <p className="mt-8 border-l-2 border-brand-red bg-cream/40 px-4 py-3 text-sm text-charcoal">
                {selected.notes}
              </p>
            ) : null}

            {selected.bookingStatus === "pending_payment" ? (
              <p className="mt-6 text-xs text-muted">
                Hold expires {selected.holdExpiresAt ? formatShort(selected.holdExpiresAt) : "soon"} — the
                dates free up automatically if payment is not verified.
              </p>
          ) : null}

            <div className="mt-8 flex flex-wrap gap-3 border-t border-charcoal/10 pt-6">
              {selected.bookingStatus === "pending_payment" ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => changeStatus(selected.id, "confirmed")}
                  className="btn-primary disabled:opacity-50"
                >
                  Mark confirmed
                </button>
              ) : null}
              {selected.bookingStatus === "confirmed" ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => changeStatus(selected.id, "completed")}
                  className="btn-primary disabled:opacity-50"
                >
                  Mark completed
                </button>
              ) : null}
              {["pending_payment", "confirmed"].includes(selected.bookingStatus) ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (window.confirm(`Cancel booking ${selected.reference}? This frees the dates for other guests.`)) {
                      void changeStatus(selected.id, "cancelled");
                    }
                  }}
                  className="border border-charcoal/15 px-6 py-3 text-sm text-charcoal transition-colors hover:border-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  Cancel booking
                </button>
              ) : null}
              <button type="button" onClick={() => setSelected(null)} className="btn-outline text-charcoal">
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-sans text-[10px] uppercase tracking-label text-muted">{title}</h4>
      <dl className="mt-3 space-y-2 text-sm">{children}</dl>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right text-charcoal">{value}</dd>
    </div>
  );
}

function formatShort(value: string): string {
  const date = new Date(value);
  return date.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}
