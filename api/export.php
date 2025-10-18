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

  // Sanitize transcoding params
  $crf = isset($_POST['crf']) ? intval($_POST['crf']) : 18;
  if ($crf < 0) $crf = 18;
  // Typical sensible range for libx264 CRF
  $crf = max(10, min(40, $crf));

  $ab = isset($_POST['abitrate']) ? intval($_POST['abitrate']) : 192;
  $ab = max(64, min(320, $ab));
  $abArg = $ab . 'k';

  $preset = isset($_POST['preset']) ? strtolower(trim($_POST['preset'])) : 'veryfast';
  $allowedPresets = ['ultrafast','superfast','veryfast','faster','fast','medium','slow'];
  if (!in_array($preset, $allowedPresets, true)) $preset = 'veryfast';

  $loudnormMode = isset($_POST['loudnorm']) ? strtolower(trim($_POST['loudnorm'])) : 'off';

  $audioFilter = '';
  if ($loudnormMode === 'single') {
    $audioFilter = ' -filter:a loudnorm=I=-14:LRA=11:TP=-2 ';
  } elseif ($loudnormMode === 'two') {
    // Two-pass loudnorm: analyze first
    $probeCmd = 'ffmpeg -y -i ' . escapeshellarg($webmPath) . ' -af loudnorm=I=-14:LRA=11:TP=-2:print_format=json -f null - 2>&1';
    $statsJson = '';
    if (function_exists('shell_exec')) {
      $out = @shell_exec($probeCmd);
      if ($out) {
        // Attempt to extract JSON object from output
        if (preg_match('/\\{\\s*\"input_i\"[\\s\\S]*?\\}/', $out, $m)) {
          $statsJson = $m[0];
        }
      }
    } elseif (function_exists('exec')) {
      $outArr = [];
      @exec($probeCmd, $outArr);
      $out = implode(\"\\n\", $outArr);
      if ($out) {
        if (preg_match('/\\{\\s*\"input_i\"[\\s\\S]*?\\}/', $out, $m)) {
          $statsJson = $m[0];
        }
      }
    }
    if ($statsJson) {
      $stats = json_decode($statsJson, true);
      if (is_array($stats)) {
        $measured_I = isset($stats['input_i']) ? $stats['input_i'] : null;
        $measured_LRA = isset($stats['input_lra']) ? $stats['input_lra'] : null;
        $measured_TP = isset($stats['input_tp']) ? $stats['input_tp'] : null;
        $measured_thresh = isset($stats['input_thresh']) ? $stats['input_thresh'] : null;
        $offset = isset($stats['target_offset']) ? $stats['target_offset'] : null;
        if ($measured_I !== null && $measured_LRA !== null && $measured_TP !== null && $measured_thresh !== null && $offset !== null) {
          $audioFilter = ' -filter:a ' . escapeshellarg(
            sprintf('loudnorm=I=-14:LRA=11:TP=-2:measured_I=%s:measured_LRA=%s:measured_TP=%s:measured_thresh=%s:offset=%s:linear=true:print_format=summary',
              $measured_I, $measured_LRA, $measured_TP, $measured_thresh, $offset
            )
          ) . ' ';
        } else {
          // Fallback to single-pass
          $audioFilter = ' -filter:a loudnorm=I=-14:LRA=11:TP=-2 ';
        }
      } else {
        $audioFilter = ' -filter:a loudnorm=I=-14:LRA=11:TP=-2 ';
      }
    } else {
      $audioFilter = ' -filter:a loudnorm=I=-14:LRA=11:TP=-2 ';
    }
  }

  // Transcode with H.264 + AAC using provided params
  $cmd = 'ffmpeg -y -i ' . escapeshellarg($webmPath)
    . ' -c:v libx264 -preset ' . escapeshellarg($preset) . ' -crf ' . escapeshellarg((string)$crf)
    . ' -c:a aac ' . $audioFilter . '-b:a ' . escapeshellarg($abArg) . ' '
    . escapeshellarg($mp4Path);

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