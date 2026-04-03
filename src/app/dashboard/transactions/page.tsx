"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { extractApiError } from "@/lib/api/client";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useAuth } from "@/lib/auth/AuthProvider";
import { PageHeader } from "@/components/admin/PageHeader";
import { Panel } from "@/components/admin/Panel";
import { AdminTable, type TableColumn } from "@/components/admin/AdminTable";
import { DetailDrawer } from "@/components/admin/DetailDrawer";
import { ExportCsvButton } from "@/components/admin/ExportCsvButton";
import { Pagination } from "@/components/admin/Pagination";
import { PermissionFallback } from "@/components/admin/PermissionFallback";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { GenericRecord, PaginatedResponse } from "@/lib/types";

export default function TransactionsPage() {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<GenericRecord> | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<GenericRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  const canView = hasPermission("transactions.view");

  const load = async () => {
    try {
      const response = await adminApi.listTransactions(search, status, page, 20);
      setData(response);
    } catch (error) {
      setError(extractApiError(error));
    }
  };

  useEffect(() => {
    if (!canView) return;
    void load();
  }, [canView, page]);

  const openDetail = useCallback(async (id: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const response = await adminApi.getTransactionDetail(id);
      setSelectedDetail(response);
    } catch (error) {
      setError(extractApiError(error));
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const columns = useMemo<TableColumn<GenericRecord>[]>(
    () => [
      {
        key: "trx",
        header: "Transaksi",
        render: (row) => (
          <div>
            <p className="font-semibold text-slate-900">{String(row.id || "-")}</p>
            <p className="mt-1 text-xs text-slate-500">
              {String(row.product_name || row.service_type || row.type || "-")}
            </p>
          </div>
        ),
      },
      {
        key: "user",
        header: "Pelanggan",
        render: (row) => (
          <div>
            <p className="font-medium text-slate-900">{String(row.user_name || "-")}</p>
            <p className="mt-1 text-xs text-slate-500">{String(row.user_phone || "-")}</p>
          </div>
        ),
      },
      {
        key: "target",
        header: "Target",
        render: (row) => String(row.target || "-"),
      },
      {
        key: "payment",
        header: "Total bayar",
        render: (row) => formatCurrency(row.total_payment as number),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge value={String(row.status || "")} />,
      },
      {
        key: "created",
        header: "Waktu",
        render: (row) => formatDateTime(row.created_at as string),
      },
      {
        key: "detail",
        header: "Detail",
        render: (row) => (
          <button
            type="button"
            onClick={() => void openDetail(String(row.id))}
            className="rounded-2xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            Lihat detail
          </button>
        ),
      },
    ],
    [openDetail],
  );

  if (!canView) return <PermissionFallback />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Transactions"
        title="Monitoring transaksi"
        description="Pantau transaksi user berdasarkan status, produk, dan target transaksi."
      />
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
      <Panel
        title="Daftar transaksi"
        description="Filter transaksi untuk kebutuhan operasional dan investigasi."
        action={<ExportCsvButton rows={data?.items || []} filename="transactions" />}
      >
        <form
          className="mb-5 grid gap-3 md:grid-cols-[1fr,220px,auto]"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            void load();
          }}
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari ID transaksi, nama user, nomor, produk..."
            className="rounded-2xl border border-slate-200 px-4 py-3"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3"
          >
            <option value="all">Semua status</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
            Terapkan
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
      <DetailDrawer
        open={detailOpen}
        title="Detail transaksi"
        data={selectedDetail}
        loading={detailLoading}
        onClose={() => {
          setDetailOpen(false);
          setSelectedDetail(null);
        }}
      />
    </div>
  );
}
