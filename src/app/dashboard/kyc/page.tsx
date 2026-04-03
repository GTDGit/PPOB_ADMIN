"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { extractApiError } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format";
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

export default function KycPage() {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<GenericRecord> | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<GenericRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canView = hasPermission("kyc.view");
  const canApprove = hasPermission("kyc.approve");

  const load = async () => {
    try {
      const response = await adminApi.listKyc(search, status, page, 20);
      setData(response);
    } catch (error) {
      setError(extractApiError(error));
    }
  };

  useEffect(() => {
    if (!canView) return;
    void load();
  }, [canView, page]);

  const openDetail = useCallback(async (userId: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const response = await adminApi.getKycDetail(userId);
      setSelectedDetail(response);
    } catch (error) {
      setError(extractApiError(error));
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const act = async (kind: "approve" | "reject", userId: string) => {
    setError("");
    setSuccess("");
    try {
      if (kind === "approve") {
        await adminApi.approveKyc(userId);
        setSuccess("KYC berhasil di-approve.");
      } else {
        await adminApi.rejectKyc(userId);
        setSuccess("KYC berhasil di-reject.");
      }
      await load();
    } catch (error) {
      setError(extractApiError(error));
    }
  };

  const columns = useMemo<TableColumn<GenericRecord>[]>(
    () => [
      {
        key: "identity",
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
        key: "document",
        header: "Dokumen",
        render: (row) => (
          <div className="space-y-1 text-xs">
            <a href={String(row.ktp_url || "#")} target="_blank" className="text-blue-600 underline decoration-blue-200 underline-offset-4">
              Foto KTP
            </a>
            <a href={String(row.face_url || "#")} target="_blank" className="block text-blue-600 underline decoration-blue-200 underline-offset-4">
              Foto wajah
            </a>
            <a href={String(row.liveness_url || "#")} target="_blank" className="block text-blue-600 underline decoration-blue-200 underline-offset-4">
              Liveness
            </a>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge value={String(row.kyc_status || "")} />,
      },
      {
        key: "verified",
        header: "Verified at",
        render: (row) => formatDateTime(row.verified_at as string),
      },
      {
        key: "actions",
        header: "Aksi",
        render: (row) =>
          canApprove ? (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => void openDetail(String(row.user_id))}
                className="rounded-2xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
              >
                Detail
              </button>
              <button
                onClick={() => void act("approve", String(row.user_id))}
                className="rounded-2xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Approve
              </button>
              <button
                onClick={() => void act("reject", String(row.user_id))}
                className="rounded-2xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700"
              >
                Reject
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void openDetail(String(row.user_id))}
              className="rounded-2xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              Detail
            </button>
          ),
      },
    ],
    [canApprove, openDetail],
  );

  if (!canView) return <PermissionFallback />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="KYC" title="Review verifikasi identitas" description="Pantau status verifikasi user dan proses approve/reject dokumen KYC." />
      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      {success ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}
      <Panel
        title="Daftar KYC"
        description="Filter berdasarkan nama, nomor, email, NIK, atau status KYC."
        action={<ExportCsvButton rows={data?.items || []} filename="kyc" />}
      >
        <form className="mb-5 grid gap-3 md:grid-cols-[1fr,220px,auto]" onSubmit={(e) => { e.preventDefault(); setPage(1); void load(); }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari KYC..." className="rounded-2xl border border-slate-200 px-4 py-3" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3">
            <option value="all">Semua status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Terapkan</button>
        </form>
        <AdminTable columns={columns} rows={data?.items || []} />
        <Pagination page={data?.page || page} hasNext={Boolean(data?.hasNext)} onPrevious={() => setPage((current) => Math.max(1, current - 1))} onNext={() => setPage((current) => current + 1)} />
      </Panel>
      <DetailDrawer
        open={detailOpen}
        title="Detail KYC"
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
