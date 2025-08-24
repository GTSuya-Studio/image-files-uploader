class FileUploader {
    constructor() {
        this.dropzone = $('#dropzone');
        this.fileInput = $('#fileInput');
        this.previews = $('#previews');
        this.uploadedLinks = $('#uploadedLinks');
        this.linksList = $('#linksList');
        
        this.maxSize = 3 * 1024 * 1024;
        this.allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        this.allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        this.maxConcurrentUploads = 3;
        this.currentUploads = 0;
        this.uploadQueue = [];
        
        this.init();
    }
    
    init() {
        this.setupDragDrop();
        this.setupFileInput();
        this.setupButtons();
        this.setupKeyboardShortcuts();
    }
    
    setupDragDrop() {
        $(document).on('dragover dragenter', (e) => e.preventDefault());
        
        this.fileInput.on('click', (e) => e.stopPropagation());

        this.dropzone.on({
            'dragover dragenter': (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.dropzone.addClass('dragover');
            },
            'dragleave': (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!this.dropzone[0].contains(e.relatedTarget)) {
                    this.dropzone.removeClass('dragover');
                }
            },
            'drop': (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.dropzone.removeClass('dragover');
                this.handleFiles(e.originalEvent.dataTransfer.files);
            },
            'click': () => this.fileInput.click()
        });
    }
    
    setupFileInput() {
        this.fileInput.on('change', (e) => {
            this.handleFiles(e.target.files);
            this.fileInput.val('');
        });
    }
    
    setupButtons() {
        $('#showFiles').on('click', () => this.loadExistingFiles());
        $('#hideFiles').on('click', () => this.toggleUploadedSection(false));
    }
    
    setupKeyboardShortcuts() {
        $(document).on('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                this.handlePaste(e);
            }
            if (e.key === 'Escape') {
                this.clearPreviews();
            }
        });
    }
    
    async handlePaste(e) {
        const items = e.originalEvent.clipboardData?.items;
        if (!items) return;
        
        const files = [];
        for (let item of items) {
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                files.push(item.getAsFile());
            }
        }
        
        if (files.length > 0) {
            e.preventDefault();
            this.handleFiles(files);
            this.showAlert('Images pasted from clipboard!', 'success');
        }
    }
    
    handleFiles(files) {
        const validFiles = Array.from(files).filter(file => this.validateFile(file));
        
        if (validFiles.length === 0) return;
        
        if (validFiles.length > 1) {
            this.showAlert(`Processing ${validFiles.length} images...`, 'info');
        }
        
        validFiles.forEach(file => {
            const previewId = this.createPreview(file);
            this.queueUpload(file, previewId);
        });
        
        this.processUploadQueue();
    }
    
    validateFile(file) {
        const isValidMime = this.allowedTypes.includes(file.type);
        const hasValidExt = this.allowedExtensions.some(ext => 
            file.name.toLowerCase().endsWith(ext)
        );
        
        if (!isValidMime || !hasValidExt) {
            this.showAlert(`Invalid file: ${file.name}. Only images allowed.`, 'error');
            return false;
        }
        
        if (file.size > this.maxSize) {
            this.showAlert(`Image too large: ${file.name} (max ${this.formatFileSize(this.maxSize)})`, 'error');
            return false;
        }
        
        if (file.size === 0) {
            this.showAlert(`Empty file: ${file.name}`, 'error');
            return false;
        }
        
        return true;
    }
    
    createPreview(file) {
        const id = `preview-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = $(`
                <div class="preview" id="${id}">
                    <img src="${e.target.result}" alt="Preview" loading="lazy">
                    <div class="filename" title="${file.name}">${this.truncateFilename(file.name)}</div>
                    <div class="filesize">${this.formatFileSize(file.size)}</div>
                    <div class="progress">
                        <div class="progress-bar"></div>
                        <span class="progress-text">Queued</span>
                    </div>
                    <button class="remove" onclick="uploader.removePreview('${id}')" title="Remove">×</button>
                </div>
            `);
            this.previews.append(preview);
        };
        
        reader.onerror = () => {
            this.showAlert(`Failed to read image: ${file.name}`, 'error');
        };
        
        reader.readAsDataURL(file);
        return id;
    }
    
    queueUpload(file, previewId) {
        this.uploadQueue.push({ file, previewId });
    }
    
    processUploadQueue() {
        while (this.currentUploads < this.maxConcurrentUploads && this.uploadQueue.length > 0) {
            const { file, previewId } = this.uploadQueue.shift();
            this.uploadFile(file, previewId);
        }
    }
    
    uploadFile(file, previewId) {
        this.currentUploads++;
        this.updateProgressText(previewId, 'Uploading...');
        
        const formData = new FormData();
        formData.append('file', file);
        
        const startTime = Date.now();
        
        $.ajax({
            url: 'upload.php',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            timeout: 30000,
            xhr: () => {
                const xhr = new XMLHttpRequest();
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const percent = Math.round((e.loaded / e.total) * 100);
                        const speed = this.calculateUploadSpeed(e.loaded, startTime);
                        $(`#${previewId} .progress-bar`).css('width', `${percent}%`);
                        this.updateProgressText(previewId, `${percent}% (${speed})`);
                    }
                };
                return xhr;
            },
            success: (response) => {
                const filename = response.trim();
                this.updateProgressText(previewId, 'Completed!');
                this.addToUploadedList(filename, true);
                this.toggleUploadedSection(true);
                
                setTimeout(() => this.removePreview(previewId), 3000);
            },
            error: (xhr) => {
                const errorMsg = xhr.status === 413 ? 'Image too large' : 
                               xhr.status === 0 ? 'Upload timeout' :
                               xhr.responseText || 'Upload failed';
                this.showAlert(`Upload failed: ${file.name} - ${errorMsg}`, 'error');
                this.updateProgressText(previewId, 'Failed');
                $(`#${previewId}`).addClass('error');
            },
            complete: () => {
                this.currentUploads--;
                this.processUploadQueue();
            }
        });
    }
    
    calculateUploadSpeed(loaded, startTime) {
        const elapsed = (Date.now() - startTime) / 1000;
        const speed = loaded / elapsed;
        return this.formatFileSize(speed) + '/s';
    }
    
    updateProgressText(previewId, text) {
        $(`#${previewId} .progress-text`).text(text);
    }
    
    removePreview(id) {
        $(`#${id}`).fadeOut(300, function() { $(this).remove(); });
    }
    
    clearPreviews() {
        this.previews.children().fadeOut(300, function() { $(this).remove(); });
        this.uploadQueue = [];
    }
    
    addToUploadedList(filename, prepend = false) {
        const url = this.normalizeUrl(filename);
        const item = $(`
            <li data-filename="${filename}">
                <img src="${url}" alt="preview" loading="lazy" onerror="this.style.display='none'">
                <input type="text" readonly value="${url}" onclick="this.select()">
                <div class="btn-group">
                    <button class="copy" onclick="uploader.copyToClipboard('${url}', this)" title="Copy URL">Copy</button>
                    <button class="delete" onclick="uploader.deleteFile('${filename}', this)" title="Delete file">Delete</button>
                </div>
            </li>
        `);
        
        if (this.linksList.find(`[data-filename="${filename}"]`).length === 0) {
            prepend ? this.linksList.prepend(item) : this.linksList.append(item);
        }
    }
    
    async copyToClipboard(text, btn) {
        try {
            await navigator.clipboard.writeText(text);
            const original = btn.textContent;
            btn.textContent = 'Copied!';
            btn.style.background = '#4caf50';
            setTimeout(() => {
                btn.textContent = original;
                btn.style.background = '';
            }, 2000);
        } catch {
            this.fallbackCopyToClipboard(text);
            this.showAlert('URL copied (fallback method)', 'success');
        }
    }
    
    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
    
    deleteFile(filename, btn) {
        if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;
        
        $(btn).prop('disabled', true).text('Deleting...');
        
        $.post('delete.php', { file: filename })
            .done(() => {
                $(btn).closest('li').fadeOut(300, function() { $(this).remove(); });
                this.showAlert('Image deleted successfully', 'success');
            })
            .fail(() => {
                this.showAlert('Delete failed', 'error');
                $(btn).prop('disabled', false).text('Delete');
            });
    }
    
    loadExistingFiles() {
        $('#showFiles').prop('disabled', true).text('Loading...');
        
        $.getJSON('list_files.php')
            .done((files) => {
                this.linksList.empty();
                if (files.length === 0) {
                    this.linksList.append('<li class="no-files">No images found</li>');
                } else {
                    files.sort((a, b) => parseInt(b) - parseInt(a))
                         .forEach(file => this.addToUploadedList(file));
                }
                this.toggleUploadedSection(true);
                this.showAlert(`Loaded ${files.length} images`, 'success');
            })
            .fail(() => this.showAlert('Cannot load existing images', 'error'))
            .always(() => {
                $('#showFiles').prop('disabled', false).text('Show Existing Images');
            });
    }
    
    toggleUploadedSection(show) {
        this.uploadedLinks.toggle(show);
        $('#hideFiles').toggleClass('hidden', !show);
        $('#showFiles').toggleClass('hidden', show);
    }
    
    normalizeUrl(filename) {
        if (!filename) return '';
        if (/^https?:\/\//i.test(filename)) return filename;
        return `${window.location.href.replace(/\/[^\/]*$/, '/uploads/')}${encodeURIComponent(filename)}`;
    }
    
    showAlert(message, type = 'error') {
        const alertClass = `alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'}`;
        const alert = $(`<div class="alert ${alertClass}">${message}</div>`);
        $('.container').prepend(alert);
        setTimeout(() => alert.fadeOut(300, () => alert.remove()), 4000);
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    truncateFilename(filename, maxLength = 20) {
        if (filename.length <= maxLength) return filename;
        const ext = filename.split('.').pop();
        const name = filename.slice(0, filename.lastIndexOf('.'));
        const truncated = name.slice(0, maxLength - ext.length - 4) + '...';
        return truncated + '.' + ext;
    }
}

$(document).ready(() => {
    window.uploader = new FileUploader();
});
