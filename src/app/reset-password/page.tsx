"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { KeyRound } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { adminApi } from "@/lib/api/admin";
import { extractApiError } from "@/lib/api/client";
import type { AdminPasswordResetPreview } from "@/lib/types";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [preview, setPreview] = useState<AdminPasswordResetPreview | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadPreview = async () => {
      if (!token) {
        setError("Token reset password tidak ditemukan.");
        setPreviewLoading(false);
        return;
      }

      try {
        const response = await adminApi.getPasswordResetPreview(token);
        setPreview(response);
      } catch (error) {
        setError(extractApiError(error));
      } finally {
        setPreviewLoading(false);
      }
    };

    void loadPreview();
  }, [token]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password admin minimal 8 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi password belum sama.");
      return;
    }
    if (!totpCode && !recoveryCode) {
      setError("Isi kode authenticator atau recovery code.");
      return;
    }

    setLoading(true);
    try {
      const response = await adminApi.resetPassword({
        token,
        newPassword: password,
        totpCode,
        recoveryCode,
      });
      setSuccess(response.message);
      setPassword("");
      setConfirmPassword("");
      setTotpCode("");
      setRecoveryCode("");
    } catch (error) {
      setError(extractApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="surface w-full max-w-xl p-8 sm:p-10">
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
            <KeyRound className="h-8 w-8" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            Reset Password
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            Buat password admin baru
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">
            Gunakan link reset dari email, lalu verifikasi dengan kode
            authenticator atau recovery code.
          </p>
        </div>

        <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
          {previewLoading
            ? "Memeriksa link reset password..."
            : preview
              ? `Reset untuk ${preview.email}. Link ini berlaku sampai ${new Intl.DateTimeFormat("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(preview.expiresAt))}.`
              : "Link reset tidak valid atau sudah kadaluarsa."}
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password baru
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimal 8 karakter"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              required
              disabled={!preview || Boolean(success)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Konfirmasi password baru
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Ulangi password baru"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              required
              disabled={!preview || Boolean(success)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Kode authenticator
            </label>
            <input
              inputMode="numeric"
              value={totpCode}
              onChange={(event) =>
                setTotpCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="6 digit"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 tracking-[0.25em] outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              disabled={!preview || Boolean(success)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Recovery code
            </label>
            <input
              value={recoveryCode}
              onChange={(event) => setRecoveryCode(event.target.value.toUpperCase())}
              placeholder="Gunakan jika authenticator tidak tersedia"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 uppercase outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              disabled={!preview || Boolean(success)}
            />
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Isi salah satu: kode authenticator atau recovery code.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !preview || Boolean(success)}
            className="w-full rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Memperbarui password..." : "Simpan password baru"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          <Link
            href="/login"
            className="font-medium text-blue-600 underline decoration-blue-200 underline-offset-4"
          >
            Kembali ke login admin
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center px-4 py-10">
          <div className="surface w-full max-w-xl p-8 text-center text-sm text-slate-500">
            Menyiapkan halaman reset password...
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
