"use client";

import { useEffect, useMemo, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { extractApiError } from "@/lib/api/client";
import { formatDateTime, stringifyValue } from "@/lib/format";
import { useAuth } from "@/lib/auth/AuthProvider";
import { PageHeader } from "@/components/admin/PageHeader";
import { Panel } from "@/components/admin/Panel";
import { AdminTable, type TableColumn } from "@/components/admin/AdminTable";
import { Pagination } from "@/components/admin/Pagination";
import { PermissionFallback } from "@/components/admin/PermissionFallback";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { GenericRecord, PaginatedResponse } from "@/lib/types";

export default function ApprovalsPage() {
  const { hasPermission } = useAuth();
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<GenericRecord> | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canView = hasPermission("approvals.view");
  const canAct = hasPermission("approvals.act");

  const load = async () => {
    try {
      const response = await adminApi.listApprovals(status, page, 20);
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
        key: "request",
        header: "Request",
        render: (row) => (
          <div>
            <p className="font-semibold text-slate-900">{String(row.request_type || "-")}</p>
            <p className="mt-1 text-xs text-slate-500">
              {String(row.requester_name || "-")}
            </p>
          </div>
        ),
      },
      {
        key: "resource",
        header: "Resource",
        render: (row) => (
          <div>
            <p className="font-medium text-slate-900">{String(row.resource_type || "-")}</p>
            <p className="mt-1 text-xs text-slate-500">{String(row.resource_id || "-")}</p>
          </div>
        ),
      },
      {
        key: "payload",
        header: "Payload",
        render: (row) => (
          <pre className="max-w-xs overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
            {stringifyValue(row.payload)}
          </pre>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge value={String(row.status || "")} />,
      },
      {
        key: "created",
        header: "Dibuat",
        render: (row) => formatDateTime(row.created_at as string),
      },
      {
        key: "action",
        header: "Aksi",
        render: (row) =>
          canAct && String(row.status || "") === "pending" ? (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  void adminApi
                    .approveApproval(String(row.id))
                    .then(() => {
                      setSuccess("Approval berhasil diproses.");
                      return load();
                    })
                    .catch((error) => setError(extractApiError(error)))
                }
                className="rounded-2xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  const reason = window.prompt("Alasan reject approval");
                  if (!reason) return;
                  void adminApi
                    .rejectApproval(String(row.id), reason)
                    .then(() => {
                      setSuccess("Approval berhasil ditolak.");
                      return load();
                    })
                    .catch((error) => setError(extractApiError(error)));
                }}
                className="rounded-2xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700"
              >
                Reject
              </button>
            </div>
          ) : (
            "-"
          ),
      },
    ],
    [canAct],
  );

  if (!canView) return <PermissionFallback />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Approvals" title="Approval queue" description="Single approval dan maker-checker request yang menunggu tindakan admin." />
      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      {success ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}
      <Panel title="Daftar approval" description="Filter request approval berdasarkan status workflow.">
        <form className="mb-5 flex flex-col gap-3 sm:flex-row" onSubmit={(e) => { e.preventDefault(); setPage(1); void load(); }}>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3">
            <option value="all">Semua status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="applied">Applied</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Terapkan</button>
        </form>
        <AdminTable columns={columns} rows={data?.items || []} />
        <Pagination page={data?.page || page} hasNext={Boolean(data?.hasNext)} onPrevious={() => setPage((current) => Math.max(1, current - 1))} onNext={() => setPage((current) => current + 1)} />
      </Panel>
    </div>
  );
}
