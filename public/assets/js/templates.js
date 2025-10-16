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
  const tplColorStopsListEl = document.getElementById("tplColorStopsList");
  const tplColorStopAddBtn = document.getElementById("tplColorStopAdd");
  const tplTextOverlayTextEl = document.getElementById("tplTextOverlayText");
  const tplTextOverlaySizeEl = document.getElementById("tplTextOverlaySize");
  const tplTextOverlayPositionEl = document.getElementById("tplTextOverlayPosition");
  const tplParticleLinksEl = document.getElementById("tplParticleLinks");

  const vizTemplateEl = document.getElementById("vizTemplate");

  // Layers UI
  const tplLayersListEl = document.getElementById("tplLayersList");
  const layerAddTextBtn = document.getElementById("layerAddText");
  const layerAddLogoBtn = document.getElementById("layerAddLogo");
  const layerAddImageBtn = document.getElementById("layerAddImage");
  const layerAddProgressBtn = document.getElementById("layerAddProgress");
  const layerAddRectBtn = document.getElementById("layerAddRect");
  const layerAddBarBtn = document.getElementById("layerAddBar");
  const layerUpBtn = document.getElementById("layerUp");
  const layerDownBtn = document.getElementById("layerDown");
  const layerRemoveBtn = document.getElementById("layerRemove");

  const layerTypeEl = document.getElementById("layerType");
  const layerOpacityEl = document.getElementById("layerOpacity");
  const layerBlendEl = document.getElementById("layerBlend");
  const layerTextEl = document.getElementById("layerText");
  const layerSizeEl = document.getElementById("layerSize");
  const layerLogoUrlEl = document.getElementById("layerLogoUrl");
  const layerLogoSizeEl = document.getElementById("layerLogoSize");
  const layerRadiusEl = document.getElementById("layerRadius");
  const layerThicknessEl = document.getElementById("layerThickness");
  const layerRectWidthEl = document.getElementById("layerRectWidth");
  const layerRectHeightEl = document.getElementById("layerRectHeight");
  const layerRectRadiusEl = document.getElementById("layerRectRadius");
  const layerRectColorEl = document.getElementById("layerRectColor");
  const layerImageUrlEl = document.getElementById("layerImageUrl");
  const layerImageWidthEl = document.getElementById("layerImageWidth");
  const layerImageHeightEl = document.getElementById("layerImageHeight");
  const layerImageTintEl = document.getElementById("layerImageTint");
  const layerImageAlphaEl = document.getElementById("layerImageAlpha");
  const layerBarWidthEl = document.getElementById("layerBarWidth");
  const layerBarHeightEl = document.getElementById("layerBarHeight");
  const layerBarColorEl = document.getElementById("layerBarColor");
  const layerBarOrientEl = document.getElementById("layerBarOrient");
  const layerPositionEl = document.getElementById("layerPosition");
  const layerAnimTypeEl = document.getElementById("layerAnimType");
  const layerAnimSpeedEl = document.getElementById("layerAnimSpeed");
  const layerAnimAmpEl = document.getElementById("layerAnimAmp");

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

  function getColorStops() {
    const tpl = templates[selectedIdx];
    if (!tpl) return [];
    if (!Array.isArray(tpl.colorStops)) tpl.colorStops = [];
    return tpl.colorStops;
  }

  function renderColorStops(stops) {
    tplColorStopsListEl.innerHTML = "";
    (stops || []).forEach((s, i) => {
      const li = document.createElement("li");
      const off = document.createElement("input");
      off.type = "number"; off.min = "0"; off.max = "1"; off.step = "0.01";
      off.value = (Number.isFinite(s.offset) ? s.offset : 0).toString();
      const col = document.createElement("input");
      col.type = "color";
      const color = typeof s.color === "string" ? s.color : "#ffffff";
      // normalize to #rrggbb
      col.value = /^#/.test(color) ? color : "#ffffff";
      const rem = document.createElement("button");
      rem.textContent = "Remove";
      rem.className = "secondary";
      rem.addEventListener("click", () => {
        const arr = getColorStops();
        arr.splice(i, 1);
        renderColorStops(arr);
      });
      off.addEventListener("input", () => {
        const arr = getColorStops();
        arr[i] = { offset: parseFloat(off.value || "0"), color: col.value };
      });
      col.addEventListener("input", () => {
        const arr = getColorStops();
        arr[i] = { offset: parseFloat(off.value || "0"), color: col.value };
      });
      li.appendChild(off);
      li.appendChild(col);
      li.appendChild(rem);
      tplColorStopsListEl.appendChild(li);
    });
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
    const showImage = type === "image";
    const showProg = type === "progressArc";
    const showRect = type === "rectangle";
    const showBar = type === "progressBar";
    document.querySelector(".layer-text-fields").style.display = showText ? "grid" : "none";
    document.querySelector(".layer-logo-fields").style.display = showLogo ? "grid" : "none";
    document.querySelector(".layer-image-fields").style.display = showImage ? "grid" : "none";
    document.querySelector(".layer-progress-fields").style.display = showProg ? "grid" : "none";
    document.querySelector(".layer-rect-fields").style.display = showRect ? "grid" : "none";
    document.querySelector(".layer-bar-fields").style.display = showBar ? "grid" : "none";
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
    layerOpacityEl.value = Number.isFinite(layer.opacity) ? layer.opacity : 1.0;
    layerBlendEl.value = typeof layer.blend === "string" ? layer.blend : "normal";
    const anim = layer.anim || {};
    layerAnimTypeEl.value = typeof anim.type === "string" ? anim.type : "none";
    layerAnimSpeedEl.value = Number.isFinite(anim.speed) ? anim.speed : 0.5;
    layerAnimAmpEl.value = Number.isFinite(anim.amp) ? anim.amp : 10;
    if (layer.type === "text") {
      layerTextEl.value = layer.text || "";
      layerSizeEl.value = Number.isFinite(layer.size) ? layer.size : 24;
    } else if (layer.type === "logo") {
      layerLogoUrlEl.value = layer.url || "";
      layerLogoSizeEl.value = Number.isFinite(layer.size) ? layer.size : 64;
    } else if (layer.type === "image") {
      layerImageUrlEl.value = layer.url || "";
      layerImageWidthEl.value = Number.isFinite(layer.width) ? layer.width : 256;
      layerImageHeightEl.value = Number.isFinite(layer.height) ? layer.height : 256;
      layerImageTintEl.value = typeof layer.tint === "string" ? layer.tint : "#ffffff";
      layerImageAlphaEl.value = Number.isFinite(layer.alpha) ? layer.alpha : 0;
    } else if (layer.type === "progressArc") {
      layerRadiusEl.value = Number.isFinite(layer.radius) ? layer.radius : 26;
      layerThicknessEl.value = Number.isFinite(layer.thickness) ? layer.thickness : 6;
    } else if (layer.type === "rectangle") {
      layerRectWidthEl.value = Number.isFinite(layer.width) ? layer.width : 200;
      layerRectHeightEl.value = Number.isFinite(layer.height) ? layer.height : 100;
      layerRectRadiusEl.value = Number.isFinite(layer.radius) ? layer.radius : 12;
      layerRectColorEl.value = typeof layer.color === "string" ? layer.color : "#ffffff";
    } else if (layer.type === "progressBar") {
      layerBarWidthEl.value = Number.isFinite(layer.width) ? layer.width : 400;
      layerBarHeightEl.value = Number.isFinite(layer.height) ? layer.height : 20;
      layerBarColorEl.value = typeof layer.color === "string" ? layer.color : "#00F5D4";
      layerBarOrientEl.value = typeof layer.orient === "string" ? layer.orient : "h";
    }
    updateLayerFormVisibility(layer.type);
  }

  function readLayerForm() {
    const type = layerTypeEl.value;
    const position = layerPositionEl.value;
    const opacity = Math.max(0, Math.min(1, parseFloat(layerOpacityEl.value || "1")));
    const blend = layerBlendEl.value || "normal";
    const anim = {
      type: layerAnimTypeEl.value || "none",
      speed: parseFloat(layerAnimSpeedEl.value || "0.5"),
      amp: parseFloat(layerAnimAmpEl.value || "10")
    };
    if (type === "text") {
      return { type, position, opacity, blend, anim, text: layerTextEl.value, size: parseInt(layerSizeEl.value || "24", 10) };
    }
    if (type === "logo") {
      return { type, position, opacity, blend, anim, url: layerLogoUrlEl.value.trim(), size: parseInt(layerLogoSizeEl.value || "64", 10) };
    }
    if (type === "image") {
      return {
        type, position, opacity, blend, anim,
        url: layerImageUrlEl.value.trim(),
        width: parseInt(layerImageWidthEl.value || "256", 10),
        height: parseInt(layerImageHeightEl.value || "256", 10),
        tint: layerImageTintEl.value || "#ffffff",
        alpha: Math.max(0, Math.min(1, parseFloat(layerImageAlphaEl.value || "0")))
      };
    }
    if (type === "progressArc") {
      return { type, position, opacity, blend, anim, radius: parseInt(layerRadiusEl.value || "26", 10), thickness: parseInt(layerThicknessEl.value || "6", 10) };
    }
    if (type === "rectangle") {
      return { type, position, opacity, blend, anim, width: parseInt(layerRectWidthEl.value || "200", 10), height: parseInt(layerRectHeightEl.value || "100", 10), radius: parseInt(layerRectRadiusEl.value || "12", 10), color: layerRectColorEl.value || "#ffffff" };
    }
    if (type === "progressBar") {
      return { type, position, opacity, blend, anim, width: parseInt(layerBarWidthEl.value || "400", 10), height: parseInt(layerBarHeightEl.value || "20", 10), color: layerBarColorEl.value || "#00F5D4", orient: layerBarOrientEl.value || "h" };
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
    let base = { anim: { type: "none", speed: 0.5, amp: 10 } };
    let layer = null;
    if (type === "text") layer = { ...base, type: "text", text: "Sample", size: 24, position: "bottom-left", opacity: 1, blend: "normal" };
    else if (type === "logo") layer = { ...base, type: "logo", url: "", size: 64, position: "top-left", opacity: 1, blend: "normal" };
    else if (type === "image") layer = { ...base, type: "image", url: "", width: 256, height: 256, tint: "#ffffff", alpha: 0, position: "top-left", opacity: 1, blend: "normal" };
    else if (type === "progressArc") layer = { ...base, type: "progressArc", radius: 26, thickness: 6, position: "top-right", opacity: 1, blend: "normal" };
    else if (type === "rectangle") layer = { ...base, type: "rectangle", width: 200, height: 100, radius: 12, color: "#ffffff", position: "top-left", opacity: 0.5, blend: "overlay" };
    else if (type === "progressBar") layer = { ...base, type: "progressBar", width: 400, height: 20, color: "#00F5D4", orient: "h", position: "bottom-left", opacity: 1, blend: "normal" };
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
    tplParticleLinksEl.checked = !!tpl.particleLinks;
    tplLogoUrlEl.value = tpl.logoUrl || "";
    tplLogoSizeEl.value = Number.isFinite(tpl.logoSize) ? tpl.logoSize : 64;
    tplLogoPositionEl.value = tpl.logoPosition || "top-left";
    const to = tpl.textOverlay || {};
    tplTextOverlayTextEl.value = to.text || "";
    tplTextOverlaySizeEl.value = Number.isFinite(to.size) ? to.size : 24;
    tplTextOverlayPositionEl.value = to.position || "bottom-left";

    // Color stops
    if (!Array.isArray(tpl.colorStops) || tpl.colorStops.length === 0) {
      // Initialize default stops from FG/BG
      tpl.colorStops = [
        { offset: 0, color: tpl.bg || "#0B0F14" },
        { offset: 1, color: tpl.fg || "#00F5D4" }
      ];
    }
    renderColorStops(tpl.colorStops);

    selectedLayerIdx = -1;
    renderLayersList();
  }

  function readForm() {
    const colorStops = getColorStops().slice().map(s => ({
      offset: Math.max(0, Math.min(1, parseFloat(s.offset) || 0)),
      color: typeof s.color === "string" ? s.color : "#ffffff"
    })).sort((a, b) => a.offset - b.offset);
    return {
      name: tplNameEl.value.trim() || "Untitled",
      mode: tplModeEl.value,
      fg: tplFgEl.value,
      bg: tplBgEl.value,
      scale: parseFloat(tplScaleEl.value || "1.0"),
      colorMap: tplColorMapEl.value,
      colorStops,
      overlayTitle: tplOverlayTitleEl.checked,
      progressArc: tplProgressArcEl.checked,
      particleTrails: tplParticleTrailsEl.checked,
      particleLinks: tplParticleLinksEl.checked,
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
    if (selectedIdx < 0) return;
    applyLayerForm();
    templates[selectedIdx] = readForm();
    await saveTemplatesToServer();
  });

  // Color stops controls
  function ensureDefaultStops() {
    const arr = getColorStops();
    if (arr.length === 0) {
      const fg = tplFgEl.value || "#00F5D4";
      const bg = tplBgEl.value || "#0B0F14";
      arr.push({ offset: 0, color: bg }, { offset: 1, color: fg });
    }
  }
  tplColorStopAddBtn.addEventListener("click", () => {
    const arr = getColorStops();
    ensureDefaultStops();
    arr.push({ offset: 0.5, color: "#ffffff" });
    renderColorStops(arr);
  });

  tplColorMapEl.addEventListener("change", () => {
    const wrap = document.querySelector(".colormap-stops");
    if (wrap) wrap.style.display = tplColorMapEl.value === "custom" ? "grid" : "none";
  });
  // Initialize visibility based on current selection
  (function initStopsVis() {
    const wrap = document.querySelector(".colormap-stops");
    if (wrap) wrap.style.display = tplColorMapEl.value === "custom" ? "grid" : "none";
  })();

  // Layers controls
  layerAddTextBtn.addEventListener("click", () => addLayer("text"));
  layerAddLogoBtn.addEventListener("click", () => addLayer("logo"));
  layerAddImageBtn.addEventListener("click", () => addLayer("image"));
  layerAddProgressBtn.addEventListener("click", () => addLayer("progressArc"));
  layerAddRectBtn.addEventListener("click", () => addLayer("rectangle"));
  layerAddBarBtn.addEventListener("click", () => addLayer("progressBar"));
  layerUpBtn.addEventListener("click", () => moveLayer(-1));
  layerDownBtn.addEventListener("click", () => moveLayer(1));
  layerRemoveBtn.addEventListener("click", () => removeLayer());

  // Layer form live updates
  layerOpacityEl.addEventListener("input", applyLayerForm);
  layerBlendEl.addEventListener("change", applyLayerForm);
  layerAnimTypeEl.addEventListener("change", applyLayerForm);
  layerAnimSpeedEl.addEventListener("input", applyLayerForm);
  layerAnimAmpEl.addEventListener("input", applyLayerForm);
  layerTextEl.addEventListener("input", applyLayerForm);
  layerSizeEl.addEventListener("input", applyLayerForm);
  layerLogoUrlEl.addEventListener("input", applyLayerForm);
  layerLogoSizeEl.addEventListener("input", applyLayerForm);
  layerRadiusEl.addEventListener("input", applyLayerForm);
  if (layerThicknessEl) layerThicknessEl.addEventListener("input", applyLayerForm);
  layerRectWidthEl.addEventListener("input", applyLayerForm);
  layerRectHeightEl.addEventListener("input", applyLayerForm);
  if (layerRectRadiusEl) layerRectRadiusEl.addEventListener("input", applyLayerForm);
  layerRectColorEl.addEventListener("input", applyLayerForm);
  if (layerImageUrlEl) layerImageUrlEl.addEventListener("input", applyLayerForm);
  if (layerImageWidthEl) layerImageWidthEl.addEventListener("input", applyLayerForm);
  if (layerImageHeightEl) layerImageHeightEl.addEventListener("input", applyLayerForm);
  if (layerImageTintEl) layerImageTintEl.addEventListener("input", applyLayerForm);
  if (layerImageAlphaEl) layerImageAlphaEl.addEventListener("input", applyLayerForm);
  layerBarWidthEl.addEventListener("input", applyLayerForm);
  layerBarHeightEl.addEventListener("input", applyLayerForm);
  layerBarColorEl.addEventListener("input", applyLayerForm);
  layerBarOrientEl.addEventListener("change", applyLayerForm);
  layerPositionEl.addEventListener("change", applyLayerForm);

  

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
      const allowedModes = ["bars","radial","waveform","particles","waterfall","spectrogram","wavefall","circlebars","mirrorwave"];
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
        const particleLinks = !!tpl.particleLinks;
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
            const opacity = Math.max(0, Math.min(1, parseFloat(l?.opacity) || 1));
            const blend = typeof l?.blend === "string" ? l.blend : "normal";
            const la = l && typeof l.anim === "object" ? l.anim : {};
            const anim = {
              type: (typeof la.type === "string" ? la.type : "none"),
              speed: Number.isFinite(la.speed) ? la.speed : 0.5,
              amp: Number.isFinite(la.amp) ? la.amp : 10
            };
            if (type === "text") {
              return { type, position, opacity, blend, anim, text: typeof l.text === "string" ? l.text : "", size: Number.isFinite(l.size) ? l.size : 24 };
            } else if (type === "logo") {
              return { type, position, opacity, blend, anim, url: typeof l.url === "string" ? l.url : "", size: Number.isFinite(l.size) ? l.size : 64 };
            } else if (type === "image") {
              return {
                type, position, opacity, blend, anim,
                url: typeof l.url === "string" ? l.url : "",
                width: Number.isFinite(l.width) ? l.width : 256,
                height: Number.isFinite(l.height) ? l.height : 256,
                tint: typeof l.tint === "string" ? l.tint : "#ffffff",
                alpha: Number.isFinite(l.alpha) ? Math.max(0, Math.min(1, l.alpha)) : 0
              };
            } else if (type === "progressArc") {
              return { type, position, opacity, blend, anim, radius: Number.isFinite(l.radius) ? l.radius : 26, thickness: Number.isFinite(l.thickness) ? l.thickness : 6 };
            } else if (type === "rectangle") {
              return { type, position, opacity, blend, anim, width: Number.isFinite(l.width) ? l.width : 200, height: Number.isFinite(l.height) ? l.height : 100, radius: Number.isFinite(l.radius) ? l.radius : 12, color: typeof l.color === "string" ? l.color : "#ffffff" };
            } else if (type === "progressBar") {
              return { type, position, opacity, blend, anim, width: Number.isFinite(l.width) ? l.width : 400, height: Number.isFinite(l.height) ? l.height : 20, color: typeof l.color === "string" ? l.color : "#00F5D4", orient: (l.orient === "v") ? "v" : "h" };
            }
            return null;
          }).filter(Boolean);
        }
        // Color stops
        let colorStops = [];
        if (Array.isArray(tpl.colorStops)) {
          colorStops = tpl.colorStops.map((s) => {
            const offset = Math.max(0, Math.min(1, parseFloat(s.offset) || 0));
            const color = typeof s.color === "string" ? s.color : "#ffffff";
            return { offset, color };
          }).sort((a, b) => a.offset - b.offset);
        }
        return { name, mode, fg, bg, scale, colorMap, colorStops, overlayTitle, progressArc, particleTrails, particleLinks, logoUrl, logoSize, logoPosition, textOverlay, layers };
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