"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { BookOpen, Bell, LogOut, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface PortalNotification {
  id: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export function PortalShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active: string;
}) {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/portal/notifications")
        .then((r) => r.json())
        .then((d) => setNotifications(d.notifications ?? []))
        .catch(() => {});
    }
  }, [status]);

  const unread = notifications.filter((n) => !n.read).length;

  async function markAllRead() {
    await fetch("/api/portal/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
  }

  const role = session?.user?.role as string | undefined;
  const roleLabel =
    role === "TEACHER" ? "Teacher Portal" : role === "PARENT" ? "Parent Portal" : role === "ADMIN" ? "Admin" : "My Learning";

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading portal" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <BookOpen className="h-10 w-10 text-primary" aria-hidden />
        <h1 className="font-serif text-xl font-bold">Please sign in</h1>
        <p className="text-sm text-muted-foreground">
          The portal is for enrolled families, teachers and admins.
        </p>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/login?callbackUrl=/portal">Sign in</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const tabs: { id: string; label: string }[] = [];
  if (role === "TEACHER") {
    tabs.push({ id: "students", label: "My Students" });
    tabs.push({ id: "revisions", label: "Revision Queue" });
  } else if (role === "PARENT") {
    tabs.push({ id: "children", label: "My Children" });
    tabs.push({ id: "invoices", label: "Invoices" });
  } else if (role === "ADMIN") {
    tabs.push({ id: "overview", label: "Overview" });
    tabs.push({ id: "enrollments", label: "Enrollments" });
    tabs.push({ id: "students", label: "Students" });
    tabs.push({ id: "teachers", label: "Teachers" });
    tabs.push({ id: "content", label: "Content Library" });
    tabs.push({ id: "invoices", label: "Payments" });
    tabs.push({ id: "audit", label: "Audit Log" });
  } else {
    tabs.push({ id: "today", label: "Today's Learning" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5" aria-label="Home">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BookOpen className="h-5 w-5" aria-hidden />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="font-serif text-sm font-bold">Irshad-e-Madina</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {roleLabel}
                </span>
              </span>
            </Link>
          </div>

          {/* Desktop tabs */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Portal sections">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  window.location.hash = t.id;
                }}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                  active === t.id && "bg-secondary text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <span className="hidden text-xs text-muted-foreground sm:block">
              {session?.user?.name}
            </span>
            <Sheet open={notifOpen} onOpenChange={setNotifOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                  {unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                      {unread}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0 sm:w-96">
                <SheetTitle className="border-b border-border px-4 py-3 text-base">
                  Notifications
                  {unread > 0 && (
                    <button
                      onClick={markAllRead}
                      className="ms-2 text-xs font-normal text-primary hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </SheetTitle>
                <ScrollArea className="h-[calc(100%-3rem)]">
                  <div className="p-2">
                    {notifications.length === 0 && (
                      <p className="p-4 text-center text-sm text-muted-foreground">
                        No notifications yet.
                      </p>
                    )}
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          "rounded-lg p-3",
                          !n.read && "bg-secondary"
                        )}
                      >
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {new Date(n.createdAt).toLocaleString("en-GB", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: "/" })}
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile tabs */}
        <nav className="flex gap-1 overflow-x-auto border-t border-border/60 px-2 py-1.5 lg:hidden" aria-label="Portal sections mobile">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                window.location.hash = t.id;
              }}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary",
                active === t.id && "bg-secondary text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">{children}</main>

      <footer className="border-t border-border/60 bg-background py-3 text-center text-xs text-muted-foreground">
        Madrasah Irshad-e-Madina · The teacher stays at the centre ·{" "}
        <Link href="/" className="hover:text-foreground">
          Public site
        </Link>
      </footer>
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div>
        <h2 className="font-serif text-xl font-bold">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    ASSIGNED: { label: "Assigned", className: "bg-emerald-600/10 text-emerald-700 border-emerald-600/30" },
    PRACTICING: { label: "Practicing", className: "bg-emerald-600/10 text-emerald-700 border-emerald-600/30" },
    READY_FOR_REVIEW: { label: "Ready for Review", className: "bg-amber-500/10 text-amber-700 border-amber-500/30" },
    NEEDS_IMPROVEMENT: { label: "Needs Improvement", className: "bg-amber-500/10 text-amber-700 border-amber-500/30" },
    PASSED: { label: "Passed", className: "bg-emerald-700/10 text-emerald-800 border-emerald-700/30" },
    MASTERED: { label: "Mastered", className: "bg-emerald-800/15 text-emerald-900 border-emerald-800/40" },
    PENDING: { label: "Pending", className: "bg-neutral-500/10 text-neutral-700 border-neutral-500/30" },
    DONE: { label: "Done", className: "bg-emerald-600/10 text-emerald-700 border-emerald-600/30" },
    SKIPPED: { label: "Skipped", className: "bg-neutral-500/10 text-neutral-500 border-neutral-500/30" },
  };
  const s = map[status] ?? { label: status, className: "" };
  return (
    <Badge variant="outline" className={s.className}>
      {s.label}
    </Badge>
  );
}

export function RefreshButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" onClick={onClick} aria-label="Refresh">
      <RefreshCw className="h-4 w-4" />
    </Button>
  );
}
