const mongoose = require('mongoose');

// Schema for individual pressure sensor zones
const PressureZoneSchema = new mongoose.Schema({
  pressure: {
    type: Number,
    required: true,
    min: 0,
    max: 100 // kPa
  },
  distribution: {
    left: { type: Number, min: 0, max: 100 }, // percentage
    right: { type: Number, min: 0, max: 100 }, // percentage
    center: { type: Number, min: 0, max: 100 } // percentage
  },
  contactArea: {
    type: Number, // cm²
    min: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Schema for body position settings
const BodyPositionSchema = new mongoose.Schema({
  head: {
    type: Number,
    required: true,
    min: 0,
    max: 45, // degrees
    default: 0
  },
  torso: {
    type: Number,
    required: true,
    min: 0,
    max: 30, // degrees
    default: 0
  },
  legs: {
    type: Number,
    required: true,
    min: 0,
    max: 20, // degrees
    default: 0
  },
  feet: {
    type: Number,
    required: true,
    min: 0,
    max: 15, // degrees
    default: 0
  }
});

// Schema for position adjustment recommendations
const PositionRecommendationSchema = new mongoose.Schema({
  bodyPart: {
    type: String,
    required: true,
    enum: ['head', 'torso', 'legs', 'feet']
  },
  targetAngle: {
    type: Number,
    required: true,
    min: 0,
    max: 45
  },
  currentAngle: {
    type: Number,
    required: true,
    min: 0,
    max: 45
  },
  reasoning: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  delaySeconds: {
    type: Number,
    default: 0,
    min: 0
  }
});

// Main pressure mapping data schema
const PressureMappingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SleepSession',
    required: true
  },
  
  // Pressure readings for different body zones
  pressureZones: {
    head: PressureZoneSchema,
    neck: PressureZoneSchema,
    upperTorso: PressureZoneSchema,
    lowerTorso: PressureZoneSchema,
    hips: PressureZoneSchema,
    thighs: PressureZoneSchema,
    knees: PressureZoneSchema,
    calves: PressureZoneSchema,
    feet: PressureZoneSchema
  },

  // Current body position
  currentPosition: {
    type: BodyPositionSchema,
    required: true
  },

  // AI-generated recommendations
  aiRecommendations: {
    recommendations: {
      head: {
        targetAngle: { type: Number, min: 0, max: 45 },
        reasoning: String
      },
      torso: {
        targetAngle: { type: Number, min: 0, max: 30 },
        reasoning: String
      },
      legs: {
        targetAngle: { type: Number, min: 0, max: 20 },
        reasoning: String
      },
      feet: {
        targetAngle: { type: Number, min: 0, max: 15 },
        reasoning: String
      }
    },
    overallAssessment: {
      pressureIssues: [String],
      comfortScore: { type: Number, min: 1, max: 10 },
      sleepQualityImpact: String,
      urgency: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
      }
    },
    adjustmentSequence: [PositionRecommendationSchema],
    additionalTips: [String],
    source: {
      type: String,
      enum: ['ai_analysis', 'fallback_algorithm', 'manual'],
      default: 'ai_analysis'
    }
  },

  // Analysis metadata
  analysis: {
    totalPressure: {
      type: Number,
      min: 0
    },
    pressureDistribution: {
      head: Number,
      torso: Number,
      legs: Number,
      feet: Number
    },
    symmetryScore: {
      type: Number,
      min: 0,
      max: 1 // 1 = perfectly symmetric
    },
    comfortIndex: {
      type: Number,
      min: 0,
      max: 10
    }
  },

  // Position adjustment history
  adjustmentHistory: [{
    timestamp: { type: Date, default: Date.now },
    bodyPart: {
      type: String,
      enum: ['head', 'torso', 'legs', 'feet']
    },
    fromAngle: Number,
    toAngle: Number,
    reason: String,
    source: {
      type: String,
      enum: ['ai_recommendation', 'manual_adjustment', 'automatic'],
      default: 'ai_recommendation'
    },
    success: { type: Boolean, default: true },
    userFeedback: {
      comfort: { type: Number, min: 1, max: 5 },
      effectiveness: { type: Number, min: 1, max: 5 },
      notes: String
    }
  }],

  // Environmental context
  environment: {
    temperature: Number, // Celsius
    humidity: Number, // percentage
    mattressFirmness: {
      type: String,
      enum: ['soft', 'medium', 'firm'],
      default: 'medium'
    }
  },

  // Quality metrics
  qualityMetrics: {
    dataCompleteness: {
      type: Number,
      min: 0,
      max: 1 // 1 = all sensors working
    },
    sensorAccuracy: {
      type: Number,
      min: 0,
      max: 1
    },
    lastCalibration: Date
  },

  // Timing
  timestamp: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number, // seconds
    default: 0
  }
}, {
  timestamps: true,
  collection: 'pressure_mappings'
});

// Indexes for efficient querying
PressureMappingSchema.index({ userId: 1, timestamp: -1 });
PressureMappingSchema.index({ sessionId: 1 });
PressureMappingSchema.index({ 'aiRecommendations.overallAssessment.urgency': 1 });
PressureMappingSchema.index({ timestamp: -1 });

// Methods
PressureMappingSchema.methods.calculateTotalPressure = function() {
  let total = 0;
  const zones = this.pressureZones;
  Object.keys(zones).forEach(zone => {
    if (zones[zone] && zones[zone].pressure) {
      total += zones[zone].pressure;
    }
  });
  this.analysis.totalPressure = total;
  return total;
};

PressureMappingSchema.methods.calculateSymmetryScore = function() {
  const zones = this.pressureZones;
  let symmetrySum = 0;
  let count = 0;

  // Calculate symmetry for zones that have left/right distribution
  Object.keys(zones).forEach(zone => {
    if (zones[zone] && zones[zone].distribution) {
      const { left, right } = zones[zone].distribution;
      if (left !== undefined && right !== undefined) {
        const symmetry = 1 - Math.abs(left - right) / 100;
        symmetrySum += symmetry;
        count++;
      }
    }
  });

  const score = count > 0 ? symmetrySum / count : 0.5;
  this.analysis.symmetryScore = score;
  return score;
};

PressureMappingSchema.methods.calculateComfortIndex = function() {
  const recommendations = this.aiRecommendations;
  if (!recommendations || !recommendations.overallAssessment) {
    this.analysis.comfortIndex = 5; // neutral
    return 5;
  }

  const comfortScore = recommendations.overallAssessment.comfortScore || 5;
  const urgency = recommendations.overallAssessment.urgency;
  
  // Adjust comfort index based on urgency
  let adjustedScore = comfortScore;
  if (urgency === 'high') adjustedScore -= 2;
  else if (urgency === 'medium') adjustedScore -= 1;
  
  // Ensure it stays within bounds
  adjustedScore = Math.max(1, Math.min(10, adjustedScore));
  
  this.analysis.comfortIndex = adjustedScore;
  return adjustedScore;
};

PressureMappingSchema.methods.addAdjustment = function(bodyPart, fromAngle, toAngle, reason, source = 'ai_recommendation') {
  this.adjustmentHistory.push({
    bodyPart,
    fromAngle,
    toAngle,
    reason,
    source,
    timestamp: new Date()
  });
  
  // Update current position
  if (this.currentPosition) {
    this.currentPosition[bodyPart] = toAngle;
  }
};

// Static methods for data analysis
PressureMappingSchema.statics.getAverageComfortScore = function(userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        averageComfort: { $avg: '$analysis.comfortIndex' },
        count: { $sum: 1 }
      }
    }
  ]);
};

PressureMappingSchema.statics.getPressureTrends = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
        },
        avgTotalPressure: { $avg: '$analysis.totalPressure' },
        avgComfort: { $avg: '$analysis.comfortIndex' },
        avgSymmetry: { $avg: '$analysis.symmetryScore' },
        adjustmentCount: { $sum: { $size: '$adjustmentHistory' } }
      }
    },
    { $sort: { '_id.date': 1 } }
  ]);
};

const PressureMapping = mongoose.model('PressureMapping', PressureMappingSchema);

module.exports = PressureMapping;
