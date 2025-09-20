# Mock Mode (No backend required)

This frontend can run entirely without a backend by enabling mock mode. Synthetic data is generated on the fly for sessions, analytics, recommendations, and devices.

How to use (PowerShell):

- Start only the frontend:

```powershell
$env:REACT_APP_USE_MOCK='true'
npm start
```

- Start via repo root script:

```powershell
cd ..  # project root
$env:REACT_APP_USE_MOCK='true'
npm run frontend
```

Implementation details:
- `src/services/sleepAPI.js` switches between real and mock APIs based on `REACT_APP_USE_MOCK` (defaults to true).
- Charts are implemented with Recharts (trends) and Chart.js (quality gauge).
- Device page uses mock device info and still works with WebSocket helpers when connected.

To re-enable real API calls later, set the env var to false:

```powershell
$env:REACT_APP_USE_MOCK='false'
```