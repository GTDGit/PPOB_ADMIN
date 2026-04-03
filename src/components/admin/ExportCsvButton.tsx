"use client";

import type { GenericRecord } from "@/lib/types";

function serializeValue(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function escapeCsv(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function ExportCsvButton({
  rows,
  filename,
  label = "Export CSV",
}: {
  rows: GenericRecord[];
  filename: string;
  label?: string;
}) {
  const disabled = rows.length === 0;

  const handleExport = () => {
    if (disabled || typeof window === "undefined") return;

    const headers = Array.from(
      rows.reduce((accumulator, row) => {
        Object.keys(row).forEach((key) => accumulator.add(key));
        return accumulator;
      }, new Set<string>()),
    );

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => escapeCsv(serializeValue(row[header])))
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={disabled}
      className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
    </button>
  );
}
