"use client";

import { CalendarDays, Users, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

function localToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function EditorialAvailability() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const today = localToday();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (checkIn && checkOut && checkOut <= checkIn) return;
    const params = new URLSearchParams();
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    params.set("guests", guests);
    router.push(`/book?${params.toString()}`);
  }

  return (
    <form onSubmit={submit} className="editorial-booking-panel" aria-label="Find your stay">
      <label className="editorial-booking-field">
        <span>Check in</span>
        <span className="flex items-center gap-3">
          <CalendarDays className="h-4 w-4 shrink-0 text-[#23212c]" aria-hidden="true" />
          <input aria-label="Check-in date" type="date" min={today} value={checkIn} onChange={(e) => { setCheckIn(e.target.value); if (checkOut && e.target.value >= checkOut) setCheckOut(""); }} className="editorial-booking-input" />
        </span>
      </label>
      <label className="editorial-booking-field">
        <span>Check out</span>
        <span className="flex items-center gap-3">
          <CalendarDays className="h-4 w-4 shrink-0 text-[#23212c]" aria-hidden="true" />
          <input aria-label="Check-out date" type="date" min={checkIn || today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="editorial-booking-input" />
        </span>
      </label>
      <label className="editorial-booking-field">
        <span>Guests</span>
        <span className="flex items-center gap-3">
          <Users className="h-4 w-4 shrink-0 text-[#23212c]" aria-hidden="true" />
          <select aria-label="Number of guests" value={guests} onChange={(e) => setGuests(e.target.value)} className="editorial-booking-input">
            {[1,2,3,4,5].map((guest) => <option key={guest} value={guest}>{guest} {guest === 1 ? "guest" : "guests"}</option>)}
          </select>
        </span>
      </label>
      <button type="submit" className="editorial-booking-button">
        <span>Find your stay</span>
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}
