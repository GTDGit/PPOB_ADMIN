import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
}

export function AdminTable<T>({
  columns,
  rows,
  emptyLabel = "Belum ada data",
  getRowKey,
}: {
  columns: TableColumn<T>[];
  rows: T[];
  emptyLabel?: string;
  getRowKey?: (item: T, index: number) => string | number;
}) {
  if (rows.length === 0) {
    const isLoadingState = emptyLabel.toLowerCase().includes("memuat");
    return (
      <div className="rounded-[1.6rem] border border-dashed border-slate-200 bg-[linear-gradient(180deg,#f8fbff,#f8fafc)] px-5 py-12 text-center">
        <p className="text-sm font-semibold text-slate-700">
          {isLoadingState ? "Memuat data" : "Belum ada data"}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-500">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 md:hidden">
        {rows.map((row, rowIndex) => (
          <div
            key={getRowKey ? getRowKey(row, rowIndex) : rowIndex}
            className="rounded-[1.6rem] border border-slate-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,251,255,0.95))] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
          >
            <div className="space-y-3">
              {columns.map((column, columnIndex) => (
                <div
                  key={column.key}
                  className={cn(
                    "grid gap-1",
                    columnIndex === 0
                      ? "border-b border-slate-100 pb-3"
                      : "border-b border-slate-100 pb-3 last:border-b-0 last:pb-0",
                  )}
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {column.header}
                  </span>
                  <div className={cn("text-sm text-slate-700", column.className)}>
                    {column.render(row)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-[1.6rem] border border-slate-200/90 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.05)] md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-[linear-gradient(180deg,#f8fbff,#f8fafc)]">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, rowIndex) => (
                <tr
                  key={getRowKey ? getRowKey(row, rowIndex) : rowIndex}
                  className="align-top transition hover:bg-blue-50/45"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn("px-4 py-4 text-sm text-slate-700", column.className)}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
