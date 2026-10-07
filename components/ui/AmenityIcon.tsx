import {
  AirVent,
  Bath,
  CarFront,
  CookingPot,
  Laptop,
  Shirt,
  ShieldCheck,
  Tv,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  wifi: Wifi,
  airVent: AirVent,
  tv: Tv,
  cookingPot: CookingPot,
  shirt: Shirt,
  laptop: Laptop,
  bath: Bath,
  carFront: CarFront,
  shieldCheck: ShieldCheck,
  zap: Zap,
};

export function AmenityIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? Zap;
  return (
    <Icon
      aria-hidden="true"
      strokeWidth={1.5}
      className={cn("h-6 w-6 text-brand-red", className)}
    />
  );
}
