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
  const layerAnimEaseEl = document.getElementById("layerAnimEase");
  const layerAnimDurEl = document.getElementById("layerAnimDur");
  const layerAnimLoopEl = document.getElementById("layerAnimLoop");
  const layerAnimKfEl = document.getElementById("layerAnimKf");

  // Keyframe editor elements
  const kfEditorEl = document.getElementById("kfEditor");
  const kfTimelineEl = document.getElementById("kfTimeline");
  const kfStageEl = document.getElementById("kfStage");
  const kfPlayBtn = document.getElementById("kfPlayBtn");
  const kfStopBtn = document.getElementById("kfStopBtn");
  const kfAddBtn = document.getElementById("kfAddBtn");
  const kfDeleteBtn = document.getElementById("kfDeleteBtn");
  const kfTimeLabel = document.getElementById("kfTimeLabel");
  const kfTEl = document.getElementById("kfT");
  const kfXEl = document.getElementById("kfX");
  const kfYEl = document.getElementById("kfY");
  const kfREl = document.getElementById("kfR");
  const kfSEl = document.getElementById("kfS");
  const kfSegEaseEl = document.getElementById("kfSegEase");
  const kfCurvesEl = document.getElementById("kfCurves");

  // Keyframe editor state
  let kf = [];
  let kfSelected = -1;
  let kfPlay = false;
  let kfPlayStart = 0; // performance.now()
  let kfPlayDur = 4;   // seconds
  let kfTime = 0;      // 0..1
  let kfDragIdx = -1;
  let kfDragging = false;

  // Stage preview image cache
  const stageImgCache = new Map();

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
    layerAnimEaseEl.value = typeof anim.ease === "string" ? anim.ease : "linear";
    layerAnimDurEl.value = Number.isFinite(anim.dur) ? anim.dur : 4;
    layerAnimLoopEl.checked = !!anim.loop;
    try {
      const kfTemp = Array.isArray(anim.kf) ? anim.kf : [];
      layerAnimKfEl.value = JSON.stringify(kfTemp, null, 2);
    } catch {
      layerAnimKfEl.value = "[]";
    }
    // Initialize keyframe editor for this layer
    kfUpdateVisibility();
    kfLoadFromTextarea();
    kfRenderAll();
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
    let kf = [];
    try {
      const arr = JSON.parse(layerAnimKfEl.value || "[]");
      if (Array.isArray(arr)) {
        kf = arr.map((p) => {
          const e = typeof p.e === "string" ? p.e : undefined;
          return {
            t: Math.max(0, Math.min(1, parseFloat(p.t) || 0)),
            x: Number.isFinite(p.x) ? p.x : 0,
            y: Number.isFinite(p.y) ? p.y : 0,
            r: Number.isFinite(p.r) ? p.r : 0,
            s: Number.isFinite(p.s) ? p.s : 1,
            ...(e ? { e } : {})
          };
        }).sort((a, b) => a.t - b.t);
      }
    } catch {}
    const anim = {
      type: layerAnimTypeEl.value || "none",
      speed: parseFloat(layerAnimSpeedEl.value || "0.5"),
      amp: parseFloat(layerAnimAmpEl.value || "10"),
      ease: layerAnimEaseEl.value || "linear",
      dur: parseFloat(layerAnimDurEl.value || "4"),
      loop: !!layerAnimLoopEl.checked,
      kf
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
  layerAnimEaseEl.addEventListener("change", applyLayerForm);
  layerAnimDurEl.addEventListener("input", applyLayerForm);
  layerAnimLoopEl.addEventListener("change", applyLayerForm);
  layerAnimKfEl.addEventListener("input", applyLayerForm);
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

  // ----- Keyframe editor helpers -----
  function kfEase(t, mode) {
    t = Math.max(0, Math.min(1, t));
    if (mode === "easeIn") return t * t;
    if (mode === "easeOut") return t * (2 - t);
    if (mode === "easeInOut") return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    return t;
  }

  function kfUpdateVisibility() {
    const isKF = (layerAnimTypeEl.value || "none") === "keyframes";
    if (kfEditorEl) kfEditorEl.classList.toggle("hidden", !isKF);
    if (isKF) {
      kfLoadFromTextarea();
      kfRenderAll();
    }
  }

  function kfLoadFromTextarea() {
    try {
      const arr = JSON.parse(layerAnimKfEl.value || "[]");
      if (Array.isArray(arr)) {
        kf = arr.map(p => {
          const e = typeof p.e === "string" ? p.e : undefined;
          return {
            t: Math.max(0, Math.min(1, parseFloat(p.t) || 0)),
            x: Number.isFinite(p.x) ? p.x : 0,
            y: Number.isFinite(p.y) ? p.y : 0,
            r: Number.isFinite(p.r) ? p.r : 0,
            s: Number.isFinite(p.s) ? Math.max(0.01, p.s) : 1,
            ...(e ? { e } : {})
          };
        }).sort((a, b) => a.t - b.t);
      } else {
        kf = [];
      }
    } catch {
      kf = [];
    }
    if (kf.length < 2) {
      kf = [{ t: 0, x: 0, y: 0, r: 0, s: 1 }, { t: 1, x: 0, y: 0, r: 0, s: 1 }];
    }
    kfSelected = 0;
    kfTime = kf[0].t;
    kfSyncInputs();
    kfSyncTextarea();
  }

  function kfSyncTextarea() {
    try {
      layerAnimKfEl.value = JSON.stringify(kf.slice().sort((a, b) => a.t - b.t), null, 2);
    } catch {}
  }

  function kfSyncInputs() {
    const cur = kf[kfSelected] || kf[0];
    if (!cur) return;
    kfTEl.value = cur.t.toFixed(2);
    kfXEl.value = Math.round(cur.x);
    kfYEl.value = Math.round(cur.y);
    kfREl.value = Math.round(cur.r);
    kfSEl.value = (cur.s).toFixed(2);
    if (kfTimeLabel) kfTimeLabel.textContent = `t=${(kfTime).toFixed(2)}`;
    if (kfSegEaseEl) {
      // Last keyframe has no outgoing segment
      const isLast = kfSelected >= kf.length - 1;
      kfSegEaseEl.disabled = isLast;
      const v = cur.e || "inherit";
      kfSegEaseEl.value = isLast ? "inherit" : v;
    }
  }

  function kfSelect(idx) {
    kfSelected = Math.max(0, Math.min(kf.length - 1, idx));
    kfTime = kf[kfSelected].t;
    kfSyncInputs();
    kfRenderAll();
  }

  function kfAddAt(t) {
    const prev = kf.slice().sort((a, b) => a.t - b.t);
    const ease = layerAnimEaseEl.value || "linear";
    const samp = kfSample(prev, t, ease);
    prev.push({ t: t, x: samp.x, y: samp.y, r: samp.r, s: samp.s });
    kf = prev.sort((a, b) => a.t - b.t);
    kfSelected = kf.findIndex(p => p.t === t);
    if (kfSelected < 0) kfSelected = Math.max(0, Math.min(kf.length - 1, Math.floor(kf.length / 2)));
    kfTime = t;
    kfSyncTextarea();
    kfSyncInputs();
    kfRenderAll();
    applyLayerForm();
  }

  function kfDeleteSelected() {
    if (kf.length <= 2) return;
    if (kfSelected < 0 || kfSelected >= kf.length) return;
    kf.splice(kfSelected, 1);
    kfSelected = Math.max(0, Math.min(kf.length - 1, kfSelected));
    kfTime = kf[kfSelected].t;
    kfSyncTextarea();
    kfSyncInputs();
    kfRenderAll();
    applyLayerForm();
  }

  function kfSetTime(t) {
    kfTime = Math.max(0, Math.min(1, t));
    if (kfTimeLabel) kfTimeLabel.textContent = `t=${kfTime.toFixed(2)}`;
    kfRenderAll();
  }

  function kfSample(arr, t, easeMode) {
    if (!Array.isArray(arr) || arr.length === 0) return { x: 0, y: 0, r: 0, s: 1 };
    const a0 = arr[0], a1 = arr[arr.length - 1];
    if (t <= a0.t) return { x: a0.x, y: a0.y, r: a0.r, s: a0.s };
    if (t >= a1.t) return { x: a1.x, y: a1.y, r: a1.r, s: a1.s };
    let i = 0;
    while (i < arr.length - 1 && t > arr[i + 1].t) i++;
    const a = arr[i], b = arr[Math.min(i + 1, arr.length - 1)];
    const span = Math.max(1e-6, b.t - a.t);
    let lt = (t - a.t) / span;
    const segEase = (typeof a.e === "string" ? a.e : easeMode);
    lt = kfEase(lt, segEase);
    const lerp = (u, v) => u + (v - u) * lt;
    return { x: lerp(a.x, b.x), y: lerp(a.y, b.y), r: lerp(a.r, b.r), s: Math.max(0.01, lerp(a.s, b.s)) };
  }

  function kfRenderTimeline() {
    if (!kfTimelineEl) return;
    const ctx = kfTimelineEl.getContext("2d");
    const w = kfTimelineEl.width, h = kfTimelineEl.height;
    ctx.clearRect(0, 0, w, h);
    // background
    ctx.fillStyle = "#0b0f14";
    ctx.fillRect(0, 0, w, h);
    // axis
    ctx.strokeStyle = "#1f2a37";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(8, h / 2);
    ctx.lineTo(w - 8, h / 2);
    ctx.stroke();
    // ticks
    ctx.fillStyle = "#95a3b3";
    for (let i = 0; i <= 10; i++) {
      const x = 8 + (w - 16) * (i / 10);
      ctx.fillRect(x, h / 2 - 8, 1, 16);
    }
    // keyframes
    for (let i = 0; i < kf.length; i++) {
      const x = 8 + (w - 16) * kf[i].t;
      ctx.beginPath();
      ctx.arc(x, h / 2, i === kfSelected ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = i === kfSelected ? "#00f5d4" : "#5b8def";
      ctx.fill();
      ctx.strokeStyle = "#0b0f14";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    // playhead
    const px = 8 + (w - 16) * kfTime;
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fillRect(px, 0, 1, h);
  }

  function kfRenderStage() {
    if (!kfStageEl) return;
    const ctx = kfStageEl.getContext("2d");
    const w = kfStageEl.width, h = kfStageEl.height;
    ctx.clearRect(0, 0, w, h);
    // bg grid
    ctx.fillStyle = "#0b0f14";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#1f2a37";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    // stage center
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.beginPath(); ctx.moveTo(w/2, 0); ctx.lineTo(w/2, h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, h/2); ctx.lineTo(w, h/2); ctx.stroke();

    // sample transform at current time
    const ease = layerAnimEaseEl.value || "linear";
    const samp = kfSample(kf, kfTime, ease);

    // build a pseudo-layer from current form values
    const type = layerTypeEl.value;
    const color = layerRectColorEl?.value || "#5b8def";
    const text = layerTextEl?.value || "Text";
    const textSize = parseInt(layerSizeEl?.value || "24", 10);
    const logoUrl = layerLogoUrlEl?.value || "";
    const logoSize = parseInt(layerLogoSizeEl?.value || "64", 10);
    const imageUrl = layerImageUrlEl?.value || "";
    const imageW = parseInt(layerImageWidthEl?.value || "256", 10);
    const imageH = parseInt(layerImageHeightEl?.value || "256", 10);
    const rectW = parseInt(layerRectWidthEl?.value || "200", 10);
    const rectH = parseInt(layerRectHeightEl?.value || "100", 10);
    const rectR = parseInt(layerRectRadiusEl?.value || "12", 10);
    const arcR = parseInt(layerRadiusEl?.value || "26", 10);
    const arcTh = parseInt(layerThicknessEl?.value || "6", 10);
    const barW = parseInt(layerBarWidthEl?.value || "400", 10);
    const barH = parseInt(layerBarHeightEl?.value || "20", 10);
    const barColor = layerBarColorEl?.value || "#00F5D4";
    const orient = (layerBarOrientEl?.value === "v") ? "v" : "h";

    const cx = Math.round(w / 2 + samp.x);
    const cy = Math.round(h / 2 + samp.y);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((samp.r * Math.PI) / 180);
    ctx.scale(samp.s, samp.s);

    ctx.lineWidth = 2;

    if (type === "text") {
      ctx.font = `${textSize}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      const grad = ctx.createLinearGradient(-100, -textSize / 2, 100, textSize / 2);
      grad.addColorStop(0, "#00f5d4");
      grad.addColorStop(1, "#5b8def");
      ctx.fillStyle = grad;
      ctx.fillText(text, 0, 0);
    } else if (type === "logo" && logoUrl) {
      let img = stageImgCache.get(logoUrl);
      if (!img) {
        img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => { stageImgCache.set(logoUrl, img); kfRenderStage(); };
        img.onerror = () => { stageImgCache.delete(logoUrl); };
        img.src = logoUrl;
      }
      if (img && img.complete && img.naturalWidth) {
        ctx.drawImage(img, -logoSize / 2, -logoSize / 2, logoSize, logoSize);
      } else {
        ctx.fillStyle = "rgba(91,141,239,0.15)";
        ctx.strokeStyle = "#5b8def";
        ctx.fillRect(-logoSize / 2, -logoSize / 2, logoSize, logoSize);
        ctx.strokeRect(-logoSize / 2, -logoSize / 2, logoSize, logoSize);
      }
    } else if (type === "image" && imageUrl) {
      let img = stageImgCache.get(imageUrl);
      if (!img) {
        img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => { stageImgCache.set(imageUrl, img); kfRenderStage(); };
        img.onerror = () => { stageImgCache.delete(imageUrl); };
        img.src = imageUrl;
      }
      if (img && img.complete && img.naturalWidth) {
        ctx.drawImage(img, -imageW / 2, -imageH / 2, imageW, imageH);
      } else {
        ctx.fillStyle = "rgba(91,141,239,0.15)";
        ctx.strokeStyle = "#5b8def";
        ctx.fillRect(-imageW / 2, -imageH / 2, imageW, imageH);
        ctx.strokeRect(-imageW / 2, -imageH / 2, imageW, imageH);
      }
    } else if (type === "rectangle") {
      const x = -rectW / 2, y = -rectH / 2, r = Math.max(0, rectR);
      ctx.fillStyle = color || "#ffffff";
      if (r <= 0) {
        ctx.fillRect(x, y, rectW, rectH);
      } else {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + rectW - r, y);
        ctx.quadraticCurveTo(x + rectW, y, x + rectW, y + r);
        ctx.lineTo(x + rectW, y + rectH - r);
        ctx.quadraticCurveTo(x + rectW, y + rectH, x + rectW - r, y + rectH);
        ctx.lineTo(x + r, y + rectH);
        ctx.quadraticCurveTo(x, y + rectH, x, y + rectH - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
      }
    } else if (type === "progressArc") {
      ctx.lineWidth = Math.max(1, arcTh);
      ctx.strokeStyle = "#5b8def";
      ctx.beginPath();
      ctx.arc(0, 0, arcR, 0, Math.PI * 2);
      ctx.stroke();
    } else if (type === "progressBar") {
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(-barW / 2, -barH / 2, barW, barH);
      ctx.fillStyle = barColor || "#00F5D4";
      if (orient === "h") {
        ctx.fillRect(-barW / 2, -barH / 2, Math.max(1, Math.floor(barW * 0.6)), barH);
      } else {
        ctx.fillRect(-barW / 2, -barH / 2, barW, Math.max(1, Math.floor(barH * 0.6)));
      }
    } else {
      // fallback proxy rect
      const rw = 200, rh = 120;
      ctx.fillStyle = "rgba(91,141,239,0.15)";
      ctx.strokeStyle = "#5b8def";
      ctx.fillRect(-rw / 2, -rh / 2, rw, rh);
      ctx.strokeRect(-rw / 2, -rh / 2, rw, rh);
    }

    ctx.restore();

    // keyframe handles
    for (let i = 0; i < kf.length; i++) {
      const p = kf[i];
      const x = w / 2 + p.x;
      const y = h / 2 + p.y;
      ctx.beginPath();
      ctx.arc(x, y, i === kfSelected ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = i === kfSelected ? "#00f5d4" : "#5b8def";
      ctx.fill();
      ctx.strokeStyle = "#0b0f14";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function kfRenderCurves() {
    if (!kfCurvesEl) return;
    const ctx = kfCurvesEl.getContext("2d");
    const w = kfCurvesEl.width, h = kfCurvesEl.height;
    ctx.clearRect(0, 0, w, h);
    // background
    ctx.fillStyle = "#0b0f14";
    ctx.fillRect(0, 0, w, h);
    // axes
    ctx.strokeStyle = "#1f2a37";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(8, h / 2);
    ctx.lineTo(w - 8, h / 2);
    ctx.stroke();

    // Sample curves
    const ease = layerAnimEaseEl.value || "linear";
    const N = Math.max(2, Math.floor(w / 3));
    const xs = new Array(N), ys = new Array(N), rs = new Array(N), ss = new Array(N);

    // Precompute ranges from keyframes to scale curves more meaningfully
    const minmax = (arr, key) => {
      let mn = Infinity, mx = -Infinity;
      for (const p of arr) { const v = p[key]; if (Number.isFinite(v)) { if (v < mn) mn = v; if (v > mx) mx = v; } }
      if (!isFinite(mn) || !isFinite(mx) || mn === mx) { mn = -1; mx = 1; }
      return [mn, mx];
    };
    const [minX, maxX] = minmax(kf, "x");
    const [minY, maxY] = minmax(kf, "y");
    const [minR, maxR] = minmax(kf, "r");
    const [minS, maxS] = minmax(kf, "s");

    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const smp = kfSample(kf, t, ease);
      xs[i] = smp.x;
      ys[i] = smp.y;
      rs[i] = smp.r;
      ss[i] = smp.s;
    }

    function drawCurve(vals, mn, mx, color) {
      const pad = 8;
      const innerW = w - pad * 2;
      const innerH = h - pad * 2;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const t = i / (N - 1);
        const x = pad + innerW * t;
        const norm = (vals[i] - mn) / Math.max(1e-6, (mx - mn)); // 0..1
        const y = pad + innerH * (1 - norm);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    drawCurve(xs, minX, maxX, "#00f5d4"); // x
    drawCurve(ys, minY, maxY, "#5b8def"); // y
    drawCurve(rs, minR, maxR, "#ffd166"); // r
    drawCurve(ss, minS, maxS, "#06d6a0"); // s

    // playhead
    const px = 8 + (w - 16) * kfTime;
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fillRect(px, 0, 1, h);
  }

  function kfRenderAll() {
    kfRenderTimeline();
    kfRenderCurves();
    kfRenderStage();
  }

  function kfStartPlay() {
    kfPlayDur = Math.max(0.1, parseFloat(layerAnimDurEl.value || "4") || 4);
    kfPlay = true;
    kfPlayStart = performance.now() - kfTime * kfPlayDur * 1000;
    requestAnimationFrame(kfTick);
  }

  function kfStopPlay() {
    kfPlay = false;
  }

  function kfTick() {
    if (!kfPlay) return;
    const now = performance.now();
    const loop = !!layerAnimLoopEl.checked;
    const elapsed = (now - kfPlayStart) / 1000;
    let t = elapsed / kfPlayDur;
    if (loop) t = t - Math.floor(t);
    t = Math.max(0, Math.min(1, t));
    kfSetTime(t);
    requestAnimationFrame(kfTick);
  }

  // Timeline interactions
  if (kfTimelineEl) {
    kfTimelineEl.addEventListener("mousedown", (e) => {
      const rect = kfTimelineEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const w = kfTimelineEl.width;
      const h = kfTimelineEl.height;
      const t = Math.max(0, Math.min(1, (x - 8) / Math.max(1, w - 16)));
      // check if near a keyframe
      const idx = kf.findIndex(p => Math.abs((8 + (w - 16) * p.t) - x) < 8);
      if (idx >= 0) {
        kfSelect(idx);
        kfDragIdx = idx;
        kfDragging = true;
      } else {
        kfSetTime(t);
      }
    });
    window.addEventListener("mousemove", (e) => {
      if (!kfDragging || kfDragIdx < 0) return;
      const rect = kfTimelineEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const w = kfTimelineEl.width;
      let t = Math.max(0, Math.min(1, (x - 8) / Math.max(1, w - 16)));
      // clamp between neighbors
      const left = kf[kfDragIdx - 1]?.t ?? 0;
      const right = kf[kfDragIdx + 1]?.t ?? 1;
      if (kfDragIdx > 0) t = Math.max(left + 0.001, t);
      if (kfDragIdx < kf.length - 1) t = Math.min(right - 0.001, t);
      kf[kfDragIdx].t = t;
      kfTime = t;
      kfSyncInputs();
      kfRenderAll();
    });
    window.addEventListener("mouseup", () => {
      if (kfDragging) {
        kfDragging = false;
        kfDragIdx = -1;
        kf.sort((a, b) => a.t - b.t);
        kfSelected = Math.max(0, kf.findIndex(p => p.t === kfTime));
        kfSyncTextarea();
        applyLayerForm();
      }
    });
    kfTimelineEl.addEventListener("dblclick", (e) => {
      const rect = kfTimelineEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const w = kfTimelineEl.width;
      const t = Math.max(0, Math.min(1, (x - 8) / Math.max(1, w - 16)));
      kfAddAt(t);
    });
    kfTimelineEl.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      if (kfSelected >= 0) kfDeleteSelected();
    });
  }

  // Stage interactions (drag selected point position)
  if (kfStageEl) {
    let stDragging = false;
    kfStageEl.addEventListener("mousedown", (e) => {
      const rect = kfStageEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // pick nearest point
      let idx = -1, best = 9999;
      for (let i = 0; i < kf.length; i++) {
        const px = kfStageEl.width / 2 + kf[i].x;
        const py = kfStageEl.height / 2 + kf[i].y;
        const d = Math.hypot(px - x, py - y);
        if (d < best && d < 14) { best = d; idx = i; }
      }
      if (idx >= 0) {
        kfSelect(idx);
      }
      stDragging = true;
    });
    window.addEventListener("mousemove", (e) => {
      if (!stDragging || kfSelected < 0) return;
      const rect = kfStageEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const relX = x - kfStageEl.width / 2;
      const relY = y - kfStageEl.height / 2;
      kf[kfSelected].x = Math.round(relX);
      kf[kfSelected].y = Math.round(relY);
      kfSyncInputs();
      kfSyncTextarea();
      kfRenderAll();
      applyLayerForm();
    });
    window.addEventListener("mouseup", () => { stDragging = false; });
  }

  // Buttons and inputs
  if (kfPlayBtn) kfPlayBtn.addEventListener("click", () => kfStartPlay());
  if (kfStopBtn) kfStopBtn.addEventListener("click", () => kfStopPlay());
  if (kfAddBtn) kfAddBtn.addEventListener("click", () => kfAddAt(kfTime));
  if (kfDeleteBtn) kfDeleteBtn.addEventListener("click", () => kfDeleteSelected());

  // Segment ease per keyframe (applies from selected KF to next)
  if (kfSegEaseEl) {
    kfSegEaseEl.addEventListener("change", () => {
      if (kfSelected < 0 || kfSelected >= kf.length - 1) return;
      const v = kfSegEaseEl.value || "inherit";
      if (v === "inherit") delete kf[kfSelected].e;
      else kf[kfSelected].e = v;
      kfSyncTextarea();
      kfRenderAll();
      applyLayerForm();
    });
  }

  // Curves canvas interactions: click to set time
  if (kfCurvesEl) {
    kfCurvesEl.addEventListener("mousedown", (e) => {
      const rect = kfCurvesEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const t = Math.max(0, Math.min(1, (x - 8) / Math.max(1, kfCurvesEl.width - 16)));
      kfSetTime(t);
    });
  }

  if (kfTEl) kfTEl.addEventListener("input", () => {
    if (kfSelected < 0) return;
    let t = Math.max(0, Math.min(1, parseFloat(kfTEl.value || "0") || 0));
    // clamp to neighbors
    const left = kf[kfSelected - 1]?.t ?? 0;
    const right = kf[kfSelected + 1]?.t ?? 1;
    if (kfSelected > 0) t = Math.max(left + 0.001, t);
    if (kfSelected < kf.length - 1) t = Math.min(right - 0.001, t);
    kf[kfSelected].t = t;
    kfTime = t;
    kf.sort((a, b) => a.t - b.t);
    kfSelected = Math.max(0, kf.findIndex(p => p.t === t));
    kfSyncTextarea();
    kfRenderAll();
    applyLayerForm();
  });

  const numUpdaters = [
    [kfXEl, "x"], [kfYEl, "y"], [kfREl, "r"], [kfSEl, "s"]
  ];
  numUpdaters.forEach(([el, key]) => {
    if (!el) return;
    el.addEventListener("input", () => {
      if (kfSelected < 0) return;
      let val = parseFloat(el.value || "0") || 0;
      if (key === "s") val = Math.max(0.01, val);
      kf[kfSelected][key] = val;
      kfSyncTextarea();
      kfRenderAll();
      applyLayerForm();
    });
  });

  // Keep GUI in sync when user edits JSON directly
  if (layerAnimKfEl) {
    layerAnimKfEl.addEventListener("input", () => {
      kfLoadFromTextarea();
      kfRenderAll();
      applyLayerForm();
    });
  }

  // Toggle editor visibility with anim type
  layerAnimTypeEl.addEventListener("change", () => {
    kfUpdateVisibility();
  });

  // Initialize visibility
  kfUpdateVisibility();

  

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
      const allowedModes = ["bars","radial","waveform","particles","waterfall","spectrogram","wavefall","circlebars","circularwave","mirrorwave","mirrorspectrum"];
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
            // sanitize keyframes if present
            let kf = [];
            if (Array.isArray(la.kf)) {
              kf = la.kf.map((p) => {
                const e = typeof p?.e === "string" ? p.e : undefined;
                return {
                  t: Math.max(0, Math.min(1, parseFloat(p?.t) || 0)),
                  x: Number.isFinite(p?.x) ? p.x : 0,
                  y: Number.isFinite(p?.y) ? p.y : 0,
                  r: Number.isFinite(p?.r) ? p.r : 0,
                  s: Number.isFinite(p?.s) ? Math.max(0.01, p.s) : 1,
                  ...(e ? { e } : {})
                };
              }).sort((a, b) => a.t - b.t);
            }
            const easeVal = typeof la.ease === "string" ? la.ease : "linear";
            const durVal = Number.isFinite(la.dur) ? Math.max(0.1, Math.min(120, la.dur)) : 4;
            const anim = {
              type: (typeof la.type === "string" ? la.type : "none"),
              speed: Number.isFinite(la.speed) ? la.speed : 0.5,
              amp: Number.isFinite(la.amp) ? la.amp : 10,
              ease: easeVal,
              dur: durVal,
              loop: !!la.loop,
              kf
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