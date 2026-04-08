"use client";

import { useCallback, useRef, useState } from "react";
import { Camera, Save, Trash2 } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { extractApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { PageHeader } from "@/components/admin/PageHeader";
import { Panel } from "@/components/admin/Panel";
import { Avatar } from "@/components/admin/Avatar";
import { prettifyResourceLabel } from "@/lib/format";

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [busy, setBusy] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveName = useCallback(async () => {
    if (!fullName.trim() || fullName.trim().length < 3) {
      setError("Nama lengkap minimal 3 karakter");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await adminApi.updateProfile(fullName.trim());
      await refreshProfile();
      setNotice("Nama berhasil diperbarui");
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setBusy(false);
    }
  }, [fullName, refreshProfile]);

  const handleAvatarUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setError("Format file harus JPG, PNG, atau WebP");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError("Ukuran file maksimal 2MB");
        return;
      }
      setAvatarBusy(true);
      setError("");
      setNotice("");
      try {
        await adminApi.uploadAvatar(file);
        await refreshProfile();
        setNotice("Foto profil berhasil diperbarui");
      } catch (err) {
        setError(extractApiError(err));
      } finally {
        setAvatarBusy(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [refreshProfile],
  );

  const handleAvatarRemove = useCallback(async () => {
    setAvatarBusy(true);
    setError("");
    setNotice("");
    try {
      await adminApi.removeAvatar();
      await refreshProfile();
      setNotice("Foto profil berhasil dihapus");
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setAvatarBusy(false);
    }
  }, [refreshProfile]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Akun"
        title="Profil Saya"
        description="Kelola informasi profil dan foto Anda. Perubahan nama akan terlihat di email yang dikirim dan seluruh console."
      />

      {error && <div className="admin-note-error">{error}</div>}
      {notice && <div className="admin-note-success">{notice}</div>}

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {/* Foto Profil */}
        <Panel title="Foto profil" description="Foto ini terlihat di inbox email, navbar, dan assignment thread.">
          <div className="flex flex-col items-center gap-5 py-4">
            <Avatar src={user?.avatarUrl} name={user?.fullName || "Admin"} size="lg" className="!h-24 !w-24 !text-3xl" />

            <div className="text-center">
              <p className="text-base font-semibold text-slate-900">{user?.fullName}</p>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                {(user?.roles || []).map((role) => (
                  <span key={role} className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                    {prettifyResourceLabel(role)}
                  </span>
                ))}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => void handleAvatarUpload(e)}
            />

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="admin-button-primary flex items-center gap-2 text-sm disabled:opacity-50"
                disabled={avatarBusy}
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
                {avatarBusy ? "Mengupload..." : "Ganti Foto"}
              </button>
              {user?.avatarUrl && (
                <button
                  type="button"
                  className="admin-button-secondary flex items-center gap-2 text-sm text-red-600 disabled:opacity-50"
                  disabled={avatarBusy}
                  onClick={() => void handleAvatarRemove()}
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus
                </button>
              )}
            </div>

            <p className="text-xs text-slate-400 text-center">
              Maks 2MB. Format: JPG, PNG, atau WebP.
            </p>
          </div>
        </Panel>

        {/* Info Profil */}
        <Panel title="Informasi profil" description="Edit nama lengkap Anda. Email tidak dapat diubah.">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">Email</label>
              <input
                className="admin-input !bg-slate-50 !text-slate-500"
                value={user?.email || ""}
                disabled
              />
              <p className="mt-1.5 text-xs text-slate-400">Email tidak dapat diubah.</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">Nomor HP</label>
              <input
                className="admin-input !bg-slate-50 !text-slate-500"
                value={user?.phone || ""}
                disabled
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">Nama lengkap</label>
              <input
                className="admin-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama lengkap Anda"
              />
              <p className="mt-1.5 text-xs text-slate-400">
                Nama ini digunakan sebagai pengirim email dan identitas di seluruh console.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                className="admin-button-primary flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={busy || !fullName.trim() || fullName.trim() === user?.fullName}
                onClick={() => void handleSaveName()}
              >
                <Save className="h-4 w-4" />
                {busy ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
