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

export default function CustomersPage() {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<GenericRecord> | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<GenericRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
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

  const openDetail = useCallback(async (id: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const response = await adminApi.getCustomerDetail(id);
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
      {
        key: "detail",
        header: "Detail",
        render: (row) => (
          <button
            type="button"
            onClick={() => void openDetail(String(row.id))}
            className="admin-chip-button"
          >
            Lihat detail
          </button>
        ),
      },
    ],
    [openDetail],
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
        <div className="admin-note-error">
          {error}
        </div>
      ) : null}
      <Panel
        title="Pencarian pelanggan"
        description="Cari berdasarkan nama, nomor HP, email, atau MIC."
        action={<ExportCsvButton rows={data?.items || []} filename="customers" />}
      >
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
            className="admin-input"
          />
          <button className="admin-button-primary">
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
      <DetailDrawer
        open={detailOpen}
        title="Detail pelanggan"
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
