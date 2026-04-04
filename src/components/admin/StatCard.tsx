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
    <div className="surface-solid overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,251,255,0.98))] p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
          {helper ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">{helper}</p>
          ) : null}
        </div>
        {icon ? (
          <div className="rounded-2xl border border-blue-100 bg-[linear-gradient(135deg,#eff6ff,#dbeafe)] p-3 text-blue-600 shadow-sm">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
