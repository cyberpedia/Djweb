(function () {
  const modal = document.getElementById("tplModal");
  const tplListEl = document.getElementById("tplList");
  const tplNameEl = document.getElementById("tplName");
  const tplModeEl = document.getElementById("tplMode");
  const tplFgEl = document.getElementById("tplFg");
  const tplBgEl = document.getElementById("tplBg");
  const tplScaleEl = document.getElementById("tplScale");
  const tplStatusEl = document.getElementById("tplStatus");

  const tplCloseBtn = document.getElementById("tplCloseBtn");
  const tplNewBtn = document.getElementById("tplNewBtn");
  const tplDeleteBtn = document.getElementById("tplDeleteBtn");
  const tplSaveBtn = document.getElementById("tplSaveBtn");
  const tplExportBtn = document.getElementById("tplExportBtn");
  const tplShareBtn = document.getElementById("tplShareBtn");
  const tplImportInput = document.getElementById("tplImportInput");

  // Overlay controls
  const tplOverlayTitleEl = document.getElementById("tplOverlayTitle");
  const tplProgressArcEl = document.getElementById("tplProgressArc");
  const tplParticleTrailsEl = document.getElementById("tplParticleTrails");
  const tplLogoUrlEl = document.getElementById("tplLogoUrl");
  const tplLogoSizeEl = document.getElementById("tplLogoSize");
  const tplLogoPositionEl = document.getElementById("tplLogoPosition");
  const tplColorMapEl = document.getElementById("tplColorMap");
  const tplTextOverlayTextEl = document.getElementById("tplTextOverlayText");
  const tplTextOverlaySizeEl = document.getElementById("tplTextOverlaySize");
  const tplTextOverlayPositionEl = document.getElementById("tplTextOverlayPosition");

  const vizTemplateEl = document.getElementById("vizTemplate");

  // Layers UI
  const tplLayersListEl = document.getElementById("tplLayersList");
  const layerAddTextBtn = document.getElementById("layerAddText");
  const layerAddLogoBtn = document.getElementById("layerAddLogo");
  const layerAddProgressBtn = document.getElementById("layerAddProgress");
  const layerUpBtn = document.getElementById("layerUp");
  const layerDownBtn = document.getElementById("layerDown");
  const layerRemoveBtn = document.getElementById("layerRemove");

  const layerTypeEl = document.getElementById("layerType");
  const layerTextEl = document.getElementById("layerText");
  const layerSizeEl = document.getElementById("layerSize");
  const layerLogoUrlEl = document.getElementById("layerLogoUrl");
  const layerLogoSizeEl = document.getElementById("layerLogoSize");
  const layerRadiusEl = document.getElementById("layerRadius");
  const layerPositionEl = document.getElementById("layerPosition");

  let templates = [];
  let selectedIdx = -1;
  let selectedLayerIdx = -1;

  async function loadTemplatesFromServer() {
    try {
      const res = await fetch("/api/templates.php");
      if (!res.ok) throw new Error("fetch failed");
      templates = await res.json();
    } catch {
      templates = [
        { name: "Neon Bars", mode: "bars", fg: "#00F5D4", bg: "#0B0F14", scale: 1.0 },
        { name: "Aurora Radial", mode: "radial", fg: "#5B8DEF", bg: "#0B0F14", scale: 1.0 }
      ];
    }
    renderList();
    if (templates.length) selectIndex(0);
  }

  function renderList() {
    tplListEl.innerHTML = "";
    templates.forEach((tpl, i) => {
      const li = document.createElement("li");
      li.textContent = tpl.name;
      li.className = i === selectedIdx ? "active" : "";
      li.addEventListener("click", () => selectIndex(i));
      tplListEl.appendChild(li);
    });
  }

  function getLayers() {
    const tpl = templates[selectedIdx];
    if (!tpl) return [];
    if (!Array.isArray(tpl.layers)) tpl.layers = [];
    return tpl.layers;
  }

  function renderLayersList() {
    const layers = getLayers();
    tplLayersListEl.innerHTML = "";
    layers.forEach((layer, i) => {
      const li = document.createElement("li");
      li.textContent = layer.type || "layer";
      li.className = i === selectedLayerIdx ? "active" : "";
      li.addEventListener("click", () => selectLayer(i));
      tplLayersListEl.appendChild(li);
    });
  }

  function updateLayerFormVisibility(type) {
    const showText = type === "text";
    const showLogo = type === "logo";
    const showProg = type === "progressArc";
    document.querySelector(".layer-text-fields").style.display = showText ? "grid" : "none";
    document.querySelector(".layer-logo-fields").style.display = showLogo ? "grid" : "none";
    document.querySelector(".layer-progress-fields").style.display = showProg ? "grid" : "none";
  }

  function selectLayer(i) {
    selectedLayerIdx = i;
    renderLayersList();
    const layers = getLayers();
    const layer = layers[i];
    if (!layer) {
      layerTypeEl.value = "";
      updateLayerFormVisibility("");
      return;
    }
    layerTypeEl.value = layer.type || "";
    layerPositionEl.value = layer.position || "top-left";
    if (layer.type === "text") {
      layerTextEl.value = layer.text || "";
      layerSizeEl.value = Number.isFinite(layer.size) ? layer.size : 24;
    } else if (layer.type === "logo") {
      layerLogoUrlEl.value = layer.url || "";
      layerLogoSizeEl.value = Number.isFinite(layer.size) ? layer.size : 64;
    } else if (layer.type === "progressArc") {
      layerRadiusEl.value = Number.isFinite(layer.radius) ? layer.radius : 26;
    }
    updateLayerFormVisibility(layer.type);
  }

  function readLayerForm() {
    const type = layerTypeEl.value;
    const position = layerPositionEl.value;
    if (type === "text") {
      return { type, position, text: layerTextEl.value, size: parseInt(layerSizeEl.value || "24", 10) };
    }
    if (type === "logo") {
      return { type, position, url: layerLogoUrlEl.value.trim(), size: parseInt(layerLogoSizeEl.value || "64", 10) };
    }
    if (type === "progressArc") {
      return { type, position, radius: parseInt(layerRadiusEl.value || "26", 10) };
    }
    return null;
  }

  function applyLayerForm() {
    if (selectedLayerIdx < 0) return;
    const layers = getLayers();
    const upd = readLayerForm();
    if (!upd) return;
    layers[selectedLayerIdx] = upd;
    renderLayersList();
  }

  function addLayer(type) {
    if (selectedIdx < 0) return;
    const layers = getLayers();
    let layer = null;
    if (type === "text") layer = { type: "text", text: "Sample", size: 24, position: "bottom-left" };
    else if (type === "logo") layer = { type: "logo", url: "", size: 64, position: "top-left" };
    else if (type === "progressArc") layer = { type: "progressArc", radius: 26, position: "top-right" };
    if (!layer) return;
    layers.push(layer);
    selectedLayerIdx = layers.length - 1;
    renderLayersList();
    selectLayer(selectedLayerIdx);
  }

  function moveLayer(dir) {
    const layers = getLayers();
    if (selectedLayerIdx < 0 || selectedLayerIdx >= layers.length) return;
    const ni = selectedLayerIdx + dir;
    if (ni < 0 || ni >= layers.length) return;
    const temp = layers[selectedLayerIdx];
    layers[selectedLayerIdx] = layers[ni];
    layers[ni] = temp;
    selectedLayerIdx = ni;
    renderLayersList();
  }

  function removeLayer() {
    const layers = getLayers();
    if (selectedLayerIdx < 0 || selectedLayerIdx >= layers.length) return;
    layers.splice(selectedLayerIdx, 1);
    selectedLayerIdx = Math.min(selectedLayerIdx, layers.length - 1);
    renderLayersList();
    if (layers.length) selectLayer(selectedLayerIdx); else {
      layerTypeEl.value = "";
      updateLayerFormVisibility("");
    }
  }

  function selectIndex(i) {
    selectedIdx = i;
    renderList();
    const tpl = templates[i];
    if (!tpl) return;
    tplNameEl.value = tpl.name || "";
    tplModeEl.value = tpl.mode || "bars";
    tplFgEl.value = tpl.fg || "#00F5D4";
    tplBgEl.value = tpl.bg || "#0B0F14";
    tplScaleEl.value = Number.isFinite(tpl.scale) ? tpl.scale : 1.0;

    tplColorMapEl.value = tpl.colorMap || "gradient";
    tplOverlayTitleEl.checked = !!tpl.overlayTitle;
    tplProgressArcEl.checked = !!tpl.progressArc;
    tplParticleTrailsEl.checked = !!tpl.particleTrails;
    tplLogoUrlEl.value = tpl.logoUrl || "";
    tplLogoSizeEl.value = Number.isFinite(tpl.logoSize) ? tpl.logoSize : 64;
    tplLogoPositionEl.value = tpl.logoPosition || "top-left";
    const to = tpl.textOverlay || {};
    tplTextOverlayTextEl.value = to.text || "";
    tplTextOverlaySizeEl.value = Number.isFinite(to.size) ? to.size : 24;
    tplTextOverlayPositionEl.value = to.position || "bottom-left";

    selectedLayerIdx = -1;
    renderLayersList();
  }

  function readForm() {
    return {
      name: tplNameEl.value.trim() || "Untitled",
      mode: tplModeEl.value,
      fg: tplFgEl.value,
      bg: tplBgEl.value,
      scale: parseFloat(tplScaleEl.value || "1.0"),
      colorMap: tplColorMapEl.value,
      overlayTitle: tplOverlayTitleEl.checked,
      progressArc: tplProgressArcEl.checked,
      particleTrails: tplParticleTrailsEl.checked,
      logoUrl: tplLogoUrlEl.value.trim(),
      logoSize: parseInt(tplLogoSizeEl.value || "64", 10),
      logoPosition: tplLogoPositionEl.value,
      textOverlay: {
        text: tplTextOverlayTextEl.value.trim(),
        size: parseInt(tplTextOverlaySizeEl.value || "24", 10),
        position: tplTextOverlayPositionEl.value
      },
      layers: getLayers().slice()
    };
  }

  async function saveTemplatesToServer() {
    tplStatusEl.textContent = "Saving…";
    try {
      const res = await fetch("/api/templates_save.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templates)
      });
      const data = await res.json();
      if (data?.success) {
        tplStatusEl.textContent = "Saved.";
        // Refresh dropdown in main UI
        await AveeViz.loadTemplates(vizTemplateEl);
      } else {
        tplStatusEl.textContent = "Save failed.";
      }
    } catch {
      tplStatusEl.textContent = "Error saving templates.";
    }
  }

  tplCloseBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  tplNewBtn.addEventListener("click", () => {
    const t = { name: "New Template", mode: "bars", fg: "#00F5D4", bg: "#0B0F14", scale: 1.0 };
    templates.push(t);
    selectIndex(templates.length - 1);
    renderList();
  });

  tplDeleteBtn.addEventListener("click", async () => {
    if (selectedIdx < 0) return;
    templates.splice(selectedIdx, 1);
    selectedIdx = Math.min(selectedIdx, templates.length - 1);
    renderList();
    if (templates.length) selectIndex(selectedIdx); else {
      tplNameEl.value = "";
      tplModeEl.value = "bars";
      tplFgEl.value = "#00F5D4";
      tplBgEl.value = "#0B0F14";
      tplScaleEl.value = "1.0";
    }
    await saveTemplatesToServer();
  });

  tplSaveBtn.addEventListener("click", async () => {
    if (selectedId << 0) return;
    applyLayerForm();
    templates[selectedIdx] = readForm();
    await saveTemplatesToServer();
  });

  // Layers controls
  layerAddTextBtn.addEventListener("click", () => addLayer("text"));
  layerAddLogoBtn.addEventListener("click", () => addLayer("logo"));
  layerAddProgressBtn.addEventListener("click", () => addLayer("progressArc"));
  layerUpBtn.addEventListener("click", () => moveLayer(-1));
  layerDownBtn.addEventListener("click", () => moveLayer(1));
  layerRemoveBtn.addEventListener("click", () => removeLayer());

  // Layer form live updates
  layerTextEl.addEventListener("input", applyLayerForm);
  layerSizeEl.addEventListener("input", applyLayerForm);
  layerLogoUrlEl.addEventListener("input", applyLayerForm);
  layerLogoSizeEl.addEventListener("input", applyLayerForm);
  layerRadiusEl.addEventListener("input", applyLayer });

  tplExportBtn.addEventListener("click", () => {
    try {
      const blob = new Blob([JSON.stringify(templates, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "visualizer_templates.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 0);
      tplStatusEl.textContent = "Exported.";
    } catch {
      tplStatusEl.textContent = "Export failed.";
    }
  });

  tplShareBtn.addEventListener("click", async () => {
    tplStatusEl.textContent = "Sharing…";
    try {
      const res = await fetch("/api/templates_share.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templates)
      });
      const data = await res.json();
      if (data?.success && data?.url) {
        const link = location.origin + data.url;
        tplStatusEl.innerHTML = `Shared: <a href="${data.url}" target="_blank">${link}</a>`;
      } else {
        tplStatusEl.textContent = "Share failed.";
      }
    } catch {
      tplStatusEl.textContent = "Share failed.";
    }
  });

  tplImportInput.addEventListener("change", async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try {
      const text = await f.text();
      const arr = JSON.parse(text);
      if (!Array.isArray(arr)) throw new Error("Invalid JSON");
      const allowedModes = ["bars","radial","waveform","particles","waterfall","spectrogram","wavefall"];
      const validPos = ["top-left","top-right","bottom-left","bottom-right"];
      templates = arr.map((tpl) => {
        const name = typeof tpl.name === "string" ? tpl.name : "Untitled";
        const mode = allowedModes.includes(tpl.mode) ? tpl.mode : "bars";
        const fg = typeof tpl.fg === "string" ? tpl.fg : "#00F5D4";
        const bg = typeof tpl.bg === "string" ? tpl.bg : "#0B0F14";
        const scale = Number.isFinite(tpl.scale) ? tpl.scale : 1.0;
        const colorMap = typeof tpl.colorMap === "string" ? tpl.colorMap : "gradient";
        const overlayTitle = !!tpl.overlayTitle;
        const progressArc = !!tpl.progressArc;
        const particleTrails = !!tpl.particleTrails;
        const logoUrl = typeof tpl.logoUrl === "string" ? tpl.logoUrl : "";
        const logoSize = Number.isFinite(tpl.logoSize) ? tpl.logoSize : 64;
        const logoPosition = validPos.includes(tpl.logoPosition) ? tpl.logoPosition : "top-left";
        const to = tpl.textOverlay || {};
        const textOverlay = {
          text: typeof to.text === "string" ? to.text : "",
          size: Number.isFinite(to.size) ? to.size : 24,
          position: typeof to.position === "string" ? to.position : "bottom-left"
        };
        // Layers
        let layers = [];
        if (Array.isArray(tpl.layers)) {
          layers = tpl.layers.map((l) => {
            const type = l && typeof l.type === "string" ? l.type : "";
            const position = validPos.includes(l?.position) ? l.position : "top-left";
            if (type === "text") {
              return { type, position, text: typeof l.text === "string" ? l.text : "", size: Number.isFinite(l.size) ? l.size : 24 };
            } else if (type === "logo") {
              return { type, position, url: typeof l.url === "string" ? l.url : "", size: Number.isFinite(l.size) ? l.size : 64 };
            } else if (type === "progressArc") {
              return { type, position, radius: Number.isFinite(l.radius) ? l.radius : 26 };
            }
            return null;
          }).filter(Boolean);
        }
        return { name, mode, fg, bg, scale, colorMap, overlayTitle, progressArc, particleTrails, logoUrl, logoSize, logoPosition, textOverlay, layers };
      });
      selectedIdx = templates.length ? 0 : -1;
      renderList();
      if (templates.length) selectIndex(0);
      await saveTemplatesToServer();
      tplStatusEl.textContent = "Imported.";
      e.target.value = "";
    } catch {
      tplStatusEl.textContent = "Import failed.";
    }
  });

  window.TemplatesManager = {
    open: async () => {
      tplStatusEl.textContent = "";
      modal.classList.remove("hidden");
      await loadTemplatesFromServer();
    },
    close: () => modal.classList.add("hidden")
  };
})();