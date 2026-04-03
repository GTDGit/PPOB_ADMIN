export function Pagination({
  page,
  hasNext,
  onPrevious,
  onNext,
}: {
  page: number;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-5 flex items-center justify-end gap-3">
      <button
        onClick={onPrevious}
        disabled={page <= 1}
        className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Sebelumnya
      </button>
      <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
        Halaman {page}
      </div>
      <button
        onClick={onNext}
        disabled={!hasNext}
        className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Berikutnya
      </button>
    </div>
  );
}
