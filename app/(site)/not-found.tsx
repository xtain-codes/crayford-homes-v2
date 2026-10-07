import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] items-center justify-center bg-warmblack px-6 text-cream">
      <div className="animate-fade-up text-center">
        <p className="eyebrow justify-center text-cream/70">Error 404</p>
        <h1 className="mt-6 font-serif text-6xl sm:text-7xl">Not found.</h1>
        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-cream/70">
          The page you are looking for does not exist or has moved.
        </p>
        <Link href="/" className="btn-light mt-10">
          Back to Crayford
        </Link>
      </div>
    </section>
  );
}
