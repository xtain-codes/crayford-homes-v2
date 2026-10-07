"use client";

import { useEffect, useMemo, useState } from "react";

import { updateInquiryStatusAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

export type AdminInquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  createdAt: string;
};

const STATUS_STYLES: Record<string, string> = {
  new: "bg-brand-pink/30 text-brand-red",
  read: "bg-blue-100 text-blue-800",
  replied: "bg-emerald-100 text-emerald-800",
  archived: "bg-charcoal/10 text-muted",
};

const FILTERS = ["all", "new", "read", "replied", "archived"] as const;

export function InquiryManager({ inquiries }: { inquiries: AdminInquiry[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; message: string } | null>(null);

  const filtered = useMemo(
    () => (filter === "all" ? inquiries : inquiries.filter((inquiry) => inquiry.status === filter)),
    [inquiries, filter]
  );

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function setStatus(id: string, status: string) {
    const result = await updateInquiryStatusAction({ id, status });
    setToast(result);
  }

  return (
    <div className="space-y-6">
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
            {status}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="border border-dashed border-charcoal/20 bg-white p-8 text-center text-sm text-muted">
          No inquiries in this view.
        </p>
      ) : (
        <ul className="divide-y divide-charcoal/5 border border-charcoal/10 bg-white">
          {filtered.map((inquiry) => (
            <li key={inquiry.id} className="px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === inquiry.id ? null : inquiry.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="flex items-center gap-3 text-charcoal">
                    <span className="font-medium">{inquiry.name}</span>
                    <span className={cn("px-2 py-0.5 text-[10px] uppercase tracking-label", STATUS_STYLES[inquiry.status] ?? "bg-charcoal/10")}>
                      {inquiry.status}
                    </span>
                  </p>
                  <p className="truncate text-xs text-muted">
                    {inquiry.email}
                    {inquiry.phone ? ` · ${inquiry.phone}` : ""} ·{" "}
                    {new Date(inquiry.createdAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </button>
                <div className="flex shrink-0 gap-2">
                  {inquiry.status === "new" ? (
                    <button
                      type="button"
                      onClick={() => setStatus(inquiry.id, "read")}
                      className="border border-charcoal/15 px-3 py-1.5 text-xs text-charcoal transition-colors hover:border-brand-red"
                    >
                      Mark read
                    </button>
                  ) : null}
                  {inquiry.status !== "replied" && inquiry.status !== "archived" ? (
                    <button
                      type="button"
                      onClick={() => setStatus(inquiry.id, "replied")}
                      className="border border-charcoal/15 px-3 py-1.5 text-xs text-charcoal transition-colors hover:border-brand-red"
                    >
                      Mark replied
                    </button>
                  ) : null}
                  {inquiry.status !== "archived" ? (
                    <button
                      type="button"
                      onClick={() => setStatus(inquiry.id, "archived")}
                      className="border border-charcoal/15 px-3 py-1.5 text-xs text-charcoal transition-colors hover:border-red-500 hover:text-red-700"
                    >
                      Archive
                    </button>
                  ) : null}
                </div>
              </div>

              {expanded === inquiry.id ? (
                <p className="mt-4 border-l-2 border-brand-red bg-cream/40 px-4 py-3 text-sm text-charcoal">
                  {inquiry.message}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

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
