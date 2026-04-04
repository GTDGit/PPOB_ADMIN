"use client";

import { useEffect, useMemo, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { extractApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { AdminTable, type TableColumn } from "@/components/admin/AdminTable";
import { DetailDrawer } from "@/components/admin/DetailDrawer";
import { ExportCsvButton } from "@/components/admin/ExportCsvButton";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { Panel } from "@/components/admin/Panel";
import { PermissionFallback } from "@/components/admin/PermissionFallback";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDateTime, prettifyResourceLabel } from "@/lib/format";
import type { GenericRecord, PaginatedResponse } from "@/lib/types";

export default function EmailLogsPage() {
  const { hasPermission } = useAuth();
  const [data, setData] = useState<PaginatedResponse<GenericRecord> | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedDetail, setSelectedDetail] = useState<GenericRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [error, setError] = useState("");

  const canView = hasPermission("email_logs.view");

  useEffect(() => {
    if (!canView) return;
    const load = async () => {
      try {
        const response = await adminApi.listEmailLogs(search, status, category, page, 20);
        setData(response);
      } catch (err) {
        setError(extractApiError(err));
      }
    };
    void load();
  }, [canView, category, page, search, status]);

  const columns = useMemo<TableColumn<GenericRecord>[]>(
    () => [
      {
        key: "mailbox",
        header: "Pengiriman",
        render: (row) => (
          <button
            type="button"
            onClick={() => {
              setSelectedDetail(row);
              setDetailOpen(true);
            }}
            className="text-left"
          >
            <p className="font-semibold text-slate-900">
              {String(row.sender_name || row.mailbox_name || row.sender_address || "-")}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {String(row.sender_address || "-")} → {String(row.recipient || "-")}
            </p>
          </button>
        ),
      },
      {
        key: "category",
        header: "Kategori",
        render: (row) => (
          <div>
            <p className="font-medium text-slate-800">
              {prettifyResourceLabel(String(row.category || "-"))}
            </p>
            <p className="mt-1 text-xs text-slate-500">{String(row.provider || "-")}</p>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge value={String(row.status || "")} />,
      },
      {
        key: "provider",
        header: "Message ID",
        render: (row) => (
          <p className="max-w-[220px] break-all text-xs text-slate-500">
            {String(row.provider_message_id || "-")}
          </p>
        ),
      },
      {
        key: "time",
        header: "Waktu",
        render: (row) => formatDateTime(String(row.created_at || "")),
      },
    ],
    [],
  );

  if (!canView) return <PermissionFallback />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Email & CS"
        title="Email logs"
        description="Pantau pengiriman email transactional dan operational, lengkap dengan mailbox asal, penerima, provider message id, dan status delivery."
      />

      {error ? <div className="admin-note-error">{error}</div> : null}

      <Panel
        title="Riwayat pengiriman email"
        description="Gunakan filter untuk memantau pengiriman reset password, invite admin, reply inbox, dan email sistem lain yang dikirim melalui provider email."
        action={<ExportCsvButton rows={data?.items || []} filename="email-logs" />}
      >
        <div className="mb-5 grid gap-3 lg:grid-cols-3">
          <input
            className="admin-input"
            placeholder="Cari penerima atau pengirim"
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
          />
          <select
            className="admin-select"
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
          >
            <option value="all">Semua status</option>
            <option value="queued">Queued</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="bounced">Bounced</option>
            <option value="complaint">Complaint</option>
            <option value="failed">Failed</option>
          </select>
          <select
            className="admin-select"
            value={category}
            onChange={(event) => {
              setPage(1);
              setCategory(event.target.value);
            }}
          >
            <option value="all">Semua kategori</option>
            <option value="verification_email">Verification Email</option>
            <option value="admin_invite">Admin Invite</option>
            <option value="admin_password_reset">Admin Password Reset</option>
            <option value="mailbox_reply">Mailbox Reply</option>
          </select>
        </div>

        <AdminTable columns={columns} rows={data?.items || []} emptyLabel="Belum ada log pengiriman email." />
        <Pagination
          page={data?.page || page}
          hasNext={Boolean(data?.hasNext)}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
          onNext={() => setPage((current) => current + 1)}
        />
      </Panel>

      <DetailDrawer
        open={detailOpen}
        title="Detail email log"
        data={selectedDetail}
        onClose={() => {
          setDetailOpen(false);
          setSelectedDetail(null);
        }}
      />
    </div>
  );
}
