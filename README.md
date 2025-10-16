Avee Web (PHP) – Visual Music Player

Overview
A lightweight web app that brings core AveePlayer Pro features to the browser with a PHP backend and a modern JavaScript front-end. It supports:
- Audio playback with playlists
- 10-band equalizer
- Live visualizers (bars, radial, waveform, circular wave, mirror wave, mirror spectrum, circle bars, particles, waterfall, spectrogram, wavefall)
- Beat-reactive animation (bars include peak-hold; waveform peak markers option; particle trails and links)
- Overlays: title, progress arc, logo (position/size), text overlay; multi-layer overlay system in Template Editor (layer opacity + blend modes; rectangle with corner radius, image with tint, progress arc thickness, and progress bar layers; per-layer animations: none, float, spin, pulse with speed/amount; keyframes with duration, loop, and easing)
- Crossfade playback and gapless scheduling
- Loudness normalization (RMS and LUFS-approx) with optional server-side loudnorm at export (Off, Single-pass, Two-pass)
- Visualizer templates (JSON) + in-app Template Editor (GUI), import/export, share link; custom colormaps (color stops)
- Resolution presets (720p/1080p/4K) and platform profiles (YouTube/Instagram/TikTok) with optional safe area guides overlay (preview only)
- Recording/exporting visualizer + audio to WebM (client-side) with optional server MP4 transcoding using FFmpeg
- Export presets (High/Medium/Low) and manual CRF/bitrate/preset control; platform-aware presets (YouTube
Stack
- PHP 8+ (no framework required)
- Vanilla JavaScript (Web Audio API, Canvas)
- Optional: FFmpeg installed on server for MP4 conversion

Project Structure
- public/
  - index.php           Main UI
  - assets/css/style.css
  - assets/js/player.js
  - assets/js/equalizer.js
  - assets/js/visualizer.js
  - assets/js/templates.js
- api/
  - upload.php            Audio file uploads
  - export.php            Receive WebM and optionally convert to MP4
  - templates.php         Serve visualizer templates
  - templates_save.php    Save visualizer templates (JSON)
  - templates_share.php   Share templates (JSON) and retrieve by id
- storage/
  - audio/                Uploaded audio files
  - exports/              Exported videos
  - templates/templates.json
  - shares/               Shared templates JSON by id

Getting Started
1) Requirements
- PHP 8+ (with file_uploads enabled)
- Optional: FFmpeg on PATH for MP4 transcoding (export.php checks availability)

2) Run locally
- Start PHP’s built-in server:
  php -S localhost:8000 -t public
- Visit http://localhost:8000

3) Usage
- Add tracks by dropping files or using the “Add Audio” button.
- Create a playlist and play tracks.
- Adjust the equalizer sliders.
- Choose a visualizer template.
- Record visualizer:
  - Press “Start Recording” while audio is playing.
  - Press “Stop Recording” to finalize.
  - The client uploads the WebM to the server.
  - If FFmpeg is available, the server can convert to MP4.

4) MP4 Conversion (optional)
- Ensure FFmpeg is installed and accessible by PHP (exec enabled).
- export.php will detect FFmpeg and perform conversion when requested.

5) Notes
- Browser support: Modern Chromium/Firefox/Safari. MediaRecorder + captureStream required for recording.
- Cross-origin audio is restricted. Upload local files or ensure CORS is enabled on remote sources.
- Templates are simple JSON; extend them as you like.

Roadmap
- More visualizer modes (waveform, particles, spectrum waterfall)
- Template editor (GUI)
- User accounts and cloud storage integration
- Advanced audio features: crossfade, gapless, replaygain

License
MIT