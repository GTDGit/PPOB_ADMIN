"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { BellDot, ShieldCheck } from "lucide-react";
import { titleCase } from "@/lib/format";
import { useAuth } from "@/lib/auth/AuthProvider";

const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  admins: "Manajemen Admin",
  roles: "Role & Permissions",
  customers: "Pelanggan",
  transactions: "Transaksi",
  deposits: "Deposits",
  qris: "QRIS",
  vouchers: "Voucher",
  catalog: "Produk & Layanan",
  pricing: "Pricing",
  kyc: "KYC",
  content: "Konten & Notifikasi",
  approvals: "Approval Queue",
  "audit-logs": "Audit Logs",
  "reference-data": "Reference Data",
  settings: "Pengaturan",
};

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const title = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const leaf = segments[segments.length - 1];
    return labelMap[leaf] || titleCase(leaf || "dashboard");
  }, [pathname]);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <div>
          <p className="text-sm font-medium text-blue-600">PPOB.ID Console</p>
          <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 md:flex md:items-center md:gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span>{(user?.roles || []).join(", ") || "Admin"}</span>
          </div>
          <button className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-500 transition hover:border-blue-200 hover:text-blue-600">
            <BellDot className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
