import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
          {helper ? (
            <p className="mt-2 text-sm text-slate-600">{helper}</p>
          ) : null}
        </div>
        {icon ? (
          <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">{icon}</div>
        ) : null}
      </div>
    </div>
  );
}
