# Adaptive Body Position System

An AI-powered sleep position optimization system that uses pressure sensor data and OpenRouter AI models to determine optimal body positioning for improved sleep quality.

## 🌟 Features

### 🎛️ Equalizer-Style Position Controller
- **4-Zone Control**: Head, Torso, Legs, and Feet elevation
- **Vertical Sliders**: Intuitive audio equalizer-like interface
- **Real-time Adjustment**: Immediate position changes with visual feedback
- **Safety Limits**: Constrained angles (Head: 0-45°, Torso: 0-30°, Legs: 0-20°, Feet: 0-15°)

### 🧠 AI-Powered Analysis
- **OpenRouter Integration**: Uses advanced language models for position optimization
- **Pressure Pattern Analysis**: Interprets pressure sensor data intelligently
- **Personalized Recommendations**: Considers user profile, sleep history, and current metrics
- **Fallback Algorithm**: Local optimization when AI service is unavailable

### 📊 Pressure Mapping Visualization
- **Interactive Body Diagram**: Visual representation of pressure distribution
- **Color-Coded Zones**: Pressure intensity indicated by color and opacity
- **Asymmetry Detection**: Identifies left-right pressure imbalances
- **Real-time Updates**: Live pressure monitoring and visualization

### 🔄 Multiple Operating Modes
- **Manual Mode**: Direct user control via sliders
- **Auto Mode**: AI-driven automatic adjustments
- **Test Mode**: Synthetic data scenarios for demonstration

### 🧪 Test Scenarios
- **Normal Sleep Position**: Balanced pressure distribution
- **Side Sleeper Issues**: High pressure on one side
- **Back Sleeper with Snoring**: Airway obstruction patterns
- **Restless Sleep**: Uneven pressure from movement

## 🏗️ Architecture

### Backend Components

#### OpenRouter Service (`openRouterService.js`)
- **AI Model Integration**: Communicates with OpenRouter API
- **Prompt Engineering**: Specialized prompts for sleep position analysis
- **Response Parsing**: Validates and sanitizes AI recommendations
- **Fallback Logic**: Basic algorithmic recommendations

#### Position Optimizer Service (`positionOptimizerService.js`)
- **Analysis Orchestration**: Coordinates AI analysis with user data
- **Physical Adjustment**: Interfaces with hardware control systems
- **History Tracking**: Records all adjustments and outcomes
- **Performance Monitoring**: Tracks comfort scores and effectiveness

#### Data Models (`PressureMapping.js`)
- **Comprehensive Schema**: Pressure zones, positions, and recommendations
- **Analysis Metrics**: Comfort index, symmetry score, total pressure
- **Adjustment History**: Detailed tracking of all position changes
- **Quality Metrics**: Data completeness and sensor accuracy

#### API Routes (`position.js`)
- **Analysis Endpoints**: Trigger AI analysis and get recommendations
- **Adjustment Control**: Execute individual or sequence adjustments
- **History Retrieval**: Access past adjustments and statistics
- **Emergency Controls**: Safety features for immediate stops

### Frontend Components

#### Body Position Controller (`BodyPositionController.js`)
- **Equalizer Interface**: 4 vertical sliders for body zones
- **AI Integration**: Request and apply AI recommendations
- **Mode Switching**: Manual, auto, and test operation modes
- **Visual Feedback**: Real-time position and recommendation display

#### Pressure Mapping Visualization (`PressureMappingVisualization.js`)
- **SVG Body Diagram**: Interactive pressure visualization
- **Statistics Panel**: Pressure analysis and distribution metrics
- **Hover Interactions**: Detailed zone information on mouseover
- **Color-Coded Scale**: Visual pressure intensity indicators

#### Adaptive Position System Page (`AdaptivePositionSystem.js`)
- **Comprehensive Dashboard**: Integrates all system components
- **Test Scenario Selection**: Choose from predefined pressure patterns
- **System Status**: Connection status and mode indicators
- **Integration Panel**: Shows connections with other sleep systems

## 🚀 Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- MongoDB database
- OpenRouter API account (optional, has fallback)

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install axios  # (already installed in this implementation)
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your settings:
   ```bash
   OPENROUTER_API_KEY=your-openrouter-api-key-here
   ENABLE_POSITION_CONTROL=true
   POSITION_ADJUSTMENT_DELAY=5000
   ```

3. **Start Server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install Dependencies** (already included in package.json)
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Access Position System**
   - Navigate to: `http://localhost:3000/position-system`
   - Available in sidebar as "Position System"

## 🎮 Usage Guide

### Getting Started

1. **Navigate to Position System**: Use the sidebar menu
2. **Select Mode**: Choose Manual, Auto, or Test mode
3. **Choose Test Scenario**: (Test mode only) Select pressure pattern
4. **Generate Data**: Click "AI Analysis" to get recommendations
5. **Apply Adjustments**: Use "Apply AI" or adjust sliders manually

### Manual Control

- **Adjust Sliders**: Drag vertical sliders to change elevation
- **View Changes**: Pressure map updates in real-time
- **Monitor Feedback**: Watch comfort indicators and recommendations

### AI Analysis

- **Trigger Analysis**: Click "AI Analysis" button
- **Review Recommendations**: See AI suggestions with reasoning
- **Apply Changes**: Use "Apply AI" for automatic adjustment
- **Monitor Results**: Track comfort score improvements

### Test Scenarios

- **Select Scenario**: Choose from dropdown menu
- **Generate Data**: New pressure data created automatically
- **Compare Results**: See how different patterns affect recommendations
- **Learn System**: Understand AI decision-making process

## 🔧 API Endpoints

### Analysis
- `POST /api/position/:userId/:sessionId/analyze` - Get AI recommendations
- `GET /api/position/:userId/:sessionId/current` - Current position data

### Control
- `POST /api/position/:userId/:sessionId/adjust` - Execute adjustments
- `POST /api/position/:userId/:sessionId/manual-adjust` - Manual adjustment
- `POST /api/position/:userId/:sessionId/emergency-stop` - Emergency stop

### Data
- `GET /api/position/:userId/history` - Adjustment history
- `GET /api/position/:userId/stats` - Position statistics
- `POST /api/position/test-scenario` - Generate test data

## 🧪 Test Data Format

```javascript
{
  scenario: "normal|side_sleeper_pressure|back_sleeper_snoring|restless_sleeper",
  head: { pressure: 8.5, distribution: { left: 45, right: 55 } },
  neck: { pressure: 6.2 },
  upperTorso: { pressure: 12.3 },
  lowerTorso: { pressure: 15.7 },
  hips: { pressure: 18.9 },
  thighs: { pressure: 11.4 },
  knees: { pressure: 7.8 },
  calves: { pressure: 9.1 },
  feet: { pressure: 5.6 },
  currentPosition: { head: 0, torso: 0, legs: 0, feet: 0 }
}
```

## 🔄 Integration

### Existing Features
- **Adaptive Pillow**: Continues working alongside position system
- **Sleep Tracking**: Position data integrated with sleep sessions
- **WebSocket**: Real-time updates for all components
- **User Profiles**: Personalized recommendations based on user data

### Hardware Interface
- **Simulated Control**: Current implementation simulates hardware
- **Hardware Ready**: API designed for real actuator control
- **Safety Features**: Emergency stops and angle limits
- **Feedback Loop**: Position confirmation and error handling

## 🛡️ Safety Features

- **Angle Limits**: Maximum safe elevation angles per body zone
- **Adjustment Delays**: Controlled timing between movements
- **Emergency Stop**: Immediate halt of all adjustments
- **Gradual Changes**: Smooth transitions to prevent discomfort
- **User Override**: Manual control always available

## 📈 Performance

- **Real-time Response**: Instant visual feedback
- **AI Processing**: ~2-5 seconds for analysis
- **Adjustment Speed**: ~100ms per degree of movement
- **Data Efficiency**: Optimized pressure data structures
- **Scalable Design**: Supports multiple concurrent users

## 🔮 Future Enhancements

- **Machine Learning**: Learn from user feedback
- **Sleep Phase Integration**: Adjust based on sleep stage
- **Multiple Profiles**: Family member settings
- **Voice Control**: Verbal position commands
- **Biometric Integration**: Heart rate and breathing correlation
- **Mobile App**: Smartphone control interface

## 🎯 Benefits

- **Improved Sleep Quality**: Optimized positioning reduces pressure points
- **AI-Powered Intelligence**: Advanced analysis beyond simple rules
- **User-Friendly Interface**: Intuitive equalizer-style controls
- **Real-time Feedback**: Immediate visual confirmation
- **Comprehensive Monitoring**: Detailed pressure and position tracking
- **Safety First**: Built-in limits and emergency controls

## 💡 Tips for Best Results

1. **Start with Test Mode**: Understand system behavior
2. **Use AI Recommendations**: Let AI optimize positions
3. **Monitor Comfort Scores**: Track improvement over time
4. **Adjust Gradually**: Make small incremental changes
5. **Set OpenRouter API Key**: Enable full AI capabilities
6. **Regular Calibration**: Ensure sensor accuracy

This adaptive position system represents a significant advancement in sleep technology, combining AI intelligence with intuitive user control for optimal sleep positioning.
