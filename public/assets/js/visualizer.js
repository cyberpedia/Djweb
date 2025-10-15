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

  function draw() {
    requestAnimationFrame(draw);
    const { fg = "#00F5D4", bg = "#0B0F14", mode = "bars", scale = 1.0 } = options;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (mode === "bars") {
      analyser.getByteFrequencyData(freqData);
      const w = canvas.width;
      const h = canvas.height;
      const barCount = 96;
      const step = Math.floor(bufferLength / barCount);
      const barWidth = w / barCount;
      for (let i = 0; i < barCount; i++) {
        const v = freqData[i * step] / 255;
        const barHeight = v * h * 0.9 * scale;
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
        const r = radius + v * 80 * scale;
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