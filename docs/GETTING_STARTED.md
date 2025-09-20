# Getting Started with Sleeping Beauties

## Quick Start Guide

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- ESP32 development board
- Required sensors (MPU6050, DHT22, microphone)

### 1. Clone the Repository
```bash
git clone https://github.com/Sri0666/Sleeping_beauties.git
cd Sleeping_beauties
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all project dependencies
npm run install-all
```

### 3. Environment Setup

#### Backend Configuration
```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your configurations:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sleeping_beauties
JWT_SECRET=your_secret_key
ESP32_API_KEY=your_esp32_api_key
```

#### Frontend Configuration
Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SERVER_URL=http://localhost:5000
```

### 4. Start Development Servers

#### Option 1: Start All Services
```bash
npm run dev
```

#### Option 2: Start Services Individually
```bash
# Terminal 1 - Backend
npm run backend

# Terminal 2 - Frontend  
npm run frontend
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### 6. ESP32 Setup

1. **Install PlatformIO** (recommended) or Arduino IDE
2. **Configure Hardware**:
   ```
   ESP32 Pin | Component       | Connection
   ----------|-----------------|------------------
   GPIO21    | MPU6050 SDA     | I2C Data
   GPIO22    | MPU6050 SCL     | I2C Clock  
   GPIO34    | MAX4466 OUT     | Analog Audio
   GPIO4     | DHT22 DATA      | Temp/Humidity
   GPIO35    | Photoresistor   | Light Sensor
   GPIO2     | Status LED      | Device Status
   ```

3. **Update Configuration**:
   Edit `esp32-firmware/src/config.h`:
   ```cpp
   #define WIFI_SSID "YourWiFiNetwork"
   #define WIFI_PASSWORD "YourWiFiPassword"
   #define SERVER_HOST "192.168.1.100"  // Your computer's IP
   #define API_KEY "your_esp32_api_key_here"
   ```

4. **Upload Firmware**:
   ```bash
   cd esp32-firmware
   pio run --target upload
   ```

## Usage Guide

### Starting Sleep Tracking

1. **Ensure ESP32 is Connected**
   - Check dashboard for device status
   - Green indicator = connected
   - Red indicator = disconnected

2. **Start Tracking Session**
   - Click "Start Sleep Tracking" on dashboard
   - ESP32 will begin collecting data
   - Real-time metrics will appear

3. **Monitor Sleep**
   - View live position updates
   - Receive snoring alerts
   - Track environmental conditions

4. **Stop Tracking**
   - Click "Stop Sleep Tracking"
   - View session summary
   - Access detailed analytics

### Viewing Analytics

1. **Dashboard Overview**
   - Sleep quality score
   - Last night's summary
   - Weekly trends

2. **Detailed Analytics**
   - Navigate to Analytics page
   - View sleep stages
   - Position analysis
   - Environmental correlations

3. **Recommendations**
   - Get personalized tips
   - Track improvement progress
   - Set sleep goals

## Troubleshooting

### Common Issues

#### ESP32 Not Connecting
```bash
# Check device status
curl http://localhost:5000/api/devices/connected

# Verify WiFi configuration
# Check serial monitor for connection logs
```

#### Backend Connection Issues
```bash
# Check MongoDB connection
# Verify environment variables
# Check port availability
```

#### Frontend Not Loading
```bash
# Clear browser cache
# Check proxy configuration
# Verify API endpoints
```

### Debug Mode

Enable debug logging:
```bash
# Backend
DEBUG=sleeping-beauties:* npm run dev

# ESP32
# Set DEBUG_MODE to true in config.h
```

## Development Tips

### Code Structure
```
├── backend/
│   ├── src/routes/      # API endpoints
│   ├── src/models/      # Database schemas
│   ├── src/services/    # Business logic
│   └── src/middleware/  # Request processing
├── frontend/
│   ├── src/pages/       # Page components
│   ├── src/components/  # Reusable UI components
│   ├── src/services/    # API calls
│   └── src/utils/       # Helper functions
└── esp32-firmware/
    ├── src/main.cpp     # Main firmware
    ├── src/config.h     # Configuration
    └── platformio.ini   # Build configuration
```

### Adding New Features

1. **Backend API**:
   - Add route in `src/routes/`
   - Update models if needed
   - Test with Postman/curl

2. **Frontend Component**:
   - Create in `src/components/`
   - Add to appropriate page
   - Style with Material-UI

3. **ESP32 Sensor**:
   - Add pin configuration
   - Implement reading function
   - Send data via WebSocket

### Testing Hardware

1. **Sensor Validation**:
   ```cpp
   // Check individual sensors
   Serial.println(mpu.getAccelerationX());
   Serial.println(dht.readTemperature());
   ```

2. **WiFi Debugging**:
   ```cpp
   Serial.println(WiFi.status());
   Serial.println(WiFi.localIP());
   ```

3. **WebSocket Testing**:
   ```javascript
   // Browser console
   const ws = new WebSocket('ws://localhost:8080');
   ws.onmessage = (event) => console.log(event.data);
   ```

## Next Steps

1. **Explore Features**:
   - Try different sleep positions
   - Test snoring detection
   - View analytics

2. **Customize Settings**:
   - Adjust sensor thresholds
   - Configure notifications
   - Set sleep goals

3. **Contribute**:
   - Report issues
   - Suggest improvements
   - Add new features

## Support

- **Documentation**: `/docs` folder
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

Happy sleep tracking! 😴✨