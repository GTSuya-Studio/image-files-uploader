<?php
declare(strict_types=1);

$uploadDir  = __DIR__ . '/uploads/';
$allowedExt = ['jpg','jpeg','png','gif','webp'];

$items = [];

if (is_dir($uploadDir)) {
    foreach (scandir($uploadDir, SCANDIR_SORT_DESCENDING) as $file) {
        if ($file === '.' || $file === '..') continue;
        $path = $uploadDir . $file;
        if (!is_file($path)) continue;
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        if (!in_array($ext, $allowedExt, true)) continue;
        $items[] = $file;
    }
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($items);
