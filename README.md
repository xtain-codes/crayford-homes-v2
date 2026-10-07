# Crayford Homes

A premium apartment showcase, booking and **property-management** platform built with
Next.js, TypeScript, Tailwind CSS and Prisma.

Guests browse the site, pick real (database-verified) dates, pay through **Paystack**,
and get a **"Payment received" confirmation email**. An authenticated administrator
manages availability, bookings, content and settings from a connected dashboard.

## Tech Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Prisma ORM (SQLite locally, PostgreSQL in production)
- Paystack (payments) + Resend (email)
- Lucide React

## Public Website

| Route | Purpose |
| --- | --- |
| `/` | Cinematic homepage: hero, rooms, amenities (all DB-driven) |
| `/book` | Booking flow with live availability calendar + payment |
| `/apartment` | Room-by-room exploration (rooms managed from admin) |
| `/gallery` | Masonry gallery with lightbox (images managed from admin) |
| `/location` | Location details and directions |

A discreet **Admin Login** link in the footer leads to the dashboard.

## Admin Dashboard

| Route | Purpose |
| --- | --- |
| `/admin/login` | Branded sign-in (HTTP-only signed session cookie, 7 days) |
| `/admin` | Stats, recent bookings, upcoming stays, quick actions |
| `/admin/availability` | Color-coded calendar — block/unblock date ranges per apartment |
| `/admin/bookings` | Full booking table with filters, details and status changes |
| `/admin/apartment` | Edit apartment details/pricing shown on the public site |
| `/admin/rooms` | Manage rooms powering the /apartment page |
| `/admin/amenities` | Manage homepage amenities |
| `/admin/gallery` | Manage gallery images and the featured image |
| `/admin/inquiries` | Inquiries from the public contact form |
| `/admin/settings` | Site name, contact details, announcement bar |

Every admin mutation is session-checked and zod-validated **server-side** — hiding UI
is never the security boundary.

## Availability System

One source of truth (`lib/availability.ts`) serves both the public site and the admin:

- A stay occupies `[check-in, check-out)` — the check-out day frees up for the next guest.
- A date is unavailable when it is **in the past**, covered by a **confirmed booking**,
  covered by an **admin block**, or **held** by a pending-payment booking that hasn't expired.
- The public calendar disables unavailable dates (`GET /api/availability`) — but the server
  re-validates every booking (`POST /api/bookings`) and every payment
  (`POST /api/bookings/verify`), so the frontend can never be trusted to enforce availability.
- **Double-booking protection:** payment verification re-checks availability *inside a
  database transaction* before confirming. The loser gets a clear 409 message.
- **Payment failure/cancellation never blocks dates:** a booking is only a 30-minute
  hold until Paystack verifies the charge; expired holds are cancelled automatically and
  their dates released.

```
Guest pays → verify route confirms (transactional overlap check) → dates become booked
Admin blocks dates → instantly unavailable to guests
Admin unblocks → available again (unless a confirmed booking occupies them)
```

## Database

Local development uses SQLite — zero setup. The schema is production-ready for
PostgreSQL: switch the datasource in `prisma/schema.prisma` and set `DATABASE_URL`.

Models: `AdminUser`, `Apartment`, `Room`, `Amenity`, `GalleryImage`, `Booking`,
`BlockedDate`, `Inquiry`, `SiteSetting`.

```bash
npm run db:push     # apply the schema
npm run db:seed     # seed admin user + content from the site config
npm run db:studio   # browse the data
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in real values (never commit it):

```env
DATABASE_URL="file:./dev.db"          # or a Postgres connection string
AUTH_SECRET="a-long-random-string"    # signs admin session cookies

NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=      # pk_test_… / pk_live_…
PAYSTACK_SECRET_KEY=                  # sk_test_… / sk_live_… (server only)

RESEND_API_KEY=                       # resend.com API key
EMAIL_FROM=Crayford <bookings@yourdomain.com>
```

`AUTH_SECRET` and `DATABASE_URL` are required. Paystack/Resend keys are optional —
without them the site runs and shows honest "being set up" states instead of faking
payments or emails.

## Setting up the Paystack API

1. Create an account at [paystack.com](https://paystack.com), open
   **Settings → API Keys & Webhooks**.
2. Copy the keys (start with `pk_test_` / `sk_test_`; switch to live keys when ready).
3. Put them in `.env.local` under `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` / `PAYSTACK_SECRET_KEY`.
4. Restart the server. `/book` now opens the Paystack checkout, charges
   `nights × apartment price` in NGN, verifies server-side and confirms the booking.
5. Recommended: set a webhook to `https://yourdomain.com/api/bookings/verify`.

**Test card:** `4084 0840 8408 4081`, any future expiry, any CVV, approve with the OTP shown.

## Setting up the confirmation email

1. Create an account at [resend.com](https://resend.com), generate an API key.
2. Verify your sending domain (or test with `onboarding@resend.dev`, which only
   delivers to your own address).
3. Add `RESEND_API_KEY` and `EMAIL_FROM` to `.env.local`, restart.

After every verified payment the guest receives the branded "Payment received" email.

## Adding Apartment Images

Drop photos into `public/images/`, then reference them in
**Admin → Gallery / Rooms** (or seed data) as `/images/your-file.jpg`.
Suggested filenames:

| Filename | Used for |
| --- | --- |
| `hero-living-room.jpg` | Homepage hero + apartment page header |
| `living-room-2/3.jpg` | Living room angles |
| `kitchen-1/2.jpg` | Kitchen & dining |
| `bedroom-1-main/alt.jpg` | Bedroom one |
| `bedroom-2-main/alt.jpg` | Bedroom two |
| `bathroom-1/2.jpg` | Bathrooms |
| `exterior.jpg` | Cinematic image break |

JPG, ≥1600px wide, under ~2MB. Missing files are hidden gracefully — never broken icons.

## Brand Identity & Logo

The official Crayford Homes palette is centralized in `tailwind.config.ts` and
`app/globals.css` (`:root` CSS variables):

| Token | Hex | Used for |
| --- | --- | --- |
| `brand-red` / `primary` | `#971D1D` | Primary buttons, footer, CTAs, selected states, admin sidebar |
| `brand-red-dark` | `#7A1717` | Hover shade of the primary red |
| `brand-pink` / `accent` | `#DDA8A8` | Borders, decorative rules, hover highlights, secondary accents |
| `brand-pink-soft` | `#F6E8E8` | Soft section tints |
| `paper` / `paper-warm` | `#FFFFFF` / `#FAFAF8` | Page backgrounds |
| `ink` / `ink-soft` | `#202020` / `#666666` | Primary / secondary text |
| disabled | `#D5D5D5` | Disabled calendar dates |

**Official logo:** drop the client-provided logo file at
`public/images/crayford-logo.png`. It is picked up automatically by the navigation,
footer, admin sidebar, admin login and the first-visit intro screen — no code changes
needed. Until the file exists, an elegant typographic wordmark is shown instead
(never a broken image). Keep the file's original aspect ratio; it renders at 32–64px
text height depending on context.

**Intro screen:** first-time visitors see a ~1.8s logo reveal on white. It plays once
per browser session (`sessionStorage`), never during internal navigation, and is
skipped for `prefers-reduced-motion` users.

## Managing Content

Two layers, one source of truth:

- **Database (admin dashboard)** — apartments, rooms, amenities, gallery, settings.
  Changes appear on the public site immediately after saving.
- **`lib/site.ts`** — static fallbacks used when the database is unreachable, plus
  hero copy and navigation links.

## Development

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Then open http://localhost:3000 — admin at http://localhost:3000/admin/login
(default seeded login: `admin@crayford.local` / `CrayfordAdmin2026!` — change it in
production via `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars before seeding).

## Production

```bash
npm run build
npm start
```

## Deployment (Vercel + PostgreSQL)

1. Push the repository to GitHub, import at vercel.com/new.
2. Create a Postgres database (Vercel Postgres, Neon, Supabase…), switch the Prisma
   datasource provider to `postgresql` and set `DATABASE_URL`.
3. Set `AUTH_SECRET` plus the Paystack/Resend variables in Project → Settings →
   Environment Variables.
4. Run `npx prisma db push` and `npm run db:seed` against the production database once.
5. Deploy, update the domain in `app/sitemap.ts`, and point the Paystack webhook at
   `https://yourdomain.com/api/bookings/verify`.
