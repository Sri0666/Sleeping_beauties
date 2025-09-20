'use strict';

// Elements
const statusEl = document.getElementById('status');
const qualityVal = document.getElementById('qualityVal');
const spo2Val = document.getElementById('spo2Val');
const coreVal = document.getElementById('coreVal');
const servoVal = document.getElementById('servoVal');
const reasoningVal = document.getElementById('reasoningVal');

const pingBtn = document.getElementById('ping');
const scanBtn = document.getElementById('scan');
const autoChk = document.getElementById('auto');

// Debug elements
const out = document.getElementById('out');
const genOut = document.getElementById('genOut');
const predOut = document.getElementById('predOut');
const genBtn = document.getElementById('gen');
const predictBtn = document.getElementById('predict');

// Charts
let timeChart, zoneChart;
let bedCanvas, bedCtx;
let gridCanvas, gridCtx;
let caffeineChart;
let lastBedState = { bed: { left: 0, right: 0 }, pressure: null };
let lastRecommendation = { zones: null, bed: { left: 0, right: 0 } };
const timeData = { labels: [], spo2: [], core: [] };

function initCharts() {
  const tc = document.getElementById('timeChart');
  const zc = document.getElementById('zoneChart');
  if (!tc || !zc || typeof window.Chart === 'undefined') {
    console.warn('Chart.js not available or canvases missing.');
    return;
  }

  const ctx1 = tc.getContext('2d');
  timeChart = new Chart(ctx1, {
    type: 'line',
    data: {
      labels: timeData.labels,
      datasets: [
        { label: 'SpO₂', data: timeData.spo2, borderColor: '#06b6d4', backgroundColor: 'rgba(6,182,212,.15)', tension: .25 },
        { label: 'Core Pressure Avg', data: timeData.core, borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,.15)', tension: .25 }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#cbd5e1' } } },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,.1)' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,.1)' } }
      }
    }
  });

  const ctx2 = zc.getContext('2d');
  zoneChart = new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: ['head','neck','upper_torso','lower_torso','hips','thighs','knees'],
      datasets: [ { label: 'Pressure', data: [0,0,0,0,0,0,0], backgroundColor: '#22c55e' } ]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#cbd5e1' } } },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,.1)' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,.1)' } }
      }
    }
  });
}

function setStatus(text, ok) {
  statusEl.textContent = text;
  statusEl.style.borderColor = ok ? '#16a34a' : '#f59e0b';
}

async function pingHealth() {
  if (out) out.textContent = 'Pinging...';
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    if (out) out.textContent = JSON.stringify(data, null, 2);
    setStatus('Connected', true);
  } catch (e) {
    if (out) out.textContent = 'Error: ' + e.message;
    setStatus('Disconnected', false);
  }
}

function computeCoreAvg(p) {
  return (p.upper_torso + p.lower_torso + p.hips) / 3;
}

function computeQuality(spo2, coreAvg) {
  // Simple demo score: start at 100, penalize low spo2 and high core
  let score = 100;
  if (spo2 < 95) score -= (95 - spo2) * 2.5; // stronger penalty as it drops
  if (coreAvg > 45) score -= (coreAvg - 45) * 1.2;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function updateCharts(tsLabel, spo2, coreAvg, pressure) {
  if (!timeChart || !zoneChart) return;
  timeData.labels.push(tsLabel);
  timeData.spo2.push(spo2);
  timeData.core.push(coreAvg);
  // keep last 50 points
  if (timeData.labels.length > 50) {
    timeData.labels.shift(); timeData.spo2.shift(); timeData.core.shift();
  }
  timeChart.update();

  const zones = ['head','neck','upper_torso','lower_torso','hips','thighs','knees'];
  zoneChart.data.datasets[0].data = zones.map(z => pressure[z] ?? 0);
  zoneChart.update();
}

// Draw a sideways equalizer bed visualization
function initBedViz() {
  bedCanvas = document.getElementById('bedViz');
  if (!bedCanvas) return;
  // Improve rendering by matching the canvas width to its CSS size
  const rect = bedCanvas.getBoundingClientRect();
  if (rect.width) bedCanvas.width = Math.floor(rect.width);
  bedCtx = bedCanvas.getContext('2d');
  redrawBedViz();
  window.addEventListener('resize', () => {
    const r = bedCanvas.getBoundingClientRect();
    if (r.width) bedCanvas.width = Math.floor(r.width);
    redrawBedViz();
  });
}

function drawBedViz(bed = { left: 0, right: 0 }, pressure = null) {
  if (!bedCtx) return;
  // remember last for redraws
  lastBedState = { bed, pressure };
  const ctx = bedCtx;
  const W = bedCanvas.width;
  const H = bedCanvas.height;
  ctx.clearRect(0, 0, W, H);

  // Frame
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 8, W - 16, H - 16);

  // Zones (head -> knees), map to 7 vertical bars across width
  const zones = ['head','neck','upper_torso','lower_torso','hips','thighs','knees'];
  const n = zones.length;
  const gap = 6;
  const barW = (W - 16 - gap * (n - 1)) / n;

  // Compute suggested elevation from servo and pressure
  // Base: 50% height. If left=1/right=-1, tilt gradient left->right. Add small pressure influence.
  const base = (H - 16) * 0.5;
  const barTops = [];
  const barCenters = [];
  zones.forEach((z, i) => {
    const x = 8 + i * (barW + gap);
    let h;
    if (typeof manualEnabled !== 'undefined' && manualEnabled) {
      // Manual override: use manualBars 0..1 to set height across full range
      const mv = (manualBars && typeof manualBars[z] === 'number') ? manualBars[z] : 0.5;
      h = 16 + mv * (H - 32);
    } else {
      // If we have per-zone recommendations, use them directly so bars follow recommended values
      const rec = lastRecommendation && lastRecommendation.zones ? lastRecommendation.zones[z] : null;
      if (typeof rec === 'number') {
        h = 16 + rec * (H - 32);
      } else {
        // Fallback heuristic
        const tilt = ((n - 1 - i) / (n - 1)) * bed.left + (i / (n - 1)) * -bed.right; // left raises left zones
        const p = pressure ? (pressure[z] ?? 0) : 0;
        const pNorm = Math.max(0, Math.min(1, (p - 20) / 45)); // normalize 20..65 roughly
        h = base + tilt * 20 + pNorm * 20; // pixels
      }
    }
    const y = 8 + (H - 16) - h;
    // bar
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(x, y, barW, h);
    // label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(z.replace('_',' '), x + barW / 2, H - 4);

    barTops.push(y);
    barCenters.push(x + barW / 2);
  });

  // Person overlay: head circle and a smooth body path that follows the bar tops
  if (barTops.length === n) {
    // Head near the first bar
    const headX = barCenters[0];
    const headY = Math.max(16, barTops[0] - 10);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(headX, headY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Body path along the tops (slightly above bars)
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    // Use quadratic curves for smoothness
    const points = barCenters.map((cx, i) => ({ x: cx, y: barTops[i] - 4 }));
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      const cpy = (prev.y + curr.y) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, cpx, cpy);
    }
    // Finish with last segment
    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
  }

  // Recommended hollow dots (if we have per-zone recommendations)
  if (lastRecommendation.zones) {
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    zones.forEach((z, i) => {
      const x = 8 + i * (barW + gap);
      const target = lastRecommendation.zones[z]; // 0..1 scale
      if (typeof target !== 'number') return;
      const h = 16 + target * (H - 32);
      const y = 8 + (H - 16) - h;
      ctx.beginPath();
      ctx.arc(x + barW / 2, y, 6, 0, Math.PI * 2);
      ctx.stroke();
    });
  }
}

function redrawBedViz() {
  drawBedViz(lastBedState.bed, lastBedState.pressure);
}

// ---------- 8x8 grid visualization ----------
let lastGridState = { bed: { left: 0, right: 0 }, pressure: null };

function initGridViz() {
  gridCanvas = document.getElementById('gridViz');
  if (!gridCanvas) return;
  const rect = gridCanvas.getBoundingClientRect();
  if (rect.width) gridCanvas.width = Math.floor(rect.width);
  gridCtx = gridCanvas.getContext('2d');
  redrawGridViz();
  window.addEventListener('resize', () => {
    const r = gridCanvas.getBoundingClientRect();
    if (r.width) gridCanvas.width = Math.floor(r.width);
    redrawGridViz();
  });
}

function drawGridViz(bed = { left: 0, right: 0 }, pressure = null) {
  if (!gridCtx) return;
  lastGridState = { bed, pressure };
  const ctx = gridCtx;
  const W = gridCanvas.width;
  const H = gridCanvas.height;
  ctx.clearRect(0, 0, W, H);

  // Dimensions
  const cols = 8, rows = 8;
  const pad = 10;
  const cellW = (W - pad * 2) / cols;
  const cellH = (H - pad * 2) / rows;

  // Build a heat field from RECOMMENDED zone heights (0..1) or MANUAL bars
  // Fallback to pressure if recommendations are not yet available
  const zoneRows = {
    head: 0, neck: 1,
    upper_torso: 2, lower_torso: 3,
    hips: 4, thighs: 5, knees: 6
  };
  const baseField = Array.from({ length: rows }, () => Array(cols).fill(0));
  // Determine source values: manual overrides take precedence, then recommendations
  const zonesOrder = ['head','neck','upper_torso','lower_torso','hips','thighs','knees'];
  const haveManual = (typeof manualEnabled !== 'undefined' && manualEnabled && manualBars);
  const rec = lastRecommendation && lastRecommendation.zones ? lastRecommendation.zones : null;
  let sourceVals = null;
  if (haveManual) sourceVals = manualBars;
  else if (rec) sourceVals = rec;

  if (sourceVals) {
    // Create a continuous 2D gradient field sampled per pixel later
    // Vertical interpolation between zone centers; gentle lateral emphasis in the middle
    const zoneAt = (y) => { // y in [0, rows)
      const yClamped = Math.max(0, Math.min(rows - 1, y));
      const i0 = Math.floor(yClamped);
      const i1 = Math.min(zonesOrder.length - 1, i0 + 1);
      const t = Math.min(1, Math.max(0, yClamped - i0));
      const v0 = Math.max(0, Math.min(1, sourceVals[zonesOrder[Math.min(i0, zonesOrder.length - 1)]] ?? 0));
      const v1 = Math.max(0, Math.min(1, sourceVals[zonesOrder[Math.min(i1, zonesOrder.length - 1)]] ?? v0));
      return v0 * (1 - t) + v1 * t;
    };

    // Render gradient directly to an ImageData for smooth curves
    const innerW = Math.max(1, Math.floor(cellW * cols));
    const innerH = Math.max(1, Math.floor(cellH * rows));
    const img = ctx.createImageData(innerW, innerH);
    const data = img.data;
    const center = (cols - 1) / 2 + (bed.left - bed.right) * 0.3;
    const sigma = cols / 3.2;
    for (let py = 0; py < innerH; py++) {
      const yFrac = py / innerH * rows; // 0..rows
      const baseV = zoneAt(yFrac);
      for (let px = 0; px < innerW; px++) {
        const xFrac = px / innerW * (cols - 1);
        const lateral = Math.exp(-((xFrac - center) ** 2) / (2 * sigma * sigma));
        const v = Math.max(0, Math.min(1, baseV * (0.85 + 0.15 * lateral)));
        // Continuous color ramp (teal -> green -> yellow)
        let r, g, b;
        if (v < 0.5) {
          const t = v / 0.5; // 0..1
          r = 30 + 100 * t;
          g = 200 + 40 * t;
          b = 200 + 30 * t;
        } else {
          const t = (v - 0.5) / 0.5; // 0..1
          r = 120 + 135 * t; // up to ~255
          g = 200 - 200 * t; // down to ~0
          b = 50;
        }
        const idx = (py * innerW + px) * 4;
        data[idx] = Math.round(r);
        data[idx + 1] = Math.round(g);
        data[idx + 2] = Math.round(b);
        data[idx + 3] = 240; // alpha
      }
    }
    ctx.putImageData(img, pad, pad);
  } else if (pressure) {
    // Fallback: compute per-cell field from pressure, then blur and draw rectangles
    Object.entries(zoneRows).forEach(([zone, r]) => {
      const p = pressure[zone] ?? 0;
      const pNorm = Math.max(0, Math.min(1, (p - 20) / 45));
      for (let c = 0; c < cols; c++) baseField[r][c] = pNorm;
    });
    // Light lateral tilt
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const leftBias = ((cols - 1 - c) / (cols - 1)) * bed.left;
        const rightBias = (c / (cols - 1)) * -bed.right;
        baseField[r][c] = Math.max(0, Math.min(1, baseField[r][c] + (leftBias + rightBias) * 0.2));
      }
    }

    // Simple 1-pass box blur
    const smooth = Array.from({ length: rows }, () => Array(cols).fill(0));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let sum = 0, count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const rr = r + dr, cc = c + dc;
            if (rr >= 0 && rr < rows && cc >= 0 && cc < cols) { sum += baseField[rr][cc]; count++; }
          }
        }
        smooth[r][c] = sum / count;
      }
    }
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = pad + c * cellW;
        const y = pad + r * cellH;
        const v = smooth[r][c];
        const col = v < 0.5
          ? `rgba(${Math.round(30 + v * 100)}, ${Math.round(200 + v * 40)}, ${Math.round(200 + v * 30)}, 0.9)`
          : `rgba(${Math.round(120 + (v - 0.5) * 270)}, ${Math.round(200 - (v - 0.5) * 200)}, 50, 0.95)`;
        ctx.fillStyle = col;
        ctx.fillRect(x, y, cellW, cellH);
      }
    }
  }

  // Draw grid lines over the gradient for readability
  ctx.strokeStyle = 'rgba(148,163,184,0.35)';
  ctx.lineWidth = 1;
  for (let c = 0; c <= cols; c++) {
    const x = pad + c * cellW;
    ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, pad + rows * cellH); ctx.stroke();
  }
  for (let r = 0; r <= rows; r++) {
    const y = pad + r * cellH;
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(pad + cols * cellW, y); ctx.stroke();
  }

  // Person overlay: align to row centers
  const cx = pad + (cols * cellW) / 2;
  const rowCenter = (r) => pad + (r + 0.5) * cellH;
  const headY = rowCenter(0);
  ctx.fillStyle = 'rgba(250, 204, 21, 0.95)'; // amber
  // Head
  ctx.beginPath();
  ctx.ellipse(cx, headY, cellW * 0.35, cellH * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  // Neck
  ctx.beginPath();
  ctx.ellipse(cx, rowCenter(1), cellW * 0.3, cellH * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  // Upper torso
  ctx.beginPath();
  ctx.ellipse(cx, rowCenter(2), cellW * 0.45, cellH * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  // Lower torso
  ctx.beginPath();
  ctx.ellipse(cx, rowCenter(3), cellW * 0.48, cellH * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hips
  ctx.beginPath();
  ctx.ellipse(cx, rowCenter(4), cellW * 0.5, cellH * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Thighs (legs pair at row 5)
  const legsY = rowCenter(5);
  ctx.beginPath();
  ctx.ellipse(cx - cellW * 0.2, legsY, cellW * 0.25, cellH * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + cellW * 0.2, legsY, cellW * 0.25, cellH * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
}

function redrawGridViz() {
  drawGridViz(lastGridState.bed, lastGridState.pressure);
}

// ---------- Manual equalizer (controls) ----------
let manualCanvas, manualCtx;
let manualEnabled = false;
let manualBars = { head: .5, neck: .5, upper_torso: .5, lower_torso: .5, hips: .5, thighs: .5, knees: .5 }; // 0..1
let dragging = null;

// Controls tab canvases
let bedVizControlsCanvas, bedVizControlsCtx;
let gridVizControlsCanvas, gridVizControlsCtx;
let pressureMapCanvas, pressureMapCtx;

function initManualEq() {
  manualCanvas = document.getElementById('manualEq');
  if (!manualCanvas) return;
  const rect = manualCanvas.getBoundingClientRect();
  if (rect.width) manualCanvas.width = Math.floor(rect.width);
  manualCtx = manualCanvas.getContext('2d');
  drawManualEq();
  window.addEventListener('resize', () => {
    const r = manualCanvas.getBoundingClientRect();
    if (r.width) manualCanvas.width = Math.floor(r.width);
    drawManualEq();
  });

  const toggle = document.getElementById('manualEnable');
  const reset = document.getElementById('manualReset');
  toggle?.addEventListener('change', (e) => { manualEnabled = e.target.checked; drawManualEq(); });
  reset?.addEventListener('click', () => {
    if (lastRecommendation.zones) {
      Object.keys(manualBars).forEach(k => manualBars[k] = lastRecommendation.zones[k] ?? .5);
    } else {
      Object.keys(manualBars).forEach(k => manualBars[k] = .5);
    }
    drawManualEq();
  });

  manualCanvas.addEventListener('mousedown', (e) => startDrag(e));
  manualCanvas.addEventListener('mousemove', (e) => onDrag(e));
  manualCanvas.addEventListener('mouseup', () => dragging = null);
  manualCanvas.addEventListener('mouseleave', () => dragging = null);
}

function drawManualEq() {
  if (!manualCtx) return;
  const ctx = manualCtx;
  const W = manualCanvas.width;
  const H = manualCanvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0b1220'; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = '#374151'; ctx.strokeRect(8,8,W-16,H-16);

  const zones = ['head','neck','upper_torso','lower_torso','hips','thighs','knees'];
  const n = zones.length; const gap = 8; const barW = (W - 16 - gap*(n-1)) / n;
  zones.forEach((z,i) => {
    const x = 8 + i*(barW+gap);
    const v = manualBars[z];
    const h = 16 + v*(H-32);
    const y = 8 + (H - 16) - h;
    ctx.fillStyle = manualEnabled ? '#2563eb' : '#334155';
    ctx.fillRect(x, y, barW, h);
    // label
    ctx.fillStyle = '#94a3b8'; ctx.font = '10px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(z.replace('_',' '), x + barW/2, H-4);
    // recommended hollow dot
    if (lastRecommendation.zones && typeof lastRecommendation.zones[z] === 'number') {
      const t = lastRecommendation.zones[z];
      const th = 16 + t*(H-32);
      const ty = 8 + (H - 16) - th;
      ctx.strokeStyle = '#eab308'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x + barW/2, ty, 6, 0, Math.PI*2); ctx.stroke();
    }
  });
}

function barHitTest(e) {
  const rect = manualCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left; const y = e.clientY - rect.top;
  const zones = ['head','neck','upper_torso','lower_torso','hips','thighs','knees'];
  const n = zones.length; const gap = 8; const barW = (manualCanvas.width - 16 - gap*(n-1)) / n;
  for (let i=0;i<n;i++){
    const bx = 8 + i*(barW+gap);
    if (x >= bx && x <= bx+barW) return { zone: zones[i], x, y, bx, barW };
  }
  return null;
}

function startDrag(e) {
  if (!manualEnabled) return;
  dragging = barHitTest(e);
  onDrag(e);
}

function onDrag(e) {
  if (!manualEnabled || !dragging) return;
  const rect = manualCanvas.getBoundingClientRect();
  const y = e.clientY - rect.top;
  const H = manualCanvas.height;
  const v = 1 - Math.max(0, Math.min(1, (y - 8) / (H - 16)));
  manualBars[dragging.zone] = v;
  drawManualEq();
  updateControlsViews(); // Update real-time views when manual controls change
}

// Initialize controls tab canvases
function initControlsCanvases() {
  // Bed viz for controls
  bedVizControlsCanvas = document.getElementById('bedVizControls');
  if (bedVizControlsCanvas) {
    const rect = bedVizControlsCanvas.getBoundingClientRect();
    if (rect.width) bedVizControlsCanvas.width = Math.floor(rect.width);
    bedVizControlsCtx = bedVizControlsCanvas.getContext('2d');
  }

  // Grid viz for controls
  gridVizControlsCanvas = document.getElementById('gridVizControls');
  if (gridVizControlsCanvas) {
    const rect = gridVizControlsCanvas.getBoundingClientRect();
    if (rect.width) gridVizControlsCanvas.width = Math.floor(rect.width);
    gridVizControlsCtx = gridVizControlsCanvas.getContext('2d');
  }

  // Pressure map
  pressureMapCanvas = document.getElementById('pressureMap');
  if (pressureMapCanvas) {
    const rect = pressureMapCanvas.getBoundingClientRect();
    if (rect.width) pressureMapCanvas.width = Math.floor(rect.width);
    pressureMapCtx = pressureMapCanvas.getContext('2d');
  }

  // Handle resize
  window.addEventListener('resize', () => {
    [bedVizControlsCanvas, gridVizControlsCanvas, pressureMapCanvas].forEach(canvas => {
      if (canvas) {
        const r = canvas.getBoundingClientRect();
        if (r.width) canvas.width = Math.floor(r.width);
      }
    });
    updateControlsViews();
  });
}

// Draw controls bed visualization
function drawControlsBedViz(bed = { left: 0, right: 0 }, pressure = null) {
  if (!bedVizControlsCtx || !bedVizControlsCanvas) return;
  
  const ctx = bedVizControlsCtx;
  const W = bedVizControlsCanvas.width;
  const H = bedVizControlsCanvas.height;
  ctx.clearRect(0, 0, W, H);

  // Frame
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 8, W - 16, H - 16);

  // Use same logic as main bed viz but with manual override priority
  const zones = ['head','neck','upper_torso','lower_torso','hips','thighs','knees'];
  const n = zones.length;
  const gap = 6;
  const barW = (W - 16 - gap * (n - 1)) / n;
  const barTops = [];
  const barCenters = [];

  zones.forEach((z, i) => {
    const x = 8 + i * (barW + gap);
    let h;
    if (manualEnabled) {
      // Show manual values
      const mv = manualBars[z] ?? 0.5;
      h = 16 + mv * (H - 32);
    } else {
      // Show recommendations
      const rec = lastRecommendation && lastRecommendation.zones ? lastRecommendation.zones[z] : null;
      if (typeof rec === 'number') {
        h = 16 + rec * (H - 32);
      } else {
        h = 16 + 0.5 * (H - 32);
      }
    }
    const y = 8 + (H - 16) - h;
    
    // Bar color: blue if manual, green if auto
    ctx.fillStyle = manualEnabled ? '#3b82f6' : '#22c55e';
    ctx.fillRect(x, y, barW, h);
    
    // Label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(z.replace('_',' '), x + barW / 2, H - 4);

    barTops.push(y);
    barCenters.push(x + barW / 2);
  });

  // Person overlay
  if (barTops.length === n) {
    const headX = barCenters[0];
    const headY = Math.max(16, barTops[0] - 10);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(headX, headY, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    const points = barCenters.map((cx, i) => ({ x: cx, y: barTops[i] - 4 }));
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      const cpy = (prev.y + curr.y) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, cpx, cpy);
    }
    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
  }

  // Recommended hollow dots
  if (!manualEnabled && lastRecommendation.zones) {
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    zones.forEach((z, i) => {
      const x = 8 + i * (barW + gap);
      const target = lastRecommendation.zones[z];
      if (typeof target !== 'number') return;
      const h = 16 + target * (H - 32);
      const y = 8 + (H - 16) - h;
      ctx.beginPath();
      ctx.arc(x + barW / 2, y, 6, 0, Math.PI * 2);
      ctx.stroke();
    });
  }
}

// Draw controls grid visualization
function drawControlsGridViz(bed = { left: 0, right: 0 }, pressure = null) {
  if (!gridVizControlsCtx || !gridVizControlsCanvas) return;
  
  // Use same drawing logic as main grid but with controls canvas
  const originalCtx = gridCtx;
  const originalCanvas = gridCanvas;
  gridCtx = gridVizControlsCtx;
  gridCanvas = gridVizControlsCanvas;
  
  drawGridViz(bed, pressure);
  
  // Restore original references
  gridCtx = originalCtx;
  gridCanvas = originalCanvas;
}

// Draw pressure mapping visualization (similar to attached image)
function drawPressureMap(pressure = null) {
  if (!pressureMapCtx || !pressureMapCanvas) return;
  
  const ctx = pressureMapCtx;
  const W = pressureMapCanvas.width;
  const H = pressureMapCanvas.height;
  ctx.clearRect(0, 0, W, H);

  if (!pressure) {
    ctx.fillStyle = '#64748b';
    ctx.font = '14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No pressure data available', W/2, H/2);
    return;
  }

  // Draw body outline similar to attached image
  const bodyWidth = W * 0.4;
  const bodyHeight = H * 0.8;
  const bodyX = (W - bodyWidth) / 2;
  const bodyY = (H - bodyHeight) / 2;

  // Zone mapping with same pressure values as used elsewhere
  const zones = [
    { name: 'head', y: 0.05, height: 0.12, pressure: pressure.head || 0 },
    { name: 'neck', y: 0.17, height: 0.08, pressure: pressure.neck || 0 },
    { name: 'upper_torso', y: 0.25, height: 0.15, pressure: pressure.upper_torso || 0 },
    { name: 'lower_torso', y: 0.40, height: 0.15, pressure: pressure.lower_torso || 0 },
    { name: 'hips', y: 0.55, height: 0.12, pressure: pressure.hips || 0 },
    { name: 'thighs', y: 0.67, height: 0.15, pressure: pressure.thighs || 0 },
    { name: 'knees', y: 0.82, height: 0.13, pressure: pressure.knees || 0 }
  ];

  // Draw zones with color-coded pressure (using same scale as elsewhere: 20-65 typical range)
  zones.forEach(zone => {
    const zoneY = bodyY + zone.y * bodyHeight;
    const zoneHeight = zone.height * bodyHeight;
    const p = zone.pressure;
    
    // Color based on pressure level (adjusted to match typical pressure ranges)
    let color;
    if (p < 25) color = '#10b981'; // green (low)
    else if (p < 40) color = '#eab308'; // yellow (normal)
    else if (p < 55) color = '#f97316'; // orange (elevated)
    else color = '#dc2626'; // red (high)

    // Draw zone rectangle
    ctx.fillStyle = color;
    ctx.fillRect(bodyX, zoneY, bodyWidth, zoneHeight);
    
    // Draw zone border
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1;
    ctx.strokeRect(bodyX, zoneY, bodyWidth, zoneHeight);
    
    // Draw pressure value (use actual pressure values)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(p.toFixed(1), bodyX + bodyWidth/2, zoneY + zoneHeight/2 + 3);
  });

  // Draw body outline
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 2;
  ctx.strokeRect(bodyX, bodyY, bodyWidth, bodyHeight);
}

// Update all controls views
function updateControlsViews() {
  const bed = lastRecommendation ? lastRecommendation.bed : { left: 0, right: 0 };
  const pressure = lastBedState ? lastBedState.pressure : null;
  
  drawControlsBedViz(bed, pressure);
  drawControlsGridViz(bed, pressure);
  drawPressureMap(pressure);
  updateZoneAnalysis(pressure);
}

// Update zone analysis text
function updateZoneAnalysis(pressure) {
  if (!pressure) return;
  
  const headNeckEl = document.getElementById('headNeckPressure');
  const torsoEl = document.getElementById('torsoPressure');
  const legsEl = document.getElementById('legsPressure');
  const feetEl = document.getElementById('feetPressure');
  
  if (headNeckEl) headNeckEl.textContent = `${((pressure.head + pressure.neck) / 2).toFixed(1)} kPa`;
  if (torsoEl) torsoEl.textContent = `${((pressure.upper_torso + pressure.lower_torso) / 2).toFixed(1)} kPa`;
  if (legsEl) legsEl.textContent = `${pressure.thighs.toFixed(1)} kPa`;
  if (feetEl) feetEl.textContent = `${pressure.knees.toFixed(1)} kPa`;
}

async function scanOnce() {
  try {
    // 1) generate one example
    const gen = await fetch('/api/generate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ count: 1 })
    });
    const genData = await gen.json();
    const sample = genData.data[0];

    // 2) predict servo
    const pred = await fetch('/api/predict', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pressure: sample.pressure, spO2: sample.spO2, examples: genData.data })
    });
    const predData = await pred.json();

    // 3) update UI
    const coreAvg = computeCoreAvg(sample.pressure);
    const quality = computeQuality(sample.spO2, coreAvg);
    const ts = new Date().toLocaleTimeString();

    qualityVal.textContent = quality;
    spo2Val.textContent = sample.spO2.toFixed(1);
    coreVal.textContent = coreAvg.toFixed(1);

    servoVal.textContent = `L: ${predData.servo_action.left_servo}, R: ${predData.servo_action.right_servo}`;
    reasoningVal.textContent = predData.servo_action.reasoning || '';

    // Update last recommendation first so visuals reflect current values
    lastRecommendation = {
      bed: { left: predData.servo_action.left_servo, right: predData.servo_action.right_servo },
      zones: {
        head: clamp01((sample.pressure.head - 20) / 45),
        neck: clamp01((sample.pressure.neck - 20) / 45),
        upper_torso: clamp01((sample.pressure.upper_torso - 40) / 30),
        lower_torso: clamp01((sample.pressure.lower_torso - 40) / 30),
        hips: clamp01((sample.pressure.hips - 40) / 30),
        thighs: clamp01((sample.pressure.thighs - 30) / 20),
        knees: clamp01((sample.pressure.knees - 30) / 20),
      }
    };
    
    updateCharts(ts, sample.spO2, coreAvg, sample.pressure);
    drawBedViz({ left: predData.servo_action.left_servo, right: predData.servo_action.right_servo }, sample.pressure);
    redrawBedViz();
    drawGridViz({ left: predData.servo_action.left_servo, right: predData.servo_action.right_servo }, sample.pressure);
    redrawGridViz();
    updateInsights(sample.pressure, sample.spO2);
    drawManualEq();
    updateControlsViews(); // Update real-time controls views

    // debug panes
    if (genOut) genOut.textContent = JSON.stringify(genData, null, 2);
    if (predOut) predOut.textContent = JSON.stringify(predData, null, 2);
  } catch (e) {
    setStatus('Disconnected', false);
    if (out) out.textContent = 'Error: ' + e.message;
  }
}

function setupHandlers() {
  if (pingBtn) pingBtn.addEventListener('click', pingHealth);
  if (scanBtn) scanBtn.addEventListener('click', scanOnce);

  let timer = null;
  if (autoChk) autoChk.addEventListener('change', (e) => {
    if (e.target.checked) {
      scanOnce();
      timer = setInterval(scanOnce, 3000);
    } else {
      if (timer) clearInterval(timer);
    }
  });

  // Debug tools
  if (genBtn) genBtn.addEventListener('click', async () => {
    genOut.textContent = 'Generating...';
    const count = Number(document.getElementById('count').value || 5);
    try {
      const res = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ count }) });
      const data = await res.json();
      genOut.textContent = JSON.stringify(data, null, 2);
    } catch (e) { genOut.textContent = 'Error: ' + e.message; }
  });

  if (predictBtn) predictBtn.addEventListener('click', async () => {
    predOut.textContent = 'Predicting...';
    try {
      const pressure = JSON.parse(document.getElementById('pressure').value);
      const spO2 = Number(document.getElementById('spo2').value);
      let examples = [];
      try { const lastGen = JSON.parse(genOut.textContent); if (lastGen && lastGen.data) examples = lastGen.data; } catch {}
      const res = await fetch('/api/predict', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pressure, spO2, examples }) });
      const data = await res.json();
      predOut.textContent = JSON.stringify(data, null, 2);
    } catch (e) { predOut.textContent = 'Error: ' + e.message; }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded event fired');
  
  // Test that key elements exist
  const tabs = document.querySelectorAll('[data-tab]');
  const panels = document.querySelectorAll('[data-tab-panel]');
  console.log('Found tabs:', tabs.length, 'panels:', panels.length);
  
  if (tabs.length === 0) {
    console.error('ERROR: No tab buttons found!');
    return;
  }
  
  if (panels.length === 0) {
    console.error('ERROR: No tab panels found!');
    return;
  }
  
  setStatus('Connecting...', false);
  setupHandlers();
  initCharts();
  initBedViz();
  initGridViz();
  initManualEq();
  initControlsCanvases();
  initExtras();
  pingHealth();
  initTabs();
  console.log('All initialization complete');
});

// ---------- Sleep insights & caffeine ----------
// Position heuristic: stomach/back/side based on lateral symmetry and hip/torso distribution.
function estimatePosition(pressure) {
  if (!pressure) return '--';
  const core = (pressure.upper_torso + pressure.lower_torso + pressure.hips) / 3;
  // Fake lateral asymmetry by comparing thighs vs knees for a hint
  const asym = Math.abs(pressure.thighs - pressure.knees);
  if (core > 52 && asym < 4) return 'Back';
  if (core > 50 && asym >= 4) return 'Side';
  return 'Stomach';
}

function estimateSnoring(pressure, spO2) {
  if (!pressure || typeof spO2 !== 'number') return '--';
  const headNeck = (pressure.head + pressure.neck) / 2;
  if (spO2 < 93 && headNeck > 24) return 'Likely';
  if (spO2 < 95) return 'Possible';
  return 'Unlikely';
}

// Caffeine chart setup
const caffeineData = { labels: [], values: [] };
function initCaffeineChart() {
  const canvas = document.getElementById('caffeineChart');
  if (!canvas || typeof Chart === 'undefined') return;
  const ctx = canvas.getContext('2d');
  caffeineChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: caffeineData.labels,
      datasets: [{ label: 'mg', data: caffeineData.values, backgroundColor: '#f59e0b' }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#cbd5e1' } } },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,.1)' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,.1)' } }
      }
    }
  });
}

function addCaffeine(mg) {
  const now = new Date();
  const label = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  caffeineData.labels.push(label);
  caffeineData.values.push(mg);
  if (caffeineData.labels.length > 24) { caffeineData.labels.shift(); caffeineData.values.shift(); }
  if (caffeineChart) caffeineChart.update();
}

// Wire caffeine buttons and update insights on each scan
function initExtras() {
  initCaffeineChart();
  document.querySelectorAll('button[data-caffeine]')?.forEach(btn => {
    btn.addEventListener('click', () => addCaffeine(Number(btn.getAttribute('data-caffeine'))));
  });
  
  // Add handlers for new controls buttons
  const aiAnalysisBtn = document.getElementById('aiAnalysis');
  const resetPositionBtn = document.getElementById('resetPosition');
  
  aiAnalysisBtn?.addEventListener('click', () => {
    // Trigger a new scan for AI analysis
    scanOnce();
  });
  
  resetPositionBtn?.addEventListener('click', () => {
    // Reset manual bars to defaults
    Object.keys(manualBars).forEach(k => manualBars[k] = 0.5);
    drawManualEq();
    updateControlsViews();
  });
}

// After scan, update insights UI
function updateInsights(pressure, spO2) {
  const posEl = document.getElementById('positionVal');
  const snoreEl = document.getElementById('snoreVal');
  if (posEl) posEl.textContent = estimatePosition(pressure);
  if (snoreEl) snoreEl.textContent = estimateSnoring(pressure, spO2);
}

function clamp01(v){ return Math.max(0, Math.min(1, v)); }

// ---------- Tabs ----------
function initTabs() {
  console.log('initTabs starting...');
  
  // Get all tab buttons and panels
  const tabButtons = document.querySelectorAll('[data-tab]');
  const tabPanels = document.querySelectorAll('[data-tab-panel]');
  
  console.log('Found', tabButtons.length, 'tab buttons and', tabPanels.length, 'tab panels');
  
  if (tabButtons.length === 0 || tabPanels.length === 0) {
    console.error('No tab buttons or panels found!');
    return;
  }

  const setActive = (targetTab) => {
    console.log('Setting active tab to:', targetTab);
    
    // Update button states
    tabButtons.forEach(btn => {
      const isActive = btn.getAttribute('data-tab') === targetTab;
      btn.classList.toggle('active', isActive);
      console.log('Button', btn.getAttribute('data-tab'), 'active:', isActive);
    });
    
    // Update panel visibility
    tabPanels.forEach(panel => {
      const panelName = panel.getAttribute('data-tab-panel');
      const shouldShow = panelName === targetTab;
      panel.style.display = shouldShow ? '' : 'none';
      console.log('Panel', panelName, 'display:', shouldShow ? 'visible' : 'hidden');
    });
    
    // Trigger canvas redraws after a brief delay to ensure layout is complete
    setTimeout(() => {
      try {
        if (typeof redrawBedViz === 'function') redrawBedViz();
        if (typeof redrawGridViz === 'function') redrawGridViz();
        if (typeof drawManualEq === 'function') drawManualEq();
        if (typeof updateControlsViews === 'function') updateControlsViews();
        console.log('Canvas redraws completed');
      } catch (e) {
        console.error('Error during canvas redraw:', e);
      }
    }, 10);
  };

  // Add click handlers to each button individually
  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tabName = btn.getAttribute('data-tab');
      console.log('Tab button clicked:', tabName);
      setActive(tabName);
    });
  });

  // Set initial tab
  setActive('overview');
  console.log('initTabs completed');
}
