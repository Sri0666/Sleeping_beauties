const mongoose = require('mongoose');

const sleepSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
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
  
  // Session timing
  startTime: {
    type: Date,
    required: true
  },
  endTime: Date,
  duration: Number, // in milliseconds
  
  // Session status
  status: {
    type: String,
    enum: ['active', 'completed', 'interrupted', 'cancelled'],
    default: 'active'
  },
  endReason: {
    type: String,
    enum: ['natural_wake', 'alarm', 'manual_stop', 'device_error', 'interrupted']
  },

  // Session settings
  settings: {
    snoringDetection: {
      type: Boolean,
      default: true
    },
    positionTracking: {
      type: Boolean,
      default: true
    },
    spineTracking: {
      type: Boolean,
      default: false
    },
    smartAlarm: {
      type: Boolean,
      default: false
    },
    alarmTime: String,
    alarmWindow: {
      type: Number,
      default: 30 // minutes
    },
    environmentMonitoring: {
      type: Boolean,
      default: true
    }
  },

  // Sleep analysis results
  analysis: {
    // Overall metrics
    sleepQuality: Number, // 0-100 score
    sleepEfficiency: Number, // percentage
    totalSleepTime: Number, // milliseconds
    timeInBed: Number, // milliseconds
    sleepOnset: Number, // minutes to fall asleep
    wakeAfterSleepOnset: Number, // minutes awake during night
    numberOfAwakenings: Number,

    // Sleep stages (in milliseconds)
    stages: {
      awake: Number,
      light: Number,
      deep: Number,
      rem: Number
    },

    // Position analysis
    positions: {
      back: Number, // time in milliseconds
      side: Number,
      stomach: Number,
      unknown: Number
    },
    positionChanges: Number,
    dominantPosition: {
      type: String,
      enum: ['back', 'side', 'stomach', 'unknown']
    },

    // Snoring analysis
    snoring: {
      totalTime: Number, // milliseconds
      intensity: {
        average: Number,
        peak: Number
      },
      frequency: Number, // events per hour
      positionCorrelation: {
        back: Number,
        side: Number,
        stomach: Number
      }
    },

    // Spine tracking (if available)
    spine: {
      alignmentScore: Number, // 0-100
      averageDeviation: Number, // degrees
      pressurePoints: [{
        location: String,
        intensity: Number,
        duration: Number
      }],
      recommendations: [String]
    },

    // Environment during sleep
    environment: {
      temperature: {
        average: Number,
        min: Number,
        max: Number
      },
      humidity: {
        average: Number,
        min: Number,
        max: Number
      },
      noise: {
        average: Number,
        peak: Number,
        disturbances: Number
      },
      light: {
        average: Number,
        peak: Number,
        disturbances: Number
      }
    }
  },

  // Raw data references
  dataCollected: {
    totalDataPoints: Number,
    sensorReadings: Number,
    audioSamples: Number,
    positionReadings: Number,
    environmentReadings: Number
  },

  // Subjective data (user-reported)
  userReport: {
    sleepQualityRating: {
      type: Number,
      min: 1,
      max: 10
    },
    morningFeeling: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'terrible']
    },
    dreamRecall: Boolean,
    nightmares: Boolean,
    sleepDisruptions: [{
      time: Date,
      reason: String,
      duration: Number
    }],
    notes: String
  },

  // Processing status
  processing: {
    rawDataProcessed: {
      type: Boolean,
      default: false
    },
    analysisComplete: {
      type: Boolean,
      default: false
    },
    recommendationsGenerated: {
      type: Boolean,
      default: false
    },
    processedAt: Date,
    processingErrors: [String]
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'sleep_sessions'
});

// Indexes for performance
sleepSessionSchema.index({ userId: 1, startTime: -1 });
sleepSessionSchema.index({ sessionId: 1 });
sleepSessionSchema.index({ deviceId: 1 });
sleepSessionSchema.index({ status: 1 });
sleepSessionSchema.index({ 'analysis.sleepQuality': -1 });
sleepSessionSchema.index({ createdAt: -1 });

// Virtual for session duration
sleepSessionSchema.virtual('calculatedDuration').get(function() {
  if (this.endTime && this.startTime) {
    return this.endTime - this.startTime;
  }
  return null;
});

// Pre-save middleware
sleepSessionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate duration if both start and end times are available
  if (this.endTime && this.startTime && !this.duration) {
    this.duration = this.endTime - this.startTime;
  }
  
  next();
});

// Methods
sleepSessionSchema.methods.calculateSleepEfficiency = function() {
  if (this.analysis && this.analysis.totalSleepTime && this.analysis.timeInBed) {
    return (this.analysis.totalSleepTime / this.analysis.timeInBed) * 100;
  }
  return null;
};

sleepSessionSchema.methods.getDominantSleepStage = function() {
  if (!this.analysis || !this.analysis.stages) return null;
  
  const stages = this.analysis.stages;
  let maxStage = 'light';
  let maxTime = stages.light || 0;
  
  Object.keys(stages).forEach(stage => {
    if (stages[stage] > maxTime) {
      maxTime = stages[stage];
      maxStage = stage;
    }
  });
  
  return maxStage;
};

sleepSessionSchema.methods.getSleepQualityFactors = function() {
  const factors = {};
  
  if (this.analysis) {
    factors.efficiency = this.analysis.sleepEfficiency;
    factors.deepSleepPercentage = this.analysis.stages?.deep ? 
      (this.analysis.stages.deep / this.analysis.totalSleepTime) * 100 : 0;
    factors.snoringImpact = this.analysis.snoring?.totalTime ? 
      (this.analysis.snoring.totalTime / this.analysis.totalSleepTime) * 100 : 0;
    factors.awakenings = this.analysis.numberOfAwakenings;
    factors.positionOptimal = this.analysis.dominantPosition === 'side';
  }
  
  return factors;
};

// Static methods
sleepSessionSchema.statics.getActiveSession = function(userId) {
  return this.findOne({ userId, status: 'active' });
};

sleepSessionSchema.statics.getUserSessions = function(userId, limit = 10, skip = 0) {
  return this.find({ userId })
    .sort({ startTime: -1 })
    .limit(limit)
    .skip(skip);
};

sleepSessionSchema.statics.getSessionsInDateRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    startTime: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ startTime: -1 });
};

module.exports = mongoose.model('SleepSession', sleepSessionSchema);