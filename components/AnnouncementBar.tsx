import { siteConfig } from "@/lib/site";

/**
 * Thin announcement strip above the navigation.
 * Remove <AnnouncementBar /> from components/Navbar.tsx (or delete this
 * component) to take it out of the site — nothing else references it.
 */
export function AnnouncementBar() {
  return (
    <div className="bg-brand-red text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-2.5 sm:px-8">
        <p className="font-sans text-[10px] font-medium uppercase tracking-label text-white/85">
          {siteConfig.announcement.message}
        </p>
        <p className="hidden items-center gap-2 font-sans text-[10px] font-medium uppercase tracking-label sm:flex">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-pink" />
          {siteConfig.announcement.status}
        </p>
      </div>
    </div>
  );
}
