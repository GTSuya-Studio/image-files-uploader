<?php
declare(strict_types=1);

$uploadDir  = __DIR__ . '/uploads/';
$allowedExt = ['jpg','jpeg','png','gif','webp'];

header('Content-Type: text/plain; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_POST['file'])) {
    http_response_code(400);
    echo 'No file specified.';
    exit;
}

$file = basename((string)$_POST['file']);
$ext  = strtolower(pathinfo($file, PATHINFO_EXTENSION));
if (!in_array($ext, $allowedExt, true)) {
    http_response_code(400);
    echo 'Invalid file.';
    exit;
}

$path        = $uploadDir . $file;
$realUpload  = realpath($uploadDir);
$realTarget  = realpath($path);

if ($realUpload === false || $realTarget === false || strpos($realTarget, $realUpload) !== 0 || !is_file($realTarget)) {
    http_response_code(404);
    echo 'File not found.';
    exit;
}

if (@unlink($realTarget)) {
    echo 'Deleted';
} else {
    http_response_code(500);
    echo 'Delete failed.';
}
