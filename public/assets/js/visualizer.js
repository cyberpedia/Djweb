/**
 * Visualizer
 * - createAnalyser(audioCtx)
 * - startVisualizerLoop(analyser, canvas, options)
 * - loadTemplates(selectEl)
 */

function createAnalyser(audioCtx) {
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.85;
  return analyser;
}

function startVisualizerLoop(analyser, canvas, options) {
  const ctx = canvas.getContext("2d");
  const bufferLength = analyser.frequencyBinCount;
  const freqData = new Uint8Array(bufferLength);
  const timeData = new Uint8Array(bufferLength);

  function hexToRgb(hex) {
    const m = /^#?([a-fA-F0-9]{6})$/.exec(hex);
    if (!m) return [0, 0, 0];
    const int = parseInt(m[1], 16);
    return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
  }
  function lerpColor(a, b, t) {
    t = Math.max(0, Math.min(1);

  // Simple beat detection on low-band energy
  let pulse = 0;
  let energyAvg = 0;
  const pulseDecay = 0.92;

  // Particles for 'particles' mode
  const particles = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6,
    r: 1 + Math.random() * 2
  }));

  function detectBeat() {
    analyser.getByteFrequencyData(freqData);
    let lowEnergy = 0;
    const n = Math.min(64, bufferLength);
    for (let i = 0; i < n; i++) lowEnergy += freqData[i];
    lowEnergy /= (n * 255);
    energyAvg = energyAvg * 0.95 + lowEnergy * 0.05;
    if (lowEnergy > energyAvg * 1.25) {
      pulse = Math.min(1.0, pulse + 0.4);
    }
    pulse *= pulseDecay;
  }

  function draw() {
    requestAnimationFrame(draw);
    detectBeat();

    const {
      fg = "#00F5D4",
      bg = "#0B0F14",
      mode = "bars",
      scale = 1.0,
      overlayTitle = false,
      getTrackTitle = null
    } = options;

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const beatScale = 1 + pulse * 0.3;

    if (mode === "bars") {
      analyser.getByteFrequencyData(freqData);
      const w = canvas.width;
      const h = canvas.height;
      const barCount = 96;
      const step = Math.floor(bufferLength / barCount);
      const barWidth = w / barCount;
      for (let i = 0; i < barCount; i++) {
        const v = freqData[i * step] / 255;
        const barHeight = v * h * 0.9 * scale * beatScale;
        const x = i * barWidth;
        const y = h - barHeight;
        const grad = ctx.createLinearGradient(x, y, x, h);
        grad.addColorStop(0, fg);
        grad.addColorStop(1, "#5B8DEF");
        ctx.fillStyle = grad;
        ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
      }
    } else if (mode === "radial") {
      analyser.getByteTimeDomainData(timeData);
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.28;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = fg;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const points = 512;
      for (let i = 0; i < points; i++) {
        const tIdx = Math.floor((i / points) * bufferLength);
        const v = (timeData[tIdx] - 128) / 128;
        const ang = (i / points) * Math.PI * 2;
        const r = radius + v * 80 * scale * beatScale;
        const x = Math.cos(ang) * r;
        const y = Math.sin(ang) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      // inner glow
      const grad = ctx.createRadialGradient(0, 0, radius * 0.6, 0, 0, radius * 1.05);
      grad.addColorStop(0, "rgba(0,245,212,0.08)");
      grad.addColorStop(1, "rgba(91,141,239,0.02)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (mode === "waveform") {
      analyser.getByteTimeDomainData(timeData);
      const w = canvas.width;
      const h = canvas.height;
      ctx.lineWidth = 2;
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, fg);
      grad.addColorStop(1, "#5B8DEF");
      ctx.strokeStyle = grad;
      ctx.beginPath();
      const amp = h * 0.35 * scale * beatScale;
      for (let i = 0; i < bufferLength; i++) {
        const v = (timeData[i] - 128) / 128;
        const x = (i / (bufferLength - 1)) * w;
        const y = h / 2 + v * amp;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else if (mode === "particles") {
      analyser.getByteFrequencyData(freqData);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const boost = 1 + pulse * 0.8;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const idx = Math.floor((i / particles.length) * bufferLength);
        const energy = (freqData[idx] / 255);
        p.vx += (Math.random() - 0.5) * 0.02;
        p.vy += (Math.random() - 0.5) * 0.02;
        p.x += p.vx * (0.8 + energy * 1.2) * boost;
        p.y += p.vy * (0.8 + energy * 1.2) * boost;
        if (p.x < 0) { p.x = canvas.width; }
        if (p.x > canvas.width) { p.x = 0; }
        if (p.y < 0) { p.y = canvas.height; }
        if (p.y > canvas.height) { p.y = 0; }
        const r = p.r + energy * 2 * scale * beatScale;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
        g.addColorStop(0, fg);
        g.addColorStop(1, "rgba(91,141,239,0.05)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (mode === "waterfall") {
      // Spectrogram waterfall: scroll up and draw a new frequency slice at bottom
      analyser.getByteFrequencyData(freqData);
      const w = canvas.width;
      const h = canvas.height;
      // Scroll previous content up by 1px
      ctx.drawImage(canvas, 0, 1, w, h - 1, 0, 0, w, h - 1);
      // Map frequency bins to columns
      const cols = Math.min(384, Math.floor(w / 2));
      const step = Math.floor(bufferLength / cols);
      // Parse colors for gradient mapping
      const fgRgb = hexToRgb(fg);
      const bgRgb = hexToRgb(bg);
      for (let i = 0; i < cols; i++) {
        const idx = i * step;
        const v = freqData[idx] / 255;
        const t = Math.pow(v * scale, 0.8) * (1 + pulse * 0.6); // gamma + beat boost
        const col = lerpColor(bgRgb, fgRgb, Math.min(1, t));
        ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
        const x = Math.floor((i / cols) * w);
        const nextX = Math.floor(((i + 1) / cols) * w);
        ctx.fillRect(x, h - 1, Math.max(1, nextX - x), 1);
      }
    }

    if (overlayTitle && typeof getTrackTitle === "function") {
      const title = getTrackTitle() || "";
      if (title) {
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        const pad = 10;
        const txtSize = Math.max(16, Math.round(canvas.width * 0.015));
        ctx.font = `${txtSize}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`;
        ctx.textBaseline = "bottom";
        const metrics = ctx.measureText(title);
        const boxW = metrics.width + pad * 2;
        const boxH = txtSize + pad * 2;
        const x = pad;
        const y = canvas.height - pad;
        // box
        ctx.fillRect(x - 4, y - boxH, boxW + 8, boxH);
        // text
        const gradText = ctx.createLinearGradient(x, y - boxH, x + boxW, y);
        gradText.addColorStop(0, fg);
        gradText.addColorStop(1, "#5B8DEF");
        ctx.fillStyle = gradText;
        ctx.fillText(title, x + pad, y - pad);
        ctx.restore();
      }
    }
  }
  draw();
}

async function loadTemplates(selectEl) {
  try {
    const res = await fetch("/api/templates.php");
    if (!res.ok) throw new Error("Templates fetch failed");
    const templates = await res.json();
    selectEl.innerHTML = "";
    templates.forEach((tpl, i) => {
      const opt = document.createElement("option");
      opt.value = i.toString();
      opt.textContent = tpl.name;
      opt.dataset.payload = JSON.stringify(tpl);
      selectEl.appendChild(opt);
    });
  } catch (e) {
    // Fallback templates
    const fallback = [
      { name: "Neon Bars", mode: "bars", fg: "#00F5D4", bg: "#0B0F14", scale: 1.0 },
      { name: "Aurora Radial", mode: "radial", fg: "#5B8DEF", bg: "#0B0F14", scale: 1.0 }
    ];
    selectEl.innerHTML = "";
    fallback.forEach((tpl, i) => {
      const opt = document.createElement("option");
      opt.value = i.toString();
      opt.textContent = tpl.name;
      opt.dataset.payload = JSON.stringify(tpl);
      selectEl.appendChild(opt);
    });
  }
}

window.AveeViz = { createAnalyser, startVisualizerLoop, loadTemplates };