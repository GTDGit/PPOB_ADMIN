import Image from "next/image";
import { cn } from "@/lib/utils";

export function AdminBrand({
  size = "md",
  centered = false,
  dark = false,
  subtitle = "Console Admin",
  compact = false,
}: {
  size?: "sm" | "md" | "lg";
  centered?: boolean;
  dark?: boolean;
  subtitle?: string;
  compact?: boolean;
}) {
  const frameClass =
    size === "sm"
      ? "rounded-[1.1rem] px-3 py-2"
      : size === "lg"
        ? "rounded-[1.45rem] px-4 py-3"
        : "rounded-[1.25rem] px-3.5 py-2.5";
  const logoWidth = size === "sm" ? 108 : size === "lg" ? 154 : 128;
  const subtitleSize = size === "sm" ? "text-[10px]" : "text-[11px]";

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        centered ? "justify-center text-center" : "justify-start",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center border shadow-sm",
          dark
            ? "border-white/12 bg-white/96 shadow-[0_14px_32px_rgba(2,6,23,0.26)]"
            : "border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.08)]",
          frameClass,
        )}
      >
        <Image
          src="/ppob-logo.png"
          alt="PPOB.ID"
          width={logoWidth}
          height={Math.round((logoWidth / 154) * 47)}
          priority={size === "lg"}
          className="h-auto w-auto"
        />
      </div>

      {!compact ? (
        <div className={centered ? "items-center" : ""}>
          <p
            className={cn(
              "font-semibold tracking-tight",
              size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-base",
              dark ? "text-white" : "text-slate-950",
            )}
          >
            PPOB.ID
          </p>
          <p
            className={cn(
              "font-medium uppercase tracking-[0.18em]",
              subtitleSize,
              dark ? "text-blue-100/80" : "text-blue-600",
            )}
          >
            {subtitle}
          </p>
        </div>
      ) : null}
    </div>
  );
}
