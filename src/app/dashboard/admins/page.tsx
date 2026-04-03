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
import type { AdminRole, GenericRecord, PaginatedResponse } from "@/lib/types";

const defaultInvite = {
  email: "",
  phone: "",
  fullName: "",
  roleId: "",
};

export default function AdminsPage() {
  const { hasPermission } = useAuth();
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [data, setData] = useState<PaginatedResponse<GenericRecord> | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [inviteForm, setInviteForm] = useState(defaultInvite);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canView = hasPermission("admins.view");
  const canInvite = hasPermission("admins.invite");
  const canManage = hasPermission("admins.manage");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [adminList, roleList] = await Promise.all([
        adminApi.listAdmins(search, page, 20),
        adminApi.listRoles(),
      ]);
      setData(adminList);
      setRoles(roleList);
      setInviteForm((current) => ({
        ...current,
        roleId: current.roleId || roleList[0]?.id || "",
      }));
    } catch (error) {
      setError(extractApiError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canView) return;
    void load();
  }, [canView, page]);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    await load();
  };

  const handleInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await adminApi.createInvite(inviteForm);
      setSuccess(
        response.emailSent
          ? "Undangan admin berhasil dikirim lewat email."
          : `Undangan dibuat. Link aktivasi: ${response.inviteLink}`,
      );
      setInviteForm({
        ...defaultInvite,
        roleId: roles[0]?.id || "",
      });
      await load();
    } catch (error) {
      setError(extractApiError(error));
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatus = async (row: GenericRecord, status: string, isActive: boolean) => {
    if (!canManage) return;
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await adminApi.setAdminStatus(String(row.id), { status, isActive });
      setSuccess("Status admin berhasil diperbarui.");
      await load();
    } catch (error) {
      setError(extractApiError(error));
    } finally {
      setActionLoading(false);
    }
  };

  const columns = useMemo<TableColumn<GenericRecord>[]>(
    () => [
      {
        key: "identity",
        header: "Admin",
        render: (row) => (
          <div>
            <p className="font-semibold text-slate-900">
              {String(row.full_name || row.email || "-")}
            </p>
            <p className="mt-1 text-xs text-slate-500">{String(row.email || "-")}</p>
            <p className="mt-1 text-xs text-slate-500">{String(row.phone || "-")}</p>
          </div>
        ),
      },
      {
        key: "roles",
        header: "Role",
        render: (row) => String(row.roles || "-"),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => (
          <div className="space-y-2">
            <StatusBadge value={String(row.status || "")} />
            <div className="text-xs text-slate-500">
              {row.is_active ? "Akun aktif" : "Akun nonaktif"}
            </div>
          </div>
        ),
      },
      {
        key: "lastLogin",
        header: "Login terakhir",
        render: (row) => formatDateTime(row.last_login_at as string),
      },
      {
        key: "actions",
        header: "Aksi",
        render: (row) =>
          canManage ? (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => void handleStatus(row, "active", true)}
                className="rounded-2xl border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700"
              >
                Aktifkan
              </button>
              <button
                onClick={() => void handleStatus(row, "disabled", false)}
                className="rounded-2xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700"
              >
                Nonaktifkan
              </button>
            </div>
          ) : (
            <span className="text-xs text-slate-400">Read only</span>
          ),
      },
    ],
    [canManage],
  );

  if (!canView) {
    return <PermissionFallback />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin Management"
        title="Kelola admin internal"
        description="Buat undangan admin baru, atur role, dan pantau status akun admin operasional."
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

      {canInvite ? (
        <Panel
          title="Undang admin baru"
          description="Super Admin atau admin yang berwenang bisa membuat undangan aktivasi lewat email."
        >
          <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={handleInvite}>
            <input
              placeholder="Email admin"
              value={inviteForm.email}
              onChange={(event) =>
                setInviteForm((current) => ({ ...current, email: event.target.value }))
              }
              className="rounded-2xl border border-slate-200 px-4 py-3"
              required
            />
            <input
              placeholder="Nomor HP"
              value={inviteForm.phone}
              onChange={(event) =>
                setInviteForm((current) => ({ ...current, phone: event.target.value }))
              }
              className="rounded-2xl border border-slate-200 px-4 py-3"
              required
            />
            <input
              placeholder="Nama lengkap"
              value={inviteForm.fullName}
              onChange={(event) =>
                setInviteForm((current) => ({ ...current, fullName: event.target.value }))
              }
              className="rounded-2xl border border-slate-200 px-4 py-3"
            />
            <select
              value={inviteForm.roleId}
              onChange={(event) =>
                setInviteForm((current) => ({ ...current, roleId: event.target.value }))
              }
              className="rounded-2xl border border-slate-200 px-4 py-3"
              required
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            <div className="md:col-span-2 xl:col-span-4">
              <button
                type="submit"
                disabled={actionLoading}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
              >
                {actionLoading ? "Mengirim undangan..." : "Kirim undangan admin"}
              </button>
            </div>
          </form>
        </Panel>
      ) : null}

      <Panel
        title="Daftar admin"
        description="Cari admin berdasarkan nama, email, atau nomor HP."
      >
        <form className="mb-5 flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari admin..."
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
          />
          <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
            Cari
          </button>
        </form>
        <AdminTable
          columns={columns}
          rows={data?.items || []}
          emptyLabel={loading ? "Memuat admin..." : "Belum ada admin."}
        />
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
