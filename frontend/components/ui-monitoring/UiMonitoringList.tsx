import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip, 
  CircularProgress, 
  Box,
  TablePagination
} from '@mui/material';
import { format } from 'date-fns';
import { UiMonitoringItem } from '@/lib/api';

interface UiMonitoringListProps {
  items: UiMonitoringItem[];
  total: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const UiMonitoringList: React.FC<UiMonitoringListProps> = ({
  items,
  total,
  currentPage,
  pageSize,
  loading,
  onPageChange,
  onPageSizeChange
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    onPageChange(newPage + 1); // Convert to 1-indexed for API
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    onPageSizeChange(parseInt(event.target.value, 10));
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="div">
            UI Monitoring Data
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total: {total} items
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="body1" color="text.secondary">
              No data found
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader aria-label="ui monitoring table">
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Application</TableCell>
                    <TableCell>Window</TableCell>
                    <TableCell>Text</TableCell>
                    <TableCell>Text Length</TableCell>
                    <TableCell>Client ID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{formatDate(item.timestamp)}</TableCell>
                      <TableCell>
                        <Chip label={item.app} size="small" color="primary" />
                      </TableCell>
                      <TableCell>{item.window}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 300 }}>
                          {truncateText(item.text)}
                        </Typography>
                      </TableCell>
                      <TableCell>{item.text_length}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 150, fontFamily: 'monospace' }}>
                          {truncateText(item.client_id, 20)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              component="div"
              count={total}
              page={currentPage - 1} // Convert from 1-indexed to 0-indexed
              onPageChange={handleChangePage}
              rowsPerPage={pageSize}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}; 