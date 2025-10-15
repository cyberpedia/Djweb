<?php
header('Content-Type: application/json');

$root = dirname(__DIR__);
$dir = $root . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'shares';
if (!is_dir($dir)) {
  @mkdir($dir, 0775, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $id = isset($_GET['id']) ? preg_replace('/[^a-zA-Z0-9_-]/', '', $_GET['id']) : '';
  if ($id === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing id']);
    exit;
  }
  $file = $dir . DIRECTORY_SEPARATOR . $id . '.json';
  if (!is_file($file)) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Not found']);
    exit;
  }
  $raw = @file_get_contents($file);
  $data = json_decode($raw, true);
  if (!is_array($data)) $data = [];
  echo json_encode(['success' => true, 'templates' => $data]);
  exit;
}

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

$id = bin2hex(random_bytes(6));
$file = $dir . DIRECTORY_SEPARATOR . $id . '.json';
$ok = @file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
if ($ok === false) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Failed to save share']);
  exit;
}

echo json_encode(['success' => true, 'id' => $id, 'url' => '/api/templates_share.php?id=' . $id]);