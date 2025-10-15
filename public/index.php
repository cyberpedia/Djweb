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
        <canvas id="vizCanvas" width="1280" height="720"></canvas>

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
          </select>
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
        </div>
        <div class="export-buttons">
          <button id="startRecBtn">Start Recording</button>
          <button id="stopRecBtn" disabled>Stop Recording</button>
        </div>
        <div id="exportStatus" class="status"></div>
      </div>
    </section>
  </main>

  <audio id="audio" crossorigin="anonymous"></audio>

  <script src="/assets/js/equalizer.js"></script>
  <script src="/assets/js/visualizer.js"></script>
  <script src="/assets/js/player.js"></script>
</body>
</html>