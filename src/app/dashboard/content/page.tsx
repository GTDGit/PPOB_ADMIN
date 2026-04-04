"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { extractApiError } from "@/lib/api/client";
import { formatDateTime, stringifyValue } from "@/lib/format";
import { useAuth } from "@/lib/auth/AuthProvider";
import { PageHeader } from "@/components/admin/PageHeader";
import { Panel } from "@/components/admin/Panel";
import { PermissionFallback } from "@/components/admin/PermissionFallback";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { GenericRecord, PaginatedResponse } from "@/lib/types";

const defaultBanner = {
  title: "",
  subtitle: "",
  imageUrl: "",
  thumbnailUrl: "",
  actionType: "open_url",
  actionValue: "",
  backgroundColor: "#EFF6FF",
  textColor: "#0F172A",
  placement: "home",
  startDate: "",
  endDate: "",
  priority: 1,
  targetTiers: [],
  isNewUserOnly: false,
  isActive: true,
};

const defaultNotification = {
  targetMode: "all",
  category: "admin",
  title: "",
  body: "",
  shortBody: "",
  actionType: "none",
  actionValue: "",
  actionButtonText: "",
  imageUrl: "",
  metadata: {},
};

export default function ContentPage() {
  const { hasAnyPermission } = useAuth();
  const [banners, setBanners] = useState<GenericRecord[]>([]);
  const [notifications, setNotifications] = useState<PaginatedResponse<GenericRecord> | null>(null);
  const [bannerForm, setBannerForm] = useState(defaultBanner);
  const [notificationForm, setNotificationForm] = useState(defaultNotification);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canView = hasAnyPermission(["banners.view", "notifications.view"]);

  const load = async () => {
    try {
      const [bannerList, notificationList] = await Promise.all([
        adminApi.listBanners(),
        adminApi.listNotifications("", 1, 10),
      ]);
      setBanners(bannerList);
      setNotifications(notificationList);
    } catch (error) {
      setError(extractApiError(error));
    }
  };

  useEffect(() => {
    if (!canView) return;
    void load();
  }, [canView]);

  if (!canView) return <PermissionFallback />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Content" title="Banner & notifikasi" description="Kelola banner aplikasi dan kirim notifikasi operasional ke user." />
      {error ? <div className="admin-note-error">{error}</div> : null}
      {success ? <div className="admin-note-success">{success}</div> : null}
      <Panel title="Buat banner" description="Banner sederhana untuk home app atau campaign aktif.">
        <form className="grid gap-4 lg:grid-cols-2" onSubmit={async (e) => {
          e.preventDefault();
          setError(""); setSuccess("");
          try {
            await adminApi.createBanner(bannerForm as unknown as GenericRecord);
            setSuccess("Banner berhasil dibuat.");
            setBannerForm(defaultBanner);
            await load();
          } catch (error) {
            setError(extractApiError(error));
          }
        }}>
          <input value={bannerForm.title} onChange={(e) => setBannerForm((f) => ({ ...f, title: e.target.value }))} placeholder="Judul banner" className="admin-input" required />
          <input value={bannerForm.subtitle} onChange={(e) => setBannerForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Subtitle banner" className="admin-input" />
          <input value={bannerForm.imageUrl} onChange={(e) => setBannerForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="Image URL" className="admin-input" required />
          <input value={bannerForm.actionValue} onChange={(e) => setBannerForm((f) => ({ ...f, actionValue: e.target.value }))} placeholder="Action value / URL" className="admin-input" />
          <input value={bannerForm.startDate} onChange={(e) => setBannerForm((f) => ({ ...f, startDate: e.target.value }))} type="datetime-local" className="admin-input" required />
          <input value={bannerForm.endDate} onChange={(e) => setBannerForm((f) => ({ ...f, endDate: e.target.value }))} type="datetime-local" className="admin-input" required />
          <div className="lg:col-span-2">
            <button className="admin-button-primary">Buat banner</button>
          </div>
        </form>
      </Panel>

      <Panel title="Broadcast notification" description="Kirim notifikasi massal ke semua user aktif.">
        <form className="grid gap-4 lg:grid-cols-2" onSubmit={async (e) => {
          e.preventDefault();
          setError(""); setSuccess("");
          try {
            await adminApi.broadcastNotification(notificationForm as unknown as GenericRecord);
            setSuccess("Notifikasi berhasil dikirim.");
            setNotificationForm(defaultNotification);
            await load();
          } catch (error) {
            setError(extractApiError(error));
          }
        }}>
          <input value={notificationForm.title} onChange={(e) => setNotificationForm((f) => ({ ...f, title: e.target.value }))} placeholder="Judul notifikasi" className="admin-input" required />
          <input value={notificationForm.shortBody} onChange={(e) => setNotificationForm((f) => ({ ...f, shortBody: e.target.value }))} placeholder="Short body" className="admin-input" />
          <textarea value={notificationForm.body} onChange={(e) => setNotificationForm((f) => ({ ...f, body: e.target.value }))} placeholder="Isi notifikasi" className="admin-textarea lg:col-span-2" rows={4} required />
          <div className="lg:col-span-2">
            <button className="admin-button-primary">Kirim notifikasi</button>
          </div>
        </form>
      </Panel>

      <Panel title="Banner aktif" description="Daftar banner yang sudah tersimpan di backend.">
        <div className="space-y-3">
          {banners.map((banner) => (
            <div key={String(banner.id)} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{String(banner.title || "-")}</p>
                  <p className="mt-1 text-sm text-slate-600">{String(banner.subtitle || "-")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge value={Boolean(banner.is_active) ? "active" : "inactive"} />
                  <button onClick={() => void adminApi.deleteBanner(String(banner.id)).then(load).catch((error) => setError(extractApiError(error)))} className="admin-button-danger">Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Riwayat notifikasi" description="10 notifikasi terbaru yang sudah dibuat dari admin console.">
        <div className="space-y-3">
          {(notifications?.items || []).map((item) => (
            <div key={String(item.id)} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{String(item.title || "-")}</p>
                  <p className="mt-1 text-sm text-slate-600">{String(item.body || "-")}</p>
                </div>
                <div className="text-xs text-slate-500">{formatDateTime(item.created_at as string)}</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
