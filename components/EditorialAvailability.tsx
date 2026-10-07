"use client";

import { CalendarDays, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function EditorialAvailability() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");

  function submit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    params.set("guests", guests);
    router.push(`/book?${params.toString()}`);
  }

  return (
    <form onSubmit={submit} className="editorial-booking-panel" aria-label="Check availability">
      <label className="editorial-booking-field">
        <span>Check in</span>
        <span className="flex items-center gap-3">
          <CalendarDays className="h-4 w-4 text-brand-red" aria-hidden="true" />
          <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="editorial-booking-input" />
        </span>
      </label>
      <label className="editorial-booking-field">
        <span>Check out</span>
        <span className="flex items-center gap-3">
          <CalendarDays className="h-4 w-4 text-brand-red" aria-hidden="true" />
          <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="editorial-booking-input" />
        </span>
      </label>
      <label className="editorial-booking-field">
        <span>Guests</span>
        <span className="flex items-center gap-3">
          <Users className="h-4 w-4 text-brand-red" aria-hidden="true" />
          <select value={guests} onChange={(e) => setGuests(e.target.value)} className="editorial-booking-input">
            {[1,2,3,4,5].map((guest) => <option key={guest} value={guest}>{guest} {guest === 1 ? "guest" : "guests"}</option>)}
          </select>
        </span>
      </label>
      <button type="submit" className="editorial-booking-button">Check availability</button>
    </form>
  );
}
