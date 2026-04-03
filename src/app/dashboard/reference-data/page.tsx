"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { extractApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { PageHeader } from "@/components/admin/PageHeader";
import { Panel } from "@/components/admin/Panel";
import { PermissionFallback } from "@/components/admin/PermissionFallback";
import type { GenericRecord } from "@/lib/types";

export default function ReferenceDataPage() {
  const { hasPermission } = useAuth();
  const [data, setData] = useState<Record<string, GenericRecord[]>>({});
  const [error, setError] = useState("");

  const canView = hasPermission("reference.view");

  useEffect(() => {
    if (!canView) return;
    const load = async () => {
      try {
        const response = await adminApi.listReferenceData();
        setData(response);
      } catch (error) {
        setError(extractApiError(error));
      }
    };
    void load();
  }, [canView]);

  if (!canView) return <PermissionFallback />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Reference" title="Reference data" description="Snapshot data referensi backend seperti operator, bank, e-wallet, dan provider TV." />
      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      <div className="grid gap-6 lg:grid-cols-2">
        {Object.entries(data).map(([key, items]) => (
          <Panel key={key} title={key} description={`Total ${items.length} data`}>
            <div className="space-y-3">
              {items.slice(0, 10).map((item, index) => (
                <div key={`${key}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="font-medium text-slate-900">{String(item.name || item.short_name || item.code || item.id || "-")}</p>
                  <p className="mt-1 text-xs text-slate-500">{String(item.status || item.code || item.value || "-")}</p>
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
