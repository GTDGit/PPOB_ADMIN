import { cn } from "@/lib/utils";
import { prettifyStatus } from "@/lib/format";

const toneMap: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",
  verified: "bg-emerald-50 text-emerald-700 ring-emerald-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",
  online: "bg-emerald-50 text-emerald-700 ring-emerald-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",
  live: "bg-emerald-50 text-emerald-700 ring-emerald-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",
  applied: "bg-blue-50 text-blue-700 ring-blue-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.68)]",
  sent: "bg-blue-50 text-blue-700 ring-blue-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.68)]",
  delivered: "bg-blue-50 text-blue-700 ring-blue-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.68)]",
  read: "bg-indigo-50 text-indigo-700 ring-indigo-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.68)]",
  pending: "bg-amber-50 text-amber-700 ring-amber-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
  process: "bg-amber-50 text-amber-700 ring-amber-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
  processing: "bg-amber-50 text-amber-700 ring-amber-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
  review: "bg-amber-50 text-amber-700 ring-amber-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
  rejected: "bg-rose-50 text-rose-700 ring-rose-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",
  failed: "bg-rose-50 text-rose-700 ring-rose-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",
  blocked: "bg-rose-50 text-rose-700 ring-rose-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",
  locked: "bg-rose-50 text-rose-700 ring-rose-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",
  disabled: "bg-slate-100 text-slate-700 ring-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]",
  inactive: "bg-slate-100 text-slate-700 ring-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]",
  expired: "bg-slate-100 text-slate-700 ring-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]",
  draft: "bg-slate-100 text-slate-700 ring-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]",
};

export function StatusBadge({ value }: { value?: string | null }) {
  const normalized = String(value || "").toLowerCase();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
        toneMap[normalized] || "bg-slate-100 text-slate-700 ring-slate-200",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75 ring-2 ring-white/70" />
      {prettifyStatus(normalized || "-")}
    </span>
  );
}
