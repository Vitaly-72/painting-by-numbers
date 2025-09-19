const { v4: uuidv4 } = require('uuid');

class CloudStorage {
    constructor() {
        // Для Vercel используем временное хранение в base64
        // В production можно подключить S3, Cloudinary и т.д.
        this.storage = new Map(); // In-memory storage для демо
    }

    async uploadFile(buffer, filename, options = {}) {
        try {
            const fileId = uuidv4();
            const extension = this.getFileExtension(filename);
            const key = `${fileId}.${extension}`;
            
            // Конвертируем buffer в base64 для простоты
            const base64Data = buffer.toString('base64');
            const dataUrl = `data:image/png;base64,${base64Data}`;

            // Сохраняем в памяти (для демо)
            this.storage.set(key, {
                data: dataUrl,
                filename: filename,
                uploadedAt: new Date(),
                size: buffer.length
            });

            return {
                success: true,
                url: dataUrl,
                key: key,
                filename: filename
            };

        } catch (error) {
            console.error('Upload error:', error);
            throw new Error('Failed to upload file: ' + error.message);
        }
    }

    async getFile(key) {
        const file = this.storage.get(key);
        if (!file) {
            throw new Error('File not found');
        }
        return file;
    }

    async deleteFile(key) {
        try {
            const deleted = this.storage.delete(key);
            return {
                success: deleted,
                message: deleted ? 'File deleted' : 'File not found'
            };
        } catch (error) {
            console.error('Delete error:', error);
            throw new Error('Failed to delete file');
        }
    }

    async listFiles() {
        return Array.from(this.storage.entries()).map(([key, file]) => ({
            key,
            filename: file.filename,
            uploadedAt: file.uploadedAt,
            size: file.size
        }));
    }

    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }

    isValidImageFormat(extension) {
        const validFormats = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
        return validFormats.includes(extension.toLowerCase());
    }

    // Методы для интеграции с реальными cloud storage (опционально)
    async uploadToS3(buffer, filename) {
        // Реализация для AWS S3
        console.log('Would upload to S3:', filename);
        return { url: 's3://bucket/' + filename };
    }

    async uploadToCloudinary(buffer, filename) {
        // Реализация для Cloudinary
        console.log('Would upload to Cloudinary:', filename);
        return { url: 'https://res.cloudinary.com/...' };
    }
}

// Singleton instance
const cloudStorage = new CloudStorage();

module.exports = cloudStorage;
