import { ArrowUpRight, Mail, Phone } from "lucide-react";
import Link from "next/link";

import { InquiryForm } from "@/components/public/InquiryForm";
import { Eyebrow, Reveal } from "@/components/ui/Reveal";
import { getEmailUrl, getPhoneUrl, siteConfig } from "@/lib/site";
import { isPlaceholder } from "@/lib/utils";

export function BookingCTA() {
  const phoneUrl = getPhoneUrl();
  const emailUrl = getEmailUrl();

  const channels: Array<{
    label: string;
    value: string;
    href: string | null;
    icon: typeof Mail;
  }> = [
    {
      label: "Email",
      value: isPlaceholder(siteConfig.email) ? "Coming soon" : siteConfig.email,
      href: emailUrl,
      icon: Mail,
    },
    {
      label: "Phone",
      value: isPlaceholder(siteConfig.phone) ? "Coming soon" : siteConfig.phone,
      href: phoneUrl,
      icon: Phone,
    },
  ];

  return (
    <section
      aria-labelledby="booking-cta-heading"
      className="bg-[#f7f0e1] text-[#23212c]"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 md:py-36 lg:px-12">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-7">
            <Reveal>
              <Eyebrow>Reservations</Eyebrow>
              <h2
                id="booking-cta-heading"
                className="mt-5 text-balance font-sans text-5xl font-light tracking-[-0.035em] leading-[1.05] sm:text-6xl md:text-7xl"
              >
                READY WHEN YOU ARE.
              </h2>
              <p className="mt-8 max-w-lg text-base leading-relaxed text-[#23212c]/70 md:text-lg">
                Book instantly online — choose your dates, pay securely through
                Paystack and receive your confirmation by email. Questions? We
                are one message away.
              </p>
              <Link href="/book" className="btn-primary mt-10 rounded-[20px]">
                Book a Stay
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Reveal>
          </div>

          <Reveal delay={150} className="md:col-span-5">
            <InquiryForm />
            <ul className="mt-10 divide-y divide-[#23212c]/15 border-y border-[#23212c]/15">
              {channels.map((channel) => {
                const rowClass =
                  "group flex items-center gap-4 py-6 transition-colors duration-300";
                const content = (
                  <>
                    <channel.icon className="h-5 w-5 shrink-0 text-brand-red" aria-hidden="true" />
                    <span className="font-sans text-[10px] uppercase tracking-label text-[#23212c]/60">
                      {channel.label}
                    </span>
                    <span className="ml-auto font-serif text-lg text-[#23212c] transition-colors group-hover:text-brand-red">
                      {channel.value}
                    </span>
                  </>
                );
                return (
                  <li key={channel.label}>
                    {channel.href ? (
                      <a href={channel.href} className={`${rowClass} w-full`}>
                        {content}
                      </a>
                    ) : (
                      <div className={rowClass}>{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
