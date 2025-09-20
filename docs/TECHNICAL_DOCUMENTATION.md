# Sleeping Beauties - Technical Documentation

## Overview

The Sleeping Beauties project is a comprehensive sleep tracking system that combines IoT hardware (ESP32), a robust backend API, and a modern web frontend to provide intelligent sleep analysis and recommendations.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ESP32 Device  │    │  Backend Server │    │ Frontend Web App│
│                 │    │                 │    │                 │
│ • Sleep Sensors │◄──►│ • REST API      │◄──►│ • React.js      │
│ • WiFi/WebSocket│    │ • WebSocket     │    │ • Material-UI   │
│ • Data Collection│    │ • MongoDB       │    │ • Charts.js     │
│ • Real-time Tx  │    │ • Sleep Analysis│    │ • Real-time UI  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Key Features Implemented

### 🔧 ESP32 Firmware
- **Real-time sensor data collection**
  - MPU6050 accelerometer/gyroscope for position tracking
  - DHT22 for temperature and humidity monitoring
  - Microphone for snoring detection
  - Light sensor for environment tracking

- **Smart Communication**
  - WebSocket connection to backend
  - Command processing for remote control
  - Automatic reconnection and error handling
  - Local data backup to SD card

- **Power Management**
  - Deep sleep modes for battery conservation
  - Dynamic sampling rates based on activity
  - Low power alerts and handling

### 🚀 Backend API (Node.js)
- **Comprehensive REST API**
  - Sleep session management
  - Real-time data ingestion
  - Analytics and reporting
  - Device management
  - Personalized recommendations

- **Real-time Communication**
  - WebSocket server for ESP32 devices
  - Socket.io for frontend real-time updates
  - Event-driven architecture
  - Scalable connection handling

- **Database Design**
  - MongoDB with optimized schemas
  - Time-series data handling
  - User profiles and preferences
  - Historical data retention

### 🎨 Frontend Web Application (React)
- **Modern UI/UX**
  - Dark theme optimized for sleep tracking
  - Material-UI components
  - Responsive design for all devices
  - Real-time data visualization

- **Core Features**
  - Dashboard with live metrics
  - Sleep session management
  - Analytics and trends
  - Device configuration
  - Personalized recommendations

## Spine Tracking Technologies

### 🔬 Researched Approaches

1. **Wearable Sensor Arrays**
   - Multiple IMU sensors placed along the spine
   - Flexible sensor strips integrated into sleepwear
   - Real-time curvature and alignment monitoring

2. **Pressure Mapping Systems**
   - Smart mattress with embedded pressure sensors
   - Body contour detection and analysis
   - Sleep surface pressure distribution

3. **Computer Vision Solutions**
   - Depth cameras for contactless monitoring
   - AI-powered posture analysis
   - Privacy-preserving processing

4. **Hybrid Approaches**
   - Combination of wearable and environmental sensors
   - Machine learning fusion algorithms
   - Adaptive sensing based on sleep patterns

### 🔧 Implementation Strategy
- **Phase 1**: Basic accelerometer-based position detection (✅ Implemented)
- **Phase 2**: Multi-sensor fusion for spine curvature
- **Phase 3**: Pressure mapping integration
- **Phase 4**: AI-powered posture recommendations

## Smart Features

### 🧠 Sleep Analysis Engine
- **Real-time Processing**
  - Sleep stage detection using sensor fusion
  - Movement and position analysis
  - Snoring intensity and frequency tracking
  - Environmental impact assessment

- **Advanced Analytics**
  - Circadian rhythm analysis
  - Sleep quality scoring
  - Trend identification
  - Correlation analysis

### ⏰ Smart Alarm System
- **Circadian Optimization**
  - Natural wake time detection
  - Sleep cycle-based alarms
  - Gradual wake sequences
  - Light therapy integration

- **Music and Sound Management**
  - Customizable wake sounds
  - White noise generation
  - Snoring feedback tones
  - Volume adaptation

### 🤖 AI Recommendations
- **Personalized Insights**
  - Sleep pattern analysis
  - Lifestyle correlation
  - Position training programs
  - Environmental optimization

- **Improvement Plans**
  - 4-week structured programs
  - Progress tracking
  - Adaptive recommendations
  - Goal setting and monitoring

## API Documentation

### Core Endpoints

#### Sleep Management
```
POST /api/sleep/sessions/start
POST /api/sleep/sessions/:id/stop
GET  /api/sleep/sessions/user/:userId
GET  /api/sleep/sessions/:id/data
```

#### Analytics
```
GET  /api/analytics/user/:userId
GET  /api/analytics/user/:userId/quality
GET  /api/analytics/user/:userId/circadian
GET  /api/analytics/user/:userId/environment
```

#### Device Management
```
GET  /api/devices/connected
POST /api/devices/:id/command
GET  /api/devices/:id/status
POST /api/devices/:id/calibrate
```

### WebSocket Events

#### ESP32 Communication
```javascript
// Device to Server
{
  "type": "sleep_data",
  "deviceId": "ESP32_001",
  "data": { "position": "side", "acceleration": {...} }
}

// Server to Device
{
  "type": "command",
  "command": "start_sleep_tracking",
  "parameters": { "userId": "123", "sessionId": "session_123" }
}
```

#### Frontend Updates
```javascript
// Real-time data updates
socket.on('sleep_data_update', (data) => { ... });
socket.on('snoring_alert', (data) => { ... });
socket.on('position_update', (data) => { ... });
```

## Installation & Setup

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### ESP32 Setup
1. Install PlatformIO or Arduino IDE
2. Configure WiFi credentials in `config.h`
3. Update server IP and API key
4. Upload firmware to ESP32
5. Connect sensors according to pin diagram

## Future Enhancements

### 🔮 Planned Features
- [ ] Mobile app development (React Native)
- [ ] Integration with health platforms (Apple Health, Google Fit)
- [ ] Multi-user support and family tracking
- [ ] Sleep coaching with certified specialists
- [ ] Integration with smart home systems
- [ ] Advanced spine tracking with medical-grade sensors

### 🚀 Technology Roadmap
- **Machine Learning**: TensorFlow.js for client-side analysis
- **Cloud Integration**: AWS/Azure for scalable data processing
- **Security**: End-to-end encryption for health data
- **Compliance**: HIPAA/GDPR compliance for medical applications

## Contributing

### Development Guidelines
1. Follow established code patterns
2. Write comprehensive tests
3. Document API changes
4. Ensure responsive design
5. Test with real hardware when possible

### Hardware Testing
- Use provided ESP32 configurations
- Validate sensor accuracy
- Test power consumption
- Verify WiFi connectivity

---

*Built with ❤️ for better sleep and health*