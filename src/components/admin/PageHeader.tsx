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
    <div className="surface-solid overflow-hidden p-6 lg:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
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
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}
