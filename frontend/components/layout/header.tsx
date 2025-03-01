"use client";

import Link from "next/link";
import { Clock, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/dashboard", label: "仪表盘" },
  { href: "/ui-monitoring", label: "UI监控" },
  { href: "/about", label: "关于" }
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex flex-1 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <span className="hidden font-bold sm:inline-block">Time Glass</span>
          </Link>
          
          <nav className="hidden md:flex md:gap-6">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div className="flex md:hidden">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle Menu"
              className="mr-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-background md:hidden",
          mobileMenuOpen ? "flex flex-col" : "hidden"
        )}
      >
        <div className="flex items-center justify-between border-b px-4 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <span className="font-bold">Time Glass</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close Menu"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close Menu</span>
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-6">
          <nav className="flex flex-col space-y-6 px-6">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
} 