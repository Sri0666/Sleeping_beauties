const WebSocket = require('ws');
const EventEmitter = require('events');

class ESP32Service extends EventEmitter {
  constructor() {
    super();
    this.devices = new Map(); // deviceId -> device info
    this.wsServer = null;
    this.io = null;
  }

  initialize(socketIo) {
    this.io = socketIo;
    this.setupWebSocketServer();
    this.setupEventHandlers();
  }

  setupWebSocketServer() {
    // WebSocket server for ESP32 devices (different port from main server)
    this.wsServer = new WebSocket.Server({ 
      port: process.env.ESP32_WS_PORT || 8080,
      verifyClient: (info) => {
        // Add authentication for ESP32 devices here
        const apiKey = info.req.url.split('apiKey=')[1];
        return apiKey === process.env.ESP32_API_KEY;
      }
    });

    this.wsServer.on('connection', (ws, req) => {
      console.log('ESP32 device connected');
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleDeviceMessage(ws, message);
        } catch (error) {
          console.error('Invalid message from ESP32:', error);
          ws.send(JSON.stringify({ error: 'Invalid JSON format' }));
        }
      });

      ws.on('close', () => {
        console.log('ESP32 device disconnected');
        this.handleDeviceDisconnect(ws);
      });

      ws.on('error', (error) => {
        console.error('ESP32 WebSocket error:', error);
      });

      // Send initial handshake
      ws.send(JSON.stringify({
        type: 'handshake',
        message: 'Connected to Sleep Tracker Server',
        timestamp: Date.now()
      }));
    });

    console.log(`ESP32 WebSocket server listening on port ${process.env.ESP32_WS_PORT || 8080}`);
  }

  handleDeviceMessage(ws, message) {
    const { type, deviceId, data, timestamp } = message;

    if (!deviceId) {
      ws.send(JSON.stringify({ error: 'Device ID required' }));
      return;
    }

    // Store/update device info
    if (!this.devices.has(deviceId)) {
      this.devices.set(deviceId, {
        ws,
        lastSeen: Date.now(),
        status: 'connected',
        data: {}
      });
    } else {
      this.devices.get(deviceId).lastSeen = Date.now();
    }

    switch (type) {
      case 'sleep_data':
        this.handleSleepData(deviceId, data, timestamp);
        break;
      case 'snoring_detection':
        this.handleSnoringData(deviceId, data, timestamp);
        break;
      case 'position_change':
        this.handlePositionData(deviceId, data, timestamp);
        break;
      case 'spine_tracking':
        this.handleSpineData(deviceId, data, timestamp);
        break;
      case 'device_status':
        this.handleDeviceStatus(deviceId, data);
        break;
      case 'heartbeat':
        this.handleHeartbeat(deviceId);
        break;
      default:
        console.log(`Unknown message type from ${deviceId}:`, type);
    }
  }

  handleSleepData(deviceId, data, timestamp) {
    const sleepData = {
      deviceId,
      timestamp: timestamp || Date.now(),
      ...data
    };

    // Emit to sleep service for processing
    this.emit('sleep_data', sleepData);

    // Forward to connected clients via Socket.IO
    if (this.io && data.userId) {
      this.io.to(`user-${data.userId}`).emit('sleep_data_update', sleepData);
    }

    console.log(`Sleep data from ${deviceId}:`, data);
  }

  handleSnoringData(deviceId, data, timestamp) {
    const snoringData = {
      deviceId,
      timestamp: timestamp || Date.now(),
      intensity: data.intensity,
      frequency: data.frequency,
      duration: data.duration,
      audioLevel: data.audioLevel
    };

    this.emit('snoring_detected', snoringData);

    if (this.io && data.userId) {
      this.io.to(`user-${data.userId}`).emit('snoring_alert', snoringData);
    }

    console.log(`Snoring detected from ${deviceId}:`, snoringData);
  }

  handlePositionData(deviceId, data, timestamp) {
    const positionData = {
      deviceId,
      timestamp: timestamp || Date.now(),
      position: data.position, // 'back', 'side', 'stomach', 'unknown'
      angle: data.angle,
      acceleration: data.acceleration,
      gyroscope: data.gyroscope
    };

    this.emit('position_change', positionData);

    if (this.io && data.userId) {
      this.io.to(`user-${data.userId}`).emit('position_update', positionData);
    }

    console.log(`Position change from ${deviceId}:`, positionData);
  }

  handleSpineData(deviceId, data, timestamp) {
    const spineData = {
      deviceId,
      timestamp: timestamp || Date.now(),
      sensors: data.sensors, // Array of sensor readings
      alignment: data.alignment,
      pressure: data.pressure,
      flexibility: data.flexibility
    };

    this.emit('spine_data', spineData);

    if (this.io && data.userId) {
      this.io.to(`user-${data.userId}`).emit('spine_update', spineData);
    }

    console.log(`Spine data from ${deviceId}:`, spineData);
  }

  handleDeviceStatus(deviceId, data) {
    const device = this.devices.get(deviceId);
    if (device) {
      device.status = data.status;
      device.battery = data.battery;
      device.firmware = data.firmware;
      device.sensors = data.sensors;
    }

    console.log(`Device status update from ${deviceId}:`, data);
  }

  handleHeartbeat(deviceId) {
    const device = this.devices.get(deviceId);
    if (device) {
      device.lastSeen = Date.now();
    }
  }

  handleDeviceDisconnect(ws) {
    // Find and remove disconnected device
    for (const [deviceId, device] of this.devices.entries()) {
      if (device.ws === ws) {
        device.status = 'disconnected';
        console.log(`Device ${deviceId} disconnected`);
        break;
      }
    }
  }

  sendCommand(data) {
    const { deviceId, command, parameters } = data;
    const device = this.devices.get(deviceId);

    if (!device || device.status !== 'connected') {
      console.error(`Device ${deviceId} not connected`);
      return false;
    }

    const message = {
      type: 'command',
      command,
      parameters,
      timestamp: Date.now()
    };

    try {
      device.ws.send(JSON.stringify(message));
      console.log(`Command sent to ${deviceId}:`, command);
      return true;
    } catch (error) {
      console.error(`Failed to send command to ${deviceId}:`, error);
      return false;
    }
  }

  getConnectedDevices() {
    const connectedDevices = [];
    for (const [deviceId, device] of this.devices.entries()) {
      if (device.status === 'connected') {
        connectedDevices.push({
          deviceId,
          lastSeen: device.lastSeen,
          status: device.status,
          ...device.data
        });
      }
    }
    return connectedDevices;
  }

  setupEventHandlers() {
    // Clean up stale devices every 5 minutes
    setInterval(() => {
      const now = Date.now();
      const timeout = parseInt(process.env.DEVICE_TIMEOUT) || 30000;

      for (const [deviceId, device] of this.devices.entries()) {
        if (now - device.lastSeen > timeout) {
          console.log(`Device ${deviceId} timed out`);
          device.status = 'timeout';
        }
      }
    }, 300000); // 5 minutes
  }
}

module.exports = new ESP32Service();