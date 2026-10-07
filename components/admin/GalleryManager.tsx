"use client";

import { useEffect, useState } from "react";

import { deleteGalleryImageAction, saveGalleryImageAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

export type AdminGalleryImage = {
  id: string;
  src: string;
  alt: string;
  title: string;
  featured: boolean;
  displayOrder: number;
};

const field =
  "mt-2 w-full border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-brand-red";

export function GalleryManager({ images }: { images: AdminGalleryImage[] }) {
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
          The public gallery renders these entries in display order. Files live in public/images —
          add the photo there first, then reference it as /images/your-file.jpg.
        </p>
        <button type="button" onClick={() => setEditing("new")} className="btn-primary shrink-0">
          Add Image
        </button>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <li key={image.id} className="border border-charcoal/10 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.src} alt={image.alt} className="aspect-[4/3] w-full object-cover" />
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm text-charcoal">
                    {image.title}
                    {image.featured ? (
                      <span className="ml-2 bg-brand-pink/30 px-2 py-0.5 text-[10px] uppercase tracking-label text-brand-red">
                        Featured
                      </span>
                    ) : null}
                  </p>
                  <p className="truncate font-mono text-[11px] text-muted">{image.src}</p>
                </div>
                <span className="shrink-0 text-xs text-muted">#{image.displayOrder}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(image.id)}
                  className="flex-1 border border-charcoal/15 px-3 py-1.5 text-xs text-charcoal transition-colors hover:border-brand-red"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm(`Remove "${image.title}" from the gallery?`)) {
                      const result = await deleteGalleryImageAction({ id: image.id });
                      setToast(result);
                    }
                  }}
                  className="flex-1 border border-charcoal/15 px-3 py-1.5 text-xs text-charcoal transition-colors hover:border-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
        {images.length === 0 ? (
          <li className="col-span-full border border-dashed border-charcoal/20 bg-white p-8 text-center text-sm text-muted">
            No gallery images yet.
          </li>
        ) : null}
      </ul>

      {editing ? (
        <GalleryImageForm
          image={images.find((image) => image.id === editing) ?? null}
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

function GalleryImageForm({
  image,
  onClose,
  onSave,
}: {
  image: AdminGalleryImage | null;
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
    const result = await saveGalleryImageAction(null, formData);
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
        aria-label={image ? "Edit gallery image" : "Add gallery image"}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto bg-white p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="font-serif text-2xl text-charcoal">
          {image ? "Edit Image" : "Add Image"}
        </h3>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {image ? <input type="hidden" name="id" value={image.id} /> : null}

          <label className="block">
            <span className="font-sans text-[10px] uppercase tracking-label text-muted">
              Image path
            </span>
            <input
              type="text"
              name="src"
              defaultValue={image?.src ?? "/images/"}
              required
              placeholder="/images/exterior.jpg"
              className={field}
            />
          </label>

          <label className="block">
            <span className="font-sans text-[10px] uppercase tracking-label text-muted">Title</span>
            <input type="text" name="title" defaultValue={image?.title} required className={field} />
          </label>

          <label className="block">
            <span className="font-sans text-[10px] uppercase tracking-label text-muted">
              Alt text (accessibility)
            </span>
            <input type="text" name="alt" defaultValue={image?.alt} required className={field} />
          </label>

          <label className="block sm:w-40">
            <span className="font-sans text-[10px] uppercase tracking-label text-muted">
              Display order
            </span>
            <input
              type="number"
              name="displayOrder"
              min={0}
              defaultValue={image?.displayOrder ?? 0}
              className={field}
            />
          </label>

          <label className="flex items-center gap-3 text-sm text-charcoal">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={image?.featured}
              className="h-4 w-4 accent-[#B89B5E]"
            />
            Featured (shows in the homepage booking card)
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1 text-charcoal">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="btn-primary flex-1 disabled:opacity-50">
              {isPending ? "Saving…" : "Save Image"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
