import { BrandIntro } from "@/components/BrandLogo";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

/**
 * Public website shell — navbar + footer. Admin routes live outside this
 * group so they render the admin shell instead.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BrandIntro />
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
