"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { extractApiError } from "@/lib/api/client";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/lib/auth/AuthProvider";
import { PageHeader } from "@/components/admin/PageHeader";
import { Panel } from "@/components/admin/Panel";
import { PermissionFallback } from "@/components/admin/PermissionFallback";
import type { GenericRecord } from "@/lib/types";

export default function PricingPage() {
  const { hasAnyPermission } = useAuth();
  const [products, setProducts] = useState<GenericRecord[]>([]);
  const [productId, setProductId] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newAdminFee, setNewAdminFee] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canView = hasAnyPermission(["pricing.request", "pricing.approve"]);

  useEffect(() => {
    if (!canView) return;
    const load = async () => {
      try {
        const response = await adminApi.getCatalog("", 1, 50);
        setProducts(response.products.items);
        setProductId(String(response.products.items[0]?.id || ""));
      } catch (error) {
        setError(extractApiError(error));
      }
    };
    void load();
  }, [canView]);

  if (!canView) return <PermissionFallback />;

  const selected = products.find((item) => String(item.id) === productId);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    try {
      await adminApi.createPricingRequest({
        productId,
        newPrice: Number(newPrice),
        newAdminFee: Number(newAdminFee || 0),
        reason,
      });
      setSuccess("Request perubahan pricing berhasil dibuat dan masuk approval queue.");
      setNewPrice("");
      setNewAdminFee("");
      setReason("");
    } catch (error) {
      setError(extractApiError(error));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pricing"
        title="Request perubahan pricing"
        description="Perubahan harga jual tidak langsung diterapkan. Semua perubahan akan masuk approval queue."
      />
      {error ? <div className="admin-note-error">{error}</div> : null}
      {success ? <div className="admin-note-success">{success}</div> : null}
      <Panel title="Buat request pricing" description="Pilih produk, isi harga baru, lalu jelaskan alasan perubahan.">
        <form className="grid gap-4 lg:grid-cols-2" onSubmit={submit}>
          <select value={productId} onChange={(e) => setProductId(e.target.value)} className="admin-input" required>
            {products.map((product) => (
              <option key={String(product.id)} value={String(product.id)}>
                {String(product.name || "-")}
              </option>
            ))}
          </select>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Harga saat ini: <span className="font-semibold text-slate-900">{formatCurrency(selected?.price as number)}</span> Â· Admin fee: <span className="font-semibold text-slate-900">{formatCurrency(selected?.admin_fee as number)}</span>
          </div>
          <input value={newPrice} onChange={(e) => setNewPrice(e.target.value)} type="number" placeholder="Harga baru" className="admin-input" required />
          <input value={newAdminFee} onChange={(e) => setNewAdminFee(e.target.value)} type="number" placeholder="Admin fee baru" className="admin-input" />
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Alasan perubahan pricing" className="admin-textarea lg:col-span-2" rows={4} required />
          <div className="lg:col-span-2">
            <button className="admin-button-primary">Kirim request pricing</button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
