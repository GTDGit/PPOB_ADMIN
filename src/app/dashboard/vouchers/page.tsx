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

const defaultForm = {
  code: "",
  name: "",
  description: "",
  discountType: "fixed",
  discountValue: 0,
  minTransaction: 0,
  maxDiscount: 0,
  maxUsage: 0,
  maxUsagePerUser: 1,
  startsAt: "",
  expiresAt: "",
  termsUrl: "",
};

export default function VouchersPage() {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<GenericRecord> | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<GenericRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canView = hasPermission("vouchers.view");
  const canManage = hasPermission("vouchers.manage");

  const load = async () => {
    try {
      const response = await adminApi.listVouchers(search, page, 20);
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
      const response = await adminApi.getVoucherDetail(id);
      setSelectedDetail(response);
    } catch (error) {
      setError(extractApiError(error));
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const createVoucher = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    try {
      await adminApi.createVoucher({
        ...form,
        applicableServices: [],
        isActive: true,
      });
      setSuccess("Voucher baru berhasil dibuat.");
      setForm(defaultForm);
      await load();
    } catch (error) {
      setError(extractApiError(error));
    }
  };

  const toggleVoucher = async (row: GenericRecord) => {
    try {
      await adminApi.updateVoucherStatus(String(row.id), {
        isActive: !Boolean(row.is_active),
      });
      await load();
    } catch (error) {
      setError(extractApiError(error));
    }
  };

  const columns = useMemo<TableColumn<GenericRecord>[]>(
    () => [
      {
        key: "voucher",
        header: "Voucher",
        render: (row) => (
          <div>
            <p className="font-semibold text-slate-900">{String(row.name || "-")}</p>
            <p className="mt-1 text-xs text-slate-500">{String(row.code || "-")}</p>
          </div>
        ),
      },
      {
        key: "benefit",
        header: "Benefit",
        render: (row) => (
          <div>
            <p className="font-medium text-slate-900">
              {String(row.discount_type || "-")} - {formatCurrency(row.discount_value as number)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Min transaksi {formatCurrency(row.min_transaction as number)}
            </p>
          </div>
        ),
      },
      {
        key: "usage",
        header: "Pemakaian",
        render: (row) => `${row.current_usage || 0} / ${row.max_usage || 0}`,
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge value={Boolean(row.is_active) ? "active" : "inactive"} />,
      },
      {
        key: "period",
        header: "Periode",
        render: (row) => (
          <div className="text-xs leading-5 text-slate-500">
            <p>{formatDateTime(row.starts_at as string)}</p>
            <p>{formatDateTime(row.expires_at as string)}</p>
          </div>
        ),
      },
      {
        key: "action",
        header: "Aksi",
        render: (row) =>
          canManage ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void openDetail(String(row.id))}
                className="rounded-2xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
              >
                Detail
              </button>
              <button
                onClick={() => void toggleVoucher(row)}
                className="rounded-2xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
              >
                {Boolean(row.is_active) ? "Nonaktifkan" : "Aktifkan"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void openDetail(String(row.id))}
              className="rounded-2xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              Detail
            </button>
          ),
      },
    ],
    [canManage, openDetail],
  );

  if (!canView) return <PermissionFallback />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Voucher"
        title="Voucher promosi"
        description="Kelola voucher diskon, masa berlaku, dan status aktif voucher."
      />
      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      {success ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}
      {canManage ? (
        <Panel title="Buat voucher baru" description="Form singkat untuk membuat voucher promosi operasional.">
          <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={createVoucher}>
            <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="Kode voucher" className="rounded-2xl border border-slate-200 px-4 py-3" required />
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nama voucher" className="rounded-2xl border border-slate-200 px-4 py-3" required />
            <input value={form.discountValue} onChange={(e) => setForm((f) => ({ ...f, discountValue: Number(e.target.value) }))} placeholder="Nilai diskon" type="number" className="rounded-2xl border border-slate-200 px-4 py-3" required />
            <select value={form.discountType} onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3">
              <option value="fixed">Fixed</option>
              <option value="percentage">Percentage</option>
            </select>
            <input value={form.minTransaction} onChange={(e) => setForm((f) => ({ ...f, minTransaction: Number(e.target.value) }))} placeholder="Min transaksi" type="number" className="rounded-2xl border border-slate-200 px-4 py-3" />
            <input value={form.maxDiscount} onChange={(e) => setForm((f) => ({ ...f, maxDiscount: Number(e.target.value) }))} placeholder="Max diskon" type="number" className="rounded-2xl border border-slate-200 px-4 py-3" />
            <input value={form.maxUsage} onChange={(e) => setForm((f) => ({ ...f, maxUsage: Number(e.target.value) }))} placeholder="Max usage" type="number" className="rounded-2xl border border-slate-200 px-4 py-3" />
            <input value={form.maxUsagePerUser} onChange={(e) => setForm((f) => ({ ...f, maxUsagePerUser: Number(e.target.value) }))} placeholder="Max usage per user" type="number" className="rounded-2xl border border-slate-200 px-4 py-3" />
            <input value={form.startsAt} onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))} type="datetime-local" className="rounded-2xl border border-slate-200 px-4 py-3" required />
            <input value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} type="datetime-local" className="rounded-2xl border border-slate-200 px-4 py-3" required />
            <input value={form.termsUrl} onChange={(e) => setForm((f) => ({ ...f, termsUrl: e.target.value }))} placeholder="URL syarat" className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2" />
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Deskripsi voucher" className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2 xl:col-span-4" rows={3} />
            <div className="md:col-span-2 xl:col-span-4">
              <button className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white">Buat voucher</button>
            </div>
          </form>
        </Panel>
      ) : null}
      <Panel
        title="Daftar voucher"
        description="Voucher aktif dan nonaktif yang saat ini tersimpan di sistem."
        action={<ExportCsvButton rows={data?.items || []} filename="vouchers" />}
      >
        <form className="mb-5 flex flex-col gap-3 sm:flex-row" onSubmit={(e) => { e.preventDefault(); setPage(1); void load(); }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari voucher..." className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
          <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Cari</button>
        </form>
        <AdminTable columns={columns} rows={data?.items || []} />
        <Pagination page={data?.page || page} hasNext={Boolean(data?.hasNext)} onPrevious={() => setPage((current) => Math.max(1, current - 1))} onNext={() => setPage((current) => current + 1)} />
      </Panel>
      <DetailDrawer
        open={detailOpen}
        title="Detail voucher"
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
