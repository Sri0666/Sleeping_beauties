const mongoose = require('mongoose');

const sleepDataSchema = new mongoose.Schema({
  dataId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  deviceId: {
    type: String,
    required: true
  },

  // Data categorization
  dataType: {
    type: String,
    required: true,
    enum: [
      'sleep_stage',
      'snoring_detection',
      'position_change',
      'spine_tracking',
      'environment',
      'movement',
      'heart_rate',
      'breathing',
      'audio_sample',
      'sensor_raw'
    ]
  },
  timestamp: {
    type: Date,
    required: true,
    index: true
  },

  // Core sensor data
  sensorData: {
    // Motion and position data
    accelerometer: {
      x: Number,
      y: Number,
      z: Number
    },
    gyroscope: {
      x: Number,
      y: Number,
      z: Number
    },
    magnetometer: {
      x: Number,
      y: Number,
      z: Number
    },
    
    // Audio data for snoring detection
    audio: {
      level: Number, // dB
      frequency: Number, // Hz
      duration: Number, // ms
      pattern: String,
      classification: {
        type: String,
        enum: ['snoring', 'breathing', 'movement', 'noise', 'silence']
      },
      confidence: Number // 0-1
    },

    // Environmental sensors
    environment: {
      temperature: Number, // Celsius
      humidity: Number, // percentage
      noise: Number, // dB
      light: Number, // lux
      airQuality: Number,
      pressure: Number // hPa
    },

    // Biometric data (if available)
    biometrics: {
      heartRate: Number, // BPM
      respiratoryRate: Number, // breaths per minute
      oxygenSaturation: Number, // percentage
      skinTemperature: Number
    }
  },

  // Processed information
  processed: {
    // Sleep stage classification
    sleepStage: {
      type: String,
      enum: ['awake', 'light', 'deep', 'rem', 'unknown']
    },
    stageConfidence: Number, // 0-1

    // Position classification
    position: {
      type: String,
      enum: ['back', 'side_left', 'side_right', 'stomach', 'upright', 'unknown']
    },
    positionConfidence: Number,
    positionAngle: Number, // degrees from horizontal

    // Movement analysis
    movement: {
      intensity: Number, // 0-10 scale
      type: {
        type: String,
        enum: ['micro', 'minor', 'major', 'transition']
      },
      duration: Number // milliseconds
    },

    // Snoring analysis
    snoring: {
      detected: Boolean,
      intensity: Number, // 0-10 scale
      frequency: Number, // Hz
      type: {
        type: String,
        enum: ['light', 'moderate', 'heavy', 'apnea_risk']
      }
    },

    // Spine tracking (if available)
    spine: {
      alignment: Number, // 0-100 score
      curvature: {
        cervical: Number,
        thoracic: Number,
        lumbar: Number
      },
      pressure: [{
        point: String,
        intensity: Number
      }],
      deviation: Number // degrees from optimal
    },

    // Environmental impact
    environmentalImpact: {
      temperature: {
        type: String,
        enum: ['optimal', 'too_hot', 'too_cold']
      },
      noise: {
        type: String,
        enum: ['quiet', 'moderate', 'disturbing']
      },
      light: {
        type: String,
        enum: ['dark', 'dim', 'bright']
      }
    }
  },

  // Quality metrics
  quality: {
    signalStrength: Number, // 0-100
    sensorAccuracy: Number, // 0-100
    noiseLevel: Number, // 0-100
    dataIntegrity: Number, // 0-100
    processingErrors: [String]
  },

  // Metadata
  deviceStatus: {
    batteryLevel: Number,
    signalStrength: Number,
    sensorStatus: [{
      sensor: String,
      status: String,
      accuracy: Number
    }]
  },

  // Processing information
  processing: {
    rawProcessed: {
      type: Boolean,
      default: false
    },
    algorithmsApplied: [String],
    processingTime: Number, // milliseconds
    processedAt: Date,
    version: String // algorithm version
  },

  // Anomaly detection
  anomalies: [{
    type: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    description: String,
    confidence: Number
  }],

  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'sleep_data',
  // Use time series optimization for large data sets
  timeseries: {
    timeField: 'timestamp',
    metaField: 'userId',
    granularity: 'seconds'
  }
});

// Indexes for time-series data optimization
sleepDataSchema.index({ userId: 1, timestamp: -1 });
sleepDataSchema.index({ sessionId: 1, timestamp: 1 });
sleepDataSchema.index({ dataType: 1, timestamp: -1 });
sleepDataSchema.index({ deviceId: 1, timestamp: -1 });
sleepDataSchema.index({ 'processed.sleepStage': 1 });
sleepDataSchema.index({ 'processed.snoring.detected': 1 });

// TTL index for data retention (optional - keep data for 2 years)
sleepDataSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 }); // 2 years

// Methods
sleepDataSchema.methods.isAnomalous = function() {
  return this.anomalies && this.anomalies.length > 0;
};

sleepDataSchema.methods.getHighSeverityAnomalies = function() {
  return this.anomalies ? this.anomalies.filter(a => 
    a.severity === 'high' || a.severity === 'critical'
  ) : [];
};

sleepDataSchema.methods.hasValidSensorData = function() {
  return this.quality && 
         this.quality.dataIntegrity > 70 && 
         this.quality.signalStrength > 50;
};

// Static methods for data analysis
sleepDataSchema.statics.getSessionData = function(sessionId, dataTypes = null) {
  const query = { sessionId };
  if (dataTypes) {
    query.dataType = { $in: dataTypes };
  }
  return this.find(query).sort({ timestamp: 1 });
};

sleepDataSchema.statics.getSnoringEvents = function(sessionId) {
  return this.find({
    sessionId,
    'processed.snoring.detected': true
  }).sort({ timestamp: 1 });
};

sleepDataSchema.statics.getPositionChanges = function(sessionId) {
  return this.aggregate([
    { $match: { sessionId, dataType: 'position_change' } },
    { $sort: { timestamp: 1 } },
    {
      $group: {
        _id: null,
        changes: { $push: { timestamp: '$timestamp', position: '$processed.position' } },
        count: { $sum: 1 }
      }
    }
  ]);
};

sleepDataSchema.statics.getEnvironmentalData = function(sessionId) {
  return this.find({
    sessionId,
    dataType: 'environment'
  }).select('timestamp sensorData.environment').sort({ timestamp: 1 });
};

sleepDataSchema.statics.getSleepStageTimeline = function(sessionId) {
  return this.find({
    sessionId,
    dataType: 'sleep_stage'
  }).select('timestamp processed.sleepStage processed.stageConfidence')
    .sort({ timestamp: 1 });
};

sleepDataSchema.statics.getDataQualityReport = function(sessionId) {
  return this.aggregate([
    { $match: { sessionId } },
    {
      $group: {
        _id: '$dataType',
        count: { $sum: 1 },
        avgQuality: { $avg: '$quality.dataIntegrity' },
        avgSignal: { $avg: '$quality.signalStrength' },
        anomalies: { $sum: { $cond: [{ $gt: [{ $size: '$anomalies' }, 0] }, 1, 0] } }
      }
    }
  ]);
};

module.exports = mongoose.model('SleepData', sleepDataSchema);