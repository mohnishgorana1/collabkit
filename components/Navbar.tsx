"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LayoutDashboard } from "lucide-react";
import ThemeToggle from "./themes/ThemeToggle";
// ❌ Humne yahan se SignedIn aur SignedOut nikal diye hain
import { UserButton, useAuth } from "@clerk/nextjs";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // ✅ useAuth() humein batayega ki user logged in hai ya nahi
  const { isLoaded, userId } = useAuth();
  
  const isSignedIn = isLoaded && userId;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">

        {/* Left: Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold transition-transform group-hover:scale-105">
              C
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">
              CollabKit
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground ml-4">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#solutions" className="hover:text-foreground transition-colors">Solutions</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </nav>
        </div>

        {/* Right: Actions & Theme Toggle */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <div className="h-4 w-px bg-border"></div>

          {/* 🔴 ONLY VISIBLE WHEN LOGGED OUT */}
          {!isSignedIn && (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium bg-foreground text-background hover:bg-foreground/90 px-4 py-2 rounded-md transition-colors"
              >
                Get Started
              </Link>
            </>
          )}

          {/* 🟢 ONLY VISIBLE WHEN LOGGED IN */}
          {isSignedIn && (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md transition-colors"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <UserButton />
            </>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <div className="flex items-center gap-4 md:hidden">
          {/* Mobile mein bhi UserButton dikhna chahiye */}
          {isSignedIn && <UserButton />}

          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-foreground p-1"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-border/40 bg-background px-4 py-6 flex flex-col gap-4 shadow-lg absolute w-full">
          <Link href="#features" className="text-foreground font-medium text-lg" onClick={() => setIsMobileMenuOpen(false)}>Features</Link>
          <Link href="#solutions" className="text-foreground font-medium text-lg" onClick={() => setIsMobileMenuOpen(false)}>Solutions</Link>
          <Link href="#pricing" className="text-foreground font-medium text-lg" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>

          <div className="h-px w-full bg-border my-2"></div>

          {/* 🔴 MOBILE: LOGGED OUT VIEW */}
          {!isSignedIn && (
            <>
              <Link href="/login" className="text-foreground font-medium text-lg" onClick={() => setIsMobileMenuOpen(false)}>Log in</Link>
              <Link href="/signup" className="bg-primary text-primary-foreground text-center font-medium py-3 rounded-md mt-2" onClick={() => setIsMobileMenuOpen(false)}>
                Get Started Free
              </Link>
            </>
          )}

          {/* 🟢 MOBILE: LOGGED IN VIEW */}
          {isSignedIn && (
            <Link href="/dashboard" className="flex items-center justify-center gap-2 bg-primary text-primary-foreground text-center font-medium py-3 rounded-md mt-2" onClick={() => setIsMobileMenuOpen(false)}>
              <LayoutDashboard size={20} />
              Go to Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;