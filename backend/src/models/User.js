const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic user information
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Personal information for sleep optimization
  profile: {
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say']
    },
    height: Number, // in cm
    weight: Number, // in kg
    timezone: {
      type: String,
      default: 'UTC'
    },
    occupation: String,
    shiftWork: {
      type: Boolean,
      default: false
    },
    workSchedule: {
      type: String,
      enum: ['regular', 'rotating', 'night', 'irregular']
    }
  },

  // Sleep preferences and history
  sleepPreferences: {
    targetSleepDuration: {
      type: Number,
      default: 8 * 60 * 60 * 1000 // 8 hours in milliseconds
    },
    preferredBedtime: {
      type: String,
      default: '22:30'
    },
    preferredWakeTime: {
      type: String,
      default: '06:30'
    },
    chronotype: {
      type: String,
      enum: ['morning', 'intermediate', 'evening'],
      default: 'intermediate'
    },
    sleepGoals: [{
      type: String,
      enum: [
        'improve_quality',
        'reduce_snoring',
        'better_timing',
        'less_interruptions',
        'deeper_sleep',
        'natural_wake',
        'reduce_fatigue'
      ]
    }]
  },

  // Health information relevant to sleep
  healthInfo: {
    sleepDisorders: [{
      type: String,
      enum: [
        'sleep_apnea',
        'insomnia',
        'restless_leg',
        'narcolepsy',
        'shift_work_disorder',
        'circadian_rhythm_disorder'
      ]
    }],
    medications: [{
      name: String,
      affectsSleep: Boolean,
      timing: String
    }],
    allergies: [String],
    chronicConditions: [String]
  },

  // App settings
  settings: {
    notifications: {
      sleepReminders: {
        type: Boolean,
        default: true
      },
      smartAlarm: {
        type: Boolean,
        default: true
      },
      weeklyReports: {
        type: Boolean,
        default: true
      },
      recommendations: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      dataSharing: {
        type: Boolean,
        default: false
      },
      researchParticipation: {
        type: Boolean,
        default: false
      }
    },
    units: {
      temperature: {
        type: String,
        enum: ['celsius', 'fahrenheit'],
        default: 'celsius'
      },
      weight: {
        type: String,
        enum: ['kg', 'lbs'],
        default: 'kg'
      },
      height: {
        type: String,
        enum: ['cm', 'ft'],
        default: 'cm'
      }
    }
  },

  // Device associations
  devices: [{
    deviceId: String,
    deviceType: {
      type: String,
      enum: ['esp32_main', 'spine_tracker', 'environmental']
    },
    nickname: String,
    addedAt: {
      type: Date,
      default: Date.now
    },
    active: {
      type: Boolean,
      default: true
    }
  }],

  // Account management
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: Date,
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
  collection: 'users'
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ userId: 1 });
userSchema.index({ 'devices.deviceId': 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Methods
userSchema.methods.toSafeObject = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

userSchema.methods.addDevice = function(deviceInfo) {
  const existingDevice = this.devices.find(d => d.deviceId === deviceInfo.deviceId);
  if (!existingDevice) {
    this.devices.push(deviceInfo);
  } else {
    existingDevice.active = true;
    existingDevice.nickname = deviceInfo.nickname || existingDevice.nickname;
  }
};

userSchema.methods.removeDevice = function(deviceId) {
  const deviceIndex = this.devices.findIndex(d => d.deviceId === deviceId);
  if (deviceIndex > -1) {
    this.devices[deviceIndex].active = false;
  }
};

module.exports = mongoose.model('User', userSchema);