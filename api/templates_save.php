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

$allowedModes = ['bars','radial','waveform','particles','waterfall','spectrogram'];
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

  $sanitized[] = compact('name','mode','fg','bg','scale','overlayTitle','progressArc','logoUrl','logoSize','logoPosition');
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