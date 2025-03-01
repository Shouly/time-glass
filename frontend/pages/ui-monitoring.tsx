import React, { useState } from 'react';
import Head from 'next/head';
import { Box, Container, TextField, Button, Typography, Paper } from '@mui/material';
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
      
      <Container maxWidth="xl">
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            UI Monitoring Dashboard
          </Typography>
          
          <Paper sx={{ p: 3, mb: 4 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  label="Client ID"
                  variant="outlined"
                  value={clientId}
                  onChange={handleClientIdChange}
                  placeholder="Enter client ID to filter data"
                  sx={{ flexGrow: 1, minWidth: '250px' }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    disabled={!clientId.trim()}
                  >
                    Apply
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={handleClear}
                    disabled={!clientId && !activeClientId}
                  >
                    Clear
                  </Button>
                </Box>
              </Box>
            </form>
            
            {activeClientId && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Filtering by Client ID: <code>{activeClientId}</code>
                </Typography>
              </Box>
            )}
          </Paper>
          
          <UiMonitoringPage clientId={activeClientId} />
        </Box>
      </Container>
    </>
  );
} 