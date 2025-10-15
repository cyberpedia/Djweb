<?php
header('Content-Type: application/json');

$root = dirname(__DIR__);
$templatesFile = $root . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'templates' . DIRECTORY_SEPARATOR . 'templates.json';

if (!is_file($templatesFile)) {
  echo json_encode([
    ['name' => 'Neon Bars', 'mode' => 'bars', 'fg' => '#00F5D4', 'bg' => '#0B0F14', 'scale' => 1.0],
    ['name' => 'Aurora Radial', 'mode' => 'radial', 'fg' => '#5B8DEF', 'bg' => '#0B0F14', 'scale' => 1.0],
    ['name' => 'Midnight Bars', 'mode' => 'bars', 'fg' => '#7C3AED', 'bg' => '#0D1117', 'scale' => 1.2],
  ]);
  exit;
}

$raw = @file_get_contents($templatesFile);
if ($raw === false) {
  echo json_encode([
    ['name' => 'Neon Bars', 'mode' => 'bars', 'fg' => '#00F5D4', 'bg' => '#0B0F14', 'scale' => 1.0],
    ['name' => 'Aurora Radial', 'mode' => 'radial', 'fg' => '#5B8DEF', 'bg' => '#0B0F14', 'scale' => 1.0],
  ]);
  exit;
}

$data = json_decode($raw, true);
if (!is_array($data)) {
  $data = [];
}
echo json_encode($data);