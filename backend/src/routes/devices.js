const express = require('express');
const router = express.Router();
const esp32Service = require('../services/esp32Service');

// Get all connected devices
router.get('/connected', (req, res) => {
  try {
    const devices = esp32Service.getConnectedDevices();
    res.json({
      success: true,
      devices,
      count: devices.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve connected devices'
    });
  }
});

// Send command to specific device
router.post('/:deviceId/command', (req, res) => {
  try {
    const { deviceId } = req.params;
    const { command, parameters } = req.body;

    if (!command) {
      return res.status(400).json({
        success: false,
        error: 'Command is required'
      });
    }

    const success = esp32Service.sendCommand({
      deviceId,
      command,
      parameters: parameters || {}
    });

    if (success) {
      res.json({
        success: true,
        message: `Command '${command}' sent to device ${deviceId}`
      });
    } else {
      res.status(404).json({
        success: false,
        error: `Device ${deviceId} not found or not connected`
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to send command to device'
    });
  }
});

// Get device status
router.get('/:deviceId/status', (req, res) => {
  try {
    const { deviceId } = req.params;
    const devices = esp32Service.getConnectedDevices();
    const device = devices.find(d => d.deviceId === deviceId);

    if (device) {
      res.json({
        success: true,
        device
      });
    } else {
      res.status(404).json({
        success: false,
        error: `Device ${deviceId} not found`
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve device status'
    });
  }
});

// Start sleep tracking for device
router.post('/:deviceId/start-tracking', (req, res) => {
  try {
    const { deviceId } = req.params;
    const { userId, sessionId } = req.body;

    const success = esp32Service.sendCommand({
      deviceId,
      command: 'start_sleep_tracking',
      parameters: {
        userId,
        sessionId,
        timestamp: Date.now()
      }
    });

    if (success) {
      res.json({
        success: true,
        message: `Sleep tracking started for device ${deviceId}`,
        sessionId
      });
    } else {
      res.status(404).json({
        success: false,
        error: `Device ${deviceId} not found or not connected`
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to start sleep tracking'
    });
  }
});

// Stop sleep tracking for device
router.post('/:deviceId/stop-tracking', (req, res) => {
  try {
    const { deviceId } = req.params;
    const { sessionId } = req.body;

    const success = esp32Service.sendCommand({
      deviceId,
      command: 'stop_sleep_tracking',
      parameters: {
        sessionId,
        timestamp: Date.now()
      }
    });

    if (success) {
      res.json({
        success: true,
        message: `Sleep tracking stopped for device ${deviceId}`
      });
    } else {
      res.status(404).json({
        success: false,
        error: `Device ${deviceId} not found or not connected`
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to stop sleep tracking'
    });
  }
});

// Configure device settings
router.put('/:deviceId/config', (req, res) => {
  try {
    const { deviceId } = req.params;
    const config = req.body;

    const success = esp32Service.sendCommand({
      deviceId,
      command: 'update_config',
      parameters: config
    });

    if (success) {
      res.json({
        success: true,
        message: `Configuration updated for device ${deviceId}`,
        config
      });
    } else {
      res.status(404).json({
        success: false,
        error: `Device ${deviceId} not found or not connected`
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update device configuration'
    });
  }
});

// Calibrate sensors
router.post('/:deviceId/calibrate', (req, res) => {
  try {
    const { deviceId } = req.params;
    const { sensorType } = req.body;

    const success = esp32Service.sendCommand({
      deviceId,
      command: 'calibrate_sensors',
      parameters: {
        sensorType: sensorType || 'all',
        timestamp: Date.now()
      }
    });

    if (success) {
      res.json({
        success: true,
        message: `Sensor calibration started for device ${deviceId}`
      });
    } else {
      res.status(404).json({
        success: false,
        error: `Device ${deviceId} not found or not connected`
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to calibrate sensors'
    });
  }
});

// Test device connectivity
router.post('/:deviceId/ping', (req, res) => {
  try {
    const { deviceId } = req.params;

    const success = esp32Service.sendCommand({
      deviceId,
      command: 'ping',
      parameters: {
        timestamp: Date.now()
      }
    });

    if (success) {
      res.json({
        success: true,
        message: `Ping sent to device ${deviceId}`
      });
    } else {
      res.status(404).json({
        success: false,
        error: `Device ${deviceId} not found or not connected`
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to ping device'
    });
  }
});

module.exports = router;