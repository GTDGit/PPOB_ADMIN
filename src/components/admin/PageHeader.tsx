import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="surface-solid relative overflow-hidden p-6 lg:p-7">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(191,219,254,0.7),transparent_60%)]" />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-3 text-2xl font-semibold text-slate-950 sm:text-[2rem]">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-[15px]">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap gap-3 rounded-[1.4rem] border border-slate-200/80 bg-white/90 p-2 shadow-sm">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}
