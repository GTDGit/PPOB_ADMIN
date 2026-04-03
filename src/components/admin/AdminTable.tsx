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
    return (
      <div className="rounded-[1.6rem] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-3 md:hidden">
        {rows.map((row, rowIndex) => (
          <div
            key={getRowKey ? getRowKey(row, rowIndex) : rowIndex}
            className="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-sm"
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

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-slate-200">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, rowIndex) => (
              <tr key={getRowKey ? getRowKey(row, rowIndex) : rowIndex} className="align-top">
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
  );
}
