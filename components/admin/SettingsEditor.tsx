"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

import { updateSettingsAction } from "@/app/admin/actions";

export type AdminSettings = Record<string, string>;

const field =
  "mt-2 w-full border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-brand-red";

export function SettingsEditor({ settings }: { settings: AdminSettings }) {
  const [state, setState] = useState<{ ok: boolean; message: string } | null>(null);
  const [isPending, setPending] = useState(false);

  const value = (key: string, fallback = "") => settings[key] ?? fallback;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setState(null);
    const result = await updateSettingsAction(null, new FormData(event.currentTarget));
    setPending(false);
    setState(result);
  }

  return (
    <div className="max-w-3xl space-y-8">
      <p className="text-sm text-muted">
        These values appear across the public website — header, footer, booking card and
        announcement bar. Empty optional fields are simply hidden on the site.
      </p>

      <form onSubmit={handleSubmit} className="border border-charcoal/10 bg-white p-6 sm:p-8">
        <h2 className="font-serif text-2xl text-charcoal">Brand</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="font-sans text-[10px] uppercase tracking-label text-muted">Site name</span>
            <input type="text" name="site.name" defaultValue={value("site.name", "Crayford")} required className={field} />
          </label>
          <label className="block">
            <span className="font-sans text-[10px] uppercase tracking-label text-muted">Wordmark</span>
            <input type="text" name="site.wordmark" defaultValue={value("site.wordmark", "CRAYFORD")} required className={field} />
          </label>
          <label className="block sm:col-span-2">
            <span className="font-sans text-[10px] uppercase tracking-label text-muted">Tagline</span>
            <input type="text" name="site.tagline" defaultValue={value("site.tagline")} className={field} />
          </label>
        </div>

        <h2 className="mt-10 font-serif text-2xl text-charcoal">Contact</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="font-sans text-[10px] uppercase tracking-label text-muted">Phone</span>
            <input type="text" name="site.phone" defaultValue={value("site.phone")} className={field} />
          </label>
          <label className="block">
            <span className="font-sans text-[10px] uppercase tracking-label text-muted">Email</span>
            <input type="email" name="site.email" defaultValue={value("site.email")} required className={field} />
          </label>
          <label className="block sm:col-span-2">
            <span className="font-sans text-[10px] uppercase tracking-label text-muted">Address</span>
            <input type="text" name="site.address" defaultValue={value("site.address")} className={field} />
          </label>
          <label className="block sm:col-span-2">
            <span className="font-sans text-[10px] uppercase tracking-label text-muted">Location (short)</span>
            <input type="text" name="site.location" defaultValue={value("site.location")} className={field} />
          </label>
          <label className="block sm:col-span-2">
            <span className="font-sans text-[10px] uppercase tracking-label text-muted">
              Instagram URL (optional)
            </span>
            <input type="url" name="site.instagram" defaultValue={value("site.instagram")} className={field} />
          </label>
        </div>

        <h2 className="mt-10 font-serif text-2xl text-charcoal">Announcement bar</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="font-sans text-[10px] uppercase tracking-label text-muted">Message</span>
            <input
              type="text"
              name="announcement.message"
              defaultValue={value("announcement.message")}
              className={field}
            />
          </label>
          <label className="block">
            <span className="font-sans text-[10px] uppercase tracking-label text-muted">Status label</span>
            <input
              type="text"
              name="announcement.status"
              defaultValue={value("announcement.status")}
              className={field}
            />
          </label>
        </div>

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
            {isPending ? "Saving…" : "Save settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
