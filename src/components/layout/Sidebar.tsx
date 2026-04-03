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
  Menu,
  QrCode,
  ReceiptText,
  Scale,
  Settings,
  ShieldCheck,
  Ticket,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { AdminBrand } from "@/components/layout/AdminBrand";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthProvider";

const navigation = [
  {
    section: "Ringkasan",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        permission: "dashboard.view",
        icon: LayoutDashboard,
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
    ],
  },
  {
    section: "Operasional",
    items: [
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
        label: "KYC",
        href: "/dashboard/kyc",
        permission: "kyc.view",
        icon: LifeBuoy,
      },
    ],
  },
  {
    section: "Produk & Kontrol",
    items: [
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
        label: "Konten & Notifikasi",
        href: "/dashboard/content",
        permissions: ["banners.view", "notifications.view"],
        icon: Megaphone,
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
    ],
  },
];

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { hasPermission, hasAnyPermission, logout, user } = useAuth();

  const visibleSections = navigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if ("permission" in item && item.permission) {
          return hasPermission(item.permission);
        }
        return hasAnyPermission(item.permissions);
      }),
    }))
    .filter((section) => section.items.length > 0);

  const SidebarContent = (
    <div className="flex h-full flex-col bg-[linear-gradient(180deg,#07122b_0%,#0e1a35_38%,#111827_100%)] text-white">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center justify-between gap-3 lg:justify-start">
          <AdminBrand size="sm" dark subtitle="Console Admin" />
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-300 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="border-b border-white/10 px-5 py-4">
        <div className="rounded-3xl border border-white/10 bg-white/6 px-4 py-4 backdrop-blur-sm">
          <p className="text-sm font-semibold text-white">
            {user?.fullName || user?.email}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-300">
            {(user?.roles || []).join(", ") || "Admin"}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {visibleSections.map((section) => (
          <div key={section.section}>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-100/55">
              {section.section}
            </p>
            <div className="mt-3 space-y-1.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium transition",
                      isActive
                        ? "bg-blue-600 text-white shadow-[0_18px_38px_rgba(29,78,216,0.34)]"
                        : "text-slate-300 hover:bg-white/8 hover:text-white",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-2xl transition",
                        isActive ? "bg-white/14" : "bg-white/6 group-hover:bg-white/10",
                      )}
                    >
                      <item.icon className="h-4.5 w-4.5" />
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 rounded-3xl border border-white/10 bg-white/6 px-4 py-4">
          <p className="text-sm font-semibold text-white">Operasional internal</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">
            Gunakan console ini untuk monitoring, approval, dan kontrol layanan PPOB.ID.
          </p>
        </div>
        <button
          onClick={() => void logout()}
          className="w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/10"
        >
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-[304px] shrink-0 border-r border-slate-200/70 lg:flex lg:flex-col">
        {SidebarContent}
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition lg:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[86vw] max-w-[320px] -translate-x-full transition-transform duration-300 ease-out lg:hidden",
          mobileOpen && "translate-x-0",
        )}
      >
        {SidebarContent}
      </aside>
    </>
  );
}
