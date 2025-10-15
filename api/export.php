<?php
// Receive WebM visualizer recording; store under public/uploads/exports.
// Optionally convert to MP4 if FFmpeg is available and requested.
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Method not allowed']);
  exit;
}

if (!isset($_FILES['video']) || $_FILES['video']['error'] !== UPLOAD_ERR_OK) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'No video']);
  exit;
}

$convert = isset($_POST['convert']) ? strtolower(trim($_POST['convert'])) : '';
$root = dirname(__DIR__);
$public = $root . DIRECTORY_SEPARATOR . 'public';
$destDir = $public . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'exports';

if (!is_dir($destDir)) {
  if (!@mkdir($destDir, 0775, true) && !is_dir($destDir)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to create exports dir']);
    exit;
  }
}

$file = $_FILES['video'];
$base = 'visualizer_' . date('Ymd_His') . '_' . substr(bin2hex(random_bytes(4)), 0, 8);
$webmPath = $destDir . DIRECTORY_SEPARATOR . $base . '.webm';

if (!@move_uploaded_file($file['tmp_name'], $webmPath)) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Failed to save video']);
  exit;
}

$response = [
  'success' => true,
  'webm' => '/uploads/exports/' . basename($webmPath),
];

function hasFfmpeg(): bool {
  // Try multiple methods; may be disabled by server config
  $paths = [];
  if (function_exists('shell_exec')) {
    $out = @shell_exec('command -v ffmpeg');
    if ($out) return true;
  }
  if (function_exists('exec')) {
    @exec('ffmpeg -version', $out, $code);
    if ($code === 0) return true;
  }
  return false;
}

if ($convert === 'mp4' && hasFfmpeg()) {
  $mp4Path = $destDir . DIRECTORY_SEPARATOR . $base . '.mp4';
  // Transcode with H.264 + AAC
  $cmd = 'ffmpeg -y -i ' . escapeshellarg($webmPath) . ' -c:v libx264 -preset veryfast -crf 18 -c:a aac -b:a 192k ' . escapeshellarg($mp4Path);
  $code = 1;
  if (function_exists('shell_exec')) {
    @shell_exec($cmd);
    $code = file_exists($mp4Path) ? 0 : 1;
  } elseif (function_exists('exec')) {
    @exec($cmd, $out, $code);
  }
  if ($code === 0 && file_exists($mp4Path)) {
    $response['mp4'] = '/uploads/exports/' . basename($mp4Path);
  } else {
    $response['ffmpeg'] = 'conversion failed or ffmpeg unavailable';
  }
} else {
  $response['ffmpeg'] = 'not requested or unavailable';
}

echo json_encode($response);