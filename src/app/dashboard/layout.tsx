"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/lib/auth/ProtectedRoute";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="admin-shell-bg soft-grid flex min-h-screen">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="flex min-h-screen flex-1 flex-col">
          <Navbar onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 px-4 py-4 sm:px-5 sm:py-5 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-[1580px]">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
