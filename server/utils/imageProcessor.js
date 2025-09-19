const Jimp = require('jimp');
const sharp = require('sharp');
const path = require('path');

class ImageProcessor {
    static async createPaintingByNumbers(inputPath, outputPath, options = {}) {
        const {
            colorCount = 12,
            filterType = 'contour',
            brightness = 1.0,
            contrast = 1.0,
            edgeIntensity = 1.0
        } = options;

        try {
            const startTime = Date.now();
            let image = await Jimp.read(inputPath);

            // Ресайз изображения
            image.resize(800, Jimp.AUTO);

            // Применение фильтров
            switch (filterType) {
                case 'contour':
                    image = await this.applyContourFilter(image, edgeIntensity);
                    break;
                case 'poster':
                    image = await this.applyPosterFilter(image, colorCount);
                    break;
                case 'sketch':
                    image = await this.applySketchFilter(image);
                    break;
                case 'watercolor':
                    image = await this.applyWatercolorFilter(image);
                    break;
            }

            // Коррекция яркости и контраста
            if (brightness !== 1.0 || contrast !== 1.0) {
                image.brightness(brightness - 1);
                image.contrast(contrast - 1);
            }

            // Квантование цветов
            image.quantize({ numberOfColors: colorCount });

            // Сохранение результата
            await image.writeAsync(outputPath);

            const processingTime = Date.now() - startTime;
            return { success: true, processingTime };

        } catch (error) {
            console.error('Image processing error:', error);
            throw error;
        }
    }

    static async applyContourFilter(image, intensity = 1.0) {
        const matrix = [
            [-1 * intensity, -1 * intensity, -1 * intensity],
            [-1 * intensity,  8 * intensity, -1 * intensity],
            [-1 * intensity, -1 * intensity, -1 * intensity]
        ];
        return image.convolute(matrix);
    }

    static async applyPosterFilter(image, colorCount) {
        image.posterize(colorCount / 2);
        return image;
    }

    static async applySketchFilter(image) {
        // Конвертируем в grayscale и применяем edge detection
        let gray = image.clone().greyscale();
        gray = await this.applyContourFilter(gray, 1.5);
        gray.invert();
        return gray;
    }

    static async applyWatercolorFilter(image) {
        // Эффект акварели с помощью размытия и повышения насыщенности
        image.blur(2);
        image.color([{ apply: 'saturate', params: [30] }]);
        return image;
    }

    static async generatePreview(imageBuffer, options) {
        // Генерация превью для реального времени
        const previewSize = 200;
        let image = await Jimp.read(imageBuffer);
        
        image.resize(previewSize, Jimp.AUTO);
        
        if (options.filterType === 'contour') {
            image = await this.applyContourFilter(image, options.edgeIntensity);
        }
        
        image.quantize({ numberOfColors: options.colorCount });
        
        return await image.getBufferAsync(Jimp.MIME_PNG);
    }
}

module.exports = ImageProcessor;