import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Time Glass - 时间管理应用",
  description: "一个帮助您管理时间的应用",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <header className="border-b">
          <div className="container flex h-16 items-center justify-between">
            <div className="font-bold text-xl">Time Glass</div>
            <nav className="flex items-center gap-4">
              <a href="/" className="text-sm font-medium hover:underline">首页</a>
              <a href="/dashboard" className="text-sm font-medium hover:underline">仪表盘</a>
              <a href="/ui-monitoring" className="text-sm font-medium hover:underline">UI监控</a>
              <a href="/about" className="text-sm font-medium hover:underline">关于</a>
            </nav>
          </div>
        </header>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
