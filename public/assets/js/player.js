(function () {
  const audioEl = document.getElementById("audio");
  const fileInput = document.getElementById("fileInput");
  const uploadToggle = document.getElementById("uploadToggle");

  const playPauseBtn = document.getElementById("playPauseBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  const seekBar = document.getElementById("seekBar");
  const currentTimeEl = document.getElementById("currentTime");
  const durationEl = document.getElementById("duration");
  const volumeEl = document.getElementById("volume");

  const playlistEl = document.getElementById("playlist");
  const trackTitleEl = document.getElementById("trackTitle");
  const trackArtistEl = document.getElementById("trackArtist");
  const artworkEl = document.getElementById("artwork");

  const eqGridEl = document.getElementById("eqGrid");
  const eqPresetEl = document.getElementById("eqPreset");

  const vizCanvas = document.getElementById("vizCanvas");
  const vizTemplateEl = document.getElementById("vizTemplate");
  const fgColorEl = document.getElementById("fgColor");
  const bgColorEl = document.getElementById("bgColor");
  const vizModeEl = document.getElementById("vizMode");
  const resolutionEl = document.getElementById("resolution");
  const showTitleEl = document.getElementById("showTitle");
  const editTemplatesBtn = document.getElementById("editTemplatesBtn");

  const startRecBtn = document.getElementById("startRecBtn");
  const stopRecBtn = document.getElementById("stopRecBtn");
  const frameRateEl = document.getElementById("frameRate");
  const recordDurationEl = document.getElementById("recordDuration");
  const convertMp4El = document.getElementById("convertMp4");
  const exportStatusEl = document.getElementById("exportStatus");

  let uploadToServer = false;
  let audioCtx = null;
  let mediaSource = null;
  let analyser = null;
  let eqFilters = null;
  let recordDest = null;

  let rafId = null;
  let timeRafId = null;

  let recorder = null;
  let recChunks = [];
  let recTimer = null;

  const playlist = [];
  let currentIndex = -1;

  // Initialize visualizer templates
  AveeViz.loadTemplates(vizTemplateEl).then(() => {
    const first = vizTemplateEl.options[0];
    if (first) {
      const payload = JSON.parse(first.dataset.payload);
      fgColorEl.value = payload.fg || fgColorEl.value;
      bgColorEl.value = payload.bg || bgColorEl.value;
      vizModeEl.value = payload.mode || vizModeEl.value;
    }
  });

  // Visualizer loop; options is a live object mutated via controls
  const vizOptions = {
    fg: fgColorEl.value,
    bg: bgColorEl.value,
    mode: vizModeEl.value,
    scale: 1.0,
    overlayTitle: true,
    getTrackTitle: () => trackTitleEl.textContent
_code  new}</;


  function ensureAudioContext() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Build chain: mediaElementSource -> EQ (x10) -> analyser -> destination
    mediaSource = audioCtx.createMediaElementSource(audioEl);
    eqFilters = AveeEq.createEqualizer(audioCtx);
    analyser = AveeViz.createAnalyser(audioCtx);
    recordDest = audioCtx.createMediaStreamDestination();

    // connect: source -> filters[0]
    mediaSource.connect(eqFilters[0]);
    // chain filters (already connected internally), connect last filter to analyser and to recordDest
    eqFilters[eqFilters.length - 1].connect(analyser);
    analyser.connect(audioCtx.destination);
    eqFilters[eqFilters.length - 1].connect(recordDest);

    // Mount UI for EQ
    AveeEq.mountEqUI(eqGridEl, eqFilters);
    AveeEq.applyPreset(eqFilters, eqPresetEl.value);

    // Start visualizer loop
    AveeViz.startVisualizerLoop(analyser, vizCanvas, vizOptions);
  }

  // Controls wiring
  playPauseBtn.addEventListener("click", async () => {
    ensureAudioContext();
    if (audioEl.paused) {
      await audioEl.play();
      playPauseBtn.textContent = "⏸";
    } else {
      audioEl.pause();
      playPauseBtn.textContent = "▶";
    }
  });

  prevBtn.addEventListener("click", () => {
    if (playlist.length === 0) return;
    const next = (currentIndex - 1 + playlist.length) % playlist.length;
    playIndex(next);
  });

  nextBtn.addEventListener("click", () => {
    if (playlist.length === 0) return;
    const next = (currentIndex + 1) % playlist.length;
    playIndex(next);
  });

  uploadToggle.addEventListener("click", () => {
    uploadToServer = !uploadToServer;
    uploadToggle.textContent = `Upload to server: ${uploadToServer ? "On" : "Off"}`;
  });

  // File input -> load into playlist (and optionally upload)
  fileInput.addEventListener("change", async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      let url = URL.createObjectURL(file);
      let uploaded = false;
      if (uploadToServer) {
        try {
          const form = new FormData();
          form.append("audio", file, file.name);
          const res = await fetch("/api/upload.php", { method: "POST", body: form });
          const data = await res.json();
          if (data?.success && data?.path) {
            url = data.path;
            uploaded = true;
          }
        } catch (err) {
          console.warn("Upload failed", err);
        }
      }
      addToPlaylist({
        id: crypto.randomUUID(),
        name: file.name,
        url,
        uploaded
      });
    }
    if (currentIndex === -1 && playlist.length) playIndex(0);
    fileInput.value = "";
  });

  // Seek and time display
  seekBar.addEventListener("input", () => {
    if (audioEl.duration && !Number.isNaN(audioEl.duration)) {
      const t = (parseFloat(seekBar.value) / 1000) * audioEl.duration;
      audioEl.currentTime = t;
    }
  });

  volumeEl.addEventListener("input", () => {
    audioEl.volume = parseFloat(volumeEl.value);
  });

  audioEl.addEventListener("ended", () => {
    // autoplay next
    if (playlist.length) {
      const next = (currentIndex + 1) % playlist.length;
      playIndex(next);
    }
  });

  // EQ presets
  eqPresetEl.addEventListener("change", () => {
    if (!eqFilters) return;
    AveeEq.applyPreset(eqFilters, eqPresetEl.value);
  });

  // Visualizer control updates
  vizTemplateEl.addEventListener("change", () => {
    const opt = vizTemplateEl.options[vizTemplateEl.selectedIndex];
    if (!opt) return;
    try {
      const payload = JSON.parse(opt.dataset.payload);
      if (payload.fg) fgColorEl.value = payload.fg;
      if (payload.bg) bgColorEl.value = payload.bg;
      if (payload.mode) vizModeEl.value = payload.mode;
      vizOptions.fg = fgColorEl.value;
      vizOptions.bg = bgColorEl.value;
      vizOptions.mode = vizModeEl.value;
      vizOptions.scale = payload.scale || 1.0;
    } catch {}
  });
  fgColorEl.addEventListener("input", () => (vizOptions.fg = fgColorEl.value));
  bgColorEl.addEventListener("input", () => (vizOptions.bg = bgColorEl.value));
  vizModeEl.addEventListener("change", () => (vizOptions.mode = vizModeEl.value));

  resolutionEl.addEventListener("change", () => {
    const val = resolutionEl.value || "1280x720";
    const [wStr, hStr] = val.split("x");
    const w = parseInt(wStr, 10);
    const h = parseInt(hStr, 10);
    if (Number.isFinite(w) && Number.isFinite(h)) {
      vizCanvas.width = w;
      vizCanvas.height = h;
    }
  });

  showTitleEl.addEventListener("change", () => {
    vizOptions.overlayTitle = showTitleEl.checked;
  });

  editTemplatesBtn.addEventListener("click", () => {
    if (window.TemplatesManager && typeof window.TemplatesManager.open === "function") {
      window.TemplatesManager.open();
    }
  });

  // Time UI updates
  function formatTime(sec) {
    if (!Number.isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }
  function updateTimeLoop() {
    if (audioEl.duration && !Number.isNaN(audioEl.duration)) {
      currentTimeEl.textContent = formatTime(audioEl.currentTime);
      durationEl.textContent = formatTime(audioEl.duration);
      const pct = (audioEl.currentTime / audioEl.duration) * 1000;
      seekBar.value = isFinite(pct) ? pct : 0;
    } else {
      currentTimeEl.textContent = "0:00";
      durationEl.textContent = "0:00";
      seekBar.value = 0;
    }
    timeRafId = requestAnimationFrame(updateTimeLoop);
  }
  timeRafId = requestAnimationFrame(updateTimeLoop);

  // Playlist handling
  function addToPlaylist(track) {
    playlist.push(track);
    renderPlaylist();
  }

  function renderPlaylist() {
    playlistEl.innerHTML = "";
    playlist.forEach((t, idx) => {
      const li = document.createElement("li");
      li.className = idx === currentIndex ? "active" : "";
      const meta = document.createElement("div");
      meta.className = "meta";
      const title = document.createElement("span");
      title.textContent = t.name;
      const small = document.createElement("small");
      small.textContent = t.uploaded ? "server" : "local";
      meta.appendChild(title);
      meta.appendChild(small);

      const actions = document.createElement("div");
      actions.style.display = "flex";
      actions.style.gap = "6px";
      const playBtn = document.createElement("button");
      playBtn.textContent = "▶";
      playBtn.addEventListener("click", () => playIndex(idx));
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "✕";
      removeBtn.addEventListener("click", () => {
        const wasCurrent = idx === currentIndex;
        playlist.splice(idx, 1);
        if (wasCurrent) {
          currentIndex = -1;
          audioEl.pause();
          playPauseBtn.textContent = "▶";
          trackTitleEl.textContent = "No track";
          trackArtistEl.textContent = "";
        } else if (idx < currentIndex) {
          currentIndex -= 1;
        }
        renderPlaylist();
      });

      actions.appendChild(playBtn);
      actions.appendChild(removeBtn);

      li.appendChild(meta);
      li.appendChild(actions);
      playlistEl.appendChild(li);
    });
  }

  async function playIndex(idx) {
    if (idx < 0 || idx >= playlist.length) return;
    currentIndex = idx;
    const t = playlist[idx];

    ensureAudioContext();
    audioEl.src = t.url;
    try {
      await audioEl.play();
      playPauseBtn.textContent = "⏸";
    } catch (e) {
      console.warn("Autoplay blocked or play failed", e);
      playPauseBtn.textContent = "▶";
    }

    trackTitleEl.textContent = t.name || "Unknown";
    trackArtistEl.textContent = "";
    artworkEl.style.background = "radial-gradient(80% 80% at 30% 20%, #1b2a3a, #0f1a25)";
    renderPlaylist();
  }

  // Recording logic
  startRecBtn.addEventListener("click", () => {
    if (!audioCtx) ensureAudioContext();
    if (!analyser || !recordDest) return;

    const fr = Math.max(1, Math.min(60, parseInt(frameRateEl.value || "60", 10)));
    const duration = Math.max(1, Math.min(900, parseInt(recordDurationEl.value || "15", 10)));

    const canvasStream = vizCanvas.captureStream(fr);
    const audioTracks = recordDest.stream.getAudioTracks();
    if (audioTracks.length === 0) {
      exportStatusEl.textContent = "Audio capture not available.";
      return;
    }
    const combined = new MediaStream([...canvasStream.getVideoTracks(), audioTracks[0]]);
    const mimeOptions = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm'
    ];
    let mimeType = '';
    for (const m of mimeOptions) {
      if (MediaRecorder.isTypeSupported(m)) { mimeType = m; break; }
    }
    try {
      recorder = new MediaRecorder(combined, mimeType ? { mimeType } : undefined);
    } catch (e) {
      exportStatusEl.textContent = "MediaRecorder not supported in this browser.";
      return;
    }

    recChunks = [];
    recorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) recChunks.push(ev.data);
    };
    recorder.onstop = async () => {
      stopRecBtn.disabled = true;
      startRecBtn.disabled = false;
      const blob = new Blob(recChunks, { type: mimeType || "video/webm" });
      exportStatusEl.textContent = "Uploading…";

      const form = new FormData();
      form.append("video", blob, "visualizer.webm");
      form.append("convert", convertMp4El.checked ? "mp4" : "");
      try {
        const res = await fetch("/api/export.php", { method: "POST", body: form });
        const data = await res.json();
        if (data?.success) {
          const links = [];
          if (data.webm) links.push(`<a href="${data.webm}" target="_blank">WebM</a>`);
          if (data.mp4) links.push(`<a href="${data.mp4}" target="_blank">MP4</a>`);
          exportStatusEl.innerHTML = "Saved: " + links.join(" · ");
        } else {
          exportStatusEl.textContent = "Upload failed.";
        }
      } catch (e) {
        exportStatusEl.textContent = "Upload error.";
      }
    };

    recorder.start(100);
    startRecBtn.disabled = true;
    stopRecBtn.disabled = false;
    exportStatusEl.textContent = "Recording…";
    if (recTimer) clearTimeout(recTimer);
    recTimer = setTimeout(() => {
      if (recorder && recorder.state === "recording") recorder.stop();
    }, duration * 1000);
  });

  stopRecBtn.addEventListener("click", () => {
    if (recorder && recorder.state === "recording") {
      recorder.stop();
      clearTimeout(recTimer);
    }
  });
})();