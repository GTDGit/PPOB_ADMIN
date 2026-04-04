"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { extractApiError } from "@/lib/api/client";
import { stringifyValue } from "@/lib/format";
import { useAuth } from "@/lib/auth/AuthProvider";
import { PageHeader } from "@/components/admin/PageHeader";
import { Panel } from "@/components/admin/Panel";
import { PermissionFallback } from "@/components/admin/PermissionFallback";
import type { GenericRecord } from "@/lib/types";

export default function SettingsPage() {
  const { hasPermission } = useAuth();
  const [settings, setSettings] = useState<GenericRecord[]>([]);
  const [keyName, setKeyName] = useState("");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("{}");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canView = hasPermission("settings.view");
  const canManage = hasPermission("settings.manage");

  const load = async () => {
    try {
      const response = await adminApi.listSettings();
      setSettings(response);
    } catch (error) {
      setError(extractApiError(error));
    }
  };

  useEffect(() => {
    if (!canView) return;
    void load();
  }, [canView]);

  if (!canView) return <PermissionFallback />;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    try {
      const parsedValue = JSON.parse(value);
      await adminApi.upsertSetting({
        key: keyName,
        description,
        value: parsedValue,
      });
      setSuccess("Setting berhasil diperbarui.");
      setKeyName("");
      setDescription("");
      setValue("{}");
      await load();
    } catch (error) {
      setError(extractApiError(error));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Settings" title="System settings" description="Konfigurasi admin level console untuk approval, security, dan operasional." />
      {error ? <div className="admin-note-error">{error}</div> : null}
      {success ? <div className="admin-note-success">{success}</div> : null}
      {canManage ? (
        <Panel title="Update setting" description="Masukkan key dan JSON value untuk menambah atau mengubah setting admin.">
          <form className="grid gap-4 lg:grid-cols-2" onSubmit={submit}>
            <input value={keyName} onChange={(e) => setKeyName(e.target.value)} placeholder="setting.key" className="admin-input" required />
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi setting" className="admin-input" />
            <textarea value={value} onChange={(e) => setValue(e.target.value)} placeholder='{"enabled": true}' className="admin-textarea lg:col-span-2" rows={6} required />
            <div className="lg:col-span-2">
              <button className="admin-button-primary">Simpan setting</button>
            </div>
          </form>
        </Panel>
      ) : null}
      <Panel title="Daftar setting" description="Setting yang saat ini tersimpan di backend admin console.">
        <div className="space-y-3">
          {settings.map((setting, index) => (
            <div key={`${String(setting.key)}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{String(setting.key || "-")}</p>
                  <p className="mt-1 text-sm text-slate-600">{String(setting.description || "-")}</p>
                </div>
              </div>
              <pre className="mt-4 overflow-auto rounded-2xl bg-white p-4 text-xs text-slate-600 ring-1 ring-slate-200">
                {stringifyValue(setting.value)}
              </pre>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
