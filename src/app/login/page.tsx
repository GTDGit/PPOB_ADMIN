"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminAuthShell } from "@/components/auth/AdminAuthShell";
import { useAuth, useAuthErrorMessage } from "@/lib/auth/AuthProvider";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = useMemo(() => searchParams.get("next") || "/dashboard", [searchParams]);
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ email, password, totpCode });
      router.replace(nextUrl);
    } catch (error) {
      setError(useAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthShell
      badge="Masuk Admin"
      title="Masuk ke console PPOB.ID"
      description="Gunakan email admin, password, dan kode authenticator untuk mengakses modul operasional internal."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email admin
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@ppob.id"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              required
            />
          </div>

          <div className="md:col-span-2">
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-blue-600 underline decoration-blue-200 underline-offset-4"
              >
                Lupa password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Masukkan password admin"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              required
            />
          </div>

          <div className="md:col-span-2">
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
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 tracking-[0.35em] outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Memeriksa akun admin..." : "Masuk ke console"}
        </button>
      </form>

      <div className="auth-muted-card mt-6 px-5 py-4 text-sm leading-6 text-slate-600">
        Aktivasi admin dilakukan lewat email undangan. Jika akun Anda belum aktif,
        buka link invite dari Super Admin lalu setup password dan authenticator.
      </div>
    </AdminAuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="admin-auth-shell flex min-h-screen items-center justify-center px-4 py-10">
          <div className="auth-card w-full max-w-lg p-8 text-center text-sm text-slate-500">
            Menyiapkan form login admin...
          </div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
