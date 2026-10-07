"use client";

import { useEffect, useState } from "react";

import { deleteAmenityAction, saveAmenityAction } from "@/app/admin/actions";
import { AmenityIcon } from "@/components/ui/AmenityIcon";
import { cn } from "@/lib/utils";

export type AdminAmenity = {
  id: string;
  name: string;
  description: string;
  icon: string;
  displayOrder: number;
};

const field =
  "mt-2 w-full border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-brand-red";

const ICON_CHOICES = [
  "wifi",
  "airVent",
  "tv",
  "cookingPot",
  "shirt",
  "laptop",
  "bath",
  "carFront",
  "shieldCheck",
  "zap",
  "key",
  "conciergeBell",
  "droplets",
  "flame",
];

export function AmenityManager({ amenities }: { amenities: AdminAmenity[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; message: string } | null>(null);

  function handleSave(result: { ok: boolean; message: string } | null) {
    if (result) {
      setToast(result);
      if (result.ok) setEditing(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="max-w-xl text-sm text-muted">
          Amenities appear in the dark section of the homepage. Icons are Lucide keys — pick from
          the list or type any supported key.
        </p>
        <button type="button" onClick={() => setEditing("new")} className="btn-primary shrink-0">
          Add Amenity
        </button>
      </div>

      <ul className="divide-y divide-charcoal/5 border border-charcoal/10 bg-white">
        {amenities.map((amenity) => (
          <li key={amenity.id} className="flex items-center gap-4 px-5 py-4">
            <AmenityIcon name={amenity.icon} className="h-5 w-5 shrink-0 text-brand-red" />
            <div className="min-w-0 flex-1">
              <p className="text-charcoal">
                {amenity.name}
                <span className="ml-2 text-xs text-muted">#{amenity.displayOrder}</span>
              </p>
              <p className="truncate text-xs text-muted">{amenity.description}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setEditing(amenity.id)}
                className="border border-charcoal/15 px-3 py-1.5 text-xs text-charcoal transition-colors hover:border-brand-red"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (window.confirm(`Remove "${amenity.name}" from the website?`)) {
                    const result = await deleteAmenityAction({ id: amenity.id });
                    setToast(result);
                  }
                }}
                className="border border-charcoal/15 px-3 py-1.5 text-xs text-charcoal transition-colors hover:border-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
        {amenities.length === 0 ? (
          <li className="px-5 py-8 text-center text-sm text-muted">No amenities yet.</li>
        ) : null}
      </ul>

      {editing ? (
        <AmenityForm
          amenity={amenities.find((amenity) => amenity.id === editing) ?? null}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
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

function AmenityForm({
  amenity,
  onClose,
  onSave,
}: {
  amenity: AdminAmenity | null;
  onClose: () => void;
  onSave: (result: { ok: boolean; message: string } | null) => void;
}) {
  const [state, setState] = useState<{ ok: boolean; message: string } | null>(null);
  const [isPending, setPending] = useState(false);

  useEffect(() => {
    if (state) onSave(state);
  }, [state, onSave]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPending(true);
    setState(null);
    const result = await saveAmenityAction(null, formData);
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
        aria-label={amenity ? "Edit amenity" : "Add amenity"}
        className="w-full max-w-lg bg-white p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="font-serif text-2xl text-charcoal">
          {amenity ? `Edit ${amenity.name}` : "Add Amenity"}
        </h3>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {amenity ? <input type="hidden" name="id" value={amenity.id} /> : null}

          <label className="block">
            <span className="font-sans text-[10px] uppercase tracking-label text-muted">Name</span>
            <input type="text" name="name" defaultValue={amenity?.name} required className={field} />
          </label>

          <label className="block">
            <span className="font-sans text-[10px] uppercase tracking-label text-muted">Description</span>
            <textarea name="description" defaultValue={amenity?.description} rows={2} className={field} />
          </label>

          <label className="block">
            <span className="font-sans text-[10px] uppercase tracking-label text-muted">Icon</span>
            <select name="icon" defaultValue={amenity?.icon ?? "wifi"} className={cn(field, "bg-white")}>
              {ICON_CHOICES.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
            <span className="mt-2 flex items-center gap-2 text-xs text-muted">
              Preview: <AmenityIcon name={amenity?.icon ?? "wifi"} className="h-4 w-4 text-brand-red" />
            </span>
          </label>

          <label className="block sm:w-40">
            <span className="font-sans text-[10px] uppercase tracking-label text-muted">Display order</span>
            <input
              type="number"
              name="displayOrder"
              min={0}
              defaultValue={amenity?.displayOrder ?? 0}
              className={field}
            />
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1 text-charcoal">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="btn-primary flex-1 disabled:opacity-50">
              {isPending ? "Saving…" : "Save Amenity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
