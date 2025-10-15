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
  const tplImportInput = document.getElementById("tplImportInput");

  const vizTemplateEl = document.getElementById("vizTemplate");

  let templates = [];
  let selectedIdx = -1;

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
  }

  function readForm() {
    return {
      name: tplNameEl.value.trim() || "Untitled",
      mode: tplModeEl.value,
      fg: tplFgEl.value,
      bg: tplBgEl.value,
      scale: parseFloat(tplScaleEl.value || "1.0")
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
    templates[selectedIdx] = readForm();
    await saveTemplatesToServer();
  });

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

  tplImportInput.addEventListener("change", async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try {
      const text = await f.text();
      const arr = JSON.parse(text);
      if (!Array.isArray(arr)) throw new Error("Invalid JSON");
      // Basic validation and sanitize
      const allowedModes = ["bars","radial","waveform","particles","waterfall"];
      templates = arr.map((tpl) => {
        const name = typeof tpl.name === "string" ? tpl.name : "Untitled";
        const mode = allowedModes.includes(tpl.mode) ? tpl.mode : "bars";
        const fg = typeof tpl.fg === "string" ? tpl.fg : "#00F5D4";
        const bg = typeof tpl.bg === "string" ? tpl.bg : "#0B0F14";
        const scale = Number.isFinite(tpl.scale) ? tpl.scale : 1.0;
        return { name, mode, fg, bg, scale };
      });
      selectedIdx = templates.length ? 0 : -1;
      renderList();
      if (templates.length) selectIndex(0);
      await saveTemplatesToServer();
      tplStatusEl.textContent = "Imported.";
      // reset input
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