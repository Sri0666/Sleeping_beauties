# Sleeping Beauties - Smart Sleep Tracking System

A comprehensive sleep tracking web application that interfaces with smart bed technology to monitor and analyze sleep patterns, providing intelligent insights and recommendations for better sleep quality. Features a fully functional web dashboard with AI-powered LLM data generation and plans for ESP32 hardware integration.

## 🌟 Features

### Real-Time Dashboard
- **5-Tab Interface**: Overview, Visualizations, Insights, Wellness, and Controls
- **AI-Powered Data Generation**: Uses Falcon-7B LLM for realistic sleep data with rule-based fallback
- **LLM Status Monitoring**: Real-time indicators showing AI availability and data source (LLM vs rule-based)
- **Auto/Manual Modes**: Continuous monitoring (3s intervals) or manual single scans
- **Connection Status**: Real-time API health monitoring with visual indicators

### Advanced Visualizations
- **Time-Series Charts**: SpO₂ and core pressure trends using Chart.js
- **Zone Pressure Chart**: Real-time bar chart showing pressure by body region
- **Bed Posture Equalizer**: Interactive canvas showing zone elevation with person overlay
- **8×8 Servo Heatmap**: Top-down activation grid with smooth gradients and body positioning
- **Pressure Mapping**: Color-coded body outline with pressure distribution analysis

### Intelligent Analytics
- **AI-Enhanced Sleep Quality**: LLM-powered quality scoring with intelligent pattern recognition
- **Smart Servo Recommendations**: Falcon-7B generated bed tilt suggestions with contextual reasoning
- **Position Detection**: AI-assisted sleeping position analysis (back/side/stomach) from pressure patterns
- **Snoring Analysis**: LLM-enhanced assessment combining multiple physiological indicators

### Interactive Controls
- **Manual Bed Control**: Drag-to-adjust equalizer for individual zone heights
- **Real-Time Preview**: Live updates across all visualizations when manual controls change
- **AI Analysis Button**: Trigger fresh LLM-powered recommendations and data generation

### Wellness Features
- **Daily Reminders**: Checkbox tracking for sleep hygiene habits
- **Caffeine Tracker**: Log intake with mini chart showing 24-hour consumption
- **Personalized Recommendations**: AI-powered sleep improvement suggestions based on data patterns

### Mobile-Optimized Design
- **Responsive Layout**: Side-by-side cards on desktop, stacked on mobile
- **Touch-Friendly Controls**: Optimized for mobile interaction
- **Adaptive Canvas Sizing**: Automatic canvas height adjustment for different screen sizes
- **Compressed Mobile UI**: Reduced padding and font sizes for optimal mobile viewing

## 🛠️ Tech Stack

### Backend
- **Node.js + Express 4.19.2**: Main web server and API
- **Python FastAPI**: AI/LLM service for advanced data generation
- **Falcon-7B LLM**: AI model for intelligent sleep data synthesis

### Frontend
- **Vanilla HTML5/CSS3/JavaScript (ES6+)**: Core web technologies
- **Chart.js 4.4.4 (CDN)**: Data visualization
- **HTML5 Canvas 2D Context**: Custom graphics and visualizations

### AI/ML
- **PyTorch**: Deep learning framework
- **Transformers**: Hugging Face library for LLM integration
- **Falcon-7B**: Large language model for contextual data generation

### Styling & Responsive Design
- **CSS Grid, Flexbox**: Layout systems
- **CSS Custom Properties**: Dynamic theming
- **Media Queries**: Mobile responsiveness

## 📁 Project Structure

```
Sleeping_beauties/
├── public/
│   ├── index.html          # Main app shell with 5-tab interface
│   └── app.js              # Frontend logic (1000+ lines) with LLM status indicators
├── python-api/
│   ├── main.py             # FastAPI server with Falcon-7B LLM integration
│   ├── requirements.txt    # Python dependencies (PyTorch, Transformers, etc.)
│   └── README.md           # Python API setup and troubleshooting guide
├── server.js               # Express server with LLM proxy and fallback logic
├── package.json            # Node.js dependencies and npm scripts
└── README.md               # This documentation
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** (specified in package.json engines)
- **Python 3.8+** with pip for LLM functionality
- Modern web browser with Canvas and ES6 support
- **Recommended**: 8GB+ RAM for Falcon-7B model (4GB minimum)

### Installation & Setup

#### 1. Install Node.js Dependencies
```powershell
# Clone the repository
git clone https://github.com/Sri0666/Sleeping_beauties.git
cd Sleeping_beauties

# Install Node.js dependencies
npm install
```

#### 2. Set Up Python LLM Environment (Optional but Recommended)
```powershell
# Navigate to Python API directory
cd python-api

# Create virtual environment (recommended)
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install Python dependencies
pip install -r requirements.txt
```

#### 3. Start the Services

**Option A: Full AI Experience (Recommended)**
```powershell
# Terminal 1: Start Python LLM API
cd python-api
python main.py

# Terminal 2: Start Node.js server
cd ..
npm start
```

**Option B: Rule-Based Only (Lighter Resource Usage)**
```powershell
# Just start Node.js server (automatic fallback)
npm start
```

### Access the Application
- Open your browser to **http://localhost:3000**
- The Overview tab loads automatically with live data generation
- **LLM Status Indicators**: Watch the status pills to see AI availability
  - **Green "LLM: Available"**: AI-powered data generation active
  - **Red "LLM: Unavailable"**: Fallback to rule-based system
  - **Blue "Source: AI LLM"**: Current data from Falcon-7B
  - **Red "Source: Rule-based"**: Current data from fallback system
- Click "Scan once" or enable "Auto mode" to start data generation

## 📡 API Endpoints

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "ok": true,
  "time": "2025-09-21T10:30:00.000Z",
  "llm": {
    "available": true,
    "url": "http://localhost:8001"
  }
}
```

### Generate Synthetic Data
```http
POST /api/generate
Content-Type: application/json

{
  "count": 10
}
```

**Response (LLM Active):**
```json
{
  "success": true,
  "source": "llm",
  "data": [
    {
      "pressure": {
        "head": 25, "neck": 28, "upper_torso": 45,
        "lower_torso": 48, "hips": 52, "thighs": 35, "knees": 32
      },
      "spO2": 96.5
    }
  ]
}
```

**Response (Fallback Mode):**
```json
{
  "success": true,
  "source": "fallback",
  "data": [ /* rule-based generated data */ ]
}
```

**Pressure Ranges (kPa):**
- Head/Neck: 20-35
- Upper/Lower Torso: 42-64
- Hips: 42-64
- Thighs/Knees: 30-52

### Servo Prediction
```http
POST /api/predict
Content-Type: application/json

{
  "pressure": { /* 7 body zones */ },
  "spO2": 96.5,
  "examples": [ /* optional training data */ ]
}
```

**Response:**
```json
{
  "success": true,
  "input": { "pressure": {...}, "spO2": 96.5 },
  "examples": [...],
  "servo_action": {
    "left_servo": 1,
    "right_servo": -1,
    "reasoning": "Low SpO2 and high core pressure → tilt left/up"
  }
}
```

## 🎨 User Interface

### Tab Navigation
- **Overview**: Live metrics, charts, and key statistics
- **Visualizations**: Bed equalizer and 8×8 servo heatmap
- **Insights**: Sleep position and snoring analysis
- **Wellness**: Daily reminders and caffeine tracking
- **Controls**: Manual bed adjustment with real-time preview

### Pressure Color Coding
- 🟢 **20-25 kPa**: Low pressure (green)
- 🟡 **25-40 kPa**: Normal pressure (yellow)
- 🟠 **40-55 kPa**: Elevated pressure (orange)
- 🔴 **55+ kPa**: High pressure (red)

### Interactive Features
- **Draggable Controls**: Manual equalizer bars for zone height adjustment
- **Real-Time Updates**: All visualizations sync instantly with data changes
- **Auto Refresh**: 3-second intervals when auto mode is enabled
- **Canvas Animations**: Smooth person overlay and gradient effects

## 📊 Data & Algorithms

### AI-Powered Data Generation
- **Falcon-7B LLM**: Contextual sleep data synthesis with physiological understanding
- **Realistic Constraints**: AI-generated data respects human sleep physiology
- **SpO₂ Correlation**: LLM understands relationships between position and oxygen levels
- **Event Simulation**: Intelligent modeling of sleep disturbances and position changes
- **Fallback System**: Rule-based generation when LLM unavailable

### Sleep Quality Algorithm
```javascript
// AI-enhanced or rule-based scoring
if (spO2 < 95) score -= (95 - spO2) * 2.5
if (coreAvg > 45) score -= (coreAvg - 45) * 1.2
```

### Servo Logic
```javascript
// LLM-powered or rule-based recommendation
// LLM considers context: sleep stage, position history, comfort patterns
// Fallback: traditional threshold-based approach
coreAvg = (upper_torso + lower_torso + hips) / 3

if (spO2 < 93 && coreAvg > 50) {
  return { left_servo: 1, right_servo: -1 }  // Tilt left/up
}
```

### LLM Integration Architecture
- **Hybrid System**: Python FastAPI + Node.js Express
- **Graceful Degradation**: Automatic fallback to rule-based system
- **Resource Management**: Efficient model loading and memory usage
- **Error Handling**: Robust timeout and failure recovery

## 🔧 Development

### Code Organization
- **server.js**: Express API with LLM proxy and fallback logic (140+ lines)
- **app.js**: Frontend logic with canvas rendering (1000+ lines)
- **index.html**: UI structure with responsive CSS (291 lines)

### Key Functions
- `generateSyntheticExample()`: Creates realistic pressure/SpO₂ data
- `ruleBasedServo()`: Determines bed tilt recommendations
- `drawBedViz()`: Renders equalizer-style bed visualization
- `drawGridViz()`: Creates 8×8 servo activation heatmap
- `updateCharts()`: Syncs Chart.js time-series and zone charts

- **python-api/main.py**: FastAPI server with Falcon-7B integration (200+ lines)
- **public/app.js**: Frontend with LLM status indicators (1100+ lines)
- **public/index.html**: Responsive 5-tab interface with status pills

### Canvas Rendering
- **Dynamic Sizing**: Canvases auto-resize to match CSS dimensions
- **Person Overlay**: Anatomically positioned body visualization
- **Gradient Effects**: Smooth color transitions for pressure mapping
- **Mobile Optimization**: Reduced canvas heights on small screens

## 🔍 Troubleshooting

### Common Issues

**API shows "Disconnected"**
- Verify Node.js server is running: `npm start`
- Check console for errors (F12 → Console)
- Ensure port 3000 is available

**LLM Status shows "Unavailable"**
- Verify Python API is running: `cd python-api && python main.py`
- Check if port 8001 is available
- Ensure Python dependencies are installed: `pip install -r requirements.txt`
- Monitor Python console for model loading errors
- **Note**: First startup may take 2-5 minutes to download Falcon-7B model

**"Source: Rule-based" instead of AI**
- LLM may be loading - wait 30-60 seconds after Python API startup
- Check Python API logs for errors
- Verify sufficient RAM (8GB+ recommended for Falcon-7B)
- System will automatically use rule-based fallback if LLM fails

**Blank or Missing Charts**
- Verify Chart.js CDN is loading (check Network tab)
- Activate each tab at least once for canvas initialization
- Check browser console for JavaScript errors

**Blurry Canvas Visualizations**
- Browser may need to recalculate canvas dimensions after resize
- Try switching tabs or refreshing the page
- Ensure CSS and canvas dimensions are properly synchronized

### Performance Notes
- **LLM Loading**: Initial Falcon-7B model download ~14GB
- **Memory Usage**: LLM requires 4-8GB RAM when active
- **Fallback Mode**: Automatic switch to lightweight rule-based system
- Canvas elements redraw automatically on window resize
- Chart.js data is limited to last 50 time points
- Auto mode generates new data every 3 seconds
- Manual controls update all visualizations in real-time

### Python API Troubleshooting
- **Model Download Fails**: Check internet connection and disk space
- **CUDA Errors**: Ensure compatible PyTorch version for your system
- **Memory Errors**: Try reducing model precision or use CPU-only mode
- **Port Conflicts**: Change port in `python-api/main.py` if 8001 is busy

## 🌐 Future Enhancements

While this is currently a complete demo application, potential extensions include:
- **Advanced LLM Integration**: Fine-tuned models for sleep medicine
- **Hardware Integration**: ESP32 sensor connectivity
- **Enhanced AI**: Multi-modal learning with sleep stage detection
- **Data Persistence**: User profiles and historical tracking
- **Smart Alarms**: Wake timing based on AI sleep phase predictions
- **Health Integration**: Export data for healthcare providers
- **Edge AI**: Local model optimization for reduced latency

## 🤝 Contributing

This project aims to revolutionize sleep tracking by reducing phone dependency and providing comprehensive, actionable sleep insights. We welcome contributions in:
- Hardware integration
- AI/ML algorithm development
- UI/UX improvements
- Documentation and testing