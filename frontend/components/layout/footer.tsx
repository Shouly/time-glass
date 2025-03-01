"use client";

import Link from "next/link";
import { BarChart2, Users, Monitor } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-8 md:py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <BarChart2 className="h-4 w-4 text-primary" />
              </div>
              <span className="font-bold">员工生产力分析平台</span>
            </div>
            <p className="text-sm text-muted-foreground">
              全面监控、深入分析、优化员工工作效率，提升企业整体生产力
            </p>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-medium">分析功能</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-primary">
                  仪表盘
                </Link>
              </li>
              <li>
                <Link href="/productivity/app-usage" className="transition-colors hover:text-primary">
                  应用使用分析
                </Link>
              </li>
              <li>
                <Link href="/ui-monitoring" className="transition-colors hover:text-primary">
                  UI监控
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
                  最佳实践
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary">
                  案例研究
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
                <a href="mailto:contact@productivity-platform.com" className="transition-colors hover:text-primary">
                  contact@productivity-platform.com
                </a>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary">
                  预约演示
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary">
                  技术支持
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary">
                  合作咨询
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} 员工生产力分析平台. 保留所有权利。
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="#" className="transition-colors hover:text-primary">
              隐私政策
            </Link>
            <Link href="#" className="transition-colors hover:text-primary">
              服务条款
            </Link>
            <Link href="#" className="transition-colors hover:text-primary">
              数据安全
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 