"use client";

import { AlertCircle, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { BrandLogo } from "@/components/BrandLogo";

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !result.ok) {
        setError(result.error ?? "Sign in failed. Please try again.");
        setPending(false);
        return;
      }

      // Session cookie is set — hard navigation guarantees the server sees it.
      window.location.href = "/admin";
    } catch {
      setError("Sign in failed. Please try again.");
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper-warm px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex flex-col items-center transition-opacity hover:opacity-80"
          >
            <BrandLogo className="h-14 w-auto" />
            <span className="sr-only">Crayford Homes</span>
          </Link>
          <p className="mt-4 flex items-center justify-center gap-2 font-sans text-[10px] uppercase tracking-label text-ink-soft">
            <Lock className="h-3 w-3 text-brand-red" aria-hidden="true" />
            Admin Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 border border-charcoal/10 bg-white p-8 shadow-sm sm:p-10">
          <label className="block">
            <span className="font-sans text-[10px] uppercase tracking-label text-ink-soft">Email</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="mt-2 w-full border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-brand-red"
            />
          </label>

          <label className="mt-6 block">
            <span className="font-sans text-[10px] uppercase tracking-label text-ink-soft">Password</span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="mt-2 w-full border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-brand-red"
            />
          </label>

          {error ? (
            <p
              role="alert"
              className="mt-6 flex items-start gap-2 border-l-2 border-brand-red bg-brand-red/10 px-4 py-3 text-sm text-brand-red-dark"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="btn-primary mt-8 w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-muted">
          Protected area. Sessions expire after 7 days.
        </p>
      </div>
    </main>
  );
}
