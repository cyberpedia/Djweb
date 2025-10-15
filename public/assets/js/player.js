(function () {
  const audioA = document.getElementById("audioA");
  const audioB = document.getElementById("audioB");
  const fileInput = document.getElementById("fileInput");
  const uploadToggle = document.getElementById("uploadToggle");

  const playPauseBtn = document.getElementById("playPauseBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  const seekBar = document.getElementById("seekBar");
  const currentTimeEl = document.getElementById("currentTime");
  const durationEl = document.getElementById("duration");
  const volumeEl = document.getElementById("volume");
  const crossfadeEl = document.getElementById("crossfade");

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
  const crfEl = document.getElementById("crf");
  const audioBitrateEl = document.getElementById("audioBitrate");
  const ffPresetEl = document.getElementById("ffPreset");

  let uploadToServer = false;

  let audioCtx = null;
  let analyser = null;
  let eqFilters = null;
  let recordDest = null;

  let sourceA = null, sourceB = null;
  let gainA = null, gainB = null;
  let masterGain = null;

  let recorder = null;
  let recChunks = [];
  let recTimer = null;

  const playlist = [];
  let currentIndex = -1;

  let activeId = "A";
  let activeEl = audioA;

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
    overlayTitle: showTitleEl.checked,
    getTrackTitle: () => trackTitleEl.textContent
  };

  function ensureAudioContext() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Equalizer chain
    eqFilters = AveeEq.createEqualizer(audioCtx);

    // Sources and per-source gains
    sourceA = audioCtx.createMediaElementSource(audioA);
    sourceB = audioCtx.createMediaElementSource(audioB);
    gainA = audioCtx.createGain();
    gainB = audioCtx.createGain();
    gainA.gain.value = 0.0;
    gainB.gain.value = 0.0;

    // Mix sources into EQ chain
    sourceA.connect(gainA);
    sourceB.connect(gainB);
    gainA.connect(eqFilters[0]);
    gainB.connect(eqFilters[0]);

    // Master gain, analyser, record destination
    masterGain = audioCtx.createGain();
    masterGain.gain.value = parseFloat(volumeEl.value || "1.0");

    // Chain filters in series (already connected internally), connect last filter into master
    eqFilters[eqFilters.length - 1].connect(masterGain);

    analyser = AveeViz.createAnalyser(audioCtx);
    masterGain.connect(analyser);
    masterGain.connect(audioCtx.destination);

    recordDest = audioCtx.createMediaStreamDestination();
    masterGain.connect(recordDest);

    // Mount UI for EQ
    AveeEq.mountEqUI(eqGridEl, eqFilters);
    AveeEq.applyPreset(eqFilters, eqPresetEl.value);

    // Start visualizer loop
    AveeViz.startVisualizerLoop(analyser, vizCanvas, vizOptions);
  }

  function setMasterVolume() {
    if (!masterGain) return;
    const v = parseFloat(volumeEl.value || "1");
    masterGain.gain.value = Math.max(0, Math.min(1, v));
  }

  // Controls wiring
  playPauseBtn.addEventListener("click", async () => {
    ensureAudioContext();
    // If either is playing, pause both; else play active
    if (!audioA.paused || !audioB.paused) {
      audioA.pause();
      audioB.pause();
      playPauseBtn.textContent = "▶";
      return;
    }
    try {
      await activeEl.play();
      playPauseBtn.textContent = "⏸";
    } catch (e) {
      console.warn("Play failed", e);
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
    const el = activeEl;
    if (el.duration && !Number.isNaN(el.duration)) {
      const t = (parseFloat(seekBar.value) / 1000) * el.duration;
      el.currentTime = t;
    }
  });

  volumeEl.addEventListener("input", setMasterVolume);

  function onEnded(id) {
    return () => {
      if (id !== activeId) return;
      if (playlist.length) {
        const next = (currentIndex + 1) % playlist.length;
        playIndex(next);
      }
    };
  }
  audioA.addEventListener("ended", onEnded("A"));
  audioB.addEventListener("ended", onEnded("B"));

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
    const el = activeEl;
    if (el.duration && !Number.isNaN(el.duration)) {
      currentTimeEl.textContent = formatTime(el.currentTime);
      durationEl.textContent = formatTime(el.duration);
      const pct = (el.currentTime / el.duration) * 1000;
      seekBar.value = isFinite(pct) ? pct : 0;
    } else {
      currentTimeEl.textContent = "0:00";
      durationEl.textContent = "0:00";
      seekBar.value = 0;
    }
    requestAnimationFrame(updateTimeLoop);
  }
  requestAnimationFrame(updateTimeLoop);

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
          audioA.pause();
          audioB.pause();
          gainA && (gainA.gain.value = 0);
          gainB && (gainB.gain.value = 0);
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

  function getInactive() {
    if (activeId === "A") {
      return { id: "B", el: audioB, gain: gainB };
    }
    return { id: "A", el: audioA, gain: gainA };
  }

  async function playIndex(idx) {
    if (idx < 0 || idx >= playlist.length) return;
    currentIndex = idx;
    const t = playlist[idx];

    ensureAudioContext();

    const inactive = getInactive();
    inactive.el.src = t.url;
    try {
      await inactive.el.play();
    } catch (e) {
      console.warn("Autoplay blocked or play failed", e);
      return;
    }

    const xfade = Math.max(0, Math.min(10, parseFloat(crossfadeEl.value || "0")));
    const now = audioCtx.currentTime;

    // Prepare gains
    inactive.gain.gain.cancelScheduledValues(now);
    inactive.gain.gain.setValueAtTime(inactive.gain.gain.value, now);
    inactive.gain.gain.linearRampToValueAtTime(1.0, now + xfade);

    const activeGainNode = activeId === "A" ? gainA : gainB;
    if (activeGainNode) {
      activeGainNode.gain.cancelScheduledValues(now);
      activeGainNode.gain.setValueAtTime(activeGainNode.gain.value, now);
      activeGainNode.gain.linearRampToValueAtTime(0.0, now + xfade);
    }

    // Update active pointers
    activeId = inactive.id;
    activeEl = inactive.el;

    // After crossfade, pause the previous element to free resources
    if (xfade > 0) {
      setTimeout(() => {
        if (activeId === "A") {
          audioB.pause();
        } else {
          audioA.pause();
        }
      }, Math.ceil(xfade * 1000) + 100);
    } else {
      if (activeId === "A") audioB.pause(); else audioA.pause();
    }

    playPauseBtn.textContent = "⏸";
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
      form.append("crf", parseInt(crfEl.value || "18", 10));
      form.append("abitrate", parseInt(audioBitrateEl.value || "192", 10));
      form.append("preset", ffPresetEl.value || "veryfast");

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