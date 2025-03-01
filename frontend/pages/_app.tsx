import '@/app/globals.css';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={inter.className}>
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
      <Component {...pageProps} />
      <Toaster />
    </div>
  );
} 