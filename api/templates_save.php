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

$allowedModes = ['bars','radial','waveform','particles','waterfall','spectrogram','wavefall','circlebars','mirrorwave'];
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
  $validPos = ['top-left','top-right','bottom-left','bottom-right'];
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
      if ($offset < 0) $offset = 0.0; if ($offset > 1) $offset = 1.0;
      $color = isset($s['color']) ? trim($s['color']) : '#ffffff';
      if (!preg_match('/^#([A-Fa-f0-9]{6})$/', $color)) $color = '#ffffff';
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
      if ($opacity < 0) $opacity = 0.0; if ($opacity > 1) $opacity = 1.0;
      $blend = isset($layer['blend']) ? trim($layer['blend']) : 'normal';
      $validBlend = ['normal','screen','multiply','overlay','add'];
      if (!in_array($blend, $validBlend, true)) $blend = 'normal';

      if ($type === 'text') {
        $text = isset($layer['text']) ? trim($layer['text']) : '';
        $size = isset($layer['size']) ? intval($layer['size']) : 24;
        $layers[] = ['type' => 'text', 'text' => $text, 'size' => $size, 'position' => $pos, 'opacity' => $opacity, 'blend' => $blend];
      } elseif ($type === 'logo') {
        $url = isset($layer['url']) ? trim($layer['url']) : '';
        $size = isset($layer['size']) ? intval($layer['size']) : 64;
        $layers[] = ['type' => 'logo', 'url' => $url, 'size' => $size, 'position' => $pos, 'opacity' => $opacity, 'blend' => $blend];
      } elseif ($type === 'image') {
        $url = isset($layer['url']) ? trim($layer['url']) : '';
        $width = isset($layer['width']) ? intval($layer['width']) : 256;
        $height = isset($layer['height']) ? intval($layer['height']) : 256;
        $tint = isset($layer['tint']) ? trim($layer['tint']) : '#ffffff';
        if (!preg_match('/^#([A-Fa-f0-9]{6})$/', $tint)) $tint = '#ffffff';
        $alpha = isset($layer['alpha']) ? floatval($layer['alpha']) : 0.0;
        if ($alpha < 0) $alpha = 0.0; if ($alpha > 1) $alpha = 1.0;
        $layers[] = ['type' => 'image', 'url' => $url, 'width' => $width, 'height' => $height, 'tint' => $tint, 'alpha' => $alpha, 'position' => $pos, 'opacity' => $opacity, 'blend' => $blend];
      } elseif ($type === 'progressArc') {
        $radius = isset($layer['radius']) ? intval($layer['radius']) : 26;
        $thickness = isset($layer['thickness']) ? intval($layer['thickness']) : 6;
        $layers[] = ['type' => 'progressArc', 'radius' => $radius, 'thickness' => $thickness, 'position' => $pos, 'opacity' => $opacity, 'blend' => $blend];
      } elseif ($type === 'rectangle') {
        $width = isset($layer['width']) ? intval($layer['width']) : 200;
        $height = isset($layer['height']) ? intval($layer['height']) : 100;
        $radius = isset($layer['radius']) ? intval($layer['radius']) : 12;
        $color = isset($layer['color']) ? trim($layer['color']) : '#ffffff';
        if (!preg_match('/^#([A-Fa-f0-9]{6})$/', $color)) $color = '#ffffff';
        $layers[] = ['type' => 'rectangle', 'width' => $width, 'height' => $height, 'radius' => $radius, 'color' => $color, 'position' => $pos, 'opacity' => $opacity, 'blend' => $blend];
      } elseif ($type === 'progressBar') {
        $width = isset($layer['width']) ? intval($layer['width']) : 400;
        $height = isset($layer['height']) ? intval($layer['height']) : 20;
        $color = isset($layer['color']) ? trim($layer['color']) : '#00F5D4';
        if (!preg_match('/^#([A-Fa-f0-9]{6})$/', $color)) $color = '#00F5D4';
        $orient = isset($layer['orient']) ? trim($layer['orient']) : 'h';
        if (!in_array($orient, ['h','v'], true)) $orient = 'h';
        $layers[] = ['type' => 'progressBar', 'width' => $width, 'height' => $height, 'color' => $color, 'orient' => $orient, 'position' => $pos, 'opacity' => $opacity, 'blend' => $blend];
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