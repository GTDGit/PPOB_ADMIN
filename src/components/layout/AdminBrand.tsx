import { cn } from "@/lib/utils";

export function AdminBrand({
  size = "md",
  centered = false,
  dark = false,
  subtitle = "Console Admin",
}: {
  size?: "sm" | "md" | "lg";
  centered?: boolean;
  dark?: boolean;
  subtitle?: string;
}) {
  const markSize =
    size === "sm"
      ? "h-11 w-11 rounded-2xl text-lg"
      : size === "lg"
        ? "h-16 w-16 rounded-[1.6rem] text-[1.7rem]"
        : "h-14 w-14 rounded-[1.35rem] text-[1.45rem]";
  const titleSize =
    size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-xl";
  const subtitleSize = size === "sm" ? "text-[11px]" : "text-xs";

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        centered ? "justify-center text-center" : "justify-start",
      )}
    >
      <div
        className={cn(
          "relative flex items-center justify-center bg-[linear-gradient(135deg,#2563eb_0%,#1d4ed8_58%,#0f172a_100%)] font-black text-white shadow-[0_18px_36px_rgba(37,99,235,0.24)]",
          markSize,
        )}
      >
        <span className="relative z-10">P</span>
        <span className="absolute inset-[18%] rounded-[inherit] border border-white/18" />
      </div>

      <div className={centered ? "items-center" : ""}>
        <p
          className={cn(
            "font-semibold tracking-tight",
            titleSize,
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
    </div>
  );
}
