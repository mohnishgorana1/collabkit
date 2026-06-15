"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, LayoutDashboard, Hexagon } from "lucide-react";
import ThemeToggle from "./themes/ThemeToggle";
import { UserButton, useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "motion/react";
import Logo from "./Logo";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();
  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/workspace');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isLoaded, userId } = useAuth();
  const isSignedIn = isLoaded && userId;

  // Track scroll for dynamic navbar styling
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      layout
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? "bg-background/50 backdrop-blur-2xl" : "bg-transparent border-transparent"} ${isProtected ? "border-b border-border/20" : ""}`}
    >
      <div className="mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />

        {/* Center Links (Optional) */}
        {/* <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-muted-foreground absolute left-1/2 -translate-x-1/2">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#workflow" className="hover:text-foreground transition-colors">Workflow</Link>
            </nav> 
        */}

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-5">
          <ThemeToggle />

          {!isSignedIn ? (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2">
                Log in
              </Link>
              <Link href="/signup" className="text-sm font-medium bg-foreground text-background hover:scale-105 active:scale-95 px-5 py-2.5 rounded-full transition-all duration-300">
                Start for free
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <div className="h-4 w-px bg-border"></div>
              <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 rounded-full" } }} />
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-4 md:hidden">
          {isSignedIn && <UserButton />}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-foreground p-1 z-50 relative"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="md:hidden fixed inset-0 top-16 bg-background/95 backdrop-blur-3xl flex flex-col p-6 gap-6 h-[calc(100vh-4rem)] border-t border-border/50"
          >
            <div className="flex flex-col gap-4 text-2xl font-semibold tracking-tight mt-10">
              <Link href="#features" onClick={() => setIsMobileMenuOpen(false)}>Features</Link>
              <Link href="#workflow" onClick={() => setIsMobileMenuOpen(false)}>Workflow</Link>
            </div>

            <div className="mt-auto flex flex-col gap-4 pb-10">
              <ThemeToggle />
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>

  );
};

export default Navbar;