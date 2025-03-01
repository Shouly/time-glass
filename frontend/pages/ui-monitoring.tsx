"use client";

import React, { useState } from 'react';
import Head from 'next/head';
import UiMonitoringPage from '@/components/ui-monitoring/UiMonitoringPage';

export default function UiMonitoringPageWrapper() {
  const [clientId, setClientId] = useState<string>('');

  const handleClientIdChange = (newClientId: string) => {
    setClientId(newClientId);
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
          
          <UiMonitoringPage 
            clientId={clientId} 
            onClientIdChange={handleClientIdChange} 
          />
        </div>
      </div>
    </>
  );
} 