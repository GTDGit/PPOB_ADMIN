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

export default function DepositsPage() {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<GenericRecord> | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canView = hasPermission("deposits.view");
  const canApprove = hasPermission("deposits.approve");

  const load = async () => {
    try {
      const response = await adminApi.listDeposits(search, status, page, 20);
      setData(response);
    } catch (error) {
      setError(extractApiError(error));
    }
  };

  useEffect(() => {
    if (!canView) return;
    void load();
  }, [canView, page]);

  const act = async (kind: "approve" | "reject", id: string) => {
    setError("");
    setSuccess("");
    try {
      if (kind === "approve") {
        await adminApi.approveDeposit(id);
        setSuccess("Deposit berhasil di-approve.");
      } else {
        await adminApi.rejectDeposit(id);
        setSuccess("Deposit berhasil di-reject.");
      }
      await load();
    } catch (error) {
      setError(extractApiError(error));
    }
  };

  const columns = useMemo<TableColumn<GenericRecord>[]>(
    () => [
      {
        key: "deposit",
        header: "Deposit",
        render: (row) => (
          <div>
            <p className="font-semibold text-slate-900">{String(row.id || "-")}</p>
            <p className="mt-1 text-xs text-slate-500">
              {String(row.provider || row.method || "-")}
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
        key: "amount",
        header: "Nominal",
        render: (row) => formatCurrency((row.total_amount || row.amount) as number),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge value={String(row.status || "")} />,
      },
      {
        key: "time",
        header: "Dibuat",
        render: (row) => formatDateTime(row.created_at as string),
      },
      {
        key: "actions",
        header: "Aksi",
        render: (row) =>
          canApprove && String(row.status || "") === "pending" ? (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => void act("approve", String(row.id))}
                className="rounded-2xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Approve
              </button>
              <button
                onClick={() => void act("reject", String(row.id))}
                className="rounded-2xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700"
              >
                Reject
              </button>
            </div>
          ) : (
            <span className="text-xs text-slate-400">-</span>
          ),
      },
    ],
    [canApprove],
  );

  if (!canView) return <PermissionFallback />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Deposits"
        title="Monitoring deposit"
        description="Review deposit user dan proses approval operasional yang masih pending."
      />
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}
      <Panel title="Daftar deposit" description="Cari deposit berdasarkan user, nominal, atau status pembayaran.">
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
            placeholder="Cari deposit..."
            className="rounded-2xl border border-slate-200 px-4 py-3"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3"
          >
            <option value="all">Semua status</option>
            <option value="pending">Pending</option>
            <option value="success">Success</option>
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
    </div>
  );
}
