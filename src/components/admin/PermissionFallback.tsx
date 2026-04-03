export function PermissionFallback({
  message = "Akun Anda belum memiliki akses ke halaman ini.",
}: {
  message?: string;
}) {
  return (
    <div className="surface-solid border-dashed px-6 py-14 text-center">
      <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
        Akses dibatasi
      </span>
      <h2 className="mt-4 text-xl font-semibold text-slate-900">
        Halaman ini belum tersedia untuk role Anda
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">{message}</p>
    </div>
  );
}
