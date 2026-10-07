"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

import type { Room } from "@/lib/site";
import { cn } from "@/lib/utils";

export function RoomTabs({ rooms }: { rooms: Room[] }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
          <div className="h-8 w-48 animate-pulse bg-beige" />
        </div>
      }
    >
      <RoomTabsInner rooms={rooms} />
    </Suspense>
  );
}

function RoomTabsInner({ rooms }: { rooms: Room[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const requested = searchParams.get("room");
  const initialIndex = Math.max(
    0,
    rooms.findIndex((room) => room.id === requested)
  );
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const tabsRef = useRef<HTMLDivElement | null>(null);

  // Keep state in sync with back/forward navigation.
  useEffect(() => {
    const index = rooms.findIndex((room) => room.id === requested);
    if (index >= 0) setActiveIndex(index);
  }, [requested, rooms]);

  const selectRoom = useCallback(
    (index: number) => {
      setActiveIndex(index);
      router.replace(`/apartment?room=${rooms[index].id}`, { scroll: false });
    },
    [rooms, router]
  );

  const activeRoom = rooms[activeIndex] ?? rooms[0];

  // Keep the active tab in view when selection changes.
  useEffect(() => {
    const container = tabsRef.current;
    if (!container) return;
    const tab = container.querySelector<HTMLButtonElement>(
      `[data-room-id="${activeRoom.id}"]`
    );
    tab?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeRoom.id]);

  if (!activeRoom) return null;
  const mainImage = activeRoom.main ?? activeRoom.gallery[0] ?? null;
  if (!mainImage) return null;

  return (
    <div className="mx-auto max-w-7xl px-6 pb-28 sm:px-8 md:pb-36 lg:px-12">
      {/* Room tabs — horizontal scroll/swipe on mobile */}
      <div
        ref={tabsRef}
        role="tablist"
        aria-label="Apartment rooms"
        className="scrollbar-hide -mx-6 flex gap-2 overflow-x-auto px-6 pb-2 sm:mx-0 sm:flex-wrap sm:justify-start sm:px-0"
      >
        {rooms.map((room, index) => (
          <button
            key={room.id}
            data-room-id={room.id}
            type="button"
            role="tab"
            id={`room-tab-${room.id}`}
            aria-selected={index === activeIndex}
            aria-controls="room-panel"
            onClick={() => selectRoom(index)}
            className={cn(
              "shrink-0 border px-5 py-3 font-sans text-[11px] font-medium uppercase tracking-label transition-all duration-300 ease-smooth",
              index === activeIndex
                ? "border-charcoal bg-charcoal text-cream"
                : "border-charcoal/15 bg-transparent text-charcoal/70 hover:border-charcoal/40 hover:text-charcoal"
            )}
          >
            {room.name}
          </button>
        ))}
      </div>

      {/* Room viewer */}
      <div
        key={activeRoom.id}
        role="tabpanel"
        id="room-panel"
        aria-labelledby={`room-tab-${activeRoom.id}`}
        className="mt-12 animate-fade-up md:mt-16"
      >
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Main image + thumbnails */}
          <div className="lg:col-span-7">
            <div className="image-frame aspect-[16/10] w-full">
              <Image
                src={mainImage.src}
                alt={mainImage.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover"
                priority
              />
            </div>
            {activeRoom.gallery.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {activeRoom.gallery.slice(0, 2).map((image) => (
                  <div key={image.src} className="image-frame aspect-[4/3] w-full">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 1024px) 50vw, 28vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center lg:col-span-5 lg:pl-6">
            <p className="eyebrow">{activeRoom.label}</p>
            <h2 className="mt-4 font-serif text-4xl font-medium text-charcoal md:text-5xl">
              {activeRoom.name}
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted">
              {activeRoom.description}
            </p>
            {activeRoom.features?.length ? (
              <ul className="mt-8 space-y-3">
                {activeRoom.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-charcoal/80">
                    <span className="h-px w-6 bg-brand-red" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
