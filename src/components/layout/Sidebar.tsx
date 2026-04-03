"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenCheck,
  Boxes,
  CreditCard,
  FileStack,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  QrCode,
  ReceiptText,
  Scale,
  Settings,
  ShieldCheck,
  Ticket,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthProvider";

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    permission: "dashboard.view",
    icon: LayoutDashboard,
  },
  {
    label: "Admin",
    href: "/dashboard/admins",
    permission: "admins.view",
    icon: ShieldCheck,
  },
  {
    label: "Role & Izin",
    href: "/dashboard/roles",
    permission: "roles.view",
    icon: BookOpenCheck,
  },
  {
    label: "Pelanggan",
    href: "/dashboard/customers",
    permission: "customers.view",
    icon: Users,
  },
  {
    label: "Transaksi",
    href: "/dashboard/transactions",
    permission: "transactions.view",
    icon: ReceiptText,
  },
  {
    label: "Deposits",
    href: "/dashboard/deposits",
    permission: "deposits.view",
    icon: Wallet,
  },
  {
    label: "QRIS",
    href: "/dashboard/qris",
    permission: "qris.view",
    icon: QrCode,
  },
  {
    label: "Voucher",
    href: "/dashboard/vouchers",
    permission: "vouchers.view",
    icon: Ticket,
  },
  {
    label: "Produk & Layanan",
    href: "/dashboard/catalog",
    permission: "catalog.view",
    icon: Boxes,
  },
  {
    label: "Pricing",
    href: "/dashboard/pricing",
    permissions: ["pricing.request", "pricing.approve"],
    icon: CreditCard,
  },
  {
    label: "KYC",
    href: "/dashboard/kyc",
    permission: "kyc.view",
    icon: LifeBuoy,
  },
  {
    label: "Konten & Notifikasi",
    href: "/dashboard/content",
    permissions: ["banners.view", "notifications.view"],
    icon: Megaphone,
  },
  {
    label: "Approval Queue",
    href: "/dashboard/approvals",
    permission: "approvals.view",
    icon: Scale,
  },
  {
    label: "Audit Log",
    href: "/dashboard/audit-logs",
    permission: "audit.view",
    icon: FileStack,
  },
  {
    label: "Reference Data",
    href: "/dashboard/reference-data",
    permission: "reference.view",
    icon: BookOpenCheck,
  },
  {
    label: "Pengaturan",
    href: "/dashboard/settings",
    permission: "settings.view",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { hasPermission, hasAnyPermission, logout, user } = useAuth();

  const visibleItems = navigation.filter((item) => {
    if (item.permission) {
      return hasPermission(item.permission);
    }
    return hasAnyPermission(item.permissions);
  });

  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-slate-950 text-white lg:flex lg:flex-col">
      <div className="border-b border-slate-800 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600/15 ring-1 ring-blue-500/30">
            <span className="text-lg font-semibold text-blue-300">P</span>
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-200/70">
              Console
            </p>
            <h1 className="text-xl font-semibold text-white">PPOB.ID Admin</h1>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-800 px-6 py-5">
        <p className="text-sm font-semibold text-white">
          {user?.fullName || user?.email}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {(user?.roles || []).join(", ") || "Admin"}
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-950/40"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <button
          onClick={() => void logout()}
          className="w-full rounded-2xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900 hover:text-white"
        >
          Keluar
        </button>
      </div>
    </aside>
  );
}
