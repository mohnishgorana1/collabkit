"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Settings, Hash, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function MobileDrawer({ workspaces }: { workspaces: any[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isWorkspaceRoute = pathname?.includes("/workspace/");
  const currentWorkspaceId = isWorkspaceRoute ? pathname.split("/")[2] : null;
  const currentWorkspace = workspaces?.find((w) => w.publicId === currentWorkspaceId);

  // prevent body scroll when drawer open
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const NavItem = ({ href, Icon, label, active }: { href: string; Icon: any; label: string; active?: boolean }) => (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
        ${active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/30 hover:text-foreground"}`}
    >
      <Icon size={18} />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );

  return (
    <>
      {/* Mobile toggle button: visible only on small screens */}
      <button
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-14 left-4 z-50 bg-background border border-border p-2 rounded-lg shadow-sm"
      >
        <Menu size={18} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Drawer panel */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-xs bg-background z-50 shadow-xl border-r border-border p-4 overflow-y-auto"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {currentWorkspace?.name?.charAt(0) || "A"}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{currentWorkspace?.name || "Your workspaces"}</div>
                    <div className="text-xs text-muted-foreground">{currentWorkspace?.slug || ""}</div>
                  </div>
                </div>

                <button aria-label="Close menu" onClick={() => setOpen(false)} className="p-2 rounded-md">
                  <X size={18} />
                </button>
              </div>

              <nav className="flex flex-col gap-2">
                <NavItem href="/dashboard" Icon={LayoutDashboard} label="Dashboard" active={pathname === "/dashboard"} />

                {/* Workspace specific links */}
                {isWorkspaceRoute && currentWorkspace && (
                  <>
                    <div className="mt-2 mb-1 h-px bg-border" />
                    <NavItem href={`/workspace/${currentWorkspace.publicId}/${currentWorkspace.slug}`} Icon={Hash} label="General" active={pathname.includes(`/${currentWorkspace.publicId}/`)} />
                    <NavItem href={`/workspace/${currentWorkspace.publicId}/members`} Icon={Users} label="Members" active={pathname.includes("/members")} />
                    <NavItem href={`/workspace/${currentWorkspace.publicId}/settings`} Icon={Settings} label="Settings" active={pathname.includes("/settings")} />
                  </>
                )}

                <div className="mt-4 h-px bg-border" />
                <NavItem href="/settings" Icon={Settings} label="Account" active={pathname === "/settings"} />

                {/* Workspaces list quick access */}
                <div className="mt-4">
                  <h4 className="text-xs text-muted-foreground uppercase mb-2">Workspaces</h4>
                  <div className="flex flex-col gap-2">
                    {workspaces?.map((ws: any) => (
                      <Link
                        key={ws._id}
                        href={`/workspace/${ws.publicId}/${ws.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary/30"
                      >
                        <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                          {ws.name.charAt(0)}
                        </div>
                        <div className="text-sm truncate">{ws.name}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
