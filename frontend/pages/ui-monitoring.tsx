import React, { useState } from 'react';
import Head from 'next/head';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
        <title>UI Monitoring | Time Glass</title>
        <meta name="description" content="Monitor UI interactions across applications" />
      </Head>
      
      <div className="container py-10 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-6">
          UI Monitoring Dashboard
        </h1>
        
        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[250px]">
                  <Input
                    placeholder="Enter client ID to filter data"
                    value={clientId}
                    onChange={handleClientIdChange}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={!clientId.trim()}
                  >
                    Apply
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleClear}
                    disabled={!clientId && !activeClientId}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </form>
            
            {activeClientId && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Filtering by Client ID: <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs">{activeClientId}</code>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <UiMonitoringPage clientId={activeClientId} />
      </div>
    </>
  );
} 