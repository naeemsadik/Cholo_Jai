"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Inbox,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  ChevronsLeft,
  ChevronsRight,
  PanelLeft,
  Home,
  FileText,
} from "lucide-react";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "cj_admin_sidebar_collapsed";

type PrimaryNavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const PRIMARY_NAV: PrimaryNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/submissions", label: "Submissions", icon: Inbox },
  { href: "/admin/home", label: "Home page", icon: Home },
  { href: "/admin/cms", label: "CMS pages", icon: FileText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface AdminSidebarProps {
  /** Pending submissions count, shown as a badge on Submissions */
  pendingCount?: number;
  /** Override the className of the outer aside (for mobile sheet variants) */
  className?: string;
}

/**
 * The vertical sidebar — desktop fixed (240px expanded, 64px collapsed).
 * The mobile Sheet variant is rendered by AdminShell directly.
 */
export function AdminSidebar({ pendingCount = 0, className }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  // Restore collapse state from localStorage.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // localStorage may be disabled — ignore.
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // Ignore — best-effort persistence.
      }
      return next;
    });
  }

  function logout() {
    if (typeof window !== "undefined") sessionStorage.removeItem("cj_admin_token");
    router.push("/admin/login");
  }

  const width = collapsed ? "w-[64px]" : "w-[240px]";

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen flex-col border-r border-rule bg-paper transition-[width] duration-200",
        width,
        className,
      )}
      aria-label="Admin navigation"
    >
      {/* Brand */}
      <div className={cn(
        "flex items-center gap-2 border-b border-rule px-3",
        collapsed ? "h-16 justify-center" : "h-16 px-4",
      )}>
        <Logo />
        {!collapsed && (
          <span className="rounded-full bg-cream-200 px-2.5 py-0.5 text-[0.6rem] font-mono uppercase tracking-wider text-ink-700">
            Admin
          </span>
        )}
      </div>

      {/* Primary nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="flex flex-col gap-1">
          {PRIMARY_NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact
              ? pathname === href
              : pathname === href || pathname?.startsWith(`${href}/`);
            const badge =
              href === "/admin/submissions" && pendingCount > 0 ? pendingCount : null;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "group relative flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-cream-100 text-ink"
                      : "text-ink-500 hover:bg-cream-50 hover:text-ink",
                    collapsed && "justify-center px-0",
                  )}
                  title={collapsed ? label : undefined}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute left-0 top-1.5 h-7 w-[3px] rounded-r-full bg-ember-600"
                    />
                  )}
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="flex-1 truncate">{label}</span>}
                  {!collapsed && badge != null && (
                    <span className="rounded-full bg-ember px-1.5 py-0.5 text-[0.6rem] font-mono font-medium text-paper">
                      {badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {!collapsed && (
          <>
            <div className="mt-6 px-3 text-[0.6rem] font-mono uppercase tracking-wider text-ink-400">
              Quick links
            </div>
            <ul className="mt-2 flex flex-col gap-1">
              <li>
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 items-center gap-3 rounded-md px-3 text-sm text-ink-500 transition-colors hover:bg-cream-50 hover:text-ink"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View public site
                </a>
              </li>
            </ul>
          </>
        )}
      </nav>

      {/* User / logout block */}
      <div className={cn(
        "border-t border-rule px-3 py-3",
        collapsed && "flex flex-col items-center px-2",
      )}>
        {!collapsed && (
          <div className="mb-2 px-2 text-[0.65rem] font-mono uppercase tracking-wider text-ink-500">
            Signed in as admin
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className={cn("w-full", collapsed && "h-9 w-9 p-0")}
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sign out</span>}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapsed}
          className={cn("mt-1 w-full text-ink-400 hover:text-ink", collapsed && "h-9 w-9 p-0")}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}

/** Hamburger button — used by the mobile top bar to open the Sheet.
 *  Wrapped in forwardRef so it can be a Radix Slot child (SheetTrigger asChild)
 *  without React complaining about refs not being forwarded.
 */
export const SidebarToggleButton = React.forwardRef<
  HTMLButtonElement,
  { onClick?: () => void }
>(function SidebarToggleButton({ onClick }, ref) {
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label="Open navigation"
    >
      <PanelLeft className="h-5 w-5" />
    </Button>
  );
});