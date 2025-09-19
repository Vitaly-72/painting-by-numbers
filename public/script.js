class PaintingGenerator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('fileInput');
        this.processBtn = document.getElementById('processBtn');
        this.resultsSection = document.getElementById('resultsSection');
        this.loading = document.getElementById('loading');
        this.originalImage = document.getElementById('originalImage');
        this.processedImage = document.getElementById('processedImage');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.newImageBtn = document.getElementById('newImageBtn');
        
        this.uploadedFile = null;
    }

    bindEvents() {
        // Drag and drop
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.style.background = '#f0f0f0';
        });

        this.dropZone.addEventListener('dragleave', () => {
            this.dropZone.style.background = '';
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.style.background = '';
            this.handleFiles(e.dataTransfer.files);
        });

        this.dropZone.addEventListener('click', () => {
            this.fileInput.click();
        });

        this.fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        this.processBtn.addEventListener('click', () => {
            this.processImage();
        });

        this.newImageBtn.addEventListener('click', () => {
            this.resetUI();
        });
    }

    handleFiles(files) {
        if (files.length === 0) return;

        const file = files[0];
        if (!file.type.startsWith('image/')) {
            alert('Пожалуйста, выберите файл изображения');
            return;
        }

        this.uploadedFile = file;
        this.processBtn.disabled = false;

        // Показать превью
        const reader = new FileReader();
        reader.onload = (e) => {
            this.originalImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    async processImage() {
        if (!this.uploadedFile) return;

        this.showLoading(true);
        
        try {
            const formData = new FormData();
            formData.append('image', this.uploadedFile);
            formData.append('colorCount', document.getElementById('colorCount').value);

            // Измените URL запроса:
const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
});

            if (!response.ok) {
                throw new Error('Ошибка сервера');
            }

            const result = await response.json();
            
            if (result.success) {
                this.processedImage.src = result.processedImage;
                this.downloadBtn.href = result.downloadUrl;
                this.resultsSection.style.display = 'block';
            }

        } catch (error) {
            console.error('Error:', error);
            alert('Ошибка обработки: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    showLoading(show) {
        this.loading.style.display = show ? 'block' : 'none';
        this.processBtn.disabled = show;
    }

    resetUI() {
        this.uploadedFile = null;
        this.processBtn.disabled = true;
        this.resultsSection.style.display = 'none';
        this.originalImage.src = '';
        this.processedImage.src = '';
        this.fileInput.value = '';
    }
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new PaintingGenerator();
});