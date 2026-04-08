"use client";

import { useCallback, useEffect, useState } from "react";
import { Briefcase, Pencil, Plus, Trash2, UserPlus, X } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { extractApiError } from "@/lib/api/client";
import type { GenericRecord } from "@/lib/types";
import { PageHeader } from "@/components/admin/PageHeader";
import { Panel } from "@/components/admin/Panel";

export default function PositionsPage() {
  const [positions, setPositions] = useState<GenericRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // Assign
  const [assignPositionId, setAssignPositionId] = useState<string | null>(null);
  const [admins, setAdmins] = useState<GenericRecord[]>([]);
  const [allAdmins, setAllAdmins] = useState<GenericRecord[]>([]);
  const [assignAdminId, setAssignAdminId] = useState("");

  const fetchPositions = useCallback(async () => {
    try {
      const data = await adminApi.listPositions();
      setPositions(data);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPositions();
  }, [fetchPositions]);

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setError("");
    try {
      await adminApi.createPosition(newName.trim());
      setNewName("");
      setShowCreate(false);
      setNotice("Posisi berhasil dibuat");
      await fetchPositions();
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setCreating(false);
    }
  }, [newName, fetchPositions]);

  const handleUpdate = useCallback(async (id: string) => {
    if (!editName.trim()) return;
    setError("");
    try {
      await adminApi.updatePosition(id, editName.trim());
      setEditId(null);
      setNotice("Posisi berhasil diperbarui");
      await fetchPositions();
    } catch (err) {
      setError(extractApiError(err));
    }
  }, [editName, fetchPositions]);

  const handleDelete = useCallback(async (id: string, name: string) => {
    if (!confirm(`Hapus posisi "${name}"? Admin dengan posisi ini akan menjadi tanpa posisi.`)) return;
    setError("");
    try {
      await adminApi.deletePosition(id);
      setNotice("Posisi berhasil dihapus");
      await fetchPositions();
    } catch (err) {
      setError(extractApiError(err));
    }
  }, [fetchPositions]);

  const openAssign = useCallback(async (positionId: string) => {
    setAssignPositionId(positionId);
    setError("");
    try {
      const [posAdmins, allAdminList] = await Promise.all([
        adminApi.getPositionAdmins(positionId),
        adminApi.listAdmins("", 1, 100),
      ]);
      setAdmins(posAdmins);
      setAllAdmins((allAdminList as { items: GenericRecord[] }).items || []);
    } catch (err) {
      setError(extractApiError(err));
    }
  }, []);

  const handleAssign = useCallback(async () => {
    if (!assignPositionId || !assignAdminId) return;
    setError("");
    try {
      await adminApi.assignPosition(assignPositionId, assignAdminId);
      setAssignAdminId("");
      setNotice("Posisi berhasil ditetapkan");
      await openAssign(assignPositionId);
      await fetchPositions();
    } catch (err) {
      setError(extractApiError(err));
    }
  }, [assignPositionId, assignAdminId, openAssign, fetchPositions]);

  const handleRemoveAdmin = useCallback(async (adminId: string) => {
    setError("");
    try {
      await adminApi.removeAdminPosition(adminId);
      setNotice("Posisi admin berhasil dihapus");
      if (assignPositionId) await openAssign(assignPositionId);
      await fetchPositions();
    } catch (err) {
      setError(extractApiError(err));
    }
  }, [assignPositionId, openAssign, fetchPositions]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Organisasi"
        title="Manajemen Posisi"
        description="Kelola posisi karyawan. Posisi ditampilkan di tanda tangan email dan profil admin."
      />

      {error && <div className="admin-note-error">{error}</div>}
      {notice && <div className="admin-note-success">{notice}</div>}

      <Panel
        title="Daftar Posisi"
        description="Tambah, edit, dan hapus posisi karyawan."
        action={
          <button
            type="button"
            className="admin-button-primary flex items-center gap-2 text-sm"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-4 w-4" />
            Tambah Posisi
          </button>
        }
      >
        {/* Create form */}
        {showCreate && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/60 p-3">
            <Briefcase className="h-5 w-5 text-blue-500 shrink-0" />
            <input
              className="admin-input flex-1"
              placeholder="Nama posisi baru..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
            <button
              type="button"
              className="admin-button-primary text-sm"
              disabled={creating || !newName.trim()}
              onClick={() => void handleCreate()}
            >
              {creating ? "..." : "Simpan"}
            </button>
            <button type="button" className="text-slate-400 hover:text-slate-600" onClick={() => setShowCreate(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {loading ? (
          <p className="py-8 text-center text-sm text-slate-400">Memuat...</p>
        ) : positions.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">Belum ada posisi.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {positions.map((pos) => (
              <div key={String(pos.id)} className="flex items-center justify-between gap-4 py-3">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-slate-400" />
                  {editId === String(pos.id) ? (
                    <input
                      className="admin-input !w-64"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleUpdate(String(pos.id))}
                      onBlur={() => void handleUpdate(String(pos.id))}
                      autoFocus
                    />
                  ) : (
                    <div>
                      <span className="font-medium text-slate-900">{String(pos.name)}</span>
                      <span className="ml-2 text-xs text-slate-400">{String(pos.admin_count || 0)} admin</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"
                    title="Kelola admin"
                    onClick={() => void openAssign(String(pos.id))}
                  >
                    <UserPlus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                    title="Edit"
                    onClick={() => { setEditId(String(pos.id)); setEditName(String(pos.name)); }}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                    title="Hapus"
                    onClick={() => void handleDelete(String(pos.id), String(pos.name))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Assign Modal */}
      {assignPositionId && (
        <Panel
          title={`Admin di posisi: ${positions.find((p) => String(p.id) === assignPositionId)?.name || ""}`}
          description="Tetapkan atau hapus admin dari posisi ini."
          action={
            <button type="button" className="text-slate-400 hover:text-slate-600" onClick={() => setAssignPositionId(null)}>
              <X className="h-5 w-5" />
            </button>
          }
        >
          <div className="space-y-4">
            {/* Assign form */}
            <div className="flex items-center gap-3">
              <select
                className="admin-input flex-1"
                value={assignAdminId}
                onChange={(e) => setAssignAdminId(e.target.value)}
              >
                <option value="">Pilih admin...</option>
                {allAdmins
                  .filter((a) => !admins.some((m) => String(m.id) === String(a.id)))
                  .map((a) => (
                    <option key={String(a.id)} value={String(a.id)}>
                      {String(a.full_name || a.email)}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                className="admin-button-primary text-sm"
                disabled={!assignAdminId}
                onClick={() => void handleAssign()}
              >
                Tetapkan
              </button>
            </div>

            {/* Admin list */}
            {admins.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Belum ada admin di posisi ini.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {admins.map((a) => (
                  <div key={String(a.id)} className="flex items-center justify-between py-2">
                    <div>
                      <span className="text-sm font-medium text-slate-900">{String(a.full_name)}</span>
                      <span className="ml-2 text-xs text-slate-400">{String(a.email)}</span>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-red-500 hover:text-red-700"
                      onClick={() => void handleRemoveAdmin(String(a.id))}
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Panel>
      )}
    </div>
  );
}
