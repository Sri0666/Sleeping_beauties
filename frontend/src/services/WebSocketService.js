import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [realtimeData, setRealtimeData] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState({});

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      toast.success('Connected to sleep tracker');
      
      // Join user room for personalized updates
      newSocket.emit('join-user-room', 'user123'); // TODO: Get actual user ID
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      toast.error('Disconnected from sleep tracker');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
      toast.error('Failed to connect to sleep tracker');
    });

    // Listen for real-time sleep data
    newSocket.on('sleep_data_update', (data) => {
      console.log('Sleep data update:', data);
      setRealtimeData(data);
    });

    // Listen for snoring alerts
    newSocket.on('snoring_alert', (data) => {
      console.log('Snoring detected:', data);
      toast((t) => (
        <div>
          <strong>Snoring Detected!</strong>
          <br />
          Intensity: {data.intensity}
          <br />
          <small>{new Date(data.timestamp).toLocaleTimeString()}</small>
        </div>
      ), {
        icon: '😴',
        duration: 5000,
      });
    });

    // Listen for position updates
    newSocket.on('position_update', (data) => {
      console.log('Position update:', data);
      // Update real-time data with position info
      setRealtimeData(prev => ({
        ...prev,
        position: data.position,
        positionAngle: data.angle,
        timestamp: data.timestamp
      }));
    });

    // Listen for spine tracking updates
    newSocket.on('spine_update', (data) => {
      console.log('Spine tracking update:', data);
      setRealtimeData(prev => ({
        ...prev,
        spine: data,
        timestamp: data.timestamp
      }));
    });

    // Listen for device status updates
    newSocket.on('device_status_update', (data) => {
      console.log('Device status update:', data);
      setDeviceStatus(prev => ({
        ...prev,
        [data.deviceId]: data
      }));
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  // Function to send device commands
  const sendDeviceCommand = (deviceId, command, parameters = {}) => {
    if (socket && isConnected) {
      socket.emit('device-command', {
        deviceId,
        command,
        parameters
      });
    } else {
      toast.error('Not connected to server');
    }
  };

  // Function to start sleep tracking
  const startSleepTracking = (sessionData) => {
    if (socket && isConnected) {
      sendDeviceCommand(sessionData.deviceId, 'start_sleep_tracking', {
        userId: sessionData.userId,
        sessionId: sessionData.sessionId
      });
    }
  };

  // Function to stop sleep tracking
  const stopSleepTracking = (deviceId, sessionId) => {
    if (socket && isConnected) {
      sendDeviceCommand(deviceId, 'stop_sleep_tracking', {
        sessionId
      });
    }
  };

  // Function to calibrate sensors
  const calibrateSensors = (deviceId, sensorType = 'all') => {
    if (socket && isConnected) {
      sendDeviceCommand(deviceId, 'calibrate_sensors', {
        sensorType
      });
      toast.loading('Calibrating sensors...', { duration: 5000 });
    }
  };

  // Function to update device configuration
  const updateDeviceConfig = (deviceId, config) => {
    if (socket && isConnected) {
      sendDeviceCommand(deviceId, 'update_config', config);
      toast.success('Device configuration updated');
    }
  };

  // Function to ping device
  const pingDevice = (deviceId) => {
    if (socket && isConnected) {
      sendDeviceCommand(deviceId, 'ping');
      toast.loading('Pinging device...', { duration: 3000 });
    }
  };

  const value = {
    socket,
    isConnected,
    realtimeData,
    deviceStatus,
    sendDeviceCommand,
    startSleepTracking,
    stopSleepTracking,
    calibrateSensors,
    updateDeviceConfig,
    pingDevice,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};