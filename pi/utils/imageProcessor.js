const sharp = require('sharp');
const Jimp = require('jimp');

class ImageProcessor {
    static async processImage(buffer, options = {}) {
        const {
            colorCount = 12,
            filterType = 'contour',
            brightness = 1.0,
            contrast = 1.0,
            edgeIntensity = 1.0
        } = options;

        try {
            // Используем sharp для базовой обработки
            let image = sharp(buffer);
            
            // Ресайз изображения
            image = image.resize(800, 800, {
                fit: 'inside',
                withoutEnlargement: true
            });

            // Применяем фильтры
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
                default:
                    image = await this.applyContourFilter(image, edgeIntensity);
            }

            // Коррекция яркости и контраста
            if (brightness !== 1.0) {
                image = image.modulate({
                    brightness: brightness
                });
            }

            if (contrast !== 1.0) {
                image = image.linear(contrast, -(128 * contrast) + 128);
            }

            // Конвертируем в PNG и применяем квантование цветов
            const processedBuffer = await image
                .png()
                .toBuffer();

            // Дополнительное квантование цветов с Jimp
            const jimpImage = await Jimp.read(processedBuffer);
            jimpImage.quantize({ numberOfColors: colorCount });

            return await jimpImage.getBufferAsync(Jimp.MIME_PNG);

        } catch (error) {
            console.error('Image processing error:', error);
            throw new Error('Failed to process image: ' + error.message);
        }
    }

    static async applyContourFilter(image, intensity = 1.0) {
        return image.convolute({
            width: 3,
            height: 3,
            kernel: [
                -1 * intensity, -1 * intensity, -1 * intensity,
                -1 * intensity,  8 * intensity, -1 * intensity,
                -1 * intensity, -1 * intensity, -1 * intensity
            ]
        });
    }

    static async applyPosterFilter(image, colorCount) {
        return image.png({
            quality: 100,
            compressionLevel: 9,
            colours: colorCount
        });
    }

    static async applySketchFilter(image) {
        // Конвертируем в grayscale и применяем edge detection
        return image
            .greyscale()
            .convolute({
                width: 3,
                height: 3,
                kernel: [
                    -1, -1, -1,
                    -1,  8, -1,
                    -1, -1, -1
                ]
            })
            .negate();
    }

    static async applyWatercolorFilter(image) {
        // Эффект акварели с помощью размытия
        return image
            .blur(2)
            .modulate({
                saturation: 1.3
            });
    }

    static async generatePreview(buffer, options) {
        try {
            const preview = await sharp(buffer)
                .resize(200, 200, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .png()
                .toBuffer();

            return preview;
        } catch (error) {
            console.error('Preview generation error:', error);
            throw error;
        }
    }

    static async validateImage(buffer) {
        try {
            const metadata = await sharp(buffer).metadata();
            return {
                isValid: true,
                width: metadata.width,
                height: metadata.height,
                format: metadata.format
            };
        } catch (error) {
            return {
                isValid: false,
                error: 'Invalid image file'
            };
        }
    }
}

module.exports = ImageProcessor;
