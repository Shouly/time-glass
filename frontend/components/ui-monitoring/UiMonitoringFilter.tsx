import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getUiMonitoringApps, getUiMonitoringWindows, UiMonitoringQueryParams } from '@/lib/api';
import { CalendarIcon, FilterIcon, RotateCcwIcon } from 'lucide-react';

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
  const [isFiltersExpanded, setIsFiltersExpanded] = useState<boolean>(false);

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

  const toggleFilters = () => {
    setIsFiltersExpanded(!isFiltersExpanded);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>高级筛选</CardTitle>
            <CardDescription>按应用、窗口和时间范围筛选数据</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleFilters}
            className="h-8 gap-1"
          >
            <FilterIcon className="h-4 w-4" />
            {isFiltersExpanded ? '收起筛选' : '展开筛选'}
          </Button>
        </div>
      </CardHeader>
      
      {isFiltersExpanded && (
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="app-select">应用程序</Label>
              <Select
                value={selectedApp}
                onValueChange={handleAppChange}
                disabled={loading}
              >
                <SelectTrigger id="app-select" className="w-full">
                  <SelectValue placeholder="所有应用程序" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有应用程序</SelectItem>
                  {apps.map((app) => (
                    <SelectItem key={app} value={app}>
                      {app}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="window-select">窗口</Label>
              <Select
                value={selectedWindow}
                onValueChange={handleWindowChange}
                disabled={loading || selectedApp === 'all'}
              >
                <SelectTrigger id="window-select" className="w-full">
                  <SelectValue placeholder="所有窗口" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有窗口</SelectItem>
                  {windows.map((window) => (
                    <SelectItem key={window} value={window}>
                      {window}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>开始日期</Label>
              <DatePicker
                date={startDate}
                setDate={setStartDate}
                label="选择开始日期"
              />
            </div>
            
            <div className="space-y-2">
              <Label>结束日期</Label>
              <DatePicker
                date={endDate}
                setDate={setEndDate}
                label="选择结束日期"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={resetFilters}
              disabled={loading}
              className="gap-1"
            >
              <RotateCcwIcon className="h-4 w-4" />
              重置
            </Button>
            <Button 
              variant="default" 
              onClick={applyFilters}
              disabled={loading}
              className="gap-1"
            >
              <FilterIcon className="h-4 w-4" />
              应用筛选
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}; 