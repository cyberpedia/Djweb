<?php
// Handle audio file upload; store under public/uploads/audio and return URL.
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Method not allowed']);
  exit;
}

if (!isset($_FILES['audio']) || $_FILES['audio']['error'] !== UPLOAD_ERR_OK) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'No file']);
  exit;
}

$root = dirname(__DIR__);
$public = $root . DIRECTORY_SEPARATOR . 'public';
$destDir = $public . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'audio';

if (!is_dir($destDir)) {
  if (!@mkdir($destDir, 0775, true) && !is_dir($destDir)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to create upload dir']);
    exit;
  }
}

$file = $_FILES['audio'];
$original = $file['name'];
$ext = strtolower(pathinfo($original, PATHINFO_EXTENSION));
$allowed = ['mp3','wav','ogg','m4a','aac','flac','opus','webm'];
if (!in_array($ext, $allowed, true)) {
  // still allow, but append .bin to prevent direct execution
  $ext = 'bin';
}
$base = preg_replace('/[^a-zA-Z0-9_\-]+/', '_', pathinfo($original, PATHINFO_FILENAME));
$unique = $base . '_' . date('Ymd_His') . '_' . substr(bin2hex(random_bytes(4)), 0, 8);
$destPath = $destDir . DIRECTORY_SEPARATOR . $unique . '.' . $ext;

if (!@move_uploaded_file($file['tmp_name'], $destPath)) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Failed to move file']);
  exit;
}

$url = '/uploads/audio/' . basename($destPath);
echo json_encode(['success' => true, 'path' => $url]);