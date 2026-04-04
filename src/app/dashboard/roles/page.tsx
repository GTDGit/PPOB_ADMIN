"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { extractApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { PageHeader } from "@/components/admin/PageHeader";
import { Panel } from "@/components/admin/Panel";
import { PermissionFallback } from "@/components/admin/PermissionFallback";
import type { AdminPermission, AdminRole } from "@/lib/types";

export default function RolesPage() {
  const { hasPermission } = useAuth();
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasPermission("roles.view")) return;

    const load = async () => {
      try {
        const [roleList, permissionList] = await Promise.all([
          adminApi.listRoles(),
          adminApi.listPermissions(),
        ]);
        setRoles(roleList);
        setPermissions(permissionList);
      } catch (error) {
        setError(extractApiError(error));
      }
    };

    void load();
  }, [hasPermission]);

  if (!hasPermission("roles.view")) {
    return <PermissionFallback />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="RBAC"
        title="Role & permission matrix"
        description="Role default dan permission yang dipakai untuk membatasi akses operasional admin."
      />

      {error ? (
        <div className="admin-note-error">
          {error}
        </div>
      ) : null}

      <Panel title="Role admin" description="Role sistem yang tersedia di phase 1 admin console.">
        <div className="grid gap-4 lg:grid-cols-2">
          {roles.map((role) => (
            <div
              key={role.id}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
            >
              <h3 className="text-lg font-semibold text-slate-950">{role.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {role.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {role.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Daftar permission" description="Permission key yang dipakai untuk sidebar, endpoint, dan guard aksi.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {permissions.map((permission) => (
            <div
              key={permission.key}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                {permission.module}
              </p>
              <p className="mt-2 font-semibold text-slate-950">{permission.key}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {permission.description || permission.action}
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
