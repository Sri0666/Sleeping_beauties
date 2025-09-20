#ifndef CONFIG_H
#define CONFIG_H

// WiFi Configuration
#define WIFI_SSID "YourWiFiNetwork"
#define WIFI_PASSWORD "YourWiFiPassword"
#define WIFI_TIMEOUT_MS 20000

// Server Configuration
#define SERVER_HOST "192.168.1.100"  // Your server IP
#define SERVER_PORT 8080
#define API_KEY "your_esp32_api_key_here"
#define DEVICE_ID "ESP32_001"

// Sensor Pin Definitions
#define MPU6050_SDA 21
#define MPU6050_SCL 22
#define MIC_PIN 34
#define DHT_PIN 4
#define DHT_TYPE DHT22
#define LIGHT_SENSOR_PIN 35
#define STATUS_LED_PIN 2

// Adaptive Pillow/Pad Configuration
#define SERVO_PIN 13               // Servo motor for pillow adjustment
#define PILLOW_BUTTON_PIN 12       // Manual adjustment button
#define SERVO_MIN_ANGLE 0          // Minimum servo angle (flat)
#define SERVO_MAX_ANGLE 45         // Maximum servo angle (raised)
#define SERVO_ADJUSTMENT_STEP 5    // Degrees per adjustment

// SD Card Pins (SPI)
#define SD_CS_PIN 5
#define SD_SCK_PIN 18
#define SD_MISO_PIN 19
#define SD_MOSI_PIN 23

// Sensor Configuration
#define SAMPLING_RATE_HZ 10          // Main sensor sampling rate
#define AUDIO_SAMPLING_RATE_HZ 1000  // Audio sampling for snoring detection
#define ENVIRONMENT_INTERVAL_MS 30000 // Environmental sensors every 30 seconds

// Sleep Detection Thresholds
#define MOVEMENT_THRESHOLD 0.5       // G-force threshold for movement detection
#define POSITION_CHANGE_THRESHOLD 30 // Degrees for position change
#define SNORING_THRESHOLD 500        // Audio level threshold for snoring
#define SNORING_FREQ_MIN 20          // Minimum frequency for snoring (Hz)
#define SNORING_FREQ_MAX 2000        // Maximum frequency for snoring (Hz)

// Restlessness Detection for Adaptive Pillow
#define RESTLESSNESS_THRESHOLD 10    // Number of movements in time window
#define RESTLESSNESS_WINDOW_MS 300000 // 5 minutes window for restlessness detection
#define PILLOW_ADJUSTMENT_COOLDOWN 600000 // 10 minutes between adjustments
#define MOVEMENT_INTENSITY_THRESHOLD 1.0  // Higher threshold for significant movement

// Power Management
#define DEEP_SLEEP_INTERVAL_MIN 5    // Deep sleep interval in minutes
#define BATTERY_LOW_THRESHOLD 20     // Battery percentage for low power mode
#define WIFI_RECONNECT_INTERVAL 30   // Seconds between WiFi reconnection attempts

// Data Transmission
#define BATCH_SIZE 10                // Number of readings to batch before sending
#define MAX_RETRY_ATTEMPTS 3         // Maximum retries for failed transmissions
#define HEARTBEAT_INTERVAL_MS 60000  // Send heartbeat every minute

// Calibration Values (adjust based on your setup)
#define ACCEL_OFFSET_X 0.0
#define ACCEL_OFFSET_Y 0.0
#define ACCEL_OFFSET_Z 0.0
#define GYRO_OFFSET_X 0.0
#define GYRO_OFFSET_Y 0.0
#define GYRO_OFFSET_Z 0.0

// Sleep Position Thresholds (in degrees from horizontal)
#define BACK_POSITION_MIN -30
#define BACK_POSITION_MAX 30
#define SIDE_POSITION_MIN 30
#define SIDE_POSITION_MAX 150
#define STOMACH_POSITION_MIN 150
#define STOMACH_POSITION_MAX 210

// Development/Debug Settings
#define DEBUG_MODE true
#define SERIAL_DEBUG true
#define LED_INDICATORS true
#define LOCAL_STORAGE_ENABLED true

// Advanced Features
#define ENABLE_OTA_UPDATES true
#define ENABLE_WEB_CONFIG true
#define ENABLE_SMART_ALARM false     // Set to true when smart alarm is implemented
#define ENABLE_SPINE_TRACKING false  // Set to true when spine sensors are connected
#define ENABLE_ADAPTIVE_PILLOW true  // Adaptive pillow/pad feature
#define ENABLE_SOUND_ANALYSIS true   // Enhanced sound tracking and analysis

// Device Information
#define FIRMWARE_VERSION "1.0.0"
#define DEVICE_MODEL "SleepTracker_ESP32"
#define MANUFACTURER "SleepingBeauties"

#endif // CONFIG_H