
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Settings, Hash, Users, User, UserCircle2 } from "lucide-react";
import ThemeToggle from "./themes/ThemeToggle";
import { UserButton, useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "motion/react";
import Logo from "./Logo";
import { cn } from "@/lib/utils";
import { useWorkspaceData } from "@/context/WorkspaceContext";

// Helper component for mobile nav items (mimics sidebar item)
// 💡 Bahar define kiya hua Helper Component
const MobileNavItem = ({ href, icon: Icon, label, isActive, onClick }: any) => (
  <Link
    href={href}
    onClick={onClick} // 💡 Ab yeh prop se aayega
    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
      }`}
  >
    <Icon size={20} className={isActive ? "text-primary" : ""} />
    {label}
  </Link>
);

const Navbar = ({ name }: { name: any }) => {
  const pathname = usePathname();
  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/workspace');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isLoaded, userId } = useAuth();
  const isSignedIn = isLoaded && userId;

  // Fetch workspace data from context
  const data = useWorkspaceData();
  const workspaces = data?.workspaces || [];

  // Logic to find current workspace if inside a workspace route
  const isWorkspaceRoute = pathname.includes("/workspace/");
  const currentWorkspaceId = isWorkspaceRoute ? pathname.split("/")[2] : null;
  const currentWorkspace = workspaces.find((w: any) => w.publicId === currentWorkspaceId);



  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  return (
    <motion.header
      layout
      className={cn("fixed top-0 z-50 w-full transition-all duration-300 ",
        "mx-auto px-2 md:px-4 lg:px-6 h-16 flex items-center",
        `${scrolled ? "bg-background/50 backdrop-blur-2xl" : "bg-transparent border-transparent"}`,
        `${isProtected ? "border-b border-border/50" : ""}`
      )}
    >
      <div className="flex items-center justify-between w-full">
        <Logo />

        {/* Desktop nav actions (only visible on md+) */}
        <div className="hidden md:flex items-center gap-x-5">
          {!isSignedIn ? (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground px-2">Log in</Link>
              <Link href="/signup" className="text-sm font-medium bg-foreground text-background px-5 py-2.5 rounded-full">Start for free</Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <div className="h-4 w-px bg-border"></div>
              {/* TODO: REMOVE AFTER */}
              <div className="bg-muted py-2 px-3 rounded-2xl flex items-center gap-2 text-primary">
                <UserCircle2 size={12}/>
                <p>{name}</p>
                </div>

              {/* <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 rounded-full" } }} /> */}
            </div>
          )}
          <ThemeToggle />
        </div>

        {/* Mobile Toggle Button */}
        <div className="flex items-center gap-4 md:hidden">
          {/* {isSignedIn && <UserButton />} */}
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-foreground p-1 z-50 relative"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="md:hidden fixed inset-0 top-16 bg-background backdrop-blur-3xl flex flex-col p-6 h-[calc(100vh-4rem)] border-t border-border/50 overflow-y-auto"
          >
            {/* 💡 Conditionally render content based on Protected vs Public route */}
            {isProtected && isSignedIn ? (
              // --- PROTECTED MOBILE MENU (Looks like Sidebar) ---
              <div className="flex flex-col h-full">
                <div className="flex flex-col gap-2">
                  <MobileNavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" isActive={pathname === "/dashboard"} onClick={() => setIsMobileMenuOpen(false)} />
                </div>

                {isWorkspaceRoute && currentWorkspace && (
                  <div className="mt-6">
                    <div className="h-px bg-border w-full mb-6"></div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-2">
                      {currentWorkspace.name}
                    </p>
                    <div className="flex flex-col gap-2">
                      <MobileNavItem href={`/workspace/${currentWorkspace.publicId}/${currentWorkspace.slug}`} icon={Hash} label="General" isActive={true} onClick={() => setIsMobileMenuOpen(false)} />
                      <MobileNavItem href={`/workspace/${currentWorkspace.publicId}/members`} icon={Users} label="Members" isActive={pathname.includes("/members")} onClick={() => setIsMobileMenuOpen(false)} />
                      <MobileNavItem href={`/workspace/${currentWorkspace.publicId}/settings`} icon={Settings} label="Settings" isActive={pathname.includes("/settings")} onClick={() => setIsMobileMenuOpen(false)} />
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-6 border-t border-border">
                  <MobileNavItem href="/settings" icon={Settings} label="Account Settings" isActive={pathname === "/settings"} onClick={() => setIsMobileMenuOpen(false)} />
                </div>
              </div>
            ) : (
              // --- PUBLIC MOBILE MENU (Landing Page Links) ---
              <div className="flex flex-col h-full">
                <div className="flex flex-col gap-4 text-2xl font-semibold tracking-tight mt-4">
                  <Link href="#features" onClick={() => setIsMobileMenuOpen(false)}>Features</Link>
                  <Link href="#workflow" onClick={() => setIsMobileMenuOpen(false)}>Workflow</Link>
                </div>

                <div className="mt-auto flex flex-col gap-4 pb-4">
                  {!isSignedIn ? (
                    <>
                      <Link href="/login" className="w-full text-center py-4 rounded-2xl bg-secondary text-foreground font-medium" onClick={() => setIsMobileMenuOpen(false)}>Log in</Link>
                      <Link href="/signup" className="w-full text-center py-4 rounded-2xl bg-foreground text-background font-medium" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
                    </>
                  ) : (
                    <Link href="/dashboard" className="w-full flex justify-center items-center gap-2 py-4 rounded-2xl bg-foreground text-background font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                      <LayoutDashboard size={20} /> Go to Dashboard
                    </Link>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
