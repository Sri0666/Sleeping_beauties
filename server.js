// Minimal Express server serving static files from ./public
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies
app.use(express.json());

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));

// Health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// --- Synthetic data generation and servo prediction (Node version of the Python snippet) ---
const BODY_ZONES = [
  'head',
  'neck',
  'upper_torso',
  'lower_torso',
  'hips',
  'thighs',
  'knees',
];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate one synthetic example following constraints
function generateSyntheticExample() {
  const pressure = {
    head: randInt(20, 35),
    neck: randInt(20, 35),
    upper_torso: randInt(42, 64),
    lower_torso: randInt(42, 64),
    hips: randInt(42, 64),
    thighs: randInt(30, 52),
    knees: randInt(30, 52),
  };

  // SpO2 heuristic: start near 98 and subtract based on core pressure load
  const coreAvg = (pressure.upper_torso + pressure.lower_torso + pressure.hips) / 3;
  // Add some variability: slight noise and occasional dips to trigger rule
  let spO2 = 98 - Math.max(0, (coreAvg - 45) * 0.35) - Math.random() * 3; // wider spread
  // 10% chance of an event (temporary lower spO2)
  if (Math.random() < 0.1) {
    spO2 -= 5 + Math.random() * 3;
  }
  spO2 = Math.max(90, Math.min(100, Number(spO2.toFixed(2))));

  return { pressure, spO2 };
}

// POST /api/generate { count?: number }
app.post('/api/generate', (req, res) => {
  const count = Math.min(100, Math.max(1, Number(req.body?.count || 10)));
  const data = Array.from({ length: count }, () => generateSyntheticExample());
  res.json({ success: true, data });
});

// Rule-based fallback used in examples and current prediction
function ruleBasedServo(pressure, spO2) {
  const coreAvg = (pressure.upper_torso + pressure.lower_torso + pressure.hips) / 3;
  if (spO2 < 93 && coreAvg > 50) {
    return { left_servo: 1, right_servo: -1, reasoning: 'Low SpO2 and high core pressure → tilt left/up' };
  }
  return { left_servo: 0, right_servo: 0, reasoning: 'Within acceptable range → no change' };
}

// POST /api/predict { pressure: {..}, spO2: number, examples?: Array<{pressure, spO2}> }
app.post('/api/predict', (req, res) => {
  const { pressure, spO2, examples } = req.body || {};

  // Basic validation
  if (!pressure || typeof spO2 !== 'number') {
    return res.status(400).json({ success: false, error: 'Missing pressure or spO2' });
  }
  for (const z of BODY_ZONES) {
    if (typeof pressure[z] !== 'number') {
      return res.status(400).json({ success: false, error: `Missing numeric pressure for zone: ${z}` });
    }
  }

  // If examples provided, attach their rule-based servo for transparency (few-shot analogue)
  const annotatedExamples = Array.isArray(examples)
    ? examples.slice(0, 20).map((ex) => ({
        ...ex,
        servo_action: ruleBasedServo(ex.pressure, ex.spO2),
      }))
    : [];

  const servo_action = ruleBasedServo(pressure, spO2);

  res.json({
    success: true,
    input: { pressure, spO2 },
    examples: annotatedExamples,
    servo_action,
  });
});

// Catch-all to client app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Simple webapp listening on http://localhost:${PORT}`);
});
