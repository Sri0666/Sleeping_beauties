# Sleeping Beauties ESP32 Firmware

This directory contains the firmware for ESP32 devices used in the Sleeping Beauties sleep tracking system.

## Hardware Requirements

### Main Sleep Tracking Device
- **ESP32 Development Board** (ESP32-WROOM-32 or similar)
- **MPU6050** - 6-axis accelerometer/gyroscope for position tracking
- **MAX4466 Microphone Module** - For snoring detection
- **DHT22** - Temperature and humidity sensor
- **Photoresistor** - Light level detection
- **3.7V LiPo Battery** - For portable operation
- **MicroSD Card Module** - Local data backup (optional)

### Optional Spine Tracking Extension
- **Multiple MPU6050 sensors** - Placed along spine tracking garment
- **Flexible PCB** - For wearable sensor array
- **Pressure sensors** - For mattress integration

## Pin Configuration

```
ESP32 Pin | Component       | Function
----------|-----------------|------------------
GPIO21    | MPU6050 SDA     | I2C Data
GPIO22    | MPU6050 SCL     | I2C Clock
GPIO34    | MAX4466 OUT     | Analog Audio Input
GPIO4     | DHT22 DATA      | Temperature/Humidity
GPIO35    | Photoresistor   | Light Level (ADC)
GPIO2     | Status LED      | Device Status
GPIO5     | SD Card CS      | SPI Chip Select
GPIO18    | SD Card SCK     | SPI Clock
GPIO19    | SD Card MISO    | SPI Data Out
GPIO23    | SD Card MOSI    | SPI Data In
```

## Features

### Core Tracking
- Real-time sleep position monitoring
- Snoring detection and analysis
- Sleep environment monitoring (temp, humidity, light, noise)
- Movement and restlessness tracking

### Advanced Features
- Smart alarm with optimal wake timing
- WiFi connectivity for real-time data streaming
- Local data storage with cloud sync
- Low power modes for extended battery life
- OTA (Over-The-Air) firmware updates

### Spine Tracking (Optional)
- Multiple sensor fusion for spine curvature
- Pressure point detection
- Sleep surface analysis
- Posture recommendations

## Sensor Technologies for Spine Tracking

### 1. Wearable Sensor Array
- **Flex sensors**: Bend-sensitive resistors along spine
- **IMU chain**: Multiple MPU6050 sensors in series
- **Textile integration**: Sensors embedded in sleep garment

### 2. Mattress-Based Tracking
- **Pressure mapping**: Grid of pressure sensors in mattress topper
- **Strain gauges**: Detect body contour and weight distribution
- **Capacitive sensing**: Non-contact body position detection

### 3. Contactless Options
- **Camera-based**: Computer vision for posture analysis
- **Radar sensors**: Millimeter-wave radar for body tracking
- **Depth sensors**: ToF (Time of Flight) sensors

## Data Processing

### On-Device Processing
- Real-time sensor fusion
- Basic sleep stage estimation
- Noise filtering and data validation
- Emergency detection (sleep apnea, abnormal patterns)

### Cloud Processing
- Advanced sleep analysis algorithms
- Machine learning pattern recognition
- Long-term trend analysis
- Personalized recommendations

## Communication Protocol

### WebSocket Messages
```json
{
  "type": "sleep_data",
  "deviceId": "ESP32_001",
  "userId": "user123",
  "timestamp": 1634567890000,
  "data": {
    "position": "side",
    "acceleration": {"x": 0.1, "y": 9.8, "z": 0.2},
    "gyroscope": {"x": 0.01, "y": 0.02, "z": 0.01},
    "environment": {
      "temperature": 21.5,
      "humidity": 45,
      "light": 2,
      "noise": 25
    }
  }
}
```

## Power Management

### Sleep Modes
- **Light Sleep**: WiFi off, sensors at low frequency
- **Deep Sleep**: Wake on motion or timer
- **Active Mode**: Full sensing and transmission

### Battery Optimization
- Dynamic sampling rates based on activity
- WiFi power saving modes
- Sensor selective activation
- Scheduled wake intervals

## Installation

1. Install Arduino IDE or PlatformIO
2. Install ESP32 board package
3. Install required libraries (see `platformio.ini`)
4. Configure WiFi credentials in `config.h`
5. Upload firmware to ESP32

## Configuration

Edit `src/config.h` to customize:
- WiFi network settings
- Server endpoints
- Sensor calibration values
- Power management settings
- Data transmission intervals

## Calibration

### Initial Setup
1. Place device in known positions for calibration
2. Run calibration routine via web interface
3. Verify sensor readings and adjust thresholds
4. Test sleep tracking accuracy

### Ongoing Maintenance
- Weekly sensor drift correction
- Battery level monitoring
- Firmware update checks
- Data quality validation