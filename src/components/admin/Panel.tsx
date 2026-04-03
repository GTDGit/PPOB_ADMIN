import type { ReactNode } from "react";

export function Panel({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`surface-solid overflow-hidden ${className}`}
    >
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-[linear-gradient(180deg,rgba(248,250,252,0.8),rgba(255,255,255,0.96))] px-6 py-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}
