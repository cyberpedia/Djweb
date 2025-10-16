<?php
// Basic index file serving the Avee Web UI.
?><!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Avee Web – PHP</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="/assets/css/style.css" rel="stylesheet">
</head>
<body>
  <header class="app-header">
    <div class="brand">
      <span class="brand-accent"></span> Avee Web
    </div>
    <div class="actions">
      <label class="file-btn">
        <input type="file" id="fileInput" accept="audio/*" multiple>
        Add Audio
      </label>
      <button id="uploadToggle" class="secondary">Upload to server: Off</button>
    </div>
  </header>

  <main class="layout">
    <section class="left-panel">
      <div class="player-card">
        <div class="now-playing">
          <div class="artwork" id="artwork"></div>
          <div class="meta">
            <div class="title" id="trackTitle">No track</div>
            <div class="artist" id="trackArtist"></div>
            <div class="artist" id="trackLoudness"></div>
          </div>
        </div>

        <div class="transport">
          <button id="prevBtn" title="Previous">⏮</button>
          <button id="playPauseBtn" title="Play/Pause">▶</button>
          <button id="nextBtn" title="Next">⏭</button>
        </div>

        <div class="seek-row">
          <span id="currentTime">0:00</span>
          <input type="range" id="seekBar" min="0" max="1000" value="0" step="1">
          <span id="duration">0:00</span>
        </div>

        <div class="vol-row">
          <span>Vol</span>
          <input type="range" id="volume" min="0" max="1" value="1" step="0.01">
        </div>

        <div class="seek-row">
          <span>Crossfade</span>
          <input type="number" id="crossfade" value="2" min="0" max="10" step="0.1">
          <span>sec</span>
        </div>

        <div class="seek-row">
          <span>Normalize</span>
          <select id="loudnessMode">
            <option value="off">Off</option>
            <option value="rms" selected>RMS</option>
            <option value="lufs">LUFS (approx)</option>
          </select>
          <span></span>
        </div>
      </div>

      <div class="playlist-card">
        <div class="card-title">Playlist</div>
        <ul id="playlist"></ul>
      </div>

      <div class="eq-card">
        <div class="card-title">Equalizer</div>
        <div class="eq-grid" id="eqGrid">
          <!-- Sliders injected by equalizer.js -->
        </div>
        <div class="eq-presets">
          <label>Preset</label>
          <select id="eqPreset">
            <option value="flat">Flat</option>
            <option value="pop">Pop</option>
            <option value="rock">Rock</option>
            <option value="jazz">Jazz</option>
            <option value="bass">Bass Boost</option>
            <option value="treble">Treble Boost</option>
          </select>
        </div>
      </div>
    </section>

    <section class="right-panel">
      <div class="viz-card">
        <div class="card-title">Visualizer</div>
        <div class="viz-wrap">
          <canvas id="vizCanvas" width="1280" height="720"></canvas>
          <canvas id="vizGuides" class="guides" width="1280" height="720"></canvas>
        </div>

        <div class="viz-controls">
          <label>Template</label>
          <select id="vizTemplate"></select>

          <label>Foreground</label>
          <input type="color" id="fgColor" value="#00F5D4">

          <label>Background</label>
          <input type="color" id="bgColor" value="#0B0F14">

          <label>Mode</label>
          <select id="vizMode">
            <option value="bars">Bars</option>
            <option value="radial">Radial</option>
            <option value="waveform">Waveform</option>
            <option value="particles">Particles</option>
            <option value="waterfall">Waterfall</option>
            <option value="spectrogram">Spectrogram</option>
            <option value="wavefall">Wavefall</option>
            <option value="circlebars">Circle Bars</option>
            <option value="circularwave">Circular Wave</option>
            <option value="mirrorwave">Mirror Wave</option>
            <option value="mirrorspectrum">Mirror Spectrum</option>
          </select>


          <label>Resolution</label>
          <select id="resolution">
            <option value="1280x720">720p (1280x720)</option>
            <option value="1920x1080">1080p (1920x1080)</option>
            <option value="3840x2160">4K (3840x2160)</option>
          </select>

          <label>Show Title</label>
          <input type="checkbox" id="showTitle" checked>

          <label>Progress Arc</label>
          <input type="checkbox" id="progressArc" checked>

          <label>Logo URL</label>
          <input type="text" id="logoUrl" placeholder="/assets/logo.png">

          <label>Logo Size</label>
          <input type="number" id="logoSize" value="64" min="16" max="512">

          <label>Logo Position</label>
          <select id="logoPosition">
            <option value="top-left">Top-left</option>
            <option value="top-right">Top-right</option>
            <option value="bottom-left">Bottom-left</option>
            <option value="bottom-right">Bottom-right</option>
          </select>

          <label>Text Overlay</label>
          <input type="text" id="textOverlayText" placeholder="Now Playing">

          <label>Text Size</label>
          <input type="number" id="textOverlaySize" value="24" min="12" max="128">

          <label>Text Position</label>
          <select id="textOverlayPosition">
            <option value="bottom-left">Bottom-left</option>
            <option value="bottom-right">Bottom-right</option>
            <option value="top-left">Top-left</option>
            <option value="top-right">Top-right</option>
          </select>

          <label>Color Map</label>
          <select id="colorMap">
            <option value="gradient" selected>Gradient (FG→BG)</option>
            <option value="inferno">Inferno</option>
            <option value="magma">Magma</option>
            <option value="viridis">Viridis</option>
            <option value="turbo">Turbo</option>
            <option value="custom">Custom (by template)</option>
          </select>

          <label>Particle Trails</label>
          <input type="checkbox" id="particleTrails" checked>

          <label>Particle Links</label>
          <input type="checkbox" id="particleLinks">

          <label>Wave Peaks</label>
          <input type="checkbox" id="wavePeaks">

          <label>Safe Area Guides</label>
          <input type="checkbox" id="safeGuides">

          <button id="editTemplatesBtn" class="secondary">Edit Templates</button>
        </div>
      </div>

      <div class="export-card">
        <div class="card-title">Export</div>
        <div class="export-controls">
          <label>Framerate</label>
          <input type="number" id="frameRate" value="60" min="1" max="60">

          <label>Duration (sec)</label>
          <input type="number" id="recordDuration" value="15" min="1" max="900">

          <label>Convert to MP4 (server)</label>
          <input type="checkbox" id="convertMp4" checked>

          <label>CRF</label>
          <input type="number" id="crf" value="18" min="10" max="40" step="1">

          <label>Audio bitrate (kbps)</label>
          <input type="number" id="audioBitrate" value="192" min="64" max="320" step="1">

          <label>FFmpeg preset</label>
          <select id="ffPreset">
            <option value="ultrafast">ultrafast</option>
            <option value="superfast">superfast</option>
            <option value="veryfast" selected>veryfast</option>
            <option value="faster">faster</option>
            <option value="fast">fast</option>
            <option value="medium">medium</option>
            <option value="slow">slow</option>
          </select>

          <label>Export preset</label>
          <select id="exportPreset">
            <option value="high">High (CRF 16, 256 kbps, fast)</option>
            <option value="medium" selected>Medium (CRF 20, 192 kbps, veryfast)</option>
            <option value="low">Low (CRF 28, 128 kbps, superfast)</option>
          </select>

          <label>Platform</label>
          <select id="platformProfile">
            <option value="youtube">YouTube 1080p (1920x1080, 60fps)</option>
            <option value="instagram">Instagram Portrait (1080x1350, 30fps)</option>
            <option value="tiktok">TikTok Portrait (1080x1920, 30fps)</option>
          </select>

          <label>Apply Platform Preset</label>
          <input type="checkbox" id="applyPlatformPreset" checked>

          <label>Normalize on export</label>
          <select id="exportLoudnorm">
            <option value="off" selected>Off</option>
            <option value="single">Single-pass (LUFS -14)</option>
            <option value="two">Two-pass (LUFS -14)</option>
          </select>
        </div>
        <div class="export-buttons">
          <button id="startRecBtn">Start Recording</button>
          <button id="stopRecBtn" disabled>Stop Recording</button>
        </div>
        <div id="exportStatus" class="status"></div>
      </div>
    </section>
  </main>

  <audio id="audioA" crossorigin="anonymous"></audio>
  <audio id="audioB" crossorigin="anonymous"></audio>

  <div id="tplModal" class="modal hidden">
    <div class="dialog">
      <div class="header">
        <div>Template Editor</div>
        <button id="tplCloseBtn" class="secondary">Close</button>
      </div>
      <div class="body">
        <div class="tpl-sidebar">
          <div class="tpl-actions">
            <button id="tplNewBtn">New</button>
            <button id="tplDeleteBtn" class="secondary">Delete</button>
            <button id="tplExportBtn" class="secondary">Export JSON</button>
            <button id="tplShareBtn" class="secondary">Share Link</button>
            <label class="file-btn">
              <input type="file" id="tplImportInput" accept="application/json">
              Import JSON
            </label>
          </div>
          <ul id="tplList"></ul>
        </div>
        <div class="tpl-form">
          <label>Name</label>
          <input type="text" id="tplName" placeholder="Template name">

          <label>Mode</label>
          <select id="tplMode">
            <option value="bars">Bars</option>
            <option value="radial">Radial</option>
            <option value="waveform">Waveform</option>
            <option value="particles">Particles</option>
            <option value="waterfall">Waterfall</option>
            <option value="spectrogram">Spectrogram</option>
            <option value="wavefall">Wavefall</option>
            <option value="circlebars">Circle Bars</option>
            <option value="circularwave">Circular Wave</option>
            <option value="mirrorwave">Mirror Wave</option>
            <option value="mirrorspectrum">Mirror Spectrum</option>
          </select>

          <label>Foreground</label>
          <input type="color" id="tplFg" value="#00F5D4">

          <label>Background</label>
          <input type="color" id="tplBg" value="#0B0F14">

          <label>Scale</label>
          <input type="number" id="tplScale" value="1.0" step="0.1" min="0.1" max="5">

          <label>Color Map</label>
          <select id="tplColorMap">
            <option value="gradient" selected>Gradient (FG→BG)</option>
            <option value="inferno">Inferno</option>
            <option value="magma">Magma</option>
            <option value="viridis">Viridis</option>
            <option value="turbo">Turbo</option>
            <option value="custom">Custom</option>
          </select>

          <div class="colormap-stops">
            <div class="card-title">Color Stops (0–1)</div>
            <div class="stops-actions">
              <button id="tplColorStopAdd">Add Stop</button>
            </div>
            <ul id="tplColorStopsList"></ul>
          </div>

          <label><input type="checkbox" id="tplOverlayTitle" checked> Show Title</label>
          <label><input type="checkbox" id="tplProgressArc" checked> Progress Arc</label>
          <label><input type="checkbox" id="tplParticleTrails" checked> Particle Trails</label>
          <label><input type="checkbox" id="tplParticleLinks"> Particle Links</label>

          <label>Logo URL</label>
          <input type="text" id="tplLogoUrl" placeholder="/assets/logo.png">

          <label>Logo Size</label>
          <input type="number" id="tplLogoSize" value="64" min="16" max="512">

          <label>Logo Position</label>
          <select id="tplLogoPosition">
            <option value="top-left">Top-left</option>
            <option value="top-right">Top-right</option>
            <option value="bottom-left">Bottom-left</option>
            <option value="bottom-right">Bottom-right</option>
          </select>

          <label>Text Overlay</label>
          <input type="text" id="tplTextOverlayText" placeholder="Now Playing">
          <label>Text Size</label>
          <input type="number" id="tplTextOverlaySize" value="24" min="12" max="128">
          <label>Text Position</label>
          <select id="tplTextOverlayPosition">
            <option value="bottom-left">Bottom-left</option>
            <option value="bottom-right">Bottom-right</option>
            <option value="top-left">Top-left</option>
            <option value="top-right">Top-right</option>
          </select>

          <div class="layers-section">
            <div class="card-title">Layers</div>
            <div class="layers-actions">
              <button id="layerAddText">Add Text</button>
              <button id="layerAddLogo">Add Logo</button>
              <button id="layerAddImage">Add Image</button>
              <button id="layerAddProgress">Add Progress Arc</button>
              <button id="layerAddRect">Add Rectangle</button>
              <button id="layerAddBar">Add Progress Bar</button>
              <button id="layerUp" class="secondary">Up</button>
              <button id="layerDown" class="secondary">Down</button>
              <button id="layerRemove" class="secondary">Remove</button>
            </div>
            <ul id="tplLayersList"></ul>

            <div class="layer-form">
              <label>Type</label>
              <input type="text" id="layerType" disabled>

              <label>Opacity</label>
              <input type="number" id="layerOpacity" value="1.0" min="0" max="1" step="0.05">

              <label>Blend</label>
              <select id="layerBlend">
                <option value="normal" selected>Normal</option>
                <option value="screen">Screen</option>
                <option value="multiply">Multiply</option>
                <option value="overlay">Overlay</option>
                <option value="add">Add</option>
              </select>

              <div class="layer-anim-fields">
                <label>Animation</label>
                <select id="layerAnimType">
                  <option value="none" selected>None</option>
                  <option value="float">Float</option>
                  <option value="spin">Spin</option>
                  <option value="pulse">Pulse</option>
                  <option value="keyframes">Keyframes</option>
                </select>
                <label>Speed (Hz)</label>
                <input type="number" id="layerAnimSpeed" value="0.5" min="0" max="10" step="0.1">
                <label>Amount</label>
                <input type="number" id="layerAnimAmp" value="10" min="0" max="360" step="1">
                <label>Easing</label>
                <select id="layerAnimEase">
                  <option value="linear" selected>Linear</option>
                  <option value="easeIn">Ease In</option>
                  <option value="easeOut">Ease Out</option>
                  <option value="easeInOut">Ease In Out</option>
                </select>
                <label>Duration (s)</label>
                <input type="number" id="layerAnimDur" value="4" min="0.1" max="120" step="0.1">
                <label>Loop</label>
                <input type="checkbox" id="layerAnimLoop" checked>
                <label>Keyframes (JSON)</label>
                <textarea id="layerAnimKf" placeholder='[{"t":0,"x":0,"y":0,"r":0,"s":1},{"t":1,"x":20,"y":-10,"r":45,"s":1.1}]'></textarea>

                <div id="kfEditor" class="kf-editor hidden">
                  <div class="kf-toolbar">
                    <button id="kfPlayBtn">Play</button>
                    <button id="kfStopBtn" class="secondary">Stop</button>
                    <button id="kfAddBtn">Add Keyframe</button>
                    <button id="kfDeleteBtn" class="secondary">Delete Keyframe</button>
                    <span id="kfTimeLabel" class="muted">t=0.00</span>
                  </div>

                  <canvas id="kfTimeline" width="720" height="60"></canvas>

                  <div class="kf-fields">
                    <label>t</label><input type="number" id="kfT" min="0" max="1" step="0.01" value="0">
                    <label>x</label><input type="number" id="kfX" step="1" value="0">
                    <label>y</label><input type="number" id="kfY" step="1" value="0">
                    <label>r</label><input type="number" id="kfR" step="1" value="0">
                    <label>s</label><input type="number" id="kfS" step="0.01" value="1">
                  </div>

                  <canvas id="kfStage" width="720" height="220"></canvas>
                </div>
              </div>

              <div class="layer-text-fields">
                <label>Text</label>
                <input type="text" id="layerText" placeholder="Sample text">
                <label>Size</label>
                <input type="number" id="layerSize" value="24" min="12" max="128">
              </div>

              <div class="layer-logo-fields">
                <label>Logo URL</label>
                <input type="text" id="layerLogoUrl" placeholder="/assets/logo.png">
                <label>Size</label>
                <input type="number" id="layerLogoSize" value="64" min="16" max="512">
              </div>

              <div class="layer-image-fields">
                <label>Image URL</label>
                <input type="text" id="layerImageUrl" placeholder="/assets/image.png">
                <label>Width</label>
                <input type="number" id="layerImageWidth" value="256" min="1" max="4096">
                <label>Height</label>
                <input type="number" id="layerImageHeight" value="256" min="1" max="4096">
                <label>Tint</label>
                <input type="color" id="layerImageTint" value="#ffffff">
                <label>Tint Alpha</label>
                <input type="number" id="layerImageAlpha" value="0" min="0" max="1" step="0.05">
              </div>

              <div class="layer-progress-fields">
                <label>Radius</label>
                <input type="number" id="layerRadius" value="26" min="6" max="256">
                <label>Thickness</label>
                <input type="number" id="layerThickness" value="6" min="1" max="64">
              </div>

              <div class="layer-rect-fields">
                <label>Width</label>
                <input type="number" id="layerRectWidth" value="200" min="1" max="4096">
                <label>Height</label>
                <input type="number" id="layerRectHeight" value="100" min="1" max="4096">
                <label>Corner Radius</label>
                <input type="number" id="layerRectRadius" value="12" min="0" max="1024">
                <label>Color</label>
                <input type="color" id="layerRectColor" value="#ffffff">
              </div>

              <div class="layer-bar-fields">
                <label>Width</label>
                <input type="number" id="layerBarWidth" value="400" min="1" max="4096">
                <label>Height</label>
                <input type="number" id="layerBarHeight" value="20" min="1" max="4096">
                <label>Color</label>
                <input type="color" id="layerBarColor" value="#00F5D4">
                <label>Orientation</label>
                <select id="layerBarOrient">
                  <option value="h" selected>Horizontal</option>
                  <option value="v">Vertical</option>
                </select>
              </div>

              <label>Position</label>
              <select id="layerPosition">
                <option value="top-left">Top-left</option>
                <option value="top-right">Top-right</option>
                <option value="bottom-left">Bottom-left</option>
                <option value="bottom-right">Bottom-right</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div class="footer">
        <button id="tplSaveBtn">Save</button>
        <div id="tplStatus" class="status"></div>
      </div>
    </div>
  </div>

  <script src="/assets/js/equalizer.js"></script>
  <script src="/assets/js/visualizer.js"></script>
  <script src="/assets/js/player.js"></script>
  <script src="/assets/js/templates.js"></script>
</body>
</html>