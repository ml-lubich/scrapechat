"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { MessageSquare, Menu, X } from "lucide-react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold">ScrapeChatAI</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-4 sm:flex">
          <Link
            href="#features"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="#faq"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            FAQ
          </Link>
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            Log in
          </Link>
          <Link href="/login">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-3 sm:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] text-[var(--foreground)] transition-colors hover:bg-[var(--secondary)]"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out sm:hidden ${
          mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-[var(--border)] bg-[var(--background)] px-6 py-4 space-y-3">
          <Link
            href="#features"
            onClick={closeMobile}
            className="block text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors py-2"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            onClick={closeMobile}
            className="block text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors py-2"
          >
            Pricing
          </Link>
          <Link
            href="#faq"
            onClick={closeMobile}
            className="block text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors py-2"
          >
            FAQ
          </Link>
          <Link
            href="/login"
            onClick={closeMobile}
            className="block text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors py-2"
          >
            Log in
          </Link>
          <Link href="/login" onClick={closeMobile} className="block pt-1">
            <Button className="w-full" size="sm">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
