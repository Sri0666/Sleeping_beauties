# Sleeping Beauties - Smart Sleep Tracking System

A comprehensive sleep tracking webapp that interfaces with ESP32 devices to monitor and analyze sleep patterns, providing intelligent insights and recommendations for better sleep quality.

## Features

### Core Sleep Tracking
- **Snoring Detection**: Real-time audio analysis to detect and measure snoring intensity
- **Sleep Position Monitoring**: Track body position throughout the night
- **Spine Position Tracking**: Monitor spinal alignment during sleep (with sensor integration)
- **Sleep Quality Analysis**: Comprehensive analysis of sleep patterns and quality metrics

### Smart Features
- **Circadian Rhythm Optimization**: Sleep timing recommendations based on natural sleep cycles
- **Smart Alarms**: Wake up during optimal sleep phases for better alertness
- **Music & Sound Management**: Replace phone dependency with integrated audio controls
- **Sleep Environment Monitoring**: Track room conditions affecting sleep quality
- **Adaptive Pillow System**: Automated pillow adjustment based on restlessness detection
- **Virtual Sleep Assistant**: AI pet that provides sleep recommendations and reminders

### Analytics & Recommendations
- **AI-Powered Insights**: Personalized sleep improvement suggestions
- **Historical Trends**: Long-term sleep pattern analysis
- **Health Correlations**: Connect sleep data with daily activities and health metrics
- **Export Capabilities**: Data export for healthcare providers

## Architecture

```
├── backend/           # Node.js server with WebSocket support
├── frontend/          # React-based web application
├── esp32-firmware/    # ESP32 device firmware
├── docs/             # Documentation and API specs
└── database/         # Database schemas and migrations
```

## Hardware Requirements

### ESP32 Setup
- ESP32 microcontroller
- Microphone module (for snoring detection)
- Accelerometer/Gyroscope (MPU6050 or similar)
- Servo motor (for adaptive pillow adjustment)
- Push button (for manual pillow control)
- Optional: Additional sensors for spine tracking
- WiFi connectivity for data transmission

### Sensor Technologies for Spine Tracking
- **Flexible Sensors**: Bend sensors along the spine
- **IMU Arrays**: Multiple accelerometer/gyroscope units
- **Pressure Sensors**: Mattress-integrated pressure mapping
- **Wearable Patches**: Adhesive sensor patches for direct monitoring

## Getting Started

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### ESP32 Setup
1. Install Arduino IDE or PlatformIO
2. Upload firmware from `esp32-firmware/` directory
3. Configure WiFi credentials
4. Connect sensors according to wiring diagram

## API Documentation

### WebSocket Endpoints
- `/ws/sleep-data` - Real-time sleep tracking data
- `/ws/device-control` - Device configuration and control

### REST API
- `POST /api/sleep-sessions` - Start/stop sleep tracking
- `GET /api/analytics/:userId` - Retrieve sleep analytics
- `POST /api/recommendations` - Get personalized sleep recommendations

## Development Roadmap

- [x] Project structure and documentation
- [ ] Backend API and WebSocket implementation
- [ ] ESP32 firmware for basic sensors
- [ ] Frontend dashboard and analytics
- [ ] Sleep analysis algorithms
- [ ] Smart alarm system
- [ ] Spine tracking research and implementation
- [ ] AI recommendation engine
- [ ] Mobile responsiveness
- [ ] Cloud deployment

## Contributing

This project aims to revolutionize sleep tracking by reducing phone dependency and providing comprehensive, actionable sleep insights.

## License

MIT License - See LICENSE file for details