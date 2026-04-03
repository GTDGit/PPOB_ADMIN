"use client";

import { X } from "lucide-react";
import { formatDateTime, prettifyStatus, stringifyValue, titleCase } from "@/lib/format";
import type { GenericRecord } from "@/lib/types";

function isDateLike(key: string, value: unknown) {
  return typeof value === "string" && (key.endsWith("_at") || key.endsWith("At") || key.includes("date"));
}

function isUrlLike(value: unknown) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

function renderValue(key: string, value: unknown) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-slate-400">-</span>;
  }

  if (typeof value === "boolean") {
    return <span>{value ? "Ya" : "Tidak"}</span>;
  }

  if (isDateLike(key, value)) {
    return <span>{formatDateTime(String(value))}</span>;
  }

  if (typeof value === "string" && (key.includes("status") || key === "roles")) {
    return <span>{prettifyStatus(value)}</span>;
  }

  if (isUrlLike(value)) {
    return (
      <a
        href={String(value)}
        target="_blank"
        rel="noreferrer"
        className="break-all text-blue-600 underline decoration-blue-200 underline-offset-4"
      >
        {String(value)}
      </a>
    );
  }

  if (typeof value === "object") {
    return (
      <pre className="overflow-x-auto rounded-2xl bg-slate-50 p-3 text-xs leading-6 text-slate-700">
        {stringifyValue(value)}
      </pre>
    );
  }

  return <span className="break-words">{String(value)}</span>;
}

export function DetailDrawer({
  open,
  title,
  data,
  loading,
  onClose,
}: {
  open: boolean;
  title: string;
  data: GenericRecord | null;
  loading?: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  const entries = Object.entries(data || {}).filter(([, value]) => value !== undefined);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30 backdrop-blur-sm" onClick={onClose}>
      <aside
        className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              Detail
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
              Memuat detail...
            </div>
          ) : entries.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
              Detail belum tersedia.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {entries.map(([key, value]) => (
                <div key={key} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {titleCase(key)}
                  </p>
                  <div className="mt-2 text-sm leading-6 text-slate-800">
                    {renderValue(key, value)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
