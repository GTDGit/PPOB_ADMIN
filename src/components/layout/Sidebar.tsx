"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenCheck,
  Boxes,
  Briefcase,
  CreditCard,
  FileStack,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  Megaphone,
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
import { prettifyResourceLabel } from "@/lib/format";
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
        label: "Antrian Persetujuan",
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
        label: "Posisi",
        href: "/dashboard/positions",
        permission: "admins.view",
        icon: Briefcase,
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
        label: "Deposit",
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
      {
        label: "Inbox",
        href: "/dashboard/inbox",
        permissions: ["mailboxes.view_assigned", "mailboxes.view_all"],
        icon: Inbox,
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
        label: "Data Referensi",
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
      {
        label: "Mailboxes",
        href: "/dashboard/mailboxes",
        permission: "mailboxes.manage",
        icon: Mail,
      },
      {
        label: "Email Logs",
        href: "/dashboard/email-logs",
        permission: "email_logs.view",
        icon: FileStack,
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
    <div className="flex h-full flex-col bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,251,255,0.98)_100%)] text-slate-900">
      <div className="border-b border-slate-200/80 px-5 py-5">
        <div className="flex items-center justify-between gap-3 lg:justify-start">
          <AdminBrand size="sm" subtitle="Console Admin" compact />
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="border-b border-slate-200/80 px-5 py-4">
        <div className="rounded-3xl border border-blue-100 bg-[linear-gradient(180deg,#eff6ff,#ffffff)] px-4 py-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-950">
            {user?.fullName || user?.email}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {(user?.roles || []).map((role) => prettifyResourceLabel(role)).join(", ") || "Admin"}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {visibleSections.map((section) => (
          <div key={section.section}>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
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
                        ? "bg-[linear-gradient(135deg,#2563eb,#1d4ed8)] text-white shadow-[0_18px_38px_rgba(37,99,235,0.24)]"
                        : "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-2xl transition",
                        isActive
                          ? "bg-white/14"
                          : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-blue-600",
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

      <div className="border-t border-slate-200/80 p-4">
        <div className="mb-3 rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <p className="text-sm font-semibold text-slate-950">Operasional internal</p>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Gunakan console ini untuk monitoring, approval, dan kontrol layanan PPOB.ID.
          </p>
        </div>
        <button
          onClick={() => void logout()}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
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
