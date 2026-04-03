export function PermissionFallback({
  message = "Akun Anda belum memiliki akses ke halaman ini.",
}: {
  message?: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <h2 className="text-xl font-semibold text-slate-900">Akses dibatasi</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
    </div>
  );
}
