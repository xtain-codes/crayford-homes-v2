"use client";

import { useEffect, useState } from "react";

import { deleteRoomAction, saveRoomAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

export type AdminRoom = {
  id: string;
  slug: string;
  name: string;
  label: string;
  description: string;
  mainImage: string;
  galleryJson: string;
  featuresJson: string;
  displayOrder: number;
};

const field =
  "mt-2 w-full border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-brand-red";

export function RoomManager({ rooms }: { rooms: AdminRoom[] }) {
  const [editing, setEditing] = useState<string | null>(null); // room id or "new"
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
          Rooms power the /apartment page tabs and the homepage showcase. Image paths live under
          /images/ (e.g. /images/bedroom-1-main.jpg).
        </p>
        <button type="button" onClick={() => setEditing("new")} className="btn-primary shrink-0">
          Add Room
        </button>
      </div>

      <ul className="divide-y divide-charcoal/5 border border-charcoal/10 bg-white">
        {rooms.map((room) => (
          <li key={room.id} className="flex items-center gap-4 px-5 py-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={room.mainImage} alt="" className="h-14 w-20 shrink-0 object-cover" />
            <div className="min-w-0 flex-1">
              <p className="text-charcoal">
                {room.name}
                <span className="ml-2 text-xs text-muted">#{room.displayOrder}</span>
              </p>
              <p className="truncate text-xs text-muted">{room.description}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setEditing(room.id)}
                className="border border-charcoal/15 px-3 py-1.5 text-xs text-charcoal transition-colors hover:border-brand-red"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (window.confirm(`Remove "${room.name}" from the website?`)) {
                    const result = await deleteRoomAction({ id: room.id });
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
        {rooms.length === 0 ? (
          <li className="px-5 py-8 text-center text-sm text-muted">No rooms yet.</li>
        ) : null}
      </ul>

      {editing ? (
        <RoomForm
          room={rooms.find((room) => room.id === editing) ?? null}
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

function RoomForm({
  room,
  onClose,
  onSave,
}: {
  room: AdminRoom | null;
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
    const result = await saveRoomAction(null, formData);
    setPending(false);
    setState(result);
  }

  const gallery: string[] = safeParse(room?.galleryJson);
  const features: string[] = safeParse(room?.featuresJson);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-warmblack/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label={room ? "Edit room" : "Add room"}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-white p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="font-serif text-2xl text-charcoal">
          {room ? `Edit ${room.name}` : "Add Room"}
        </h3>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {room ? <input type="hidden" name="id" value={room.id} /> : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="font-sans text-[10px] uppercase tracking-label text-muted">Name</span>
              <input type="text" name="name" defaultValue={room?.name} required className={field} />
            </label>
            <label className="block">
              <span className="font-sans text-[10px] uppercase tracking-label text-muted">
                Slug (URL id)
              </span>
              <input
                type="text"
                name="slug"
                defaultValue={room?.slug}
                required
                disabled={Boolean(room)}
                className={cn(field, room && "bg-cream/60 text-muted")}
              />
            </label>
          </div>

          <label className="block">
            <span className="font-sans text-[10px] uppercase tracking-label text-muted">Description</span>
            <textarea name="description" defaultValue={room?.description} rows={3} required className={field} />
          </label>

          <label className="block">
            <span className="font-sans text-[10px] uppercase tracking-label text-muted">Main image path</span>
            <input
              type="text"
              name="mainImage"
              defaultValue={room?.mainImage ?? "/images/"}
              required
              className={field}
            />
          </label>

          <label className="block">
            <span className="font-sans text-[10px] uppercase tracking-label text-muted">
              Gallery paths (one per line)
            </span>
            <textarea name="galleryPaths" defaultValue={gallery.join("\n")} rows={3} className={field} />
          </label>

          <label className="block">
            <span className="font-sans text-[10px] uppercase tracking-label text-muted">
              Features (one per line)
            </span>
            <textarea name="features" defaultValue={features.join("\n")} rows={3} className={field} />
          </label>

          <label className="block sm:w-40">
            <span className="font-sans text-[10px] uppercase tracking-label text-muted">Display order</span>
            <input
              type="number"
              name="displayOrder"
              min={0}
              defaultValue={room?.displayOrder ?? 0}
              className={field}
            />
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1 text-charcoal">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="btn-primary flex-1 disabled:opacity-50">
              {isPending ? "Saving…" : "Save Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function safeParse(json: string | undefined): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
