"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AdminSidebar, SidebarToggleButton } from "./admin-sidebar";
import { cn } from "@/lib/utils";

interface AdminShellProps {
  children: React.ReactNode;
  /** Optional badge count for the Submissions nav item */
  pendingSubmissions?: number;
}

/**
 * Admin layout shell — sidebar + content area.
 *
 * Desktop (lg+): collapsible sidebar (240px / 64px) beside a flexible content
 * area with generous horizontal padding.
 *
 * Mobile (<lg): sticky top bar with hamburger; sidebar lives in a Sheet.
 *
 * Both contexts share the AdminSectionHeader inside their inner content.
 */
export function AdminShell({ children, pendingSubmissions = 0 }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop layout — sidebar fixed, content scrolls */}
      <div className="hidden lg:flex">
        <AdminSidebar pendingCount={pendingSubmissions} />
        <main className="flex-1 min-w-0">
          <div className="mx-auto w-full max-w-[1440px] px-6 py-8 xl:px-10 xl:py-10">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile layout — top bar with hamburger, sidebar in a Sheet */}
      <MobileShell pendingSubmissions={pendingSubmissions}>{children}</MobileShell>
    </div>
  );
}

function MobileShell({
  children,
  pendingSubmissions,
}: {
  children: React.ReactNode;
  pendingSubmissions: number;
}) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Close the sheet whenever the route changes.
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="lg:hidden">
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-rule bg-paper px-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <SidebarToggleButton onClick={() => setOpen(true)} />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px]">
            <AdminSidebar pendingCount={pendingSubmissions} />
          </SheetContent>
        </Sheet>
        <div className="font-display text-lg font-semibold tracking-tight">
          {pageTitleFromPath(pathname)}
        </div>
      </div>
      <main className="px-4 py-6 sm:px-6">
        <div className="mx-auto w-full max-w-[1440px]">{children}</div>
      </main>
    </div>
  );
}

function pageTitleFromPath(pathname: string | null): string {
  if (!pathname) return "Admin";
  if (pathname === "/admin" || pathname === "/admin/") return "Dashboard";
  if (pathname.startsWith("/admin/events")) return "Events";
  if (pathname.startsWith("/admin/submissions")) return "Submissions";
  if (pathname.startsWith("/admin/home")) return "Home page";
  if (pathname.startsWith("/admin/cms")) return "CMS pages";
  if (pathname.startsWith("/admin/analytics")) return "Analytics";
  if (pathname.startsWith("/admin/settings")) return "Settings";
  return "Admin";
}

/**
 * In-page section header — preserved export from the original shell so all
 * existing sub-views keep working.
 */
export function AdminSectionHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 pb-2 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="mt-3 font-display text-display-sm tracking-tight">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
