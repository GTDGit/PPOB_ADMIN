"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  ReceiptText,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { extractApiError } from "@/lib/api/client";
import { formatCurrency, formatNumber } from "@/lib/format";
import { useAuth } from "@/lib/auth/AuthProvider";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Panel } from "@/components/admin/Panel";
import { AdminTable, type TableColumn } from "@/components/admin/AdminTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { AdminDashboardSummary, GenericRecord } from "@/lib/types";

export default function DashboardPage() {
  const { hasPermission } = useAuth();
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<GenericRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [summaryData, transactions] = await Promise.all([
          adminApi.getDashboardSummary(),
          hasPermission("transactions.view")
            ? adminApi.listTransactions("", "all", 1, 5)
            : Promise.resolve({ items: [], page: 1, perPage: 5, total: 0, hasNext: false }),
        ]);

        setSummary(summaryData);
        setRecentTransactions(transactions.items);
      } catch (error) {
        setError(extractApiError(error));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [hasPermission]);

  const columns = useMemo<TableColumn<GenericRecord>[]>(
    () => [
      {
        key: "id",
        header: "Transaksi",
        render: (row) => (
          <div>
            <p className="font-semibold text-slate-900">{String(row.id || "-")}</p>
            <p className="mt-1 text-xs text-slate-500">
              {String(row.product_name || row.type || "-")}
            </p>
          </div>
        ),
      },
      {
        key: "user",
        header: "Pelanggan",
        render: (row) => (
          <div>
            <p className="font-medium text-slate-900">{String(row.user_name || "-")}</p>
            <p className="mt-1 text-xs text-slate-500">
              {String(row.user_phone || "-")}
            </p>
          </div>
        ),
      },
      {
        key: "amount",
        header: "Nilai",
        render: (row) => formatCurrency(row.total_payment as number),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge value={String(row.status || "")} />,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Ringkasan operasional"
        description="Pantau performa harian, antrian approval, dan aktivitas transaksi dari seluruh kanal PPOB.ID."
      />

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total pelanggan"
          value={loading || !summary ? "..." : formatNumber(summary.totalUsers)}
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard
          label="Admin aktif"
          value={loading || !summary ? "..." : formatNumber(summary.activeAdmins)}
          icon={<ShieldCheck className="h-6 w-6" />}
        />
        <StatCard
          label="Transaksi hari ini"
          value={loading || !summary ? "..." : formatNumber(summary.transactionsToday)}
          icon={<ReceiptText className="h-6 w-6" />}
        />
        <StatCard
          label="Deposit pending"
          value={loading || !summary ? "..." : formatNumber(summary.depositsPending)}
          icon={<Wallet className="h-6 w-6" />}
        />
        <StatCard
          label="KYC pending"
          value={loading || !summary ? "..." : formatNumber(summary.pendingKYC)}
          icon={<CreditCard className="h-6 w-6" />}
        />
        <StatCard
          label="Approval pending"
          value={loading || !summary ? "..." : formatNumber(summary.pendingApprovals)}
          icon={<ShieldCheck className="h-6 w-6" />}
        />
        <StatCard
          label="Revenue hari ini"
          value={loading || !summary ? "..." : formatCurrency(summary.revenueToday)}
          icon={<ReceiptText className="h-6 w-6" />}
        />
        <StatCard
          label="Nominal deposit hari ini"
          value={loading || !summary ? "..." : formatCurrency(summary.depositAmountToday)}
          icon={<Wallet className="h-6 w-6" />}
        />
      </div>

      <Panel
        title="Transaksi terbaru"
        description="Cuplikan transaksi terbaru untuk monitoring operasional harian."
      >
        <AdminTable
          columns={columns}
          rows={recentTransactions}
          emptyLabel="Belum ada transaksi yang bisa ditampilkan."
        />
      </Panel>
    </div>
  );
}
