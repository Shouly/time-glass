import React, { useState, useEffect } from 'react';
import { Container, Box, Typography } from '@mui/material';
import { UiMonitoringFilter } from './UiMonitoringFilter';
import { UiMonitoringList } from './UiMonitoringList';
import { getUiMonitoring, UiMonitoringItem, UiMonitoringQueryParams } from '@/lib/api';

interface UiMonitoringPageProps {
  clientId?: string;
}

export const UiMonitoringPage: React.FC<UiMonitoringPageProps> = ({ clientId }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [items, setItems] = useState<UiMonitoringItem[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [filters, setFilters] = useState<UiMonitoringQueryParams>({
    client_id: clientId,
    page: 1,
    pageSize: 10
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await getUiMonitoring({
        ...filters,
        page: currentPage,
        pageSize
      });
      setItems(response.items);
      setTotalItems(response.total);
    } catch (error) {
      console.error('Error loading UI monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: UiMonitoringQueryParams) => {
    setCurrentPage(1); // Reset to first page when filters change
    setFilters({ ...newFilters, page: 1, pageSize });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFilters({ ...filters, page, pageSize });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when page size changes
    setFilters({ ...filters, page: 1, pageSize: size });
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          UI Monitoring
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <UiMonitoringFilter 
            clientId={clientId} 
            onFilterChange={handleFilterChange} 
          />
        </Box>
        
        <UiMonitoringList 
          items={items}
          total={totalItems}
          currentPage={currentPage}
          pageSize={pageSize}
          loading={loading}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </Box>
    </Container>
  );
};

export default UiMonitoringPage; 