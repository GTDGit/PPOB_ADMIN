"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyUsersPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/customers");
  }, [router]);

  return null;
}
