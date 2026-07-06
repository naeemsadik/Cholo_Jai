"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

interface AdminGateProps {
  children: React.ReactNode;
}

export function AdminGate({ children }: AdminGateProps) {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const token = sessionStorage.getItem("cj_admin_token");
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-ink-500 font-mono uppercase tracking-wider">Checking session…</p>
      </div>
    );
  }

  return <>{children}</>;
}