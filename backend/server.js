const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/sleep', require('./src/routes/sleep'));
app.use('/api/analytics', require('./src/routes/analytics'));
app.use('/api/devices', require('./src/routes/devices'));
app.use('/api/recommendations', require('./src/routes/recommendations'));
app.use('/api/position', require('./src/routes/position'));

// ESP32 Data Ingestion
const esp32Service = require('./src/services/esp32Service');
esp32Service.initialize(io);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });
  
  socket.on('device-command', (data) => {
    // Forward commands to ESP32 devices
    esp32Service.sendCommand(data);
  });
  
  socket.on('pillow_command', (data) => {
    console.log('Pillow command received:', data);
    // Forward pillow commands to ESP32
    esp32Service.sendCommand({
      type: 'pillow_control',
      command: data.type,
      timestamp: data.timestamp
    });
  });
  
  socket.on('pet_reminder', (data) => {
    console.log('Pet reminder set:', data);
    // Could integrate with notification service here
    socket.emit('reminder_set', {
      type: data.type,
      message: 'Reminder set successfully!',
      timestamp: Date.now()
    });
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});