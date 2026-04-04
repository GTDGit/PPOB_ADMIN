"use client";

import { X } from "lucide-react";
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
  prettifyAuditAction,
  prettifyFieldLabel,
  prettifyResourceLabel,
  stringifyValue,
} from "@/lib/format";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { GenericRecord } from "@/lib/types";

function isDateLike(key: string, value: unknown) {
  return (
    typeof value === "string" &&
    (key.endsWith("_at") ||
      key.endsWith("At") ||
      key.includes("date") ||
      key.includes("expires"))
  );
}

function isUrlLike(value: unknown) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

function isCurrencyLike(key: string) {
  return /(amount|price|payment|balance|fee|revenue|discount|nominal|total)/i.test(key);
}

function isStatusLike(key: string) {
  return /(status|verified|verification|is_active|active|locked|blocked)/i.test(key);
}

function isPayloadLike(key: string) {
  return /(payload|old_value|new_value|metadata|raw|response|request|detail|details|evidence|document)/i.test(
    key,
  );
}

function getSectionTitle(key: string) {
  if (isStatusLike(key)) return "Status & Verifikasi";
  if (isCurrencyLike(key)) return "Nilai & Finansial";
  if (isDateLike(key, "x")) return "Waktu";
  if (/(user|admin|customer|name|email|phone|role|tier|actor)/i.test(key)) {
    return "Pihak Terkait";
  }
  if (
    /(id|reference|resource|provider|product|service|target|method|type|trx|qris|mic|code)/i.test(
      key,
    )
  ) {
    return "Identitas & Referensi";
  }
  if (isPayloadLike(key)) return "Payload & Detail";
  return "Informasi Lain";
}

function renderValue(key: string, value: unknown) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-slate-400">-</span>;
  }

  if (typeof value === "boolean") {
    return <StatusBadge value={value ? "active" : "inactive"} />;
  }

  if (isStatusLike(key) && typeof value === "string") {
    return <StatusBadge value={value} />;
  }

  if (/action/i.test(key) && typeof value === "string") {
    return <span>{prettifyAuditAction(value)}</span>;
  }

  if (key === "resource_type" && typeof value === "string") {
    return <span>{prettifyResourceLabel(value)}</span>;
  }

  if (isDateLike(key, value)) {
    return <span>{formatDateTime(String(value))}</span>;
  }

  if (isCurrencyLike(key)) {
    return <span>{formatCurrency(value as number | string)}</span>;
  }

  if (typeof value === "number") {
    return <span>{formatNumber(value)}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-slate-400">-</span>;
    }

    if (value.every((item) => typeof item === "string" || typeof item === "number")) {
      return (
        <div className="flex flex-wrap gap-2">
          {value.map((item) => (
            <span
              key={String(item)}
              className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
            >
              {String(item)}
            </span>
          ))}
        </div>
      );
    }

    return (
      <pre className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-3 text-xs leading-6 text-slate-700">
        {stringifyValue(value)}
      </pre>
    );
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
      <pre className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-3 text-xs leading-6 text-slate-700">
        {stringifyValue(value)}
      </pre>
    );
  }

  return <span className="break-words">{String(value)}</span>;
}

function buildSections(data: GenericRecord | null) {
  const entries = Object.entries(data || {}).filter(([, value]) => value !== undefined);
  const order = [
    "Status & Verifikasi",
    "Identitas & Referensi",
    "Pihak Terkait",
    "Nilai & Finansial",
    "Waktu",
    "Payload & Detail",
    "Informasi Lain",
  ];

  const sections = new Map<string, Array<[string, unknown]>>();

  for (const [key, value] of entries) {
    const sectionTitle = getSectionTitle(key);
    const current = sections.get(sectionTitle) || [];
    current.push([key, value]);
    sections.set(sectionTitle, current);
  }

  return order
    .map((title) => ({
      title,
      items: sections.get(title) || [],
    }))
    .filter((section) => section.items.length > 0);
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

  const sections = buildSections(data);
  const statusValue =
    (data?.status as string) ||
    (data?.kyc_status as string) ||
    (typeof data?.is_active === "boolean" ? (data.is_active ? "active" : "inactive") : "");
  const subtitle =
    (data?.email as string) ||
    (data?.reference_number as string) ||
    (data?.resource_id as string) ||
    (data?.id as string) ||
    "";
  const summaryCards = [
    {
      label: "Status",
      value:
        statusValue ? (
          <StatusBadge value={statusValue} />
        ) : (
          <span className="text-sm text-slate-400">-</span>
        ),
    },
    {
      label: "Referensi",
      value: String(
        data?.id ||
          data?.resource_id ||
          data?.reference_number ||
          data?.trx_id ||
          data?.code ||
          "-",
      ),
    },
    {
      label: "Pihak terkait",
      value: String(data?.user_name || data?.full_name || data?.admin_name || data?.email || "-"),
    },
    {
      label: "Waktu",
      value: formatDateTime(
        (data?.created_at as string) ||
          (data?.updated_at as string) ||
          (data?.last_login_at as string),
      ),
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/36 backdrop-blur-sm"
      onClick={onClose}
    >
      <aside
        className="flex h-full w-full max-w-[960px] flex-col border-l border-slate-200 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] shadow-[0_24px_64px_rgba(15,23,42,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,rgba(219,234,254,0.95),rgba(255,255,255,0.96))] px-6 py-6">
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                Detail Operasional
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h3>
              {subtitle ? (
                <p className="mt-2 truncate text-sm text-slate-500">{subtitle}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition hover:border-blue-200 hover:text-blue-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {!loading ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-[1.35rem] border border-white/75 bg-white/90 px-4 py-4 shadow-sm"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {card.label}
                  </p>
                  <div className="mt-2 text-sm font-medium text-slate-900">{card.value}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="surface-solid px-5 py-10 text-center text-sm text-slate-500">
              Memuat detail...
            </div>
          ) : sections.length === 0 ? (
            <div className="surface-solid px-5 py-10 text-center text-sm text-slate-500">
              Detail belum tersedia.
            </div>
          ) : (
            <div className="space-y-6">
              {sections.map((section) => (
                <section key={section.title} className="surface-solid p-5">
                  <div className="border-b border-slate-100 pb-4">
                    <p className="text-sm font-semibold text-slate-950">{section.title}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {section.title === "Payload & Detail"
                        ? "Informasi teknis dan payload mentah dari event atau transaksi."
                        : "Ringkasan data yang terkait dengan entitas ini."}
                    </p>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {section.items.map(([key, value]) => (
                      <div
                        key={key}
                        className="rounded-[1.35rem] border border-slate-200 bg-slate-50/70 p-4"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          {prettifyFieldLabel(key)}
                        </p>
                        <div className="mt-2 text-sm leading-6 text-slate-800">
                          {renderValue(key, value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
