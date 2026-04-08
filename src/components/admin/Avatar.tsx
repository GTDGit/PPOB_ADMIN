import { useMemo } from "react";
import { getFileUrl } from "@/lib/api/client";

const COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-teal-500",
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.[0] || "?").toUpperCase();
}

const sizeMap = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-14 w-14 text-lg",
};

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ src, name, size = "md", className = "" }: AvatarProps) {
  const colorClass = useMemo(() => COLORS[hashName(name) % COLORS.length], [name]);
  const initials = useMemo(() => getInitials(name), [name]);
  const resolvedSrc = useMemo(() => getFileUrl(src), [src]);

  if (resolvedSrc) {
    return (
      <img
        src={resolvedSrc}
        alt={name}
        className={`shrink-0 rounded-full object-cover ${sizeMap[size]} ${className}`}
      />
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${colorClass} ${sizeMap[size]} ${className}`}
    >
      {initials}
    </span>
  );
}
