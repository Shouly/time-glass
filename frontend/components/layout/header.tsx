"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Clock, BarChart2, Award, Menu, Monitor } from "lucide-react";

export function Header() {
  const pathname = usePathname() || "";
  
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };
  
  const navItems = [
    { href: "/", label: "首页" },
    { href: "/dashboard", label: "仪表盘" },
    { 
      href: "/productivity", 
      label: "生产力分析",
      children: [
        { href: "/productivity/time-analysis", label: "工作时间分析", icon: <Clock className="mr-2 h-4 w-4" /> },
        { href: "/productivity/app-usage", label: "应用使用分析", icon: <BarChart2 className="mr-2 h-4 w-4" /> },
        { href: "/productivity/score", label: "生产力评分", icon: <Award className="mr-2 h-4 w-4" /> },
      ]
    },
    { href: "/ui-monitoring", label: "UI监控", icon: <Monitor className="mr-2 h-4 w-4" /> },
    { href: "/about", label: "关于" },
  ];
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">Time Glass</span>
          </Link>
        </div>
        
        <div className="hidden md:flex">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => 
              item.children ? (
                <DropdownMenu key={item.href}>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant={isActive(item.href) ? "default" : "ghost"} 
                      className="h-8"
                    >
                      {item.label}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {item.children.map((child) => (
                      <DropdownMenuItem key={child.href} asChild>
                        <Link href={child.href} className="flex items-center">
                          {child.icon}
                          {child.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition-colors hover:text-foreground/80 ${
                    isActive(item.href) ? "text-foreground" : "text-foreground/60"
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>
        </div>
        
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">打开菜单</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {navItems.map((item) => 
                item.children ? (
                  item.children.map((child) => (
                    <DropdownMenuItem key={child.href} asChild>
                      <Link href={child.href} className="flex items-center">
                        {child.icon}
                        {child.label}
                      </Link>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>
                      {item.icon && item.icon}
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
} 