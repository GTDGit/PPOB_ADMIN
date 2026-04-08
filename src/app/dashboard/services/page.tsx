"use client";

import { useCallback, useEffect, useState } from "react";
import { Layers, Pencil, Save, X, ExternalLink } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { extractApiError } from "@/lib/api/client";
import type { GenericRecord } from "@/lib/types";
import { PageHeader } from "@/components/admin/PageHeader";
import { Panel } from "@/components/admin/Panel";
import { StatusBadge } from "@/components/admin/StatusBadge";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "maintenance", label: "Maintenance" },
  { value: "coming_soon", label: "Coming Soon" },
  { value: "hidden", label: "Hidden" },
];

export default function ServicesPage() {
  const [services, setServices] = useState<GenericRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<GenericRecord>({});
  const [saving, setSaving] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      const data = await adminApi.listServices();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchServices();
  }, [fetchServices]);

  const startEdit = (svc: GenericRecord) => {
    setEditId(String(svc.id));
    setEditData({
      name: svc.name,
      icon: svc.icon,
      iconUrl: svc.iconUrl || svc.icon_url,
      route: svc.route,
      status: svc.status,
      badge: svc.badge || "",
      sortOrder: svc.sortOrder ?? svc.sort_order ?? 0,
      isFeatured: svc.isFeatured ?? svc.is_featured ?? false,
    });
    setError("");
    setNotice("");
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditData({});
  };

  const handleSave = async () => {
    if (!editId) return;
    setSaving(true);
    setError("");
    try {
      await adminApi.updateService(editId, {
        name: editData.name,
        icon: editData.icon,
        icon_url: editData.iconUrl,
        route: editData.route,
        status: editData.status,
        badge: editData.badge || null,
        sort_order: Number(editData.sortOrder) || 0,
        is_featured: Boolean(editData.isFeatured),
      });
      setNotice("Layanan berhasil diperbarui");
      setEditId(null);
      setEditData({});
      await fetchServices();
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const webviewUrl = (route: string) => {
    const slug = String(route || "")
      .replace(/^\/services\//, "")
      .replace(/^\//, "");
    return `https://app.ppob.id/service/${slug}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Produk & Kontrol"
        title="Kelola Layanan"
        description="Atur icon, nama, link prefix, status, dan urutan layanan yang tampil di aplikasi."
        icon={Layers}
      />

      {error && (
        <div className="admin-note-error">
          <span>{error}</span>
          <button onClick={() => setError("")} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      )}

      {notice && (
        <div className="admin-note-success">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      )}

      <Panel title="Daftar Layanan" description="Klik edit untuk mengubah konfigurasi layanan.">
        {loading ? (
          <div className="py-12 text-center text-gray-400">Memuat...</div>
        ) : services.length === 0 ? (
          <div className="py-12 text-center text-gray-400">Tidak ada layanan</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="py-3 px-4 font-medium">#</th>
                  <th className="py-3 px-4 font-medium">Icon</th>
                  <th className="py-3 px-4 font-medium">Nama</th>
                  <th className="py-3 px-4 font-medium">Route / Link</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Badge</th>
                  <th className="py-3 px-4 font-medium">Featured</th>
                  <th className="py-3 px-4 font-medium">Urutan</th>
                  <th className="py-3 px-4 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {services.map((svc) => {
                  const isEditing = editId === String(svc.id);
                  const iconUrl = String(svc.iconUrl || svc.icon_url || "");

                  if (isEditing) {
                    return (
                      <tr key={String(svc.id)} className="border-b border-gray-50 bg-blue-50/50">
                        <td className="py-3 px-4 text-gray-400">{String(svc.id)}</td>
                        <td className="py-3 px-4">
                          <input
                            className="admin-input w-full text-xs"
                            placeholder="URL icon (https://...)"
                            value={String(editData.iconUrl || "")}
                            onChange={(e) => setEditData({ ...editData, iconUrl: e.target.value })}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            className="admin-input w-full"
                            value={String(editData.name || "")}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            className="admin-input w-full text-xs"
                            placeholder="/services/pulsa"
                            value={String(editData.route || "")}
                            onChange={(e) => setEditData({ ...editData, route: e.target.value })}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <select
                            className="admin-input"
                            value={String(editData.status || "active")}
                            onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            className="admin-input w-20"
                            placeholder="PROMO"
                            value={String(editData.badge || "")}
                            onChange={(e) => setEditData({ ...editData, badge: e.target.value })}
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={Boolean(editData.isFeatured)}
                            onChange={(e) => setEditData({ ...editData, isFeatured: e.target.checked })}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            className="admin-input w-16"
                            value={Number(editData.sortOrder || 0)}
                            onChange={(e) => setEditData({ ...editData, sortOrder: e.target.value })}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <button
                              onClick={handleSave}
                              disabled={saving}
                              className="admin-button-primary text-xs px-2 py-1 flex items-center gap-1"
                            >
                              <Save size={12} />
                              {saving ? "..." : "Simpan"}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="admin-button-secondary text-xs px-2 py-1"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={String(svc.id)} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-4 text-gray-400 text-xs">{String(svc.id)}</td>
                      <td className="py-3 px-4">
                        {iconUrl ? (
                          <img src={iconUrl} alt="" className="w-8 h-8 rounded-lg object-contain bg-gray-50" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                            {String(svc.icon || "—")}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium">{String(svc.name)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <code className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            {String(svc.route || "-")}
                          </code>
                          <a
                            href={webviewUrl(String(svc.route || ""))}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={String(svc.status)} />
                      </td>
                      <td className="py-3 px-4">
                        {svc.badge ? (
                          <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                            {String(svc.badge)}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {(svc.isFeatured || svc.is_featured) ? "✓" : "—"}
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {String(svc.sortOrder ?? svc.sort_order ?? 0)}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => startEdit(svc)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
