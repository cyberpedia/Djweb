/**
 * Equalizer: 10-band biquad peaking filters.
 * Provides:
 *  - createEqualizer(audioCtx)
 *  - applyPreset(filters, name)
 *  - mountEqUI(containerEl, filters)
 */

const EQ_BANDS = [
  { freq: 31 },
  { freq: 62 },
  { freq: 125 },
  { freq: 250 },
  { freq: 500 },
  { freq: 1000 },
  { freq: 2000 },
  { freq: 4000 },
  { freq: 8000 },
  { freq: 16000 }
];

function createEqualizer(audioCtx) {
  const filters = EQ_BANDS.map(({ freq }) => {
    const f = audioCtx.createBiquadFilter();
    f.type = "peaking";
    f.frequency.value = freq;
    f.gain.value = 0;
    f.Q.value = 1;
    return f;
  });
  // chain filters in series
  for (let i = 0; i < filters.length - 1; i++) {
    filters[i].connect(filters[i + 1]);
  }
  return filters;
}

function applyPreset(filters, name) {
  // gains in dB for 10 bands
  const presets = {
    flat: [0,0,0,0,0,0,0,0,0,0],
    pop:  [-1,2,4,5,3,0,-1,-1,-1,-1],
    rock: [4,3,2,0,-1,0,2,3,3,4],
    jazz: [0,3,2,1,0,1,2,3,4,3],
    bass: [6,5,4,2,0,-2,-3,-4,-5,-6],
    treble: [-5,-4,-3,-2,-1,1,3,5,6,7]
  };
  const gains = presets[name] || presets.flat;
  filters.forEach((f, i) => f.gain.value = gains[i]);
}

function mountEqUI(containerEl, filters) {
  containerEl.innerHTML = "";
  EQ_BANDS.forEach((b, idx) => {
    const wrapper = document.createElement("div");
    wrapper.className = "eq-slider";
    const label = document.createElement("label");
    label.textContent = b.freq >= 1000 ? (b.freq / 1000) + "k" : b.freq.toString();
    const input = document.createElement("input");
    input.type = "range";
    input.min = -12;
    input.max = 12;
    input.step = 0.5;
    input.value = filters[idx].gain.value;
    input.addEventListener("input", () => {
      filters[idx].gain.value = parseFloat(input.value);
    });
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    containerEl.appendChild(wrapper);
  });
}

// export to global for player.js
window.AveeEq = { createEqualizer, applyPreset, mountEqUI, EQ_BANDS };