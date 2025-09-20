import React, { useEffect, useState } from 'react';
import { Typography, Box, Card, CardContent, Button, Grid, Chip, Stack } from '@mui/material';
import { deviceAPI } from '../services/sleepAPI';
import { useWebSocket } from '../services/WebSocketService';

const DeviceManagement = () => {
  const [devices, setDevices] = useState([]);
  const { pingDevice, calibrateSensors, updateDeviceConfig } = useWebSocket();

  useEffect(() => {
    const load = async () => {
      const r = await deviceAPI.getConnectedDevices();
      setDevices(r.data.devices || []);
    };
    load();
  }, []);

  const doPing = (id) => pingDevice && pingDevice(id);
  const doCalibrate = (id) => calibrateSensors && calibrateSensors(id);
  const doLowNoiseMode = async (id) => {
    if (updateDeviceConfig) updateDeviceConfig(id, { noise_mode: 'low' });
    else await deviceAPI.updateDeviceConfig(id, { noise_mode: 'low' });
  };

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h4" gutterBottom>
        Device Management
      </Typography>

      <Grid container spacing={2}>
        {devices.map(dev => (
          <Grid item xs={12} md={6} key={dev.deviceId}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap">
                  <Box>
                    <Typography variant="h6">{dev.deviceId}</Typography>
                    <Stack direction="row" spacing={1} mt={1}>
                      <Chip label={`Status: ${dev.status}`} color={dev.status === 'online' ? 'success' : 'default'} />
                      <Chip label={`Battery: ${dev.battery}%`} />
                      <Chip label={`RSSI: ${dev.rssi} dBm`} />
                      <Chip label={`FW: ${dev.firmware}`} />
                    </Stack>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" onClick={() => doPing(dev.deviceId)}>Ping</Button>
                    <Button variant="outlined" onClick={() => doCalibrate(dev.deviceId)}>Calibrate</Button>
                    <Button variant="contained" onClick={() => doLowNoiseMode(dev.deviceId)}>Low-noise mode</Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DeviceManagement;