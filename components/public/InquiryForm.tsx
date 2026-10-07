"use client";

import { CheckCircle2, Send } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const field =
  "mt-2 w-full border border-cream/15 bg-transparent px-4 py-3 text-sm text-cream outline-none transition-colors placeholder:text-cream/30 focus:border-brand-red";

/**
 * Public inquiry form — posts to /api/inquiries and lands in the admin
 * dashboard (Inquiries) for follow-up.
 */
export function InquiryForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setStatus("sending");
    setError(null);

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          message: formData.get("message"),
        }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !result.ok) {
        setError(result.error ?? "Could not send your message. Please try again.");
        setStatus("error");
        return;
      }
      form.reset();
      setStatus("sent");
    } catch {
      setError("Could not send your message. Please try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="border border-brand-red/30 bg-cream/5 p-8 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-brand-red" aria-hidden="true" />
        <p className="mt-4 font-serif text-2xl text-cream">Message received.</p>
        <p className="mt-2 text-sm text-cream/60">
          Thank you — we will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-white/10 bg-cream/5 p-8">
      <p className="font-sans text-[10px] uppercase tracking-label text-cream/60">
        Send a message
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="sr-only">Name</span>
          <input type="text" name="name" required placeholder="Your name" className={field} />
        </label>
        <label className="block">
          <span className="sr-only">Email</span>
          <input type="email" name="email" required placeholder="Email address" className={field} />
        </label>
        <label className="block sm:col-span-2">
          <span className="sr-only">Phone (optional)</span>
          <input type="tel" name="phone" placeholder="Phone (optional)" className={field} />
        </label>
        <label className="block sm:col-span-2">
          <span className="sr-only">Message</span>
          <textarea
            name="message"
            required
            rows={4}
            placeholder="How can we help?"
            className={cn(field, "resize-none")}
          />
        </label>
      </div>

      {error ? (
        <p role="alert" className="mt-4 border-l-2 border-red-500 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "sending" ? (
          "Sending…"
        ) : (
          <>
            Send Message
            <Send className="h-4 w-4" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}
