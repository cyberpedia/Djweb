<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Method not allowed']);
  exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
  exit;
}

$allowedModes = ['bars','radial','waveform','particles','waterfall','spectrogram','wavefall','circlebars','circularwave','mirrorwave','mirrorspectrum'];
$validPos = ['top-left','top-right','bottom-left','bottom-right'];
$validBlend = ['normal','screen','multiply','overlay','add'];
$validEase = ['linear','easeIn','easeOut','easeInOut','bezier'];
$validAnim = ['none','float','spin','pulse','keyframes'];

$sanitizeColor = function ($hex, $fallback = '#ffffff') {
  $hex = is_string($hex) ? trim($hex) : '';
  return preg_match('/^#([A-Fa-f0-9]{6})$/', $hex) ? $hex : $fallback;
};

$sanitized = [];
foreach ($data as $tpl) {
  if (!is_array($tpl)) continue;

  $name = isset($tpl['name']) ? trim($tpl['name']) : 'Untitled';
  $mode = in_array($tpl['mode'] ?? 'bars', $allowedModes, true) ? $tpl['mode'] : 'bars';
  $fg = isset($tpl['fg']) ? trim($tpl['fg']) : '#00F5D4';
  $bg = isset($tpl['bg']) ? trim($tpl['bg']) : '#0B0F14';
  $scale = isset($tpl['scale']) ? floatval($tpl['scale']) : 1.0;

  $overlayTitle = !empty($tpl['overlayTitle']);
  $progressArc = !empty($tpl['progressArc']);
  $logoUrl = isset($tpl['logoUrl']) ? trim($tpl['logoUrl']) : '';
  $logoSize = isset($tpl['logoSize']) ? intval($tpl['logoSize']) : 64;
  $logoPosition = in_array($tpl['logoPosition'] ?? 'top-left', $validPos, true) ? $tpl['logoPosition'] : 'top-left';

  $colorMap = isset($tpl['colorMap']) ? trim($tpl['colorMap']) : 'gradient';
  $particleTrails = !empty($tpl['particleTrails']);
  $particleLinks = !empty($tpl['particleLinks']);

  $textOverlay = null;
  if (isset($tpl['textOverlay']) && is_array($tpl['textOverlay'])) {
    $to = $tpl['textOverlay'];
    $text = isset($to['text']) ? trim($to['text']) : '';
    $size = isset($to['size']) ? intval($to['size']) : 24;
    $pos = isset($to['position']) ? trim($to['position']) : 'bottom-left';
    $textOverlay = ['text' => $text, 'size' => $size, 'position' => $pos];
  }

  // Color stops
  $colorStops = [];
  if (isset($tpl['colorStops']) && is_array($tpl['colorStops'])) {
    foreach ($tpl['colorStops'] as $s) {
      if (!is_array($s)) continue;
      $offset = isset($s['offset']) ? floatval($s['offset']) : 0.0;
      if ($offset < 0) $offset = 0.0;
      if ($offset > 1) $offset = 1.0;
      $color = $sanitizeColor($s['color'] ?? '#ffffff', '#ffffff');
      $colorStops[] = ['offset' => $offset, 'color' => $color];
    }
    usort($colorStops, function ($a, $b) { return $a['offset'] <=> $b['offset']; });
  }

  // Layers
  $layers = [];
  if (isset($tpl['layers']) && is_array($tpl['layers'])) {
    foreach ($tpl['layers'] as $layer) {
      if (!is_array($layer)) continue;
      $type = isset($layer['type']) ? trim($layer['type']) : '';
      $pos = isset($layer['position']) ? trim($layer['position']) : 'top-left';
      if (!in_array($pos, $validPos, true)) $pos = 'top-left';
      $opacity = isset($layer['opacity']) ? floatval($layer['opacity']) : 1.0;
      if ($opacity < 0) $opacity = 0.0;
      if ($opacity > 1) $opacity = 1.0;
      $blend = isset($layer['blend']) ? trim($layer['blend']) : 'normal';
      if (!in_array($blend, $validBlend, true)) $blend = 'normal';

      // Animation
      $anim = null;
      if (isset($layer['anim']) && is_array($layer['anim'])) {
        $at = isset($layer['anim']['type']) ? trim($layer['anim']['type']) : 'none';
        if (!in_array($at, $validAnim, true)) $at = 'none';
        $as = isset($layer['anim']['speed']) ? floatval($layer['anim']['speed']) : 0.5;
        if ($as < 0) $as = 0.0; if ($as > 10) $as = 10.0;
        $aa = isset($layer['anim']['amp']) ? floatval($layer['anim']['amp']) : 10.0;
        if ($aa < 0) $aa = 0.0; if ($aa > 360) $aa = 360.0;
        $ease = isset($layer['anim']['ease']) ? trim($layer['anim']['ease']) : 'linear';
        if (!in_array($ease, $validEase, true)) $ease = 'linear';
        $dur = isset($layer['anim']['dur']) ? floatval($layer['anim']['dur']) : 4.0;
        if ($dur < 0.1) $dur = 0.1; if ($dur > 120) $dur = 120.0;
        $loop = !empty($layer['anim']['loop']);

        $kf = [];
        if (isset($layer['anim']['kf']) && is_array($layer['anim']['kf'])) {
          foreach ($layer['anim']['kf'] as $p) {
            if (!is_array($p)) continue;
            $t = isset($p['t']) ? floatval($p['t']) : 0.0;
            if ($t < 0) $t = 0.0; if ($t > 1) $t = 1.0;
            $x = isset($p['x']) ? floatval($p['x']) : 0.0;
            $y = isset($p['y']) ? floatval($p['y']) : 0.0;
            $r = isset($p['r']) ? floatval($p['r']) : 0.0;
            $s = isset($p['s']) ? floatval($p['s']) : 1.0;
            if ($s < 0.01) $s = 0.01; if ($s > 10) $s = 10.0;
            $e = isset($p['e']) ? trim($p['e']) : '';
            $segEase = in_array($e, $validEase, true) ? $e : null;
            $entry = ['t' => $t, 'x' => $x, 'y' => $y, 'r' => $r, 's' => $s];
            if ($segEase) {
              $entry['e'] = $segEase;
              if ($segEase === 'bezier' && isset($p['b']) && is_array($p['b']) && count($p['b']) === 4) {
                $bx1 = max(0.0, min(1.0, floatval($p['b'][0])));
                $by1 = max(0.0, min(1.0, floatval($p['b'][1])));
                $bx2 = max(0.0, min(1.0, floatval($p['b'][2])));
                $by2 = max(0.0, min(1.0, floatval($p['b'][3])));
                $entry['b'] = [$bx1, $by1, $bx2, $by2];
              }
            }
            $kf[] = $entry;
          }
          usort($kf, function ($a, $b) { return $a['t'] <=> $b['t']; });
        }

        $anim = ['type' => $at, 'speed' => $as, 'amp' => $aa, 'ease' => $ease, 'dur' => $dur, 'loop' => $loop, 'kf' => $kf];
      }

      if ($type === 'text') {
        $text = isset($layer['text']) ? trim($layer['text']) : '';
        $size = isset($layer['size']) ? intval($layer['size']) : 24;
        $layers[] = ['type' => 'text', 'text' => $text, 'size' => $size, 'position' => $pos, 'opacity' => $opacity, 'blend' => $blend, 'anim' => $anim];
      } elseif ($type === 'logo') {
        $url = isset($layer['url']) ? trim($layer['url']) : '';
        $size = isset($layer['size']) ? intval($layer['size']) : 64;
        $layers[] = ['type' => 'logo', 'url' => $url, 'size' => $size, 'position' => $pos, 'opacity' => $opacity, 'blend' => $blend, 'anim' => $anim];
      } elseif ($type === 'image') {
        $url = isset($layer['url']) ? trim($layer['url']) : '';
        $width = isset($layer['width']) ? intval($layer['width']) : 256;
        $height = isset($layer['height']) ? intval($layer['height']) : 256;
        $tint = $sanitizeColor($layer['tint'] ?? '#ffffff', '#ffffff');
        $alpha = isset($layer['alpha']) ? floatval($layer['alpha']) : 0.0;
        if ($alpha < 0) $alpha = 0.0; if ($alpha > 1) $alpha = 1.0;
        $layers[] = ['type' => 'image', 'url' => $url, 'width' => $width, 'height' => $height, 'tint' => $tint, 'alpha' => $alpha, 'position' => $pos, 'opacity' => $opacity, 'blend' => $blend, 'anim' => $anim];
      } elseif ($type === 'progressArc') {
        $radius = isset($layer['radius']) ? intval($layer['radius']) : 26;
        $thickness = isset($layer['thickness']) ? intval($layer['thickness']) : 6;
        $layers[] = ['type' => 'progressArc', 'radius' => $radius, 'thickness' => $thickness, 'position' => $pos, 'opacity' => $opacity, 'blend' => $blend, 'anim' => $anim];
      } elseif ($type === 'rectangle') {
        $width = isset($layer['width']) ? intval($layer['width']) : 200;
        $height = isset($layer['height']) ? intval($layer['height']) : 100;
        $radius = isset($layer['radius']) ? intval($layer['radius']) : 12;
        $color = $sanitizeColor($layer['color'] ?? '#ffffff', '#ffffff');
        $layers[] = ['type' => 'rectangle', 'width' => $width, 'height' => $height, 'radius' => $radius, 'color' => $color, 'position' => $pos, 'opacity' => $opacity, 'blend' => $blend, 'anim' => $anim];
      } elseif ($type === 'progressBar') {
        $width = isset($layer['width']) ? intval($layer['width']) : 400;
        $height = isset($layer['height']) ? intval($layer['height']) : 20;
        $color = $sanitizeColor($layer['color'] ?? '#00F5D4', '#00F5D4');
        $orient = isset($layer['orient']) ? trim($layer['orient']) : 'h';
        if ($orient !== 'v') $orient = 'h';
        $layers[] = ['type' => 'progressBar', 'width' => $width, 'height' => $height, 'color' => $color, 'orient' => $orient, 'position' => $pos, 'opacity' => $opacity, 'blend' => $blend, 'anim' => $anim];
      }
    }
  }

  $sanitized[] = [
    'name' => $name,
    'mode' => $mode,
    'fg' => $fg,
    'bg' => $bg,
    'scale' => $scale,
    'colorMap' => $colorMap,
    'colorStops' => $colorStops,
    'overlayTitle' => $overlayTitle,
    'progressArc' => $progressArc,
    'particleTrails' => $particleTrails,
    'particleLinks' => $particleLinks,
    'logoUrl' => $logoUrl,
    'logoSize' => $logoSize,
    'logoPosition' => $logoPosition,
    'textOverlay' => $textOverlay,
    'layers' => $layers
  ];
}

$root = dirname(__DIR__);
$dir = $root . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'templates';
$file = $dir . DIRECTORY_SEPARATOR . 'templates.json';

if (!is_dir($dir)) {
  if (!@mkdir($dir, 0775, true) && !is_dir($dir)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to prepare storage']);
    exit;
  }
}

$ok = @file_put_contents($file, json_encode($sanitized, JSON_PRETTY_PRINT));
if ($ok === false) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Failed to write templates']);
  exit;
}

echo json_encode(['success' => true, 'count' => count($sanitized)]);