<?php
declare(strict_types=1);

$uploadDir   = __DIR__ . '/uploads/';
$maxBytes    = 3 * 1024 * 1024;
$allowedExt  = ['jpg','jpeg','png','gif','webp'];
$allowedMime = ['image/jpeg','image/png','image/gif','image/webp'];

header('Content-Type: text/plain; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_FILES['file'])) {
    http_response_code(400);
    echo 'No file uploaded.';
    exit;
}

$f = $_FILES['file'];

if ($f['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo 'Upload error.';
    exit;
}

if ($f['size'] > $maxBytes) {
    http_response_code(400);
    echo 'File too large.';
    exit;
}

$ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
if (!in_array($ext, $allowedExt, true)) {
    http_response_code(400);
    echo 'Invalid file type.';
    exit;
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime  = $finfo->file($f['tmp_name']) ?: '';
if (!in_array($mime, $allowedMime, true)) {
    http_response_code(400);
    echo 'Invalid mime type.';
    exit;
}

if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
    http_response_code(500);
    echo 'Cannot create upload dir.';
    exit;
}
if (!is_writable($uploadDir)) {
    http_response_code(500);
    echo 'Upload dir not writable.';
    exit;
}

$filename = time() . '-' . bin2hex(random_bytes(5)) . '.' . $ext;
$target   = $uploadDir . $filename;

if (!move_uploaded_file($f['tmp_name'], $target)) {
    http_response_code(500);
    echo 'Upload failed.';
    exit;
}

echo $filename;
