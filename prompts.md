# Project Prompts (Inspiration: AveePlayer Pro)

These prompts focus only on features and the inspiration app. Copy/paste any prompt to bootstrap a new project.

---

## Master Project Prompt

Build a visual music player inspired by AveePlayer Pro. Include:

- Audio playback
  - Playlists (add/remove/reorder), play/pause/prev/next, autoplay next
  - Dual-source crossfade (adjustable seconds), gapless transitions, master volume
  - Loudness normalization modes: Off, RMS, approximate LUFS; smooth gain ramping

- Equalizer
  - 10-band graphic EQ with presets (Flat, Rock, Pop, Jazz, Classical)
  - Per-track EQ memory and instant application

- Visualizers (beat-reactive)
  - Bars (with peak-hold markers)
  - Radial
  - Waveform (optional peak markers)
  - Particles (with trails and links)
  - Waterfall (vertical spectrogram)
  - Spectrogram (time color-mapped)
  - Wavefall (time-domain waterfall)
  - Circle Bars (radial bars around center)
  - Circular Wave (radial waveform line)
  - Mirror Wave (top/bottom mirrored waveforms)
  - Mirror Spectrum (mirrored spectrum bars)
  - Consistent color map support across modes

- Color maps
  - Built-in: gradient, inferno, magma, viridis, turbo
  - Custom multi-stop colormap editor (offset 0–1, hex colors)

- Overlays
  - Title overlay (track name)
  - Progress arc (configurable radius/thickness)
  - Progress bar (horizontal/vertical)
  - Logo overlay (URL, size, position)
  - Image layers (URL, width/height, optional tint, alpha)
  - Rectangle layers (width/height, corner radius)
  - Text overlay (content, size, position)

- Layers system
  - Ordered overlay stack
  - Per-layer opacity and blend modes (normal, screen, multiply, overlay, add)

- Animations
  - Per-layer animation types: none, float, spin, pulse
  - Keyframe-driven transforms: x/y/r (rotation)/s (scale) with duration and loop

- Keyframe Editor GUI
  - Timeline with markers: add/remove, multi-selection (Ctrl/Cmd/Shift)
  - Group drag with neighbor constraints; delete/nudge selected
  - Per-segment easing overrides: linear, ease-in, ease-out, ease-in-out, step (hold), bezier
  - Custom cubic-bezier editor: draggable handles and preset buttons
  - Snap-to-grid (configurable divisions) and anchor snapping (0/0.25/0.5/0.75/1)
  - Parameter curves view (x/y/r/s) with show/hide toggles
  - Live layer preview on stage canvas

- Templates
  - List/load/edit/save; import/export as JSON
  - Share via generated links; robust validation of template fields

- Recording & export
  - Capture visualizer + audio to a video file
  - Optional conversion to MP4
  - Export presets (High/Medium/Low) and manual controls (quality, audio bitrate, speed preset)
  - Platform profiles (YouTube/Instagram/TikTok) with resolution and frame rate presets
  - Loudness normalization on export: off, single-pass, and two-pass
  - Safe-area guides overlay (preview-only) excluded from recordings

- Composition aids
  - Resolution presets (e.g., 720p, 1080p, 4K)
  - Platform safe-area guides for composition preview

- UX
  - Modern, responsive interface with clear controls and consistent styling
  - Efficient, smooth visual performance

---

## Feature Prompts (Focused)

- Audio playback and transitions
  - Prompt: Implement a dual-source playback system supporting adjustable crossfade, gapless scheduling, master volume, and loudness normalization (Off/RMS/approx LUFS). Ensure smooth ramps without pops and seamless transitions across tracks.

- Equalizer
  - Prompt: Implement a 10-band EQ with presets and per-track memory. Changes should respond instantly and persist for the track.

- Visualizer modes
  - Prompt: Implement modular visualizers: bars, radial, waveform, particles (trails/links), waterfall, spectrogram, wavefall, circle bars, circular wave, mirror wave, mirror spectrum. All modes should be beat-reactive; bars include peak-hold; waveform supports optional peak markers. Provide color map selection and apply custom colormaps consistently.

- Overlays and layers
  - Prompt: Implement overlays for title, progress arc and bar, logo, images with tint/alpha, rectangles with corner radius, and text. Compose them via an ordered layers stack with per-layer opacity and blend modes.

- Animations and Keyframe Editor
  - Prompt: Implement per-layer animations (none, float, spin, pulse) and keyframes for x/y/r/s with duration and loop. Build a GUI editor with timeline markers, multi-selection, group drag constrained by neighbors, delete/nudge, per-segment easing (including step/hold and custom cubic-bezier with draggable handles and presets), snap-to-grid and anchors, parameter curves view, and live layer previews.

- Templates management
  - Prompt: Implement a templates manager: list, load, edit, save, import/export, and share via links. Validate all fields and keep templates backward compatible when adding new options.

- Recording and export
  - Prompt: Implement recording of visualizer plus audio to a video file and optional conversion to MP4. Add export presets (High/Medium/Low) and manual controls (quality, audio bitrate, speed preset). Include platform profiles (YouTube/Instagram/TikTok) that set resolution and frame rate, optional loudness normalization (off/single-pass/two-pass), and exclude safe-area guides from recordings.

- Platform profiles and composition guides
  - Prompt: Implement platform presets (resolution and frame rate) and an optional safe-area guides overlay visible in the UI but not included in recordings.

- Color maps and editor
  - Prompt: Provide predefined color maps (gradient, inferno, magma, viridis, turbo) and a custom multi-stop editor (offsets 0–1, hex colors). Apply these to waterfall, spectrogram, wavefall, and any spectrum-based modes.

---

## Future/Backlog Feature Prompts

- Audio
  - Prompt: Add accurate loudness measurement (BS.1770/EBU R128) with per-track LUFS and LRA display; normalize-on-play and normalize-on-export with peak limits.
  - Prompt: Implement BPM/tempo detection and beat-grid overlays; support ReplayGain metadata.

- Visualizers
  - Prompt: Add advanced effects (circular waveform fills, mirrored spectrum peak-hold variants, spectrum waterfall with advanced palettes, dynamic particles with collisions, 3D or depth effects, adjustable persistence/trails).
  - Prompt: Provide GPU/WebGL variants for performance and a fallback path when unavailable.

- Overlays and layers
  - Prompt: Add more shapes (rounded stroke), masks, image cropping, text styles (fonts and gradients), per-layer opacity curves, per-layer timing offsets, motion paths with control points.

- Timeline composer
  - Prompt: Implement a scene composer to sequence multiple visualizer scenes, overlays, and animations with cue points (intro/outro), fades, and transitions. Export multi-scene videos.

- Templates and sharing
  - Prompt: Add user accounts and cloud sync for playlists and templates, short shareable links, QR generation, and collaborative template editing.

- Export and presets
  - Prompt: Provide platform-specific export profiles (bitrate, normalization target, safe areas), watermark overlays, and batch exports.

- Performance and UX
  - Prompt: Optimize analysis and rendering for stable high FPS, add preview thumbnails for templates, and provide theme support (light/dark), localization, and accessibility improvements.

---