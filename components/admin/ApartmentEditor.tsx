"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

import { updateApartmentAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

export type AdminApartment = {
  id: string;
  slug: string;
  name: string;
  description: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  checkInTime: string;
  checkOutTime: string;
  active: boolean;
};

const inputClass =
  "mt-2 w-full border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-brand-red";

export function ApartmentEditor({ apartments }: { apartments: AdminApartment[] }) {
  return (
    <div className="space-y-8">
      <p className="max-w-2xl text-sm text-muted">
        These details feed the public website: the homepage booking card, the /book page and
        server-side price calculation. Changes appear on the site immediately after saving.
      </p>

      {apartments.map((apartment) => (
        <ApartmentForm key={apartment.id} apartment={apartment} />
      ))}
    </div>
  );
}

function ApartmentForm({ apartment }: { apartment: AdminApartment }) {
  const [state, setState] = useState<{ ok: boolean; message: string } | null>(null);
  const [isPending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setState(null);
    const result = await updateApartmentAction(null, new FormData(event.currentTarget));
    setPending(false);
    setState(result);
  }

  return (
    <form onSubmit={handleSubmit} className="border border-charcoal/10 bg-white p-6 sm:p-8">
      <input type="hidden" name="apartmentId" value={apartment.id} />

      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-charcoal">{apartment.name}</h2>
        <span className="font-mono text-xs text-muted">{apartment.slug}</span>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="font-sans text-[10px] uppercase tracking-label text-muted">Name</span>
          <input type="text" name="name" defaultValue={apartment.name} required className={inputClass} />
        </label>

        <label className="block sm:col-span-2">
          <span className="font-sans text-[10px] uppercase tracking-label text-muted">Description</span>
          <textarea
            name="description"
            defaultValue={apartment.description}
            rows={3}
            className={inputClass}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="font-sans text-[10px] uppercase tracking-label text-muted">Location</span>
          <input type="text" name="location" defaultValue={apartment.location} className={inputClass} />
        </label>

        <label className="block">
          <span className="font-sans text-[10px] uppercase tracking-label text-muted">Bedrooms</span>
          <input type="number" name="bedrooms" min={0} max={20} defaultValue={apartment.bedrooms} className={inputClass} />
        </label>

        <label className="block">
          <span className="font-sans text-[10px] uppercase tracking-label text-muted">Bathrooms</span>
          <input type="number" name="bathrooms" min={0} max={20} defaultValue={apartment.bathrooms} className={inputClass} />
        </label>

        <label className="block">
          <span className="font-sans text-[10px] uppercase tracking-label text-muted">Max guests</span>
          <input type="number" name="maxGuests" min={1} max={20} defaultValue={apartment.maxGuests} className={inputClass} />
        </label>

        <label className="block">
          <span className="font-sans text-[10px] uppercase tracking-label text-muted">Price per night (₦)</span>
          <input
            type="number"
            name="pricePerNight"
            min={0}
            step={500}
            defaultValue={apartment.pricePerNight}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="font-sans text-[10px] uppercase tracking-label text-muted">Check-in time</span>
          <input type="text" name="checkInTime" defaultValue={apartment.checkInTime} className={inputClass} />
        </label>

        <label className="block">
          <span className="font-sans text-[10px] uppercase tracking-label text-muted">Check-out time</span>
          <input type="text" name="checkOutTime" defaultValue={apartment.checkOutTime} className={inputClass} />
        </label>
      </div>

      <label className="mt-5 flex items-center gap-3 text-sm text-charcoal">
        <input
          type="checkbox"
          name="active"
          defaultChecked={apartment.active}
          className="h-4 w-4 accent-[#B89B5E]"
        />
        Listed on the public website
      </label>

      {state && !state.ok ? (
        <p role="alert" className="mt-6 border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.message}
        </p>
      ) : null}
      {state?.ok ? (
        <p role="status" className="mt-6 flex items-center gap-2 border-l-2 border-emerald-600 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          {state.message}
        </p>
      ) : null}

      <div className="mt-8">
        <button type="submit" disabled={isPending} className="btn-primary disabled:opacity-50">
          {isPending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
