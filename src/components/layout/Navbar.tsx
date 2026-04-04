"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { BellDot, Menu, ShieldCheck } from "lucide-react";
import { prettifyResourceLabel, titleCase } from "@/lib/format";
import { useAuth } from "@/lib/auth/AuthProvider";

const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  admins: "Manajemen Admin",
  roles: "Role & Permissions",
  customers: "Pelanggan",
  transactions: "Transaksi",
  deposits: "Deposit",
  qris: "QRIS",
  vouchers: "Voucher",
  catalog: "Produk & Layanan",
  pricing: "Pricing",
  kyc: "KYC",
  content: "Konten & Notifikasi",
  approvals: "Antrian Persetujuan",
  "audit-logs": "Audit Log",
  "reference-data": "Data Referensi",
  settings: "Pengaturan",
};

const descriptionMap: Record<string, string> = {
  dashboard: "Pantau ringkasan harian dan aktivitas operasional terbaru.",
  admins: "Kelola akun admin, sesi aktif, dan status akses internal.",
  roles: "Atur role, permission, dan cakupan akses tiap tim.",
  customers: "Cari dan telaah profil pelanggan beserta aktivitas mereka.",
  transactions: "Monitor transaksi masuk, status proses, dan tindak lanjut.",
  deposits: "Verifikasi deposit, pantau nominal, dan proses persetujuan.",
  qris: "Lihat performa QRIS, status pembayaran, dan histori terbaru.",
  vouchers: "Kelola voucher aktif, masa berlaku, dan penggunaan promo.",
  catalog: "Pantau produk, layanan, dan konfigurasi operasional katalog.",
  pricing: "Tinjau pengajuan harga dan persetujuan perubahan margin.",
  kyc: "Review dokumen verifikasi dan tindak lanjut kepatuhan pengguna.",
  content: "Atur banner, notifikasi, dan konten informasi operasional.",
  approvals: "Pantau seluruh antrian persetujuan lintas modul dan tim.",
  "audit-logs": "Telusuri aktivitas admin, perubahan data, dan jejak aksi.",
  "reference-data": "Kelola data referensi yang dipakai modul operasional.",
  settings: "Atur pengaturan global console, keamanan, dan preferensi.",
};

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const { title, description } = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const leaf = segments[segments.length - 1];
    return {
      title: labelMap[leaf] || titleCase(leaf || "dashboard"),
      description:
        descriptionMap[leaf] || "Kelola operasional internal PPOB.ID dengan akses sesuai role.",
    };
  }, [pathname]);

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      }).format(new Date()),
    [],
  );
  const roleLabel = useMemo(
    () =>
      (user?.roles || []).length > 0
        ? (user?.roles || []).map((role) => prettifyResourceLabel(role)).join(" · ")
        : "Admin",
    [user?.roles],
  );

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/88 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-5 lg:px-8">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-sm font-medium text-blue-600">PPOB.ID Console Admin</p>
            <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-2xl border border-blue-100 bg-blue-50/80 px-4 py-2 text-sm text-blue-700 md:flex md:items-center md:gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Online</span>
          </div>
          <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 lg:block">
            {todayLabel}
          </div>
          <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 md:flex md:items-center md:gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span>{roleLabel}</span>
          </div>
          <button className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-500 shadow-sm transition hover:border-blue-200 hover:text-blue-600">
            <BellDot className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
