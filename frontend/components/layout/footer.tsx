"use client";

import Link from "next/link";
import { Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-8 md:py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <span className="font-bold">Time Glass</span>
            </div>
            <p className="text-sm text-muted-foreground">
              智能时间管理与分析平台，帮助您更高效地利用每一分钟
            </p>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-medium">产品</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-primary">
                  仪表盘
                </Link>
              </li>
              <li>
                <Link href="/ui-monitoring" className="transition-colors hover:text-primary">
                  UI监控
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary">
                  数据分析
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary">
                  团队版
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-medium">资源</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="transition-colors hover:text-primary">
                  关于我们
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary">
                  使用指南
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary">
                  常见问题
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary">
                  博客
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-medium">联系我们</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="mailto:contact@timeglass.app" className="transition-colors hover:text-primary">
                  contact@timeglass.app
                </a>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary">
                  反馈建议
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary">
                  支持中心
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Time Glass. 保留所有权利。
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="#" className="transition-colors hover:text-primary">
              隐私政策
            </Link>
            <Link href="#" className="transition-colors hover:text-primary">
              服务条款
            </Link>
            <Link href="#" className="transition-colors hover:text-primary">
              Cookie 政策
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 