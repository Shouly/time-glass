import React, { useState } from 'react';
import Head from 'next/head';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import UiMonitoringPage from '@/components/ui-monitoring/UiMonitoringPage';

export default function UiMonitoringPageWrapper() {
  const [clientId, setClientId] = useState<string>('');
  const [activeClientId, setActiveClientId] = useState<string>('');

  const handleClientIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setClientId(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setActiveClientId(clientId);
  };

  const handleClear = () => {
    setClientId('');
    setActiveClientId('');
  };

  return (
    <>
      <Head>
        <title>UI 监控 | Time Glass</title>
        <meta name="description" content="监控应用程序界面交互" />
      </Head>
      
      <div className="container py-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">UI 监控面板</h1>
            <p className="text-muted-foreground">
              跟踪和分析用户界面交互，了解应用程序使用模式
            </p>
          </div>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>筛选条件</CardTitle>
              <CardDescription>
                输入客户端 ID 以筛选特定设备的数据
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="flex-1 space-y-2">
                    <label htmlFor="client-id" className="text-sm font-medium">
                      客户端 ID
                    </label>
                    <Input
                      id="client-id"
                      placeholder="输入客户端 ID 筛选数据"
                      value={clientId}
                      onChange={handleClientIdChange}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2 self-end">
                    <Button 
                      type="submit" 
                      disabled={!clientId.trim()}
                    >
                      应用
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={handleClear}
                      disabled={!clientId && !activeClientId}
                    >
                      清除
                    </Button>
                  </div>
                </div>
                
                {activeClientId && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>当前筛选:</span>
                      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs">
                        {activeClientId}
                      </code>
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
          
          <UiMonitoringPage clientId={activeClientId} />
        </div>
      </div>
    </>
  );
} 