const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const ImageProcessor = require('../utils/imageProcessor');
const CloudStorage = require('../utils/cloudStorage');
const ProcessingHistory = require('../models/ProcessingHistory');

const router = express.Router();
const cloudStorage = new CloudStorage();

const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 20 * 1024 * 1024 }
});

router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        const { colorCount, filterType, brightness, contrast, edgeIntensity } = req.body;
        const options = {
            colorCount: parseInt(colorCount) || 12,
            filterType: filterType || 'contour',
            brightness: parseFloat(brightness) || 1.0,
            contrast: parseFloat(contrast) || 1.0,
            edgeIntensity: parseFloat(edgeIntensity) || 1.0
        };

        const tempInput = path.join('/tmp', `${uuidv4()}-input.png`);
        const tempOutput = path.join('/tmp', `${uuidv4()}-output.png`);

        // Сохраняем файл временно
        require('fs').writeFileSync(tempInput, req.file.buffer);

        // Обрабатываем изображение
        const result = await ImageProcessor.createPaintingByNumbers(
            tempInput, tempOutput, options
        );

        // Загружаем в облачное хранилище
        const originalUrl = await cloudStorage.uploadFile(tempInput);
        const processedUrl = await cloudStorage.uploadFile(tempOutput);

        // Сохраняем в историю
        const history = await ProcessingHistory.create({
            user_id: req.user.id,
            original_filename: originalUrl,
            processed_filename: processedUrl,
            color_count: options.colorCount,
            filter_type: options.filterType,
            processing_time: result.processingTime
        });

        // Удаляем временные файлы
        require('fs').unlinkSync(tempInput);
        require('fs').unlinkSync(tempOutput);

        res.json({
            success: true,
            originalImage: originalUrl,
            processedImage: processedUrl,
            historyId: history.id,
            processingTime: result.processingTime
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Processing failed' });
    }
});

// Превью в реальном времени
router.post('/preview', auth, upload.single('image'), async (req, res) => {
    try {
        const options = JSON.parse(req.body.options || '{}');
        const preview = await ImageProcessor.generatePreview(req.file.buffer, options);
        
        res.set('Content-Type', 'image/png');
        res.send(preview);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;