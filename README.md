# Sleeping Beauties - Sleep Dashboard# Sleeping Beauties - Smart Sleep Tracking System# Sleeping Beauties — Real‑Time Sleep Dashboard



A real-time sleep monitoring web application that simulates smart bed technology with synthetic data generation, pressure mapping, servo recommendations, and comprehensive sleep analytics. Built with Node.js/Express backend and vanilla JavaScript frontend with interactive visualizations.



## 🌟 FeaturesA comprehensive sleep tracking webapp that interfaces with smart bed technology to monitor and analyze sleep patterns, providing intelligent insights and recommendations for better sleep quality. Currently features a fully functional web dashboard with synthetic data simulation and plans for ESP32 hardware integration.# Sleeping Beauties - Smart Sleep Tracking System



### Real-Time Dashboard

- **5-Tab Interface**: Overview, Visualizations, Insights, Wellness, and Controls

- **Live Data Simulation**: Realistic synthetic pressure data for 7 body zones + SpO₂ monitoring## 🌟 Current Features

- **Auto/Manual Modes**: Continuous monitoring (3s intervals) or manual single scans

- **Connection Status**: Real-time API health monitoring with visual indicators



### Advanced Visualizations### Real-Time DashboardA minimal Node/Express web app that simulates a smart bed with real‑time visualizations, controls, and wellness insights. It generates realistic synthetic pressure/SpO₂ data, recommends servo actions, and renders multiple canvas‑based views alongside charts. The UI is optimized for desktop and mobile and includes a Controls tab for manual overrides.A comprehensive sleep tracking webapp that interfaces with ESP32 devices to monitor and analyze sleep patterns, providing intelligent insights and recommendations for better sleep quality.

- **Time-Series Charts**: SpO₂ and core pressure trends using Chart.js

- **Zone Pressure Chart**: Real-time bar chart showing pressure by body region- **Tabbed Interface**: Overview, Visualizations, Insights, Wellness, and Controls

- **Bed Posture Equalizer**: Interactive canvas showing zone elevation with person overlay

- **8×8 Servo Heatmap**: Top-down activation grid with smooth gradients and body positioning- **Live Data Stream**: Synthetic pressure mapping by body zone + SpO₂ monitoring  

- **Pressure Mapping**: Color-coded body outline with pressure distribution analysis

- **Intelligent Recommendations**: Rule-based servo actions with reasoning

### Intelligent Analytics

- **Sleep Quality Scoring**: Dynamic calculation with penalties for low SpO₂ and high pressure- **Interactive Controls**: Manual equalizer for per-zone height adjustments## Features

- **Servo Recommendations**: Rule-based left/right bed tilt suggestions with reasoning

- **Position Detection**: Estimated sleeping position (back/side/stomach) from pressure patterns

- **Snoring Analysis**: Heuristic assessment based on head/neck pressure and SpO₂ levels

### Advanced Visualizations

### Interactive Controls

- **Manual Bed Control**: Drag-to-adjust equalizer for individual zone heights- **Bed Posture View**: Equalizer-style visualization showing zone elevation

- **Real-Time Preview**: Live updates across all visualizations when manual controls change

- **Pressure Zone Analysis**: Detailed breakdown of head/neck, torso, legs, and feet pressure- **8×8 Servo Heatmap**: Top-down activation view with body overlay- Tabbed dashboard UI (Overview, Visualizations, Insights, Wellness, Controls)### Core Sleep Tracking

- **AI Analysis Button**: Trigger fresh recommendations and data generation

- **Pressure Mapping**: Color-coded body pressure distribution analysis

### Wellness Features

- **Daily Reminders**: Checkbox tracking for sleep hygiene habits- **Time-Series Charts**: SpO₂ and core pressure trends- Real‑time synthetic data stream (pressure by body zone + SpO₂)- **Snoring Detection**: Real-time audio analysis to detect and measure snoring intensity

- **Caffeine Tracker**: Log intake with mini chart showing 24-hour consumption

- **Personalized Recommendations**: Sleep improvement suggestions based on data patterns- **Zone Analysis**: Real-time pressure breakdown by body region



### Mobile-Optimized Design- Rule‑based servo recommendation (left/right tilt) with reasoning- **Sleep Position Monitoring**: Track body position throughout the night

- **Responsive Layout**: Side-by-side cards on desktop, stacked on mobile

- **Touch-Friendly Controls**: Optimized for mobile interaction### Sleep Analytics

- **Adaptive Canvas Sizing**: Automatic canvas height adjustment for different screen sizes

- **Compressed Mobile UI**: Reduced padding and font sizes for optimal mobile viewing- **Position Detection**: Estimated sleeping position (back/side/stomach)- Visualizations- **Spine Position Tracking**: Monitor spinal alignment during sleep (with sensor integration)



## 🛠️ Tech Stack- **Snoring Analysis**: Heuristic-based snoring likelihood assessment



- **Backend**: Node.js + Express 4.19.2- **Sleep Quality Scoring**: Comprehensive quality metrics with penalty system  - Equalizer‑style bed posture view- **Sleep Quality Analysis**: Comprehensive analysis of sleep patterns and quality metrics

- **Frontend**: Vanilla HTML5/CSS3/JavaScript (ES6+)

- **Charts**: Chart.js 4.4.4 (CDN)- **Wellness Tracking**: Daily reminders and caffeine intake monitoring

- **Visualizations**: HTML5 Canvas 2D Context for custom graphics

- **Styling**: CSS Grid, Flexbox, CSS Custom Properties, Media Queries  - Top‑down 8×8 servo activation heatmap with body overlay

- **Data**: Synthetic generation with realistic physiological constraints

### Mobile-Optimized Design

## 📁 Project Structure

- **Responsive Layout**: Side-by-side cards on wide screens, stacked on mobile  - Pressure Mapping body distribution view### Smart Features

```

Sleeping_beauties/- **Compressed UI**: Optimized spacing and canvas sizing for phones

├── public/

│   ├── index.html          # Main app shell with 5-tab interface- **Touch-Friendly**: Interactive controls designed for mobile interaction  - Time‑series chart: SpO₂ and core pressure average- **Circadian Rhythm Optimization**: Sleep timing recommendations based on natural sleep cycles

│   └── app.js              # Frontend logic (1000+ lines)

├── server.js               # Express server with synthetic data APIs

├── package.json            # Dependencies and npm scripts

└── README.md               # This documentation## 🚀 Future Vision  - Zone pressure bar chart- **Smart Alarms**: Wake up during optimal sleep phases for better alertness

```



## 🚀 Getting Started

### Smart Hardware Integration- Controls- **Music & Sound Management**: Replace phone dependency with integrated audio controls

### Prerequisites

- **Node.js 18+** (specified in package.json engines)- **ESP32 Connectivity**: Real sensor data from embedded devices

- Modern web browser with Canvas and ES6 support

- **Snoring Detection**: Real-time audio analysis capabilities  - Manual equalizer for per‑zone heights with live preview (bed + 8×8)- **Sleep Environment Monitoring**: Track room conditions affecting sleep quality

### Installation & Setup

```powershell- **Spine Position Tracking**: Advanced sensor integration for spinal alignment

# Clone the repository

git clone https://github.com/Sri0666/Sleeping_beauties.git- **Adaptive Pillow System**: AI-powered servo motor adjustments  - Pressure Mapping and zone analysis panel- **AI-Powered Adaptive Pillow**: LLM-driven automated pillow adjustment based on pressure readings and SpO₂ levels

cd Sleeping_beauties



# Install dependencies

npm install### AI & Machine Learning  - Reset and quick "AI Analysis" (triggers a fresh scan)- **Virtual Sleep Assistant**: AI pet that provides sleep recommendations and reminders



# Start the server- **LLM Integration**: Transformer-based models for intelligent adjustments

npm start

```- **Confidence Scoring**: AI reasoning and confidence levels for recommendations- Insights & Wellness



### Access the Application- **Few-Shot Learning**: Adaptive system learning from minimal user data

- Open your browser to **http://localhost:3000**

- The Overview tab loads automatically with live synthetic data- **Circadian Optimization**: Sleep timing recommendations based on natural cycles  - Estimated sleeping position and snoring likelihood### AI & Machine Learning

- Click "Scan once" or enable "Auto mode" to start data generation



## 📡 API Endpoints

### Advanced Features  - Daily reminders and caffeine intake tracker with mini chart- **LLM Integration**: Transformer-based models for intelligent pillow adjustments

### Health Check

```http- **Smart Alarms**: Wake during optimal sleep phases

GET /api/health

```- **Environment Monitoring**: Room condition tracking- Mobile‑friendly responsive layout with side‑by‑side cards on wide screens- **Synthetic Data Generation**: AI-generated training data for personalized recommendations

**Response:**

```json- **Health Correlations**: Connect sleep data with daily activities

{

  "ok": true,- **Export Capabilities**: Data sharing with healthcare providers- **Real-time Prediction**: Instant servo action predictions based on sleep metrics

  "time": "2025-09-21T10:30:00.000Z"

}

```

## 🛠️ Tech Stack## Tech Stack- **Confidence Scoring**: AI provides confidence levels and reasoning for each adjustment

### Generate Synthetic Data

```http

POST /api/generate

Content-Type: application/json**Current Implementation:**- **Few-shot Learning**: Adaptive system that learns from minimal user data



{- **Backend**: Node.js + Express (JSON APIs + static hosting)

  "count": 10

}- **Frontend**: Vanilla HTML/CSS/JS with Chart.js- Backend: Node.js + Express (static hosting + JSON APIs)

```

**Response:**- **Visualization**: Canvas 2D rendering for custom graphics

```json

{- **Data**: Synthetic generation with realistic constraints- Frontend: Vanilla HTML/CSS/JS### Analytics & Recommendations

  "success": true,

  "data": [

    {

      "pressure": {**Planned Architecture:**- Charts: Chart.js (CDN)- **AI-Powered Insights**: Personalized sleep improvement suggestions

        "head": 25, "neck": 28, "upper_torso": 45,

        "lower_torso": 48, "hips": 52, "thighs": 35, "knees": 32- **Backend**: Node.js with WebSocket support

      },

      "spO2": 96.5- **Frontend**: React-based dashboard (migration planned)- Canvas rendering: 2D contexts for custom visuals- **Historical Trends**: Long-term sleep pattern analysis

    }

  ]- **Hardware**: ESP32 with sensor modules

}

```- **AI**: Python + PyTorch for machine learning components- **Health Correlations**: Connect sleep data with daily activities and health metrics



**Pressure Ranges (kPa):**

- Head/Neck: 20-35

- Upper/Lower Torso: 42-64  ## 📁 Project Structure## Project Structure- **Export Capabilities**: Data export for healthcare providers

- Hips: 42-64

- Thighs/Knees: 30-52



### Servo Prediction**Current:**

```http

POST /api/predict```

Content-Type: application/json

Sleeping_beauties/```## Architecture

{

  "pressure": { /* 7 body zones */ },├── public/

  "spO2": 96.5,

  "examples": [ /* optional training data */ ]│   ├── index.html      # App shell, styles, tabs, canvasesSleeping_beauties/

}

```│   └── app.js          # UI logic, charts, canvases, API calls

**Response:**

```json├── server.js           # Express server + synthetic data APIs├─ public/```

{

  "success": true,├── package.json        # Dependencies and scripts

  "input": { "pressure": {...}, "spO2": 96.5 },

  "examples": [...],└── README.md           # Project documentation│  ├─ index.html        # App shell, styles, tabs, canvases├── backend/           # Node.js server with WebSocket support

  "servo_action": {

    "left_servo": 1,```

    "right_servo": -1,

    "reasoning": "Low SpO2 and high core pressure → tilt left/up"│  └─ app.js            # UI logic, charts, canvases, fetch calls├── frontend/          # React-based web application

  }

}**Planned:**

```

```├─ server.js            # Express server + synthetic data & prediction APIs├── esp32-firmware/    # ESP32 device firmware

## 🎨 User Interface

├── backend/            # Node.js server with WebSocket support

### Tab Navigation

- **Overview**: Live metrics, charts, and key statistics├── frontend/           # React-based web application  ├─ package.json         # Scripts and dependencies├── docs/             # Documentation and API specs

- **Visualizations**: Bed equalizer and 8×8 servo heatmap  

- **Insights**: Sleep position and snoring analysis├── esp32-firmware/     # ESP32 device firmware

- **Wellness**: Daily reminders and caffeine tracking

- **Controls**: Manual bed adjustment with real-time preview├── docs/              # Documentation and API specs└─ README.md            # This file└── database/         # Database schemas and migrations



### Pressure Color Coding└── database/          # Database schemas and migrations

- 🟢 **20-25 kPa**: Low pressure (green)

- 🟡 **25-40 kPa**: Normal pressure (yellow)  `````````

- 🟠 **40-55 kPa**: Elevated pressure (orange)

- 🔴 **55+ kPa**: High pressure (red)



### Interactive Features## 🚀 Getting Started

- **Draggable Controls**: Manual equalizer bars for zone height adjustment

- **Real-Time Updates**: All visualizations sync instantly with data changes

- **Auto Refresh**: 3-second intervals when auto mode is enabled

- **Canvas Animations**: Smooth person overlay and gradient effects### Prerequisites## Getting Started## Hardware Requirements



## 📊 Data & Algorithms- Node.js 18+ (see `"engines"` in package.json)



### Synthetic Data Generation- Modern web browser

- **Realistic Constraints**: Pressure ranges based on actual sleep research

- **SpO₂ Correlation**: Values influenced by core pressure load

- **Event Simulation**: 10% chance of temporary SpO₂ drops

- **Physiological Accuracy**: Zone-specific pressure distributions### Quick StartPrerequisites### ESP32 Setup



### Sleep Quality Algorithm1. **Clone the repository**

```javascript

// Starts at 100, applies penalties   ```powershell- Node.js 18+ (see `"engines"` in package.json)- ESP32 microcontroller

if (spO2 < 95) score -= (95 - spO2) * 2.5

if (coreAvg > 45) score -= (coreAvg - 45) * 1.2   git clone https://github.com/Sri0666/Sleeping_beauties.git

```

   cd Sleeping_beauties- Microphone module (for snoring detection)

### Servo Logic

```javascript   ```

// Rule-based recommendation

coreAvg = (upper_torso + lower_torso + hips) / 3Install & run- Accelerometer/Gyroscope (MPU6050 or similar)

if (spO2 < 93 && coreAvg > 50) {

  return { left_servo: 1, right_servo: -1 }  // Tilt left/up2. **Install dependencies**

}

```   ```powershell1. Install dependencies- Servo motor (for adaptive pillow adjustment)



## 🔧 Development   npm install



### Code Organization   ```   - Windows PowerShell- Push button (for manual pillow control)

- **server.js**: Express API with synthetic data generation (115 lines)

- **app.js**: Frontend logic with canvas rendering (1000+ lines)

- **index.html**: UI structure with responsive CSS (291 lines)

3. **Start the server**     ```powershell- Optional: Additional sensors for spine tracking

### Key Functions

- `generateSyntheticExample()`: Creates realistic pressure/SpO₂ data   ```powershell

- `ruleBasedServo()`: Determines bed tilt recommendations

- `drawBedViz()`: Renders equalizer-style bed visualization   npm start     npm install- WiFi connectivity for data transmission

- `drawGridViz()`: Creates 8×8 servo activation heatmap

- `updateCharts()`: Syncs Chart.js time-series and zone charts   ```



### Canvas Rendering     ```

- **Dynamic Sizing**: Canvases auto-resize to match CSS dimensions

- **Person Overlay**: Anatomically positioned body visualization4. **Open the app**

- **Gradient Effects**: Smooth color transitions for pressure mapping

- **Mobile Optimization**: Reduced canvas heights on small screens   - Navigate to http://localhost:30002. Start the server### Sensor Technologies for Spine Tracking



## 🔍 Troubleshooting   - You should see the Overview tab with live data and charts



### Common Issues   ```powershell- **Flexible Sensors**: Bend sensors along the spine

**API shows "Disconnected"**

- Verify server is running: `npm start`### Demo Mode

- Check console for errors (F12 → Console)

- Ensure port 3000 is availableThe app runs in full demo mode with realistic synthetic data. Use the navbar to explore:   npm start- **IMU Arrays**: Multiple accelerometer/gyroscope units



**Blank or Missing Charts**- **Overview**: Real-time metrics and charts

- Verify Chart.js CDN is loading (check Network tab)

- Activate each tab at least once for canvas initialization- **Visualizations**: Interactive bed and servo views   ```- **Pressure Sensors**: Mattress-integrated pressure mapping

- Check browser console for JavaScript errors

- **Insights**: Sleep position and snoring analysis

**Blurry Canvas Visualizations**

- Browser may need to recalculate canvas dimensions after resize- **Wellness**: Daily reminders and caffeine tracking3. Open the app in your browser- **Wearable Patches**: Adhesive sensor patches for direct monitoring

- Try switching tabs or refreshing the page

- Ensure CSS and canvas dimensions are properly synchronized- **Controls**: Manual bed adjustments with live preview



### Performance Notes   - http://localhost:3000

- Canvas elements redraw automatically on window resize

- Chart.js data is limited to last 50 time points## 📡 API Reference

- Auto mode generates new data every 3 seconds

- Manual controls update all visualizations in real-time## Getting Started



## 🌐 Future Enhancements### Core Endpoints



While this is currently a complete demo application, potential extensions include:- **GET** `/api/health` - System health checkYou should see the Overview tab with status, charts, and live values. Use the navbar to explore Visualizations, Insights, Wellness, and Controls.

- **Hardware Integration**: ESP32 sensor connectivity

- **Machine Learning**: Predictive models for sleep optimization- **POST** `/api/generate` - Generate synthetic sleep data

- **Data Persistence**: User profiles and historical tracking

- **Smart Alarms**: Wake timing based on sleep phase detection- **POST** `/api/predict` - Get servo recommendations### Backend Setup

- **Health Integration**: Export data for healthcare providers



## 📄 License

### Data Generation## API```bash

MIT License - Feel free to use this code for educational or commercial purposes.

```javascript

---

POST /api/generatecd backend

**Current Status**: Fully functional web application with synthetic data simulation  

**Server**: Express.js serving static files + JSON APIs  {

**Client**: Interactive dashboard with real-time visualizations  

**Demo**: Complete sleep monitoring simulation ready to run locally  "count": 10  // 1-100 samplesBase URL: http://localhost:3000npm install

}

```npm run dev



### Servo Prediction- GET /api/health```

```javascript

POST /api/predict  - Returns `{ ok: true, time: <ISO> }` for liveness checks

{

  "pressure": {### Frontend Setup

    "head": 25, "neck": 28, "upper_torso": 45,

    "lower_torso": 48, "hips": 52, "thighs": 35, "knees": 32- POST /api/generate```bash

  },

  "spO2": 96.5,  - Body: `{ count?: number }` (1–100, default 10)cd frontend

  "examples": []  // Optional training examples

}  - Returns `{ success: true, data: Array<{ pressure, spO2 }> }`npm install

```

  - Pressure ranges (kPa) are realistic per zone: head/neck ~20–35, core ~42–64, etc.npm start

## 🎨 UI Features

```

### Interactive Controls

- **Auto/Manual Toggle**: Switch between automatic and manual bed control- POST /api/predict

- **Zone Adjustments**: Drag bars to set individual zone heights

- **Real-Time Updates**: All visualizations update instantly with changes  - Body: `{ pressure: Record<zone, number>, spO2: number, examples?: Array<{ pressure, spO2 }> }`### ESP32 Setup

- **Mobile Responsive**: Optimized for phone and tablet viewing

  - Validates required zones: `head, neck, upper_torso, lower_torso, hips, thighs, knees`1. Install Arduino IDE or PlatformIO

### Pressure Mapping Colors

- 🟢 **20-25 kPa**: Low pressure (green)  - Responds with `{ success: true, input, examples, servo_action }`2. Upload firmware from `esp32-firmware/` directory

- 🟡 **25-40 kPa**: Normal pressure (yellow)

- 🟠 **40-55 kPa**: Elevated pressure (orange)  - `servo_action`: `{ left_servo: -1|0|1, right_servo: -1|0|1, reasoning: string }`3. Configure WiFi credentials

- 🔴 **55+ kPa**: High pressure (red)

4. Connect sensors according to wiring diagram

### Canvas Visualizations

- **Bed Equalizer**: Shows zone heights with person overlay## Frontend Behavior

- **8×8 Grid**: Servo activation heatmap with body position

- **Pressure Map**: Body outline with color-coded pressure zones## Quick Start



## 🔧 Development Roadmap- Auto/Scan controls generate new samples, call the prediction API, and update:



### Phase 1: Core Platform ✅  - Time chart (SpO₂, core average)### Option 1: Demo Mode (No Hardware Required)

- [x] Web dashboard with synthetic data

- [x] Real-time visualizations and controls  - Zone bar chart```bash

- [x] Mobile-responsive design

- [x] Basic sleep analytics  - Bed posture, 8×8 heatmap, and pressure mapping# Clone the repository



### Phase 2: Hardware Integration 🚧  - Insights (position, snoring)git clone https://github.com/Sri0666/Sleeping_beauties.git

- [ ] ESP32 firmware development

- [ ] Sensor integration (pressure, audio, motion)- Manual mode on the Controls tab lets you adjust per‑zone heights (0–1). Changes instantly reflect in both bed and 8×8 views. Hollow dots show recommended values.cd Sleeping_beauties

- [ ] WebSocket real-time communication

- [ ] Device configuration interface- Pressure Mapping colors: 20–25 Low (green), 25–40 Normal (yellow), 40–55 Elevated (orange), 55+ High (red).



### Phase 3: AI Enhancement 🔮# Install dependencies

- [ ] Machine learning model development

- [ ] LLM integration for smart recommendations## Responsive UInpm run install-all

- [ ] Adaptive learning algorithms

- [ ] Confidence scoring system



### Phase 4: Advanced Features 🔮- Wide screens: many cards display side‑by‑side using `grid cols-2/cols-3` classes.# Start in demo mode with mock data

- [ ] Smart alarm system

- [ ] Environmental monitoring- Mobile (<900px): grids collapse to a single column; padding and font sizes shrink; canvas heights reduce for readability.REACT_APP_USE_MOCK=true npm run dev

- [ ] Health data correlations

- [ ] Cloud deployment and scaling```



## 🔍 Troubleshooting## Troubleshooting



### Common Issues### Option 2: Full Setup with AI

- **API shows "Disconnected"**: Ensure server is running on port 3000

- **Blank visualizations**: Activate each tab at least once for canvas initialization- API shows Disconnected```bash

- **Blurry canvases**: Browser may need to recalculate canvas dimensions on resize

  - Ensure the server is running (`npm start`) and browser is on `http://localhost:3000`# Backend setup with AI

### Development Tips

- Use browser DevTools (F12) to check for JavaScript errors  - Check console for errors in the browser DevTools (F12)cd backend

- Canvas elements auto-resize but may need manual redraw after tab switches

- Chart.js loads from CDN - ensure internet connection for charts- Blank charts or visualspython setup_ai.py



## 🌐 Future Hardware Requirements  - Ensure Chart.js is loaded in `index.html` (CDN). Canvases are created dynamically; ensure the tab is visible at least once.



### ESP32 Setup (Planned)- Canvases look blurry# Start both frontend and backend

- **Microcontroller**: ESP32 with WiFi capability

- **Sensors**:   - The app sets canvas width to CSS width on resize; ensure the tab has been activated so canvases can measure correctly.cd ..

  - Microphone module (snoring detection)

  - MPU6050 (accelerometer/gyroscope)npm run dev

  - Pressure sensors (mattress integration)

  - Servo motors (pillow adjustment)## Notes & Next Steps```

- **Connectivity**: WiFi for real-time data transmission



### Sensor Technologies (Research Phase)

- **Flexible Sensors**: Bend sensors for spine tracking- Data is synthetic; integrate with real sensors/firmware by replacing `/api/generate` and `/api/predict` logic.Visit `http://localhost:3000` to access the dashboard.

- **IMU Arrays**: Multiple motion sensors

- **Wearable Patches**: Adhesive sensor patches- Consider persisting manual settings (localStorage) and adding server‑side logging.

- **Pressure Mapping**: Full mattress sensor grid

- If deploying, add a production web server/reverse proxy and harden CORS, rate limits, etc.## AI System Setup

## 🤝 Contributing



This project aims to revolutionize sleep tracking by reducing phone dependency and providing comprehensive, actionable sleep insights. We welcome contributions in:The system includes an advanced AI-powered adaptive pillow that uses machine learning for intelligent adjustments:

- Hardware integration

- AI/ML algorithm development### Prerequisites

- UI/UX improvements- Python 3.8+

- Documentation and testing- PyTorch and Transformers library

- 4GB+ RAM recommended

## 📄 License

### Installation

MIT License - See LICENSE file for details```bash

cd backend

---pip install -r requirements.txt

python setup_ai.py

**Current Status**: Fully functional web demo with synthetic data  ```

**Next Milestone**: ESP32 hardware integration  

**Vision**: Complete smart sleep ecosystem with AI-powered optimizationFor detailed AI system documentation, see [docs/AI_SYSTEM.md](docs/AI_SYSTEM.md).

## API Documentation

### WebSocket Endpoints
- `/ws/sleep-data` - Real-time sleep tracking data
- `/ws/device-control` - Device configuration and control

### REST API
- `POST /api/sleep-sessions` - Start/stop sleep tracking
- `GET /api/analytics/:userId` - Retrieve sleep analytics
- `POST /api/recommendations` - Get personalized sleep recommendations
- `POST /api/adaptive-pillow/predict` - AI-powered servo predictions
- `GET /api/adaptive-pillow/status` - AI system status

## Development Roadmap

- [x] Project structure and documentation
- [x] Backend API and WebSocket implementation
- [x] Frontend dashboard and analytics
- [x] AI-powered adaptive pillow system
- [x] LLM integration for smart adjustments
- [x] Mock data system for development
- [ ] ESP32 firmware for basic sensors
- [ ] Sleep analysis algorithms
- [ ] Smart alarm system
- [ ] Spine tracking research and implementation
- [ ] Mobile responsiveness optimization
- [ ] Cloud deployment

## Contributing

This project aims to revolutionize sleep tracking by reducing phone dependency and providing comprehensive, actionable sleep insights.

## License

MIT License - See LICENSE file for details