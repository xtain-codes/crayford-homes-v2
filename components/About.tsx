import { Eyebrow, Reveal } from "@/components/ui/Reveal";

export function About() {
  return (
    <section aria-labelledby="about-heading" className="bg-warmwhite">
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-36 sm:px-8 md:pb-36 md:pt-48 lg:px-12">
        <div className="grid gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-3">
            <Eyebrow>Welcome to Crayford</Eyebrow>
          </Reveal>
          <div className="md:col-span-9 lg:col-span-8">
            <Reveal delay={100}>
              <h2
                id="about-heading"
                className="text-balance font-serif text-4xl font-medium leading-[1.08] text-charcoal sm:text-5xl md:text-6xl"
              >
                Quiet luxury, made for real life.
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-8 max-w-2xl text-balance text-base leading-relaxed text-muted md:text-lg">
                Crayford is designed for guests who appreciate comfort, privacy and
                thoughtful details. From the moment you arrive, every space is
                created to feel easy, refined and familiar.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
