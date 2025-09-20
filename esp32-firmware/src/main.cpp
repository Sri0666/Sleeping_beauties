#include <Arduino.h>
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <SPI.h>
#include <SD.h>
#include <ESP32Servo.h>

#include "config.h"

// Global objects
WebSocketsClient webSocket;
Adafruit_MPU6050 mpu;
DHT dht(DHT_PIN, DHT_TYPE);
Servo pillowServo;

// Global variables
String currentUserId = "";
String currentSessionId = "";
bool isTracking = false;
bool wifiConnected = false;
unsigned long lastHeartbeat = 0;
unsigned long lastEnvironmentReading = 0;
unsigned long lastSensorReading = 0;

// Adaptive Pillow Variables
int currentPillowAngle = 0;
unsigned long lastPillowAdjustment = 0;
int movementCount = 0;
unsigned long movementWindowStart = 0;
bool restlessnessDetected = false;

// Data structures
struct SensorReading {
  float accelX, accelY, accelZ;
  float gyroX, gyroY, gyroZ;
  float temperature;
  float humidity;
  int lightLevel;
  int audioLevel;
  float movementIntensity;
  unsigned long timestamp;
};

struct SleepPosition {
  String position;
  float angle;
  float confidence;
};

struct SoundAnalysis {
  int level;
  float frequency;
  String classification;
  float confidence;
  bool isSnoring;
};

// Function declarations
void setupWiFi();
void setupSensors();
void setupAdaptivePillow();
void setupWebSocket();
void setupAdaptivePillow();
void webSocketEvent(WStype_t type, uint8_t* payload, size_t length);
void sendSensorData();
void sendSnoringData(int intensity, float frequency);
void sendPositionData(SleepPosition pos);
void sendRestlessnessAlert();
void sendPillowAdjustmentData(int angle, String reason);
void sendSoundAnalysis(SoundAnalysis sound);
void sendHeartbeat();
void processCommand(JsonDocument& doc);
SensorReading readSensors();
SleepPosition detectPosition(SensorReading reading);
SoundAnalysis analyzeSoundLevel(int audioLevel);
bool detectRestlessness(SensorReading reading);
void adjustPillow(int targetAngle, String reason);
void handlePillowButton();
void enterDeepSleep();
void handleLowPower();
void logToSD(String data);

void setup() {
  Serial.begin(115200);
  Serial.println("Sleeping Beauties ESP32 Sleep Tracker Starting...");
  
  // Initialize pins
  pinMode(STATUS_LED_PIN, OUTPUT);
  pinMode(LIGHT_SENSOR_PIN, INPUT);
  pinMode(PILLOW_BUTTON_PIN, INPUT_PULLUP);
  digitalWrite(STATUS_LED_PIN, HIGH); // Power on indicator
  
  // Initialize I2C
  Wire.begin(MPU6050_SDA, MPU6050_SCL);
  
  // Setup components
  setupSensors();
  setupAdaptivePillow();
  setupWiFi();
  setupWebSocket();
  
  // Initialize SD card for local backup
  if (LOCAL_STORAGE_ENABLED) {
    if (!SD.begin(SD_CS_PIN)) {
      Serial.println("SD Card initialization failed!");
    } else {
      Serial.println("SD Card initialized successfully");
    }
  }
  
  Serial.println("Setup complete! Ready to track sleep with adaptive pillow.");
  digitalWrite(STATUS_LED_PIN, LOW); // Setup complete
}

void loop() {
  unsigned long currentTime = millis();
  
  // Handle WebSocket communication
  webSocket.loop();
  
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    wifiConnected = false;
    setupWiFi();
  } else {
    wifiConnected = true;
  }
  
  // Send heartbeat
  if (currentTime - lastHeartbeat > HEARTBEAT_INTERVAL_MS) {
    sendHeartbeat();
    lastHeartbeat = currentTime;
  }
  
  // Read sensors and send data if tracking
  if (isTracking && (currentTime - lastSensorReading > (1000 / SAMPLING_RATE_HZ))) {
    SensorReading reading = readSensors();
    
    // Calculate movement magnitude for restlessness detection
    float accelMagnitude = sqrt(reading.accelX * reading.accelX + 
                               reading.accelY * reading.accelY + 
                               reading.accelZ * reading.accelZ);
    
    // Analyze restlessness and adjust pillow if needed
    analyzeRestlessness(accelMagnitude);
    
    // Detect sleep position
    SleepPosition position = detectPosition(reading);
    sendPositionData(position);
    
    // Enhanced sound analysis
    SoundAnalysis soundAnalysis = analyzeSoundLevel(reading.audioLevel);
    
    // Check for snoring with enhanced detection
    if (soundAnalysis.snoring_detected) {
      sendSnoringData(reading.audioLevel, 100.0); // Simplified frequency calculation
    }
    
    // Send general sensor data
    sendSensorData();
    
    lastSensorReading = currentTime;
  }
  
  // Read environmental sensors less frequently
  if (currentTime - lastEnvironmentReading > ENVIRONMENT_INTERVAL_MS) {
    // Environmental data is included in regular sensor readings
    lastEnvironmentReading = currentTime;
  }
  
  // Check manual pillow adjustment button
  static bool lastButtonState = HIGH;
  static unsigned long lastButtonPress = 0;
  bool currentButtonState = digitalRead(PILLOW_BUTTON_PIN);
  
  if (currentButtonState == LOW && lastButtonState == HIGH && 
      (currentTime - lastButtonPress > 500)) { // Debounce
    Serial.println("Manual pillow adjustment requested");
    adjustPillow();
    lastButtonPress = currentTime;
  }
  lastButtonState = currentButtonState;
  
  // Power management
  if (analogRead(34) < BATTERY_LOW_THRESHOLD) { // Simple battery check
    handleLowPower();
  }
  
  delay(100); // Small delay to prevent overwhelming the system
}

void setupWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  unsigned long startTime = millis();
  while (WiFi.status() != WL_CONNECTED && (millis() - startTime) < WIFI_TIMEOUT_MS) {
    delay(500);
    Serial.print(".");
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("WiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    wifiConnected = true;
  } else {
    Serial.println();
    Serial.println("WiFi connection failed!");
    wifiConnected = false;
  }
}

void setupSensors() {
  // Initialize MPU6050
  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip");
    while (1) {
      delay(10);
    }
  }
  Serial.println("MPU6050 Found!");
  
  // Configure MPU6050
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  
  // Initialize DHT22
  dht.begin();
  Serial.println("DHT22 initialized");
  
  delay(100);
}

void setupAdaptivePillow() {
  if (ENABLE_ADAPTIVE_PILLOW) {
    pillowServo.attach(SERVO_PIN);
    pillowServo.write(SERVO_MIN_ANGLE);
    currentPillowAngle = SERVO_MIN_ANGLE;
    movementWindowStart = millis();
    Serial.println("Adaptive pillow servo initialized");
  }
}

void setupWebSocket() {
  String url = "/ws?apiKey=" + String(API_KEY) + "&deviceId=" + String(DEVICE_ID);
  webSocket.begin(SERVER_HOST, SERVER_PORT, url);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
  Serial.println("WebSocket client initialized");
}

void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("WebSocket Disconnected");
      break;
      
    case WStype_CONNECTED:
      Serial.printf("WebSocket Connected to: %s\n", payload);
      // Send initial handshake
      sendHeartbeat();
      break;
      
    case WStype_TEXT: {
      Serial.printf("Received: %s\n", payload);
      
      // Parse JSON command
      DynamicJsonDocument doc(1024);
      DeserializationError error = deserializeJson(doc, payload);
      
      if (!error) {
        processCommand(doc);
      } else {
        Serial.println("Failed to parse JSON command");
      }
      break;
    }
    
    case WStype_ERROR:
      Serial.println("WebSocket Error");
      break;
      
    default:
      break;
  }
}

void processCommand(JsonDocument& doc) {
  String command = doc["command"];
  
  if (command == "start_sleep_tracking") {
    currentUserId = doc["parameters"]["userId"].as<String>();
    currentSessionId = doc["parameters"]["sessionId"].as<String>();
    isTracking = true;
    Serial.println("Sleep tracking started for user: " + currentUserId);
    
    // Send confirmation
    DynamicJsonDocument response(512);
    response["type"] = "command_response";
    response["command"] = "start_sleep_tracking";
    response["status"] = "success";
    response["sessionId"] = currentSessionId;
    
    String responseStr;
    serializeJson(response, responseStr);
    webSocket.sendTXT(responseStr);
    
  } else if (command == "stop_sleep_tracking") {
    isTracking = false;
    Serial.println("Sleep tracking stopped");
    
    DynamicJsonDocument response(512);
    response["type"] = "command_response";
    response["command"] = "stop_sleep_tracking";
    response["status"] = "success";
    
    String responseStr;
    serializeJson(response, responseStr);
    webSocket.sendTXT(responseStr);
    
  } else if (command == "ping") {
    DynamicJsonDocument response(512);
    response["type"] = "pong";
    response["timestamp"] = millis();
    
    String responseStr;
    serializeJson(response, responseStr);
    webSocket.sendTXT(responseStr);
    
  } else if (command == "calibrate_sensors") {
    // Perform sensor calibration
    Serial.println("Calibrating sensors...");
    // TODO: Implement calibration routine
    
  } else if (command == "update_config") {
    // Update device configuration
    Serial.println("Updating configuration...");
    // TODO: Implement configuration update
  }
}

SensorReading readSensors() {
  SensorReading reading;
  
  // Read MPU6050
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);
  
  reading.accelX = a.acceleration.x;
  reading.accelY = a.acceleration.y;
  reading.accelZ = a.acceleration.z;
  reading.gyroX = g.gyro.x;
  reading.gyroY = g.gyro.y;
  reading.gyroZ = g.gyro.z;
  
  // Read DHT22
  reading.temperature = dht.readTemperature();
  reading.humidity = dht.readHumidity();
  
  // Read light sensor
  reading.lightLevel = analogRead(LIGHT_SENSOR_PIN);
  
  // Read microphone
  reading.audioLevel = analogRead(MIC_PIN);
  
  reading.timestamp = millis();
  
  return reading;
}

SleepPosition detectPosition(SensorReading reading) {
  SleepPosition pos;
  
  // Calculate angle from accelerometer data
  float angle = atan2(reading.accelY, reading.accelZ) * 180.0 / PI;
  pos.angle = angle;
  
  // Determine position based on angle
  if (angle >= BACK_POSITION_MIN && angle <= BACK_POSITION_MAX) {
    pos.position = "back";
    pos.confidence = 0.9;
  } else if (angle >= SIDE_POSITION_MIN && angle <= SIDE_POSITION_MAX) {
    pos.position = "side";
    pos.confidence = 0.8;
  } else if (angle >= STOMACH_POSITION_MIN && angle <= STOMACH_POSITION_MAX) {
    pos.position = "stomach";
    pos.confidence = 0.7;
  } else {
    pos.position = "unknown";
    pos.confidence = 0.3;
  }
  
  return pos;
}

bool detectSnoring(int audioLevel) {
  // Simple snoring detection based on audio level
  // TODO: Implement more sophisticated frequency analysis
  return audioLevel > SNORING_THRESHOLD;
}

void sendSensorData() {
  if (!wifiConnected || !isTracking) return;
  
  SensorReading reading = readSensors();
  
  DynamicJsonDocument doc(1024);
  doc["type"] = "sleep_data";
  doc["deviceId"] = DEVICE_ID;
  doc["userId"] = currentUserId;
  doc["sessionId"] = currentSessionId;
  doc["timestamp"] = reading.timestamp;
  
  JsonObject data = doc.createNestedObject("data");
  
  JsonObject accel = data.createNestedObject("acceleration");
  accel["x"] = reading.accelX;
  accel["y"] = reading.accelY;
  accel["z"] = reading.accelZ;
  
  JsonObject gyro = data.createNestedObject("gyroscope");
  gyro["x"] = reading.gyroX;
  gyro["y"] = reading.gyroY;
  gyro["z"] = reading.gyroZ;
  
  JsonObject env = data.createNestedObject("environment");
  env["temperature"] = reading.temperature;
  env["humidity"] = reading.humidity;
  env["light"] = reading.lightLevel;
  env["audioLevel"] = reading.audioLevel;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  webSocket.sendTXT(jsonString);
  
  // Log to SD card as backup
  if (LOCAL_STORAGE_ENABLED) {
    logToSD(jsonString);
  }
}

void sendPositionData(SleepPosition pos) {
  if (!wifiConnected || !isTracking) return;
  
  DynamicJsonDocument doc(512);
  doc["type"] = "position_change";
  doc["deviceId"] = DEVICE_ID;
  doc["userId"] = currentUserId;
  doc["sessionId"] = currentSessionId;
  doc["timestamp"] = millis();
  
  JsonObject data = doc.createNestedObject("data");
  data["position"] = pos.position;
  data["angle"] = pos.angle;
  data["confidence"] = pos.confidence;
  
  String jsonString;
  serializeJson(doc, jsonString);
  webSocket.sendTXT(jsonString);
}

void sendSnoringData(int intensity, float frequency) {
  if (!wifiConnected || !isTracking) return;
  
  DynamicJsonDocument doc(512);
  doc["type"] = "snoring_detection";
  doc["deviceId"] = DEVICE_ID;
  doc["userId"] = currentUserId;
  doc["sessionId"] = currentSessionId;
  doc["timestamp"] = millis();
  
  JsonObject data = doc.createNestedObject("data");
  data["intensity"] = intensity;
  data["frequency"] = frequency;
  data["duration"] = 1000; // 1 second sample
  data["audioLevel"] = intensity;
  
  String jsonString;
  serializeJson(doc, jsonString);
  webSocket.sendTXT(jsonString);
}

void sendHeartbeat() {
  DynamicJsonDocument doc(512);
  doc["type"] = "heartbeat";
  doc["deviceId"] = DEVICE_ID;
  doc["timestamp"] = millis();
  
  JsonObject status = doc.createNestedObject("status");
  status["battery"] = 75; // TODO: Implement actual battery reading
  status["wifi"] = WiFi.RSSI();
  status["isTracking"] = isTracking;
  status["firmware"] = FIRMWARE_VERSION;
  
  String jsonString;
  serializeJson(doc, jsonString);
  webSocket.sendTXT(jsonString);
}

void handleLowPower() {
  Serial.println("Low power mode activated");
  // Reduce sampling rate
  // Turn off non-essential features
  // Consider deep sleep
}

void logToSD(String data) {
  File dataFile = SD.open("/sleep_data.txt", FILE_APPEND);
  if (dataFile) {
    dataFile.println(data);
    dataFile.close();
  }
}

void analyzeRestlessness(float accelMagnitude) {
  if (!ENABLE_ADAPTIVE_PILLOW) return;
  
  unsigned long currentTime = millis();
  
  // Reset movement count if time window has passed
  if (currentTime - movementWindowStart > RESTLESSNESS_WINDOW_MS) {
    movementCount = 0;
    movementWindowStart = currentTime;
  }
  
  // Check if movement exceeds threshold
  if (accelMagnitude > RESTLESSNESS_THRESHOLD) {
    movementCount++;
    lastMovementTime = currentTime;
    
    // If too many movements in window, adjust pillow
    if (movementCount >= RESTLESSNESS_COUNT_THRESHOLD && 
        currentTime - lastPillowAdjustment > MIN_PILLOW_ADJUST_INTERVAL) {
      adjustPillow();
    }
  }
}

void adjustPillow() {
  if (!ENABLE_ADAPTIVE_PILLOW) return;
  
  // Alternate between different angles for comfort
  int targetAngle;
  if (currentPillowAngle == SERVO_MIN_ANGLE) {
    targetAngle = SERVO_MAX_ANGLE;
  } else {
    targetAngle = SERVO_MIN_ANGLE;
  }
  
  Serial.println("Adjusting pillow for comfort - Detected restless movement");
  Serial.print("Moving pillow from ");
  Serial.print(currentPillowAngle);
  Serial.print(" to ");
  Serial.println(targetAngle);
  
  // Smooth servo movement
  int step = (targetAngle > currentPillowAngle) ? 2 : -2;
  while (abs(currentPillowAngle - targetAngle) > 1) {
    currentPillowAngle += step;
    pillowServo.write(currentPillowAngle);
    delay(30); // Smooth movement
  }
  
  currentPillowAngle = targetAngle;
  lastPillowAdjustment = millis();
  movementCount = 0; // Reset after adjustment
  
  // Send pillow adjustment notification
  sendPillowAdjustment(targetAngle);
}

void sendPillowAdjustment(int angle) {
  DynamicJsonDocument doc(512);
  doc["type"] = "pillow_adjustment";
  doc["angle"] = angle;
  doc["reason"] = "restlessness_detected";
  doc["timestamp"] = millis();
  doc["movement_count"] = movementCount;
  
  String jsonString;
  serializeJson(doc, jsonString);
  webSocket.sendTXT(jsonString);
}

SoundAnalysis analyzeSoundLevel(int soundLevel) {
  SoundAnalysis analysis;
  analysis.level = soundLevel;
  analysis.timestamp = millis();
  
  // Classify sound level
  if (soundLevel < 100) {
    analysis.classification = "quiet";
    analysis.snoring_detected = false;
  } else if (soundLevel < 300) {
    analysis.classification = "moderate";
    analysis.snoring_detected = false;
  } else if (soundLevel < 600) {
    analysis.classification = "loud";
    analysis.snoring_detected = true;
  } else {
    analysis.classification = "very_loud";
    analysis.snoring_detected = true;
  }
  
  // Update snoring streak
  static unsigned long lastSnoringTime = 0;
  static int snoringStreak = 0;
  
  if (analysis.snoring_detected) {
    if (millis() - lastSnoringTime < 10000) { // Within 10 seconds
      snoringStreak++;
    } else {
      snoringStreak = 1;
    }
    lastSnoringTime = millis();
  } else {
    if (millis() - lastSnoringTime > 30000) { // 30 seconds of quiet
      snoringStreak = 0;
    }
  }
  
  analysis.snoring_intensity = snoringStreak;
  return analysis;
}