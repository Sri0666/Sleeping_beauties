# Adaptive Pillow System

## Overview

The Adaptive Pillow system is an innovative feature that automatically adjusts pillow elevation based on detected restlessness patterns during sleep. This helps improve comfort and potentially reduce sleep disruptions.

## How It Works

### Hardware Components
- **Servo Motor**: Controls pillow angle (0° to 90°)
- **ESP32 Controller**: Processes movement data and controls servo
- **Accelerometer**: Detects body movement and restlessness
- **Manual Button**: Allows manual pillow adjustment

### Detection Algorithm
1. **Movement Monitoring**: Continuous accelerometer data analysis
2. **Restlessness Threshold**: Configurable movement sensitivity (default: 10)
3. **Time Window Analysis**: 5-minute windows for movement counting
4. **Adjustment Triggers**: Automatic adjustment when excessive movement detected

### Configuration Parameters
```cpp
// In config.h
#define SERVO_PIN 13                        // Servo control pin
#define SERVO_MIN_ANGLE 0                   // Flat position
#define SERVO_MAX_ANGLE 90                  // Maximum elevation
#define RESTLESSNESS_THRESHOLD 10           // Movement sensitivity
#define RESTLESSNESS_WINDOW_MS 300000       // 5-minute window
#define RESTLESSNESS_COUNT_THRESHOLD 8      // Movements before adjustment
#define MIN_PILLOW_ADJUST_INTERVAL 900000   // 15-minute minimum between adjustments
```

## WebApp Integration

### Real-time Monitoring
- Live pillow angle display
- Movement count tracking
- Adjustment history
- Manual control interface

### User Interface Features
- **Angle Visualization**: Progress bar showing current pillow elevation
- **Restlessness Meter**: Real-time movement detection display
- **Manual Adjustment**: One-click pillow position change
- **Adjustment Log**: History of automatic and manual adjustments

### Notifications
- "Detected restless movement" alerts
- "Adjusting pillow angle for comfort" confirmations
- Movement pattern analysis

## Virtual Pet Assistant Integration

The Virtual Pet Assistant works alongside the adaptive pillow to provide comprehensive sleep support:

### Sleep Recommendations
- Optimal bedtime suggestions
- Meal timing recommendations (3 hours before bed)
- Daily sleep tips and advice

### Smart Reminders
- **Sleep Schedule**: Personalized bedtime reminders
- **Meal Timing**: Dinner time notifications
- **Sleep Hygiene**: Daily tips for better sleep

### Pet Characteristics
- **Mood System**: Pet reacts to sleep quality and patterns
- **Experience Points**: Gain XP for good sleep habits
- **Adaptive Responses**: Different suggestions based on sleep data

## Installation Instructions

### ESP32 Firmware Setup
1. Connect servo motor to pin 13
2. Connect manual button to pin 14 (with pull-up resistor)
3. Flash the updated firmware with adaptive pillow support
4. Configure WiFi and server connection

### Hardware Assembly
1. **Servo Mounting**: Secure servo motor under pillow/mattress
2. **Pillow Attachment**: Connect pillow pad to servo arm
3. **Button Placement**: Mount manual control button within reach
4. **Power Supply**: Ensure adequate power for servo operation

### WebApp Configuration
1. Ensure frontend includes AdaptivePillow component
2. Backend WebSocket should handle pillow_command events
3. Real-time data flow should include movement and angle data

## Safety Features

### Movement Limits
- Controlled servo speed for gentle adjustments
- Maximum angle limitations to prevent discomfort
- Minimum interval between adjustments

### Manual Override
- Physical button for immediate manual control
- WebApp manual adjustment capability
- Emergency stop functionality

### Monitoring
- Continuous position feedback
- Movement pattern logging
- Adjustment effectiveness tracking

## Usage Tips

### Optimal Positioning
- Place servo motor centrally under pillow area
- Ensure smooth pillow movement without obstruction
- Test manual controls before automated use

### Sensitivity Tuning
- Adjust restlessness threshold based on sleep patterns
- Monitor adjustment frequency and comfort
- Consider personal movement patterns during sleep

### Maintenance
- Regular servo motor inspection
- Button functionality testing
- Software updates for improved algorithms

## Troubleshooting

### Common Issues
1. **Servo Not Moving**: Check power supply and pin connections
2. **Excessive Adjustments**: Increase restlessness threshold
3. **No Movement Detection**: Verify accelerometer calibration
4. **Manual Button Unresponsive**: Check button wiring and debouncing

### Calibration
- Test servo range during setup
- Verify accelerometer sensitivity
- Adjust thresholds based on initial use

## Future Enhancements

### Planned Features
- Machine learning for personalized adjustment patterns
- Integration with sleep phase detection
- Multiple adjustment positions for different sleep stages
- Voice control integration
- Smart home ecosystem compatibility

### Research Opportunities
- Sleep quality correlation with pillow adjustments
- Optimal adjustment timing based on sleep cycles
- Personalized comfort profiles
- Long-term sleep improvement tracking