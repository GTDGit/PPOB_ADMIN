"use client";

import { useEffect, useMemo, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { extractApiError } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format";
import { useAuth } from "@/lib/auth/AuthProvider";
import { PageHeader } from "@/components/admin/PageHeader";
import { Panel } from "@/components/admin/Panel";
import { AdminTable, type TableColumn } from "@/components/admin/AdminTable";
import { Pagination } from "@/components/admin/Pagination";
import { PermissionFallback } from "@/components/admin/PermissionFallback";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { GenericRecord, PaginatedResponse } from "@/lib/types";

export default function AuditLogsPage() {
  const { hasPermission } = useAuth();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<GenericRecord> | null>(null);
  const [error, setError] = useState("");

  const canView = hasPermission("audit.view");

  useEffect(() => {
    if (!canView) return;
    const load = async () => {
      try {
        const response = await adminApi.listAuditLogs(page, 20);
        setData(response);
      } catch (error) {
        setError(extractApiError(error));
      }
    };
    void load();
  }, [canView, page]);

  const columns = useMemo<TableColumn<GenericRecord>[]>(
    () => [
      {
        key: "admin",
        header: "Admin",
        render: (row) => String(row.admin_name || "-"),
      },
      {
        key: "action",
        header: "Action",
        render: (row) => (
          <div>
            <p className="font-semibold text-slate-900">{String(row.action || "-")}</p>
            <p className="mt-1 text-xs text-slate-500">
              {String(row.resource_type || "-")} · {String(row.resource_id || "-")}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge value={String(row.status || "")} />,
      },
      {
        key: "ip",
        header: "IP / Agent",
        render: (row) => (
          <div className="text-xs text-slate-500">
            <p>{String(row.ip_address || "-")}</p>
            <p className="mt-1 line-clamp-2">{String(row.user_agent || "-")}</p>
          </div>
        ),
      },
      {
        key: "time",
        header: "Waktu",
        render: (row) => formatDateTime(row.created_at as string),
      },
    ],
    [],
  );

  if (!canView) return <PermissionFallback />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Audit Trail" title="Audit log admin" description="Seluruh aktivitas admin, perubahan status, dan event approval yang tercatat di backend." />
      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      <Panel title="Log aktivitas" description="Log audit tersimpan untuk keperluan operasional, keamanan, dan investigasi.">
        <AdminTable columns={columns} rows={data?.items || []} />
        <Pagination page={data?.page || page} hasNext={Boolean(data?.hasNext)} onPrevious={() => setPage((current) => Math.max(1, current - 1))} onNext={() => setPage((current) => current + 1)} />
      </Panel>
    </div>
  );
}
