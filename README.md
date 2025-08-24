# Image Uploader

A simple and lightweight web application for uploading and managing image files via a modern, drag-and-drop interface.
Purpose and Features

This project provides a straightforward, user-friendly solution for uploading images to a server. Its core value lies in its simplicity and efficiency, making it ideal for personal use, small projects, or as a component in a larger application.

### Key features include:

    * Drag-and-Drop Interface: Effortlessly upload images by dragging them into the designated drop zone.
    * Live Previews & Progress: View a thumbnail preview of each image with a real-time progress bar during upload.
    * Concurrent Uploads: The application efficiently handles multiple file uploads at the same time.
    * Clipboard Paste: Paste images directly from your clipboard, perfect for screenshots.
    * Image Management: After uploading, you can see a list of your files, copy their direct URLs to the clipboard, and delete them from the server.
    * Server-Side Validation: The backend PHP scripts ensure file safety by validating file type and size.

### Technologies Used

    * Frontend: HTML5, CSS3, JavaScript (using JQuery)
    * Backend: PHP
    * Styling: Custom CSS and basic Bootstrap for a clean, responsive design.

# Installation

To get this project running, you will need a web server with PHP support (like Apache with PHP).

### Clone the Repository:

  *git clone https://github.com/your-username/your-repository.git*
  *cd your-repository*

  (Remember to replace your-username/your-repository with your actual repository path).

### Move Files:
  Place all the project files and folders into your web server's document root (e.g., htdocs, www, or public_html). Create the uploads directory: The PHP scripts are configured to save files in an uploads folder. Create this directory in the root of your project:

  *mkdir uploads*

### Set Directory Permissions:
  It's crucial to give your web server write permissions to the uploads directory. On Linux/macOS, you can use chmod. Note: Be cautious with permissions, especially on production servers.

  *chmod 775 uploads*

# Usage

  Launch the Application: Open your web browser and navigate to the project's URL (e.g., http://localhost/your-project-folder/).

  ### Upload Images:

      * Drag & Drop: Drag images from your computer directly into the "Drag & Drop your image files here" area.
      * Click: Click anywhere inside the drop zone to open your file selection dialog.
      * Paste: Use the Ctrl+V (or Cmd+V on Mac) keyboard shortcut to paste a copied image.

  ### Manage Files:

      * Click the "Show Existing Images" button to see a list of all images currently on the server.
      * For each image in the list, you can use the "Copy" button to copy its URL or the "Delete" button to remove it.
