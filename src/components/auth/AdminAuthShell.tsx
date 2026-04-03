import type { ReactNode } from "react";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { AdminBrand } from "@/components/layout/AdminBrand";

export function AdminAuthShell({
  title,
  description,
  children,
  badge = "Akses Internal",
  highlights = [],
}: {
  title: string;
  description: string;
  children: ReactNode;
  badge?: string;
  highlights?: Array<{ title: string; description: string }>;
}) {
  const items =
    highlights.length > 0
      ? highlights
      : [
          {
            title: "Operasional lebih tertata",
            description: "Pantau transaksi, deposit, KYC, dan approval dalam satu console.",
          },
          {
            title: "Akses sesuai role",
            description: "Setiap tim hanya melihat modul yang memang mereka butuhkan.",
          },
          {
            title: "Audit dan keamanan aktif",
            description: "Aktivitas admin tercatat dengan session dan verifikasi tambahan.",
          },
        ];

  return (
    <div className="admin-auth-shell flex items-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="grid gap-6 xl:grid-cols-[0.92fr,1.08fr] xl:items-center">
          <aside className="hidden xl:block">
            <div className="surface-solid overflow-hidden p-8">
              <AdminBrand size="lg" />

              <div className="mt-10 max-w-xl">
                <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                  {badge}
                </span>
                <h1 className="mt-5 text-4xl font-semibold leading-tight text-slate-950 text-balance">
                  {title}
                </h1>
                <p className="mt-4 text-base leading-7 text-slate-600 text-balance">
                  {description}
                </p>
              </div>

              <div className="mt-10 grid gap-4">
                {items.map((item) => (
                  <div
                    key={item.title}
                    className="auth-muted-card flex items-start gap-4 px-5 py-4"
                  >
                    <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="auth-card p-6 sm:p-8 lg:p-10">
            <div className="xl:hidden">
              <AdminBrand centered size="md" />
              <div className="mt-6 text-center">
                <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
                  {badge}
                </span>
                <h1 className="mt-4 text-3xl font-semibold leading-tight text-slate-950 text-balance">
                  {title}
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-600 text-balance">
                  {description}
                </p>
              </div>
            </div>

            <div className="hidden xl:flex xl:items-center xl:justify-between xl:gap-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                  {badge}
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-950">{title}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  {description}
                </p>
              </div>
              <div className="hidden rounded-full border border-blue-100 bg-blue-50/80 px-4 py-2 text-xs font-medium text-blue-700 xl:flex xl:items-center xl:gap-2">
                <span>Console siap dipakai</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-8 xl:mt-10">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
