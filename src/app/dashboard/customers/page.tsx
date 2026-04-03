"use client";

import { useEffect, useMemo, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { extractApiError } from "@/lib/api/client";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useAuth } from "@/lib/auth/AuthProvider";
import { PageHeader } from "@/components/admin/PageHeader";
import { Panel } from "@/components/admin/Panel";
import { AdminTable, type TableColumn } from "@/components/admin/AdminTable";
import { Pagination } from "@/components/admin/Pagination";
import { PermissionFallback } from "@/components/admin/PermissionFallback";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { GenericRecord, PaginatedResponse } from "@/lib/types";

export default function CustomersPage() {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<GenericRecord> | null>(null);
  const [error, setError] = useState("");

  const canView = hasPermission("customers.view");

  const load = async () => {
    try {
      const response = await adminApi.listCustomers(search, page, 20);
      setData(response);
    } catch (error) {
      setError(extractApiError(error));
    }
  };

  useEffect(() => {
    if (!canView) return;
    void load();
  }, [canView, page]);

  const columns = useMemo<TableColumn<GenericRecord>[]>(
    () => [
      {
        key: "customer",
        header: "Pelanggan",
        render: (row) => (
          <div>
            <p className="font-semibold text-slate-900">{String(row.full_name || "-")}</p>
            <p className="mt-1 text-xs text-slate-500">{String(row.phone || "-")}</p>
            <p className="mt-1 text-xs text-slate-500">{String(row.email || "-")}</p>
          </div>
        ),
      },
      {
        key: "mic",
        header: "MIC / Tier",
        render: (row) => (
          <div>
            <p className="font-medium text-slate-900">{String(row.mic || "-")}</p>
            <p className="mt-1 text-xs text-slate-500">{String(row.tier || "-")}</p>
          </div>
        ),
      },
      {
        key: "balance",
        header: "Saldo",
        render: (row) => formatCurrency(row.balance as number),
      },
      {
        key: "kyc",
        header: "KYC",
        render: (row) => <StatusBadge value={String(row.kyc_status || "")} />,
      },
      {
        key: "joined",
        header: "Terdaftar",
        render: (row) => formatDateTime(row.created_at as string),
      },
    ],
    [],
  );

  if (!canView) {
    return <PermissionFallback />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Customers"
        title="Data pelanggan"
        description="Lihat profil, saldo, tier, dan status KYC pelanggan PPOB.ID."
      />
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
      <Panel title="Pencarian pelanggan" description="Cari berdasarkan nama, nomor HP, email, atau MIC.">
        <form
          className="mb-5 flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            void load();
          }}
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari pelanggan..."
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
          />
          <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
            Cari
          </button>
        </form>
        <AdminTable columns={columns} rows={data?.items || []} />
        <Pagination
          page={data?.page || page}
          hasNext={Boolean(data?.hasNext)}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
          onNext={() => setPage((current) => current + 1)}
        />
      </Panel>
    </div>
  );
}
