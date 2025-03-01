import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getUiMonitoringApps, getUiMonitoringWindows, UiMonitoringQueryParams } from '@/lib/api';

interface UiMonitoringFilterProps {
  clientId?: string;
  onFilterChange: (filters: UiMonitoringQueryParams) => void;
}

export const UiMonitoringFilter: React.FC<UiMonitoringFilterProps> = ({ 
  clientId, 
  onFilterChange 
}) => {
  const [apps, setApps] = useState<string[]>([]);
  const [windows, setWindows] = useState<string[]>([]);
  const [selectedApp, setSelectedApp] = useState<string>('all');
  const [selectedWindow, setSelectedWindow] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadApps();
  }, [clientId]);

  useEffect(() => {
    if (selectedApp && selectedApp !== 'all') {
      loadWindows();
    } else {
      setWindows([]);
      setSelectedWindow('all');
    }
  }, [selectedApp, clientId]);

  const loadApps = async () => {
    try {
      setLoading(true);
      const appsList = await getUiMonitoringApps(clientId);
      setApps(appsList);
    } catch (error) {
      console.error('Error loading apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWindows = async () => {
    try {
      setLoading(true);
      const windowsList = await getUiMonitoringWindows(clientId, selectedApp !== 'all' ? selectedApp : undefined);
      setWindows(windowsList);
    } catch (error) {
      console.error('Error loading windows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppChange = (value: string) => {
    setSelectedApp(value);
  };

  const handleWindowChange = (value: string) => {
    setSelectedWindow(value);
  };

  const applyFilters = () => {
    const filters: UiMonitoringQueryParams = {
      client_id: clientId,
      app: selectedApp !== 'all' ? selectedApp : undefined,
      window: selectedWindow !== 'all' ? selectedWindow : undefined,
      startTime: startDate ? startDate.toISOString() : undefined,
      endTime: endDate ? endDate.toISOString() : undefined
    };
    onFilterChange(filters);
  };

  const resetFilters = () => {
    setSelectedApp('all');
    setSelectedWindow('all');
    setStartDate(undefined);
    setEndDate(undefined);
    onFilterChange({ client_id: clientId });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-3">
            <Select
              value={selectedApp}
              onValueChange={handleAppChange}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Applications" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                {apps.map((app) => (
                  <SelectItem key={app} value={app}>
                    {app}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="md:col-span-3">
            <Select
              value={selectedWindow}
              onValueChange={handleWindowChange}
              disabled={loading || selectedApp === 'all'}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Windows" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Windows</SelectItem>
                {windows.map((window) => (
                  <SelectItem key={window} value={window}>
                    {window}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="md:col-span-2">
            <DatePicker
              date={startDate}
              setDate={setStartDate}
              label="Start Date"
            />
          </div>
          
          <div className="md:col-span-2">
            <DatePicker
              date={endDate}
              setDate={setEndDate}
              label="End Date"
            />
          </div>
          
          <div className="md:col-span-2 flex gap-2">
            <Button 
              variant="default" 
              onClick={applyFilters}
              disabled={loading}
              className="flex-1"
            >
              Apply
            </Button>
            <Button 
              variant="outline" 
              onClick={resetFilters}
              disabled={loading}
              className="flex-1"
            >
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 