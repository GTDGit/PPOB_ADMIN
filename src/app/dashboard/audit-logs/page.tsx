"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { extractApiError } from "@/lib/api/client";
import {
  formatDateTime,
  prettifyAuditAction,
  prettifyResourceLabel,
} from "@/lib/format";
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

export default function AuditLogsPage() {
  const { hasPermission } = useAuth();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<GenericRecord> | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<GenericRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
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

  const openDetail = useCallback((row: GenericRecord) => {
    setSelectedDetail(row);
    setDetailOpen(true);
  }, []);

  const columns = useMemo<TableColumn<GenericRecord>[]>(
    () => [
      {
        key: "admin",
        header: "Admin",
        render: (row) => (
          <div>
            <p className="font-semibold text-slate-900">
              {String(row.admin_name || row.admin_email || "-")}
            </p>
            <p className="mt-1 text-xs text-slate-500">{String(row.admin_email || "-")}</p>
          </div>
        ),
      },
      {
        key: "action",
        header: "Aktivitas",
        render: (row) => (
          <div>
            <p className="font-semibold text-slate-900">
              {prettifyAuditAction(String(row.action || ""))}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {prettifyResourceLabel(String(row.resource_type || ""))} -{" "}
              {String(row.resource_id || "-")}
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
        header: "Konteks",
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
      {
        key: "detail",
        header: "Detail",
        render: (row) => (
          <button
            type="button"
            onClick={() => openDetail(row)}
            className="admin-chip-button"
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
      <PageHeader eyebrow="Audit Trail" title="Audit log admin" description="Seluruh aktivitas admin, perubahan status, dan event approval ditampilkan dengan format yang lebih mudah dibaca tim operasional." />
      {error ? <div className="admin-note-error">{error}</div> : null}
      <Panel
        title="Log aktivitas"
        description="Pantau siapa melakukan apa, pada modul mana, dari perangkat mana, dan kapan aksi itu terjadi."
        action={<ExportCsvButton rows={data?.items || []} filename="audit-logs" />}
      >
        <AdminTable columns={columns} rows={data?.items || []} />
        <Pagination page={data?.page || page} hasNext={Boolean(data?.hasNext)} onPrevious={() => setPage((current) => Math.max(1, current - 1))} onNext={() => setPage((current) => current + 1)} />
      </Panel>
      <DetailDrawer
        open={detailOpen}
        title="Detail audit log"
        data={selectedDetail}
        onClose={() => {
          setDetailOpen(false);
          setSelectedDetail(null);
        }}
      />
    </div>
  );
}
