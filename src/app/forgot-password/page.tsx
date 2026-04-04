"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminAuthShell } from "@/components/auth/AdminAuthShell";
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
    <AdminAuthShell
      badge="Reset Password"
      title="Lupa password admin"
      description="Masukkan email admin Anda. Jika terdaftar, kami akan mengirimkan link reset password ke email tersebut."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error ? <div className="admin-note-error">{error}</div> : null}
        {success ? <div className="admin-note-success">{success}</div> : null}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Email admin
          </label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="riko@gtd.co.id"
            className="admin-input"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="admin-button-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
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
    </AdminAuthShell>
  );
}
