"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { useSearchParams, useRouter } from "next/navigation";
import { adminApi } from "@/lib/api/admin";
import { useAuth, useAuthErrorMessage } from "@/lib/auth/AuthProvider";
import { APP_URL, TOTP_ISSUER } from "@/lib/config";
import { formatDateTime } from "@/lib/format";
import type { AdminInviteAcceptPayload, AdminInvitePreview } from "@/lib/types";

function ActivatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { completeActivation } = useAuth();

  const [preview, setPreview] = useState<AdminInvitePreview | null>(null);
  const [activation, setActivation] = useState<AdminInviteAcceptPayload | null>(null);
  const [qrCode, setQrCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const headerTitle = useMemo(
    () => (activation ? "Aktifkan Authenticator" : "Aktivasi Admin"),
    [activation],
  );

  useEffect(() => {
    if (!token) {
      setError("Token undangan admin tidak ditemukan.");
      setLoading(false);
      return;
    }

    const loadPreview = async () => {
      setLoading(true);
      try {
        const response = await adminApi.getInvitePreview(token);
        setPreview(response);
        setFullName(response.fullName || "");
      } catch (error) {
        setError(useAuthErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    void loadPreview();
  }, [token]);

  useEffect(() => {
    if (!activation?.otpauthUrl) return;

    void QRCode.toDataURL(activation.otpauthUrl, {
      margin: 0,
      width: 220,
      color: {
        dark: "#1d4ed8",
        light: "#FFFFFF",
      },
    }).then(setQrCode);
  }, [activation]);

  const handleCreateCredentials = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await adminApi.acceptInvite({
        token,
        fullName,
        password,
      });
      setActivation(response);
    } catch (error) {
      setError(useAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setConfirming(true);

    try {
      const response = await adminApi.confirmInviteTOTP({ token, code: totpCode });
      completeActivation(response);
      router.replace("/dashboard");
    } catch (error) {
      setError(useAuthErrorMessage(error));
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="surface w-full max-w-3xl p-8 sm:p-10">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            PPOB.ID Admin
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            {headerTitle}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Undangan admin akan mengaktifkan akun operasional Anda untuk
            console internal PPOB.ID.
          </p>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-8 rounded-3xl bg-slate-50 px-6 py-16 text-center text-sm text-slate-500">
            Memuat data undangan admin...
          </div>
        ) : null}

        {!loading && preview && !activation ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-950">
                Detail undangan
              </h2>
              <dl className="mt-5 space-y-4 text-sm text-slate-600">
                <div>
                  <dt className="font-medium text-slate-500">Email</dt>
                  <dd className="mt-1 text-slate-900">{preview.email}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Nomor HP</dt>
                  <dd className="mt-1 text-slate-900">{preview.phone}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Role</dt>
                  <dd className="mt-1 text-slate-900">{preview.roleName}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Batas aktivasi</dt>
                  <dd className="mt-1 text-slate-900">
                    {formatDateTime(preview.expiresAt)}
                  </dd>
                </div>
              </dl>
            </div>

            <form className="space-y-5" onSubmit={handleCreateCredentials}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nama lengkap
                </label>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password admin
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Menyiapkan authenticator..." : "Lanjut setup authenticator"}
              </button>
            </form>
          </div>
        ) : null}

        {!loading && activation ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-950">
                Scan QR code
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Scan dengan Google Authenticator, Microsoft Authenticator, atau
                aplikasi TOTP lain. Issuer yang dipakai: {TOTP_ISSUER}.
              </p>

              <div className="mt-5 flex justify-center rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                {qrCode ? (
                  <Image
                    src={qrCode}
                    alt="QR code admin authenticator"
                    width={220}
                    height={220}
                    unoptimized
                  />
                ) : (
                  <div className="flex h-[220px] w-[220px] items-center justify-center text-sm text-slate-500">
                    Menyiapkan QR...
                  </div>
                )}
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
                <p className="font-medium text-slate-700">Secret key</p>
                <p className="mt-2 break-all font-mono text-slate-900">
                  {activation.secret}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-slate-950">
                  Recovery codes
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Simpan recovery code ini di tempat aman. Setiap kode hanya
                  bisa dipakai sekali jika perangkat authenticator hilang.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {activation.recoveryCodes.map((code) => (
                    <div
                      key={code}
                      className="rounded-2xl bg-slate-50 px-4 py-3 text-center font-mono text-sm font-semibold tracking-[0.18em] text-slate-900"
                    >
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <form
                className="rounded-3xl border border-slate-200 bg-white p-6"
                onSubmit={handleConfirm}
              >
                <h2 className="text-lg font-semibold text-slate-950">
                  Konfirmasi authenticator
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Masukkan 6 digit kode yang muncul di aplikasi authenticator
                  Anda untuk mengaktifkan akun admin.
                </p>
                <input
                  inputMode="numeric"
                  value={totpCode}
                  onChange={(event) =>
                    setTotpCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="6 digit"
                  className="mt-5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 tracking-[0.35em] outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  required
                />
                <button
                  type="submit"
                  disabled={confirming}
                  className="mt-5 w-full rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {confirming ? "Mengaktifkan akun admin..." : "Aktifkan console admin"}
                </button>

                <p className="mt-4 text-xs leading-6 text-slate-500">
                  Jika QR code tidak terbaca, Anda tetap bisa menambahkan akun
                  secara manual menggunakan secret key atau URL otpauth berikut:
                </p>
                <a
                  href={activation.otpauthUrl}
                  className="mt-2 block break-all text-xs text-blue-600 underline decoration-blue-200 underline-offset-4"
                >
                  {activation.otpauthUrl}
                </a>
              </form>
            </div>
          </div>
        ) : null}

        <p className="mt-8 text-center text-xs leading-6 text-slate-500">
          Jika undangan admin bermasalah, minta Super Admin membuat invite baru
          dari {APP_URL}.
        </p>
      </div>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center px-4 py-10">
          <div className="surface w-full max-w-3xl p-8 text-center text-sm text-slate-500">
            Memuat aktivasi admin...
          </div>
        </div>
      }
    >
      <ActivatePageContent />
    </Suspense>
  );
}
