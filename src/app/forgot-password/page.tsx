"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { extractApiError } from "@/lib/api/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await adminApi.forgotPassword({ email });
      setSuccess(response.message);
    } catch (error) {
      setError(extractApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="surface w-full max-w-lg p-8 sm:p-10">
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
            <Mail className="h-8 w-8" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            Reset Password
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            Lupa password admin
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
            Masukkan email admin Anda. Jika terdaftar, kami akan mengirimkan
            link reset password ke email tersebut.
          </p>
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
              Email admin
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="riko@gtd.co.id"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Mengirim link reset..." : "Kirim link reset"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Sudah ingat password?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 underline decoration-blue-200 underline-offset-4"
          >
            Kembali ke login
          </Link>
        </div>
      </div>
    </div>
  );
}
