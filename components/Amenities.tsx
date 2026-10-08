import { AmenityIcon } from "@/components/ui/AmenityIcon";
import { Eyebrow, Reveal } from "@/components/ui/Reveal";
import type { Amenity } from "@/lib/site";

export function Amenities({ amenities }: { amenities: Amenity[] }) {
  return (
    <section
      id="amenities"
      aria-labelledby="amenities-heading"
      className="bg-[#f7f0e1] text-[#23212c]"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 md:py-36 lg:px-12">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <Reveal>
              <Eyebrow>Amenities</Eyebrow>
              <h2
                id="amenities-heading"
                className="mt-5 text-balance font-sans text-4xl font-light tracking-[-0.035em] leading-[1.08] sm:text-5xl"
              >
                Thoughtful details, built around your stay.
              </h2>
            </Reveal>
          </div>
          <div className="md:col-span-8">
            <ul className="grid grid-cols-1 gap-x-10 gap-y-2 sm:grid-cols-2">
              {amenities.map((amenity, index) => (
                <Reveal
                  as="li"
                  key={amenity.name}
                  delay={(index % 2) * 80}
                  className="group border-b border-[#23212c]/15 py-6 transition-colors duration-300 hover:border-brand-red/50"
                >
                  <div className="flex items-start gap-4">
                    <AmenityIcon name={amenity.icon} className="mt-0.5 shrink-0 transition-transform duration-500 group-hover:-translate-y-0.5" />
                    <div>
                      <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-[#23212c]">
                        {amenity.name}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#23212c]/65">
                        {amenity.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
