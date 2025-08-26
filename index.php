<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Image Files Uploader</title>
  <link href="assets/css/bootstrap.min.css" rel="stylesheet">
  <link href="assets/css/style.css" rel="stylesheet">
</head>
<body>
<div class="container mt-4">
    <h2 class="text-center mb-4">Image Files Uploader</h2>

    <div class="dropzone" id="dropzone">
        <h3>Drag & Drop your image files here</h3>
        <p>Or click to select images</p>
        <input type="file" id="fileInput" multiple accept="image/*" hidden>
    </div>

    <div id="previews" class="previews"></div>

    <div id="uploadedLinks" class="uploaded-section">
        <h5>Uploaded Image URLs</h5>
        <ul id="linksList"></ul>
    </div>

    <div class="mt-4">
        <button id="showFiles" class="btn">Show Existing Images</button>
        <button id="hideFiles" class="btn hidden">Hide Images</button>
    </div>
</div>

<script src="assets/js/jquery-3.4.1.min.js"></script>
<script src="assets/js/script.js"></script>
</body>
</html>
