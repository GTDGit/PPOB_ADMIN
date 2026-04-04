"use client";

import { useEffect, useMemo, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { extractApiError } from "@/lib/api/client";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/lib/auth/AuthProvider";
import { PageHeader } from "@/components/admin/PageHeader";
import { Panel } from "@/components/admin/Panel";
import { AdminTable, type TableColumn } from "@/components/admin/AdminTable";
import { Pagination } from "@/components/admin/Pagination";
import { PermissionFallback } from "@/components/admin/PermissionFallback";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { GenericRecord, PaginatedResponse } from "@/lib/types";

export default function CatalogPage() {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [services, setServices] = useState<GenericRecord[]>([]);
  const [products, setProducts] = useState<PaginatedResponse<GenericRecord> | null>(null);
  const [error, setError] = useState("");

  const canView = hasPermission("catalog.view");

  const load = async () => {
    try {
      const response = await adminApi.getCatalog(search, page, 20);
      setServices(response.services);
      setProducts(response.products);
    } catch (error) {
      setError(extractApiError(error));
    }
  };

  useEffect(() => {
    if (!canView) return;
    void load();
  }, [canView, page]);

  const columns = useMemo<TableColumn<GenericRecord>[]>(
    () => [
      {
        key: "product",
        header: "Produk",
        render: (row) => (
          <div>
            <p className="font-semibold text-slate-900">{String(row.name || "-")}</p>
            <p className="mt-1 text-xs text-slate-500">
              {String(row.service_type || "-")} Â· {String(row.category || "-")}
            </p>
          </div>
        ),
      },
      {
        key: "nominal",
        header: "Nominal",
        render: (row) => formatCurrency(row.nominal as number),
      },
      {
        key: "price",
        header: "Harga jual",
        render: (row) => (
          <div>
            <p className="font-medium text-slate-900">{formatCurrency(row.price as number)}</p>
            <p className="mt-1 text-xs text-slate-500">
              Admin fee {formatCurrency(row.admin_fee as number)}
            </p>
          </div>
        ),
      },
      {
        key: "stock",
        header: "Stock",
        render: (row) => String(row.stock ?? "-"),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge value={String(row.status || "")} />,
      },
    ],
    [],
  );

  if (!canView) return <PermissionFallback />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Produk & layanan"
        description="Pantau layanan utama dan produk PPOB yang sedang aktif di sistem."
      />
      {error ? <div className="admin-note-error">{error}</div> : null}
      <Panel title="Layanan utama" description="Service master yang dipakai oleh mobile app dan transaksi backend.">
        <div className="flex flex-wrap gap-3">
          {services.map((service) => (
            <div key={String(service.id)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="font-semibold text-slate-900">{String(service.name || "-")}</p>
              <p className="mt-1 text-xs text-slate-500">{String(service.category_name || "-")}</p>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Produk" description="Produk yang bisa dicari dan menjadi dasar request pricing change.">
        <form className="mb-5 flex flex-col gap-3 sm:flex-row" onSubmit={(e) => { e.preventDefault(); setPage(1); void load(); }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari produk..." className="admin-input" />
          <button className="admin-button-primary">Cari</button>
        </form>
        <AdminTable columns={columns} rows={products?.items || []} />
        <Pagination page={products?.page || page} hasNext={Boolean(products?.hasNext)} onPrevious={() => setPage((current) => Math.max(1, current - 1))} onNext={() => setPage((current) => current + 1)} />
      </Panel>
    </div>
  );
}
