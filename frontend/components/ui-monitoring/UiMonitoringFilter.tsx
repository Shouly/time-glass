import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  TextField,
  Box,
  SelectChangeEvent
} from '@mui/material';
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
  const [selectedApp, setSelectedApp] = useState<string>('');
  const [selectedWindow, setSelectedWindow] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadApps();
  }, [clientId]);

  useEffect(() => {
    if (selectedApp) {
      loadWindows();
    } else {
      setWindows([]);
      setSelectedWindow('');
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
      const windowsList = await getUiMonitoringWindows(clientId, selectedApp);
      setWindows(windowsList);
    } catch (error) {
      console.error('Error loading windows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppChange = (event: SelectChangeEvent) => {
    setSelectedApp(event.target.value);
  };

  const handleWindowChange = (event: SelectChangeEvent) => {
    setSelectedWindow(event.target.value);
  };

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
  };

  const applyFilters = () => {
    const filters: UiMonitoringQueryParams = {
      client_id: clientId,
      app: selectedApp || undefined,
      window: selectedWindow || undefined,
      startTime: startDate ? new Date(startDate).toISOString() : undefined,
      endTime: endDate ? new Date(endDate).toISOString() : undefined
    };
    onFilterChange(filters);
  };

  const resetFilters = () => {
    setSelectedApp('');
    setSelectedWindow('');
    setStartDate('');
    setEndDate('');
    onFilterChange({ client_id: clientId });
  };

  return (
    <Card>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="app-select-label">Application</InputLabel>
              <Select
                labelId="app-select-label"
                id="app-select"
                value={selectedApp}
                label="Application"
                onChange={handleAppChange}
                disabled={loading}
              >
                <MenuItem value="">
                  <em>All Applications</em>
                </MenuItem>
                {apps.map((app) => (
                  <MenuItem key={app} value={app}>
                    {app}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="window-select-label">Window</InputLabel>
              <Select
                labelId="window-select-label"
                id="window-select"
                value={selectedWindow}
                label="Window"
                onChange={handleWindowChange}
                disabled={loading || !selectedApp}
              >
                <MenuItem value="">
                  <em>All Windows</em>
                </MenuItem>
                {windows.map((window) => (
                  <MenuItem key={window} value={window}>
                    {window}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <TextField
              id="start-date"
              label="Start Date"
              type="datetime-local"
              value={startDate}
              onChange={handleStartDateChange}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <TextField
              id="end-date"
              label="End Date"
              type="datetime-local"
              value={endDate}
              onChange={handleEndDateChange}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'center' }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={applyFilters}
                disabled={loading}
              >
                Apply
              </Button>
              <Button 
                variant="outlined" 
                onClick={resetFilters}
                disabled={loading}
              >
                Reset
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}; 