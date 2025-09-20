import axios from 'axios';

// Enable mock mode to run without a backend
const USE_MOCK = (process.env.REACT_APP_USE_MOCK || 'true') === 'true';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens (when implemented)
api.interceptors.request.use(
  (config) => {
    // Add auth token when available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Sleep API endpoints
// Helper: random integer in range
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper: generate last N days dates
const lastNDays = (n) => {
  const days = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push(d);
  }
  return days;
};

// Mock API implementation
const sleepAPIMock = {
  startSleepSession: async (sessionData) => {
    const session = {
      sessionId: `sess_${Date.now()}`,
      userId: sessionData.userId,
      deviceId: sessionData.deviceId,
      startTime: new Date().toISOString(),
      settings: sessionData.settings || {},
    };
    await new Promise(r => setTimeout(r, 300));
    return { data: { session } };
  },
  stopSleepSession: async (sessionId) => {
    await new Promise(r => setTimeout(r, 250));
    return { data: { ok: true, sessionId } };
  },
  getUserSessions: async (userId, limit = 10) => {
    // Generate a recent session as "today's" metrics
    const quality = randInt(65, 95);
    const durationHours = randInt(6, 9) + Math.random();
    const duration = Math.round(durationHours * 60 * 60 * 1000);
    const session = {
      sessionId: `sess_${Date.now() - 86400000}`,
      userId,
      deviceId: 'ESP32_001',
      startTime: new Date(Date.now() - duration - randInt(0, 60) * 60000).toISOString(),
      endTime: new Date(Date.now() - randInt(0, 30) * 60000).toISOString(),
      duration,
      quality,
      snoringEvents: randInt(0, 12),
      positionChanges: randInt(3, 25),
    };
    await new Promise(r => setTimeout(r, 300));
    return { data: { sessions: [session], total: 1 } };
  },
  getSessionData: async () => ({ data: { data: [] } }),
  getRealtimeData: async () => ({ data: {} }),
  updateSessionSettings: async () => ({ data: { ok: true } }),
  recordSleepData: async () => ({ data: { ok: true } }),
  getAnalytics: async (userId, period = '7d') => {
    const days = lastNDays(7);
    const trends = days.map(d => {
      const quality = randInt(60, 95);
      const durationH = 5.5 + Math.random() * 4; // 5.5h - 9.5h
      return {
        date: d.toISOString().slice(0,10),
        quality,
        durationMs: Math.round(durationH * 3600 * 1000),
      };
    });
    const avgQ = Math.round(trends.reduce((a, b) => a + b.quality, 0) / trends.length);
    const avgDur = Math.round(trends.reduce((a, b) => a + b.durationMs, 0) / trends.length);
    const summary = {
      averageQuality: avgQ,
      averageSleepDuration: avgDur,
      sleepEfficiency: randInt(75, 95),
      totalSnoringTime: randInt(0, 90) * 60 * 1000,
    };
    await new Promise(r => setTimeout(r, 350));
    return { data: { analytics: { trends, summary } } };
  },
  getSleepQuality: async () => ({ data: {} }),
  getCircadianAnalysis: async () => ({ data: {} }),
  getEnvironmentAnalysis: async () => ({ data: {} }),
  exportSleepData: async () => ({ data: { ok: true, url: '#' } }),
  getRecommendations: async () => {
    const recs = [
      { id: 'rec1', title: 'Maintain Consistent Bedtime', description: 'Aim to sleep within a 30-minute window each night.', category: 'routine', status: 'new' },
      { id: 'rec2', title: 'Reduce Screen Time', description: 'Avoid screens 60 minutes before bed to improve melatonin production.', category: 'habit', status: 'new' },
      { id: 'rec3', title: 'Optimize Bedroom Temperature', description: 'Keep temperature around 18-20°C for better sleep.', category: 'environment', status: 'new' },
    ];
    await new Promise(r => setTimeout(r, 200));
    return { data: { recommendations: recs } };
  },
  updateRecommendationStatus: async () => ({ data: { ok: true } }),
  getRecommendationEffectiveness: async () => ({ data: { score: randInt(60, 90) } }),
  getSmartAlarmConfig: async () => ({ data: { window: '07:00-07:30' } }),
  getImprovementPlan: async () => ({ data: { weeks: 4 } }),
};

const sleepAPIReal = {
  // Sleep Sessions
  startSleepSession: (sessionData) => 
    api.post('/sleep/sessions/start', sessionData),
  
  stopSleepSession: (sessionId, endReason = 'manual') => 
    api.post(`/sleep/sessions/${sessionId}/stop`, { endReason }),
  
  getUserSessions: (userId, limit = 10, page = 1, status = null) => 
    api.get(`/sleep/sessions/user/${userId}`, { 
      params: { limit, page, status } 
    }),
  
  getSessionData: (sessionId, dataType = null) => 
    api.get(`/sleep/sessions/${sessionId}/data`, { 
      params: { dataType } 
    }),
  
  getRealtimeData: (sessionId) => 
    api.get(`/sleep/sessions/${sessionId}/realtime`),
  
  updateSessionSettings: (sessionId, settings) => 
    api.put(`/sleep/sessions/${sessionId}/settings`, settings),
  
  recordSleepData: (sleepData) => 
    api.post('/sleep/data', sleepData),

  // Analytics
  getAnalytics: (userId, period = '30d', includeComparison = false) => 
    api.get(`/analytics/user/${userId}`, { 
      params: { period, includeComparison } 
    }),
  
  getSleepQuality: (userId) => 
    api.get(`/analytics/user/${userId}/quality`),
  
  getCircadianAnalysis: (userId) => 
    api.get(`/analytics/user/${userId}/circadian`),
  
  getEnvironmentAnalysis: (userId) => 
    api.get(`/analytics/user/${userId}/environment`),
  
  exportSleepData: (userId, format = 'json', dateRange = null) => 
    api.get(`/analytics/user/${userId}/export`, { 
      params: { format, dateRange } 
    }),

  // Recommendations
  getRecommendations: (userId, category = 'all') => 
    api.get(`/recommendations/user/${userId}`, { 
      params: { category } 
    }),
  
  updateRecommendationStatus: (recommendationId, status, feedback = null) => 
    api.put(`/recommendations/${recommendationId}/status`, { 
      status, feedback 
    }),
  
  getRecommendationEffectiveness: (userId) => 
    api.get(`/recommendations/user/${userId}/effectiveness`),
  
  getSmartAlarmConfig: (userId, targetWakeTime = null) => 
    api.get(`/recommendations/user/${userId}/smart-alarm`, { 
      params: { targetWakeTime } 
    }),
  
  getImprovementPlan: (userId, duration = '4weeks') => 
    api.get(`/recommendations/user/${userId}/improvement-plan`, { 
      params: { duration } 
    }),
};

// Device API endpoints
const deviceAPIMock = {
  getConnectedDevices: async () => {
    await new Promise(r => setTimeout(r, 200));
    return { data: { devices: [
      { deviceId: 'ESP32_001', status: 'online', battery: randInt(55, 98), firmware: '1.2.3', rssi: -randInt(40, 70) }
    ] } };
  },
  getDeviceStatus: async (deviceId) => ({ data: { deviceId, status: 'online' } }),
  sendDeviceCommand: async () => ({ data: { ok: true } }),
  startDeviceTracking: async () => ({ data: { ok: true } }),
  stopDeviceTracking: async () => ({ data: { ok: true } }),
  updateDeviceConfig: async () => ({ data: { ok: true } }),
  calibrateDevice: async () => ({ data: { ok: true } }),
  pingDevice: async () => ({ data: { ok: true } }),
};

const deviceAPIReal = {
  getConnectedDevices: () => 
    api.get('/devices/connected'),
  
  getDeviceStatus: (deviceId) => 
    api.get(`/devices/${deviceId}/status`),
  
  sendDeviceCommand: (deviceId, command, parameters = {}) => 
    api.post(`/devices/${deviceId}/command`, { command, parameters }),
  
  startDeviceTracking: (deviceId, userId, sessionId) => 
    api.post(`/devices/${deviceId}/start-tracking`, { userId, sessionId }),
  
  stopDeviceTracking: (deviceId, sessionId) => 
    api.post(`/devices/${deviceId}/stop-tracking`, { sessionId }),
  
  updateDeviceConfig: (deviceId, config) => 
    api.put(`/devices/${deviceId}/config`, config),
  
  calibrateDevice: (deviceId, sensorType = 'all') => 
    api.post(`/devices/${deviceId}/calibrate`, { sensorType }),
  
  pingDevice: (deviceId) => 
    api.post(`/devices/${deviceId}/ping`),
};

// Auth API endpoints (placeholders for future implementation)
const authAPIMock = {
  login: async () => ({ data: { token: 'mock' } }),
  register: async () => ({ data: { ok: true } }),
  logout: async () => ({ data: { ok: true } }),
  refreshToken: async () => ({ data: { token: 'mock' } }),
};

const authAPIReal = {
  login: (credentials) => 
    api.post('/auth/login', credentials),
  
  register: (userData) => 
    api.post('/auth/register', userData),
  
  logout: () => 
    api.post('/auth/logout'),
  
  refreshToken: () => 
    api.post('/auth/refresh'),
};

// Utility functions
const apiUtils = {
  // Format duration from milliseconds to readable string
  formatDuration: (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  },
  
  // Format sleep quality score to category
  formatSleepQuality: (score) => {
    if (score >= 90) return { category: 'Excellent', color: '#27ae60' };
    if (score >= 80) return { category: 'Good', color: '#2ecc71' };
    if (score >= 70) return { category: 'Fair', color: '#f39c12' };
    if (score >= 60) return { category: 'Poor', color: '#e67e22' };
    return { category: 'Terrible', color: '#e74c3c' };
  },
  
  // Format position to display name
  formatPosition: (position) => {
    const positions = {
      back: 'Back',
      side_left: 'Left Side',
      side_right: 'Right Side',
      side: 'Side',
      stomach: 'Stomach',
      upright: 'Upright',
      unknown: 'Unknown'
    };
    return positions[position] || position;
  },
  
  // Calculate sleep efficiency
  calculateSleepEfficiency: (totalSleepTime, timeInBed) => {
    if (!timeInBed || timeInBed === 0) return 0;
    return Math.round((totalSleepTime / timeInBed) * 100);
  },
  
  // Format timestamp to relative time
  formatRelativeTime: (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  },
  
  // Generate chart colors for sleep stages
  getSleepStageColors: () => ({
    awake: '#e74c3c',
    light: '#3498db',
    deep: '#9b59b6',
    rem: '#f39c12',
    unknown: '#95a5a6'
  }),
  
  // Validate session data
  validateSessionData: (sessionData) => {
    const required = ['userId', 'deviceId'];
    return required.every(field => sessionData[field]);
  }
};

export default (USE_MOCK ? sleepAPIMock : sleepAPIReal);
export const deviceAPI = (USE_MOCK ? deviceAPIMock : deviceAPIReal);
export const authAPI = (USE_MOCK ? authAPIMock : authAPIReal);
export { apiUtils };