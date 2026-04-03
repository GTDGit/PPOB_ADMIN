import { cn } from "@/lib/utils";
import { prettifyStatus } from "@/lib/format";

const toneMap: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  applied: "bg-blue-50 text-blue-700 ring-blue-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  process: "bg-amber-50 text-amber-700 ring-amber-200",
  rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  failed: "bg-rose-50 text-rose-700 ring-rose-200",
  disabled: "bg-slate-100 text-slate-700 ring-slate-200",
  inactive: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function StatusBadge({ value }: { value?: string | null }) {
  const normalized = String(value || "").toLowerCase();

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
        toneMap[normalized] || "bg-slate-100 text-slate-700 ring-slate-200",
      )}
    >
      {prettifyStatus(normalized || "-")}
    </span>
  );
}
