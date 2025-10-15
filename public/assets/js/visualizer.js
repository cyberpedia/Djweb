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
    t = Math.max(0, Math.min(1, t));
    return [
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t)
    ];
  }

  function colormapSample(name, t) {
    // Clamp
    t = Math.max(0, Math.min(1, t));
    // Predefined stops for colormaps (approximate)
    const stops = {
      inferno: [
        [0.0, 0, 0, 4],
        [0.25, 31, 8, 70],
        [0.5, 118, 35, 112],
        [0.75, 196, 69, 58],
        [1.0, 252, 255, 164]
      ],
      magma: [
        [0.0, 0, 0, 3],
        [0.25, 28, 16, 68],
        [0.5, 109, 41, 110],
        [0.75, 187, 86, 62],
        [1.0, 252, 253, 191]
      ],
      viridis: [
        [0.0, 68, 1, 84],
        [0.25, 58, 82, 139],
        [0.5, 33, 145, 140],
        [0.75, 94, 201, 97],
        [1.0, 253, 231, 37]
      ],
      turbo: [
        [0.0, 34, 9, 255],
        [0.25, 56, 255, 236],
        [0.5, 255, 236, 56],
        [0.75, 255, 111, 0],
        [1.0, 125, 0, 0]
      ]
    };
    const map = stops[name] || stops.inferno;
    let i = 0;
    while (i < map.length - 1 && t > map[i + 1][0]) i++;
    const a = map[i];
    const b = map[Math.min(i + 1, map.length - 1)];
    const span = Math.max(1e-6, b[0] - a[0]);
    const lt = (t - a[0]) / span;
    return [
      Math.round(a[1] + (b[1] - a[1]) * lt),
      Math.round(a[2] + (b[2] - a[2]) * lt),
      Math.round(a[3] + (b[3] - a[3]) * lt)
    ];
  }

  function colormapFromStops(stops, t) {
    if (!Array.isArray(stops) || stops.length === 0) return [255, 255, 255];
    t = Math.max(0, Math.min(1, t));
    // Ensure sorted
    const arr = stops.map(s => ({ o: Math.max(0, Math.min(1, parseFloat(s.offset) || 0)), c: s.color || "#ffffff" }))
      .sort((a, b) => a.o - b.o);
    const rgb = (hex) => {
      const m = /^#?([a-fA-F0-9]{6})$/.exec(hex);
      if (!m) return [255, 255, 255];
      const int = parseInt(m[1], 16);
      return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
    };
    if (t <= arr[0].o) return rgb(arr[0].c);
    if (t >= arr[arr.length - 1].o) return rgb(arr[arr.length - 1].c);
    let i = 0;
    while (i < arr.length - 1 && t > arr[i + 1].o) i++;
    const a = arr[i];
    const b = arr[i + 1];
    const span = Math.max(1e-6, b.o - a.o);
    const lt = (t - a.o) / span;
    const ra = rgb(a.c), rb = rgb(b.c);
    return [
      Math.round(ra[0] + (rb[0] - ra[0]) * lt),
      Math.round(ra[1] + (rb[1] - ra[1]) * lt),
      Math.round(ra[2] + (rb[2] - ra[2]) * lt)
    ];
  }

  function colorFromMap(t, fgRgb, bgRgb, name, customStops) {
    if (name === "gradient" || !name) {
      return lerpColor(bgRgb, fgRgb, t);
    }
    if (name === "custom" && Array.isArray(customStops) && customStops.length > 0) {
      return colormapFromStops(customStops, t);
    }
    return colormapSample(name, t);
  }

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

  // Spectrogram state
  const specTmp = document.createElement("canvas");
  specTmp.width = canvas.width;
  specTmp.height = canvas.height;
  const specCtx = specTmp.getContext("2d");

  // Overlay logo cache (single legacy overlay) + layer image cache
  let lastLogoUrl = "";
  let logoImg = null;
  const imageCache = new Map(); // url -> HTMLImageElement

  // Bar peaks (peak-hold)
  let barPeaks = [];
  let barCountPrev = 0;

  function computePos(pos, w, h, sizeW, sizeH, pad = 16) {
    let x = pad, y = pad;
    if (pos === "top-right") { x = w - sizeW - pad; y = pad; }
    else if (pos === "bottom-left") { x = pad; y = h - sizeH - pad; }
    else if (pos === "bottom-right") { x = w - sizeW - pad; y = h - sizeH - pad; }
    return { x, y };
  }

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

      if (barCountPrev !== barCount) {
        barPeaks = new Array(barCount).fill(0);
        barCountPrev = barCount;
      }

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

        // Peak-hold
        barPeaks[i] = Math.max(barPeaks[i] * 0.96, barHeight);
        const peakY = h - barPeaks[i];
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fillRect(x + 2, Math.max(0, peakY - 2), barWidth - 4, 2);
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
        const prevX = p.x, prevY = p.y;
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

        if (options.particleTrails) {
          ctx.save();
          ctx.globalAlpha = 0.08 + energy * 0.1;
          ctx.strokeStyle = "#5B8DEF";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          ctx.restore();
        }
      }
      // Links between nearby particles
      if (options.particleLinks) {
        ctx.save();
        ctx.lineWidth = 1;
        const maxDist = Math.min(canvas.width, canvas.height) * 0.12;
        for (let i = 0; i < particles.length; i += 2) {
          const p = particles[i];
          for (let j = i + 1; j < Math.min(particles.length, i + 8); j++) {
            const q = particles[j];
            const dx = p.x - q.x;
            const dy = p.y - q.y;
            const d = Math.hypot(dx, dy);
            if (d < maxDist) {
              const idx = Math.floor((i / particles.length) * bufferLength);
              const energy = (freqData[idx] / 255);
              const a = Math.max(0, 1 - d / maxDist) * (0.08 + energy * 0.12);
              ctx.globalAlpha = a;
              ctx.strokeStyle = "#5B8DEF";
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(q.x, q.y);
              ctx.stroke();
            }
          }
        }
        ctx.restore();
      }
    } else if (mode === "waterfall") {
      analyser.getByteFrequencyData(freqData);
      const w = canvas.width;
      const h = canvas.height;
      ctx.drawImage(canvas, 0, 1, w, h - 1, 0, 0, w, h - 1);
      const cols = Math.min(384, Math.floor(w / 2));
      const step = Math.floor(bufferLength / cols);
      const fgRgb = hexToRgb(fg);
      const bgRgb = hexToRgb(bg);
      const mapName = options.colorMap || "gradient";
      const customStops = options.colorStops || null;
      for (let i = 0; i < cols; i++) {
        const idx = i * step;
        const v = freqData[idx] / 255;
        const t = Math.pow(v * scale, 0.8) * (1 + pulse * 0.6);
        const col = colorFromMap(Math.min(1, t), fgRgb, bgRgb, mapName, customStops);
        ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
        const x = Math.floor((i / cols) * w);
        const nextX = Math.floor(((i + 1) / cols) * w);
        ctx.fillRect(x, h - 1, Math.max(1, nextX - x), 1);
      }
    } else if (mode === "spectrogram") {
      analyser.getByteFrequencyData(freqData);
      const w = canvas.width;
      const h = canvas.height;
      ctx.drawImage(canvas, 1, 0, w - 1, h, 0, 0, w - 1, h);
      const rows = bufferLength;
      const fgRgb = hexToRgb(fg);
      const bgRgb = hexToRgb(bg);
      const mapName = options.colorMap || "gradient";
      const customStops = options.colorStops || null;
      for (let y = 0; y < h; y++) {
        const frac = 1 - y / h;
        const idx = Math.min(rows - 1, Math.floor(frac * rows));
        const v = (freqData[idx] / 255) * scale * (1 + pulse * 0.5);
        const t = Math.min(1, Math.pow(v, 0.85));
        const col = colorFromMap(t, fgRgb, bgRgb, mapName, customStops);
        ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
        ctx.fillRect(w - 1, y, 1, 1);
      }
    } else if (mode === "wavefall") {
      analyser.getByteTimeDomainData(timeData);
      const w = canvas.width;
      const h = canvas.height;
      // scroll up by 1px
      ctx.drawImage(canvas, 0, 1, w, h - 1, 0, 0, w, h - 1);
      const fgRgb = hexToRgb(fg);
      const bgRgb = hexToRgb(bg);
      const mapName = options.colorMap || "gradient";
      const customStops = options.colorStops || null;
      for (let x = 0; x < w; x++) {
        const idx = Math.floor((x / w) * (bufferLength - 1));
        const v = (timeData[idx] - 128) / 128;
        const t = Math.min(1, Math.abs(v) * scale * (1 + pulse * 0.3));
        const col = colorFromMap(t, fgRgb, bgRgb, mapName, customStops);
        ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
        ctx.fillRect(x, h - 1, 1, 1);
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
        ctx.fillRect(x - 4, y - boxH, boxW + 8, boxH);
        const gradText = ctx.createLinearGradient(x, y - boxH, x + boxW, y);
        gradText.addColorStop(0, fg);
        gradText.addColorStop(1, "#5B8DEF");
        ctx.fillStyle = gradText;
        ctx.fillText(title, x + pad, y - pad);
        ctx.restore();
      }
    }

    // Additional text overlay
    if (options.textOverlay && options.textOverlay.text) {
      const t = options.textOverlay;
      const size = Math.max(12, Math.min(128, parseInt(t.size || 24, 10)));
      ctx.save();
      ctx.font = `${size}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`;
      ctx.textBaseline = "top";
      const pad = 12;
      const metrics = ctx.measureText(t.text);
      let x = pad, y = pad;
      if (t.position === "top-right") { x = canvas.width - metrics.width - pad; y = pad; }
      else if (t.position === "bottom-left") { x = pad; y = canvas.height - size - pad; }
      else if (t.position === "bottom-right") { x = canvas.width - metrics.width - pad; y = canvas.height - size - pad; }
      const gradText = ctx.createLinearGradient(x, y, x + metrics.width, y + size);
      gradText.addColorStop(0, fg);
      gradText.addColorStop(1, "#5B8DEF");
      ctx.fillStyle = gradText;
      ctx.fillText(t.text, x, y);
      ctx.restore();
    }

    // Progress arc overlay
    if (options.progressArc && typeof options.getProgress === "function") {
      const info = options.getProgress();
      const prog = info && Number.isFinite(info.progress) ? info.progress : 0;
      const cx = canvas.width - 40;
      const cy = 40;
      const r = 26;
      ctx.save();
      ctx.lineWidth = 6;
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
      grad.addColorStop(0, fg);
      grad.addColorStop(1, "#5B8DEF");
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0, Math.min(1, prog)));
      ctx.stroke();
      ctx.restore();
    }

    // Logo overlay
    const logoUrl = options.logoUrl || "";
    if (logoUrl !== lastLogoUrl) {
      lastLogoUrl = logoUrl;
      logoImg = null;
      if (logoUrl) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => { logoImg = img; };
        img.onerror = () => { logoImg = null; };
        img.src = logoUrl;
      }
    }
    if (logoImg) {
      const size = Math.max(16, Math.min(512, parseInt(options.logoSize || 64, 10)));
      const pos = options.logoPosition || "top-left";
      const p = computePos(pos, canvas.width, canvas.height, size, size, 16);
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.drawImage(logoImg, p.x, p.y, size, size);
      ctx.restore();
    }

    // Layers rendering
    if (Array.isArray(options.layers)) {
      for (const layer of options.layers) {
        const type = layer.type;
        const pos = layer.position || "top-left";
        if (type === "text" && layer.text) {
          const size = Math.max(12, Math.min(128, parseInt(layer.size || 24, 10)));
          ctx.save();
          ctx.font = `${size}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`;
          const metrics = ctx.measureText(layer.text);
          const p = computePos(pos, canvas.width, canvas.height, metrics.width, size, 12);
          const gradText = ctx.createLinearGradient(p.x, p.y, p.x + metrics.width, p.y + size);
          gradText.addColorStop(0, fg);
          gradText.addColorStop(1, "#5B8DEF");
          ctx.fillStyle = gradText;
          ctx.fillText(layer.text, p.x, p.y);
          ctx.restore();
        } else if (type === "logo" && layer.url) {
          let img = imageCache.get(layer.url);
          if (!img) {
            img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => { imageCache.set(layer.url, img); };
            img.onerror = () => { imageCache.delete(layer.url); };
            img.src = layer.url;
          }
          if (img && img.complete && img.naturalWidth) {
            const size = Math.max(16, Math.min(512, parseInt(layer.size || 64, 10)));
            const p = computePos(pos, canvas.width, canvas.height, size, size, 16);
            ctx.save();
            ctx.globalAlpha = 0.9;
            ctx.drawImage(img, p.x, p.y, size, size);
            ctx.restore();
          }
        } else if (type === "progressArc" && typeof options.getProgress === "function") {
          const info = options.getProgress();
          const prog = info && Number.isFinite(info.progress) ? info.progress : 0;
          const r = Math.max(6, Math.min(256, parseInt(layer.radius || 26, 10)));
          const p = computePos(pos, canvas.width, canvas.height, r * 2, r * 2, 16);
          const cx = p.x + r;
          const cy = p.y + r;
          ctx.save();
          ctx.lineWidth = 6;
          ctx.strokeStyle = "rgba(255,255,255,0.12)";
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
          const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
          grad.addColorStop(0, fg);
          grad.addColorStop(1, "#5B8DEF");
          ctx.strokeStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0, Math.min(1, prog)));
          ctx.stroke();
          ctx.restore();
        }
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