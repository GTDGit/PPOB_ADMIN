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
    <div className="mt-5 flex flex-col items-stretch justify-end gap-3 sm:flex-row sm:items-center">
      <button
        onClick={onPrevious}
        disabled={page <= 1}
        className="admin-button-secondary disabled:cursor-not-allowed disabled:opacity-40"
      >
        Sebelumnya
      </button>
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-slate-700">
        Halaman {page}
      </div>
      <button
        onClick={onNext}
        disabled={!hasNext}
        className="admin-button-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        Berikutnya
      </button>
    </div>
  );
}
