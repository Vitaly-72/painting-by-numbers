const express = require('express');
const multer = require('multer');
const ImageProcessor = require('./utils/imageProcessor');
const cloudStorage = require('./utils/cloudStorage');

const app = express();

// Middleware
app.use(express.json());

// Конфигурация multer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const extension = file.originalname.split('.').pop().toLowerCase();
        if (cloudStorage.isValidImageFormat(extension)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file format. Only images are allowed.'), false);
        }
    }
});

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed. Use POST.' 
        });
    }

    try {
        // Обработка загрузки файла
        upload.single('image')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    error: err.message
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'No image file provided'
                });
            }

            try {
                // Валидация изображения
                const validation = await ImageProcessor.validateImage(req.file.buffer);
                if (!validation.isValid) {
                    return res.status(400).json({
                        success: false,
                        error: validation.error
                    });
                }

                // Параметры обработки
                const options = {
                    colorCount: parseInt(req.body.colorCount) || 12,
                    filterType: req.body.filterType || 'contour',
                    brightness: parseFloat(req.body.brightness) || 1.0,
                    contrast: parseFloat(req.body.contrast) || 1.0,
                    edgeIntensity: parseFloat(req.body.edgeIntensity) || 1.0
                };

                // Обработка изображения
                const processedBuffer = await ImageProcessor.processImage(
                    req.file.buffer, 
                    options
                );

                // Сохранение в cloud storage
                const uploadResult = await cloudStorage.uploadFile(
                    processedBuffer,
                    `painting-${Date.now()}.png`,
                    { contentType: 'image/png' }
                );

                // Ответ клиенту
                res.json({
                    success: true,
                    processedImage: uploadResult.url,
                    downloadUrl: uploadResult.url,
                    filename: uploadResult.filename,
                    fileKey: uploadResult.key,
                    processingOptions: options
                });

            } catch (processError) {
                console.error('Processing error:', processError);
                res.status(500).json({
                    success: false,
                    error: 'Failed to process image: ' + processError.message
                });
            }
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error: ' + error.message
        });
    }
};
