"use client";

import { useEffect, useMemo, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { extractApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { AdminTable, type TableColumn } from "@/components/admin/AdminTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { Panel } from "@/components/admin/Panel";
import { PermissionFallback } from "@/components/admin/PermissionFallback";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Avatar } from "@/components/admin/Avatar";
import { formatDateTime, prettifyStatus } from "@/lib/format";
import type { AdminMailbox, GenericRecord, PaginatedResponse } from "@/lib/types";

const initialForm = {
  type: "shared",
  address: "",
  displayName: "",
  ownerAdminId: "",
  isActive: true,
  memberIds: [] as string[],
};

function normalizeMailbox(item: GenericRecord): AdminMailbox {
  return {
    id: String(item.id || ""),
    type: String(item.type || "shared") as AdminMailbox["type"],
    address: String(item.address || ""),
    displayName: String(item.displayName || item.display_name || ""),
    ownerAdminId: String(item.ownerAdminId || item.owner_admin_id || ""),
    ownerName: String(item.ownerName || item.owner_name || ""),
    isActive: Boolean(item.isActive ?? item.is_active),
    unreadThreads: Number(item.unreadThreads ?? item.unread_threads ?? 0),
    totalThreads: Number(item.totalThreads ?? item.total_threads ?? 0),
    latestMessageAt: String(item.latestMessageAt || item.latest_message_at || ""),
    createdAt: String(item.createdAt || item.created_at || ""),
    updatedAt: String(item.updatedAt || item.updated_at || ""),
    members: (item.members as GenericRecord[] | undefined) || [],
  };
}

export default function MailboxesPage() {
  const { hasPermission } = useAuth();
  const [mailboxes, setMailboxes] = useState<AdminMailbox[]>([]);
  const [admins, setAdmins] = useState<PaginatedResponse<GenericRecord> | null>(null);
  const [selected, setSelected] = useState<AdminMailbox | null>(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const canManage = hasPermission("mailboxes.manage");

  const loadData = async () => {
    try {
      const [mailboxResponse, adminsResponse] = await Promise.all([
        adminApi.listMailboxes(),
        adminApi.listAdmins("", 1, 100),
      ]);
      setMailboxes((mailboxResponse.items as unknown as GenericRecord[]).map(normalizeMailbox));
      setAdmins(adminsResponse);
    } catch (err) {
      setError(extractApiError(err));
    }
  };

  useEffect(() => {
    if (!canManage) return;
    void loadData();
  }, [canManage]);

  useEffect(() => {
    if (!selected) {
      setForm(initialForm);
      return;
    }
    setForm({
      type: selected.type,
      address: selected.address,
      displayName: selected.displayName,
      ownerAdminId: String(selected.ownerAdminId || ""),
      isActive: Boolean(selected.isActive),
      memberIds: Array.isArray(selected.members)
        ? selected.members.map((member) => String((member as GenericRecord).admin_user_id))
        : [],
    });
  }, [selected]);

  const columns = useMemo<TableColumn<AdminMailbox>[]>(
    () => [
      {
        key: "mailbox",
        header: "Mailbox",
        render: (row) => (
          <button type="button" onClick={() => setSelected(row)} className="flex items-center gap-3 text-left">
            <Avatar name={row.displayName || row.address} size="sm" />
            <div>
              <p className="font-semibold text-slate-900">{row.displayName}</p>
              <p className="mt-0.5 text-xs text-slate-500">{row.address}</p>
            </div>
          </button>
        ),
      },
      {
        key: "type",
        header: "Tipe",
        render: (row) => <StatusBadge value={row.type} />,
      },
      {
        key: "active",
        header: "Status",
        render: (row) => <StatusBadge value={row.isActive ? "active" : "inactive"} />,
      },
      {
        key: "activity",
        header: "Aktivitas",
        render: (row) => (
          <div className="text-xs text-slate-500">
            <p>{row.unreadThreads || 0} thread belum dibaca</p>
            <p className="mt-1">{formatDateTime(row.latestMessageAt || row.createdAt)}</p>
          </div>
        ),
      },
    ],
    [],
  );

  const availableAdmins = admins?.items || [];

  const toggleMember = (adminId: string) => {
    setForm((current) => ({
      ...current,
      memberIds: current.memberIds.includes(adminId)
        ? current.memberIds.filter((id) => id !== adminId)
        : [...current.memberIds, adminId],
    }));
  };

  const submit = async () => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const payload = {
        ...form,
        ownerAdminId: form.ownerAdminId || undefined,
      };
      if (selected?.id) {
        await adminApi.updateMailbox(selected.id, payload);
        setNotice("Mailbox berhasil diperbarui");
      } else {
        await adminApi.createMailbox(payload);
        setNotice("Mailbox berhasil dibuat");
      }
      await loadData();
      setSelected(null);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setBusy(false);
    }
  };

  if (!canManage) return <PermissionFallback />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Email & CS"
        title="Kelola mailbox"
        description="Atur shared mailbox dan personal mailbox admin, termasuk owner, anggota tim, dan status aktif mailbox."
      />

      {error ? <div className="admin-note-error">{error}</div> : null}
      {notice ? <div className="admin-note-success">{notice}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <Panel title="Daftar mailbox" description="Seluruh mailbox operasional, personal, dan sistem yang terdaftar di console admin.">
          <AdminTable columns={columns} rows={mailboxes} emptyLabel="Mailbox belum tersedia." />
        </Panel>

        <Panel
          title={selected ? "Ubah mailbox" : "Buat mailbox"}
          description="Gunakan form ini untuk menambah mailbox baru atau memperbarui membership pada shared mailbox."
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">Tipe mailbox</label>
                <select
                  className="admin-select"
                  value={form.type}
                  onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
                >
                  <option value="shared">Shared</option>
                  <option value="personal">Personal</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">Status</label>
                <select
                  className="admin-select"
                  value={form.isActive ? "active" : "inactive"}
                  onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.value === "active" }))}
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">Nama pengirim (From name)</label>
              <input
                className="admin-input"
                value={form.displayName}
                onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
                placeholder="Contoh: Customer Support"
              />
              <p className="mt-1.5 text-xs text-slate-400">
                Nama ini terlihat oleh penerima email di field From.
              </p>
              {form.displayName.trim() && form.address.trim() && (
                <div className="mt-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-mono text-blue-800">
                  {form.displayName.trim()} &lt;{form.address.trim()}&gt;
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">Alamat email</label>
              <input
                className="admin-input"
                value={form.address}
                onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                placeholder="contoh: cs@ppob.id"
              />
            </div>

            {form.type === "personal" ? (
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">Owner admin</label>
                <select
                  className="admin-select"
                  value={form.ownerAdminId}
                  onChange={(event) => setForm((current) => ({ ...current, ownerAdminId: event.target.value }))}
                >
                  <option value="">Pilih owner mailbox</option>
                  {availableAdmins.map((admin) => (
                    <option key={String(admin.id)} value={String(admin.id)}>
                      {String(admin.full_name || admin.email || "-")}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {form.type === "shared" ? (
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-800">Anggota mailbox</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {availableAdmins.map((admin) => {
                    const adminId = String(admin.id);
                    const checked = form.memberIds.includes(adminId);
                    return (
                      <label
                        key={adminId}
                        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleMember(adminId)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600"
                        />
                        <span>
                          {String(admin.full_name || admin.email || "-")}
                          <span className="mt-1 block text-xs text-slate-500">
                            {String(admin.email || "-")}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                className="admin-button-primary disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => void submit()}
                disabled={busy || !form.displayName.trim()}
              >
                {busy ? "Menyimpan..." : selected ? "Simpan perubahan" : "Buat mailbox"}
              </button>
              <button
                type="button"
                className="admin-button-secondary"
                onClick={() => {
                  setSelected(null);
                  setForm(initialForm);
                }}
              >
                Reset form
              </button>
            </div>

            <div className="rounded-[1.2rem] border border-blue-100 bg-blue-50/70 p-4 text-sm leading-6 text-slate-600">
              <p className="font-semibold text-slate-900">Catatan</p>
              <p className="mt-2">
                Personal mailbox idealnya memakai owner admin dan alamat email `nama.lengkap@ppob.id`.
                Untuk shared mailbox, pilih anggota tim yang memang diberi tanggung jawab melihat atau membalas email dari mailbox tersebut.
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
