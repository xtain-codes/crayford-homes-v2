"use client";

import { Calendar, ChevronLeft, ChevronRight, Loader2, Lock } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { formatNaira, formatStayDate, parseDateInput, validateStay } from "@/lib/booking";
import { cn } from "@/lib/utils";

type ApartmentOption = {
  slug: string;
  name: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
};

type PaystackHandler = { open: () => void };

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: Record<string, unknown>) => PaystackHandler;
    };
  }
}

type Step = "details" | "paying" | "verifying" | "confirmed";

type ConfirmationResult = {
  bookingReference: string;
  total: number;
  emailSent: boolean;
  message?: string;
};

const inputClass =
  "mt-2 min-h-[54px] w-full rounded-lg border border-charcoal/15 bg-[#ededed] px-4 py-3 font-sans text-sm text-charcoal outline-none transition-colors duration-200 focus:border-charcoal/50 focus:bg-white";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function todayKey(): string {
  return toKey(new Date());
}

function formatDayShort(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Public booking widget.
 *
 * Flow: guest picks apartment + dates (unavailable dates disabled in the
 * calendar, validated again server-side on submit) → POST /api/bookings
 * creates a 30-minute hold → Paystack charges the exact DB-computed amount →
 * POST /api/bookings/verify re-checks availability inside a transaction and
 * confirms → confirmation email. Failed/abandoned payments leave the hold to
 * expire, never blocking dates permanently.
 */
export function BookingWidget({ apartments }: { apartments: ApartmentOption[] }) {
  const searchParams = useSearchParams();
  const queryApplied = useRef(false);
  const [apartmentSlug, setApartmentSlug] = useState(apartments[0]?.slug ?? "");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("details");
  const [confirmed, setConfirmed] = useState<ConfirmationResult | null>(null);
  const [bookingReference, setBookingReference] = useState<string | null>(null);

  const [unavailableDates, setUnavailableDates] = useState<Set<string>>(new Set());
  const [loadingAvailability, setLoadingAvailability] = useState(true);

  const [pickerOpen, setPickerOpen] = useState<"in" | "out" | null>(null);
  const [pickerCursor, setPickerCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const apartment =
    apartments.find((option) => option.slug === apartmentSlug) ?? apartments[0];

  useEffect(() => {
    if (queryApplied.current) return;
    queryApplied.current = true;
    const qIn = searchParams.get("checkIn");
    const qOut = searchParams.get("checkOut");
    const qGuests = Number(searchParams.get("guests"));
    if (qIn) setCheckIn(qIn);
    if (qOut) setCheckOut(qOut);
    if (Number.isFinite(qGuests) && qGuests >= 1) {
      setGuests(Math.min(qGuests, apartment?.maxGuests ?? qGuests));
    }
  }, [searchParams, apartment?.maxGuests]);

  // Load live availability for the selected apartment.
  useEffect(() => {
    let cancelled = false;
    setLoadingAvailability(true);
    fetch(`/api/availability?apartment=${encodeURIComponent(apartmentSlug)}&months=8`)
      .then((response) => response.json())
      .then((data: { unavailableDates?: string[] }) => {
        if (!cancelled) setUnavailableDates(new Set(data.unavailableDates ?? []));
      })
      .catch(() => {
        if (!cancelled) setUnavailableDates(new Set());
      })
      .finally(() => {
        if (!cancelled) setLoadingAvailability(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apartmentSlug]);

  const stay = useMemo(
    () => (checkIn && checkOut ? validateStay(checkIn, checkOut) : null),
    [checkIn, checkOut]
  );
  const nights = stay?.ok ? stay.stay.nights : 0;
  const total = nights > 0 && apartment ? nights * apartment.pricePerNight : 0;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Range overlap check against the fetched unavailable set (UI-level; the
  // server re-validates authoritatively on submit).
  const rangeConflict = useMemo(() => {
    if (!stay?.ok) return false;
    const inDate = parseDateInput(checkIn);
    const outDate = parseDateInput(checkOut);
    if (!inDate || !outDate) return false;
    const cursor = new Date(inDate);
    while (cursor.getTime() < outDate.getTime()) {
      if (unavailableDates.has(toKey(cursor))) return true;
      cursor.setTime(cursor.getTime() + 86_400_000);
    }
    return false;
  }, [stay, checkIn, checkOut, unavailableDates]);

  const detailsValid =
    stay?.ok === true &&
    !rangeConflict &&
    guestName.trim().length >= 2 &&
    emailValid &&
    guests >= 1 &&
    !!apartment &&
    guests <= apartment.maxGuests;

  /* ── Calendar helpers ─────────────────────────────────────────────────── */

  function shiftPickerMonth(delta: number) {
    setPickerCursor((previous) => {
      const date = new Date(previous.year, previous.month + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  }

  function isPast(key: string): boolean {
    return key < todayKey();
  }

  /** Check-out day itself may be an "unavailable" day (it frees at 12:00). */
  function disabledFor(kind: "in" | "out", key: string): boolean {
    if (isPast(key)) return true;
    if (kind === "in") return unavailableDates.has(key);
    // For check-out: every night from check-in up to (not including) this day
    // must be free; the day itself is selectable even if busy.
    if (!checkIn) return unavailableDates.has(key) && key !== checkIn;
    const inDate = parseDateInput(checkIn);
    if (!inDate) return unavailableDates.has(key);
    const [y, m, d] = key.split("-").map(Number);
    const day = new Date(y, m - 1, d);
    if (day.getTime() <= inDate.getTime()) return true; // must be after check-in
    const cursor = new Date(inDate);
    while (cursor.getTime() < day.getTime()) {
      if (unavailableDates.has(toKey(cursor))) return true;
      cursor.setTime(cursor.getTime() + 86_400_000);
    }
    return false;
  }

  const pickerGrid = useMemo(() => {
    const first = new Date(pickerCursor.year, pickerCursor.month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(pickerCursor.year, pickerCursor.month + 1, 0).getDate();
    const cells: { key: string; day: number }[] = [];
    for (let i = 0; i < startPad; i += 1) cells.push({ key: `pad-${i}`, day: 0 });
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(pickerCursor.year, pickerCursor.month, day);
      cells.push({ key: toKey(date), day });
    }
    return cells;
  }, [pickerCursor]);

  /* ── Flow ─────────────────────────────────────────────────────────────── */

  async function handlePay() {
    setError(null);
    if (!apartment) return;

    if (!stay || !stay.ok) {
      setError(stay && "error" in stay ? stay.error : "Choose your dates to continue.");
      return;
    }
    if (rangeConflict) {
      setError("Some of the selected dates are no longer available. Please choose another date range.");
      return;
    }
    if (guestName.trim().length < 2) {
      setError("Enter the guest's full name.");
      return;
    }
    if (!emailValid) {
      setError("Enter a valid email so we can send your confirmation.");
      return;
    }
    if (guests < 1 || guests > apartment.maxGuests) {
      setError(`Guests must be between 1 and ${apartment.maxGuests}.`);
      return;
    }

    setStep("paying");

    try {
      // 1. Create the booking hold (server validates availability again).
      const holdResponse = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apartmentSlug: apartment.slug,
          guestName,
          email,
          phone,
          checkIn,
          checkOut,
          guests,
        }),
      });
      const hold = (await holdResponse.json()) as {
        bookingReference?: string;
        amount?: number;
        error?: string;
      };

      if (!holdResponse.ok || !hold.bookingReference) {
        setStep("details");
        setError(hold.error ?? "Could not start your booking. Please try again.");
        return;
      }

      setBookingReference(hold.bookingReference);

      // 2. Charge via Paystack (key configured) or go straight to verification
      //    attempt (which will report payments-not-configured honestly).
      const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

      if (!paystackKey || typeof window === "undefined" || !window.PaystackPop) {
        setStep("verifying");
        const verify = await fetch("/api/bookings/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingReference: hold.bookingReference,
            paymentReference: "unpaid",
          }),
        });
        const result = (await verify.json()) as { error?: string };
        setStep("details");
        setError(
          result.error ??
            "Online payments are being set up. Your dates are held for 30 minutes — please try again shortly."
        );
        return;
      }

      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email,
        amount: (hold.amount ?? total) * 100, // kobo
        currency: "NGN",
        ref: hold.bookingReference,
        metadata: {
          custom_fields: [
            { display_name: "Booking", variable_name: "booking", value: hold.bookingReference },
            { display_name: "Apartment", variable_name: "apartment", value: apartment.name },
            { display_name: "Check-in", variable_name: "check_in", value: checkIn },
            { display_name: "Check-out", variable_name: "check_out", value: checkOut },
            { display_name: "Guests", variable_name: "guests", value: String(guests) },
          ],
        },
        onSuccess: async (transaction: { reference: string }) => {
          setStep("verifying");
          try {
            const verifyResponse = await fetch("/api/bookings/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bookingReference: hold.bookingReference,
                paymentReference: transaction.reference,
              }),
            });
            const result = (await verifyResponse.json()) as {
              confirmed?: boolean;
              emailSent?: boolean;
              message?: string;
              error?: string;
              bookingReference?: string;
              total?: number;
            };

            if (!verifyResponse.ok || !result.confirmed) {
              setStep("details");
              setError(
                result.error ??
                  "We could not verify your payment. If you were charged, please contact us with the payment reference."
              );
              return;
            }

            setConfirmed({
              bookingReference: result.bookingReference ?? hold.bookingReference!,
              total: result.total ?? hold.amount ?? total,
              emailSent: result.emailSent === true,
              message: result.message,
            });
            setStep("confirmed");
          } catch {
            setStep("details");
            setError("We could not verify your payment. If you were charged, please contact us.");
          }
        },
        onCancel: () => {
          setStep("details");
          setError("Payment cancelled — the hold on your dates expires automatically in 30 minutes.");
        },
        onError: () => {
          setStep("details");
          setError("Payment could not start. Please try again.");
        },
      });
      handler.open();
    } catch {
      setStep("details");
      setError("Something went wrong. Please try again.");
    }
  }

  /* ── Confirmation step ────────────────────────────────────────────────── */

  if (step === "confirmed" && confirmed && apartment) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="border border-brand-red/30 bg-white p-10 text-center sm:p-14">
          <p className="eyebrow justify-center">Booking confirmed</p>
          <h2 className="mt-5 font-serif text-4xl font-medium text-charcoal">Payment received.</h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">
            {confirmed.emailSent
              ? `A confirmation email is on its way to ${email}. Our team will be in touch to finalise your arrival details.`
              : confirmed.message ??
                "Your payment has been verified. Our team will be in touch to finalise your arrival details."}
          </p>

          <dl className="mx-auto mt-8 max-w-sm space-y-3 border-y border-charcoal/10 py-8 text-left text-sm">
            <Row label="Reference" value={confirmed.bookingReference} />
            <Row label="Apartment" value={apartment.name} />
            <Row label="Check-in" value={stay?.ok ? formatStayDate(stay.stay.checkIn) : checkIn} />
            <Row label="Check-out" value={stay?.ok ? formatStayDate(stay.stay.checkOut) : checkOut} />
            <Row label="Nights" value={String(nights)} />
            <Row label="Guests" value={String(guests)} />
            <Row label="Total paid" value={formatNaira(confirmed.total)} strong />
          </dl>

          <button
            type="button"
            className="btn-primary mt-8"
            onClick={() => {
              setStep("details");
              setConfirmed(null);
              setBookingReference(null);
              setCheckIn("");
              setCheckOut("");
            }}
          >
            Make another booking
          </button>
        </div>
      </div>
    );
  }

  /* ── Details step ─────────────────────────────────────────────────────── */

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
      {/* Form */}
      <div className="lg:col-span-7">
        <div className="rounded-2xl border border-charcoal/15 bg-[#fafafb] p-6 sm:p-10">
          <p className="font-sans text-xs font-medium uppercase tracking-[0.14em] text-muted">
            Book your stay
          </p>
          <h2 className="mt-4 font-serif text-4xl font-normal leading-[1.05] tracking-[-0.02em] text-charcoal sm:text-5xl">
            Choose your dates.
          </h2>

          {/* Apartment picker */}
          <fieldset className="mt-8">
            <legend className="font-sans text-[10px] uppercase tracking-label text-muted">
              Apartment
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {apartments.map((option) => (
                <button
                  key={option.slug}
                  type="button"
                  onClick={() => {
                    setApartmentSlug(option.slug);
                    setCheckIn("");
                    setCheckOut("");
                  }}
                  aria-pressed={apartmentSlug === option.slug}
                  className={cn(
                    "rounded-2xl border p-5 text-left transition-colors duration-200",
                    apartmentSlug === option.slug
                      ? "border-charcoal bg-charcoal text-white"
                      : "border-charcoal/15 bg-[#ededed] hover:border-charcoal/40"
                  )}
                >
                  <span className={cn("block font-serif text-xl", apartmentSlug === option.slug ? "text-white" : "text-charcoal")}>{option.name}</span>
                  <span className={cn("mt-1 block text-xs", apartmentSlug === option.slug ? "text-white/65" : "text-muted")}>
                    {option.bedrooms} bedrooms · {option.bathrooms} bathrooms · up to{" "}
                    {option.maxGuests} guests
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Dates */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="relative">
              <span className="font-sans text-[10px] uppercase tracking-label text-muted">
                Check-in
              </span>
              <button
                type="button"
                onClick={() => setPickerOpen(pickerOpen === "in" ? null : "in")}
                aria-expanded={pickerOpen === "in"}
                className={cn(inputClass, "mt-2 flex items-center justify-between text-left", !checkIn && "text-muted")}
              >
                {checkIn ? formatDayShort(checkIn) : "Select date"}
                <Calendar className="h-4 w-4 text-charcoal/60" aria-hidden="true" />
              </button>
            </div>
            <div className="relative">
              <span className="font-sans text-[10px] uppercase tracking-label text-muted">
                Check-out
              </span>
              <button
                type="button"
                onClick={() => checkIn && setPickerOpen(pickerOpen === "out" ? null : "out")}
                aria-expanded={pickerOpen === "out"}
                className={cn(inputClass, "mt-2 flex items-center justify-between text-left", !checkOut && "text-muted")}
              >
                {checkOut ? formatDayShort(checkOut) : checkIn ? "Select date" : "Choose check-in first"}
                <Calendar className="h-4 w-4 text-charcoal/60" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Calendar popover */}
          {pickerOpen && apartment ? (
            <div className="relative mt-4">
              <div className="absolute inset-x-0 top-0 z-20 border border-charcoal/15 bg-white p-4 shadow-xl sm:max-w-sm">
                {loadingAvailability ? (
                  <p className="flex items-center gap-2 py-8 text-sm text-muted">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Loading availability…
                  </p>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => shiftPickerMonth(-1)}
                        aria-label="Previous month"
                        className="rounded-full p-2 text-charcoal hover:bg-charcoal hover:text-white"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <p className="font-serif text-lg text-charcoal">
                        {new Date(pickerCursor.year, pickerCursor.month, 1).toLocaleDateString(
                          "en-NG",
                          { month: "long", year: "numeric" }
                        )}
                      </p>
                      <button
                        type="button"
                        onClick={() => shiftPickerMonth(1)}
                        aria-label="Next month"
                        className="rounded-full p-2 text-charcoal hover:bg-charcoal hover:text-white"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-7 text-center">
                      {WEEKDAYS.map((name) => (
                        <span key={name} className="py-1 text-[10px] uppercase tracking-label text-muted">
                          {name}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {pickerGrid.map((cell) =>
                        cell.day === 0 ? (
                          <span key={cell.key} />
                        ) : (
                          <button
                            key={cell.key}
                            type="button"
                            disabled={disabledFor(pickerOpen, cell.key)}
                            onClick={() => {
                              if (pickerOpen === "in") {
                                setCheckIn(cell.key);
                                if (checkOut && cell.key >= checkOut) setCheckOut("");
                                setPickerOpen("out");
                              } else {
                                setCheckOut(cell.key);
                                setPickerOpen(null);
                              }
                            }}
                            aria-label={`${cell.day} ${pickerCursor.month + 1}`}
                            className={cn(
                              "flex h-9 items-center justify-center text-sm transition-colors",
                              (pickerOpen === "in" ? checkIn : checkOut) === cell.key
                                ? "rounded-full bg-charcoal text-white"
                                : "rounded-full text-charcoal hover:bg-charcoal/10",
                              disabledFor(pickerOpen, cell.key) &&
                                "cursor-not-allowed text-charcoal/25 line-through hover:bg-transparent",
                              isPast(cell.key) && "cursor-not-allowed text-charcoal/25 hover:bg-transparent"
                            )}
                          >
                            {cell.day}
                          </button>
                        )
                      )}
                    </div>

                    <p className="mt-3 flex items-center gap-2 border-t border-charcoal/10 pt-3 text-xs text-muted">
                      <Lock className="h-3 w-3" aria-hidden="true" />
                      Crossed-out dates are already booked or blocked.
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : null}

          {/* Guest details */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="font-sans text-[10px] uppercase tracking-label text-muted">
                Guests (up to {apartment?.maxGuests ?? 4})
              </span>
              <input
                type="number"
                min={1}
                max={apartment?.maxGuests ?? 4}
                value={guests}
                onChange={(event) => setGuests(Number(event.target.value))}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="font-sans text-[10px] uppercase tracking-label text-muted">Full name</span>
              <input
                type="text"
                value={guestName}
                autoComplete="name"
                onChange={(event) => setGuestName(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="font-sans text-[10px] uppercase tracking-label text-muted">Email</span>
              <input
                type="email"
                required
                value={email}
                placeholder="you@example.com"
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="font-sans text-[10px] uppercase tracking-label text-muted">
                Phone (optional)
              </span>
              <input
                type="tel"
                value={phone}
                autoComplete="tel"
                onChange={(event) => setPhone(event.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          {rangeConflict ? (
            <p role="alert" className="mt-6 border-l-2 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-800">
              Some of the selected dates are no longer available. Please choose another date range.
            </p>
          ) : error ? (
            <p role="alert" className="mt-6 border-l-2 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handlePay}
            disabled={!detailsValid || step === "paying" || step === "verifying"}
            className="mt-8 inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-charcoal px-8 font-sans text-sm font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            {step === "paying"
              ? "Starting payment…"
              : step === "verifying"
                ? "Confirming your payment…"
                : total > 0
                  ? `Pay ${formatNaira(total)}`
                  : "Choose dates to continue"}
          </button>

          <p className="mt-4 text-center text-xs text-muted">
            Payment is processed securely by Paystack. A confirmation email is sent the moment
            your payment is verified.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="lg:col-span-5">
        <div className="rounded-[22px] bg-[#111111] p-8 text-[#fafafb] sm:p-10 lg:sticky lg:top-32">
          <p className="font-sans text-xs font-medium uppercase tracking-[0.14em] text-white/55">Your stay</p>
          <h3 className="mt-4 font-serif text-3xl font-normal tracking-[-0.015em] text-white">{apartment?.name ?? "Apartment"}</h3>

          <dl className="mt-8 space-y-5 border-t border-white/15 pt-8 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-white/55">Check-in</dt>
              <dd>{checkIn ? formatDayShort(checkIn) : "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-white/55">Check-out</dt>
              <dd>{checkOut ? formatDayShort(checkOut) : "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-white/55">Guests</dt>
              <dd>{guests}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-white/15 pt-5">
              <dt className="text-white/55">
                {apartment ? formatNaira(apartment.pricePerNight) : ""} × {nights} night
                {nights === 1 ? "" : "s"}
              </dt>
              <dd>{total > 0 ? formatNaira(total) : "—"}</dd>
            </div>
          </dl>

          <div className="mt-8 border-t border-white/15 pt-8">
            <div className="flex items-baseline justify-between">
              <span className="font-sans text-xs uppercase tracking-[0.14em] text-white/55">Total</span>
              <span className="font-serif text-4xl text-white">{total > 0 ? formatNaira(total) : "—"}</span>
            </div>
          </div>

          <p className="mt-8 text-xs leading-relaxed text-white/55">
            Your dates are held for 30 minutes once you start payment. If payment is not
            completed, they are released automatically.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-white/55">{label}</dt>
      <dd className={cn("text-right", strong ? "font-serif text-lg text-charcoal" : "text-charcoal")}>
        {value}
      </dd>
    </div>
  );
}
