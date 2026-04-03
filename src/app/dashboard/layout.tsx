"use client";

import { ProtectedRoute } from "@/lib/auth/ProtectedRoute";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Navbar />
          <main className="flex-1 px-5 py-5 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
