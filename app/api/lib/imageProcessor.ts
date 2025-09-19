import { createCanvas, loadImage } from 'canvas';
import quantize from 'quantize';
import sharp from 'sharp';

export interface ProcessResult {
  processedImage: string;
  numbersImage: string;
  colorPalette: Array<{ color: string; number: number }>;
  dimensions: { width: number; height: number };
}

export async function processImage(
  imageBuffer: Buffer,
  colorsCount: number = 12,
  blockSize: number = 20
): Promise<ProcessResult> {
  try {
    // Оптимизация изображения с помощью sharp
    const optimizedImage = await sharp(imageBuffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .png()
      .toBuffer();

    // Загрузка изображения
    const image = await loadImage(optimizedImage);
    
    // Создание canvas для обработки
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    // Получение данных пикселей
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const pixels = imageData.data;

    // Подготовка данных для квантования
    const pixelArray = [];
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] > 128) { // Проверка альфа-канала
        pixelArray.push([pixels[i], pixels[i + 1], pixels[i + 2]]);
      }
    }

    if (pixelArray.length === 0) {
      throw new Error('No valid image data found');
    }

    // Квантование цветов
    const colorMap = quantize(pixelArray, Math.min(colorsCount, 20));
    const palette = colorMap.palette();

    // Создание палитры с номерами
    const colorPalette = palette.map((color: number[], index: number) => ({
      color: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
      number: index + 1,
      hex: `#${color[0].toString(16).padStart(2, '0')}${color[1].toString(16).padStart(2, '0')}${color[2].toString(16).padStart(2, '0')}`
    }));

    // Создание изображения с номерами
    const numbersCanvas = createCanvas(image.width, image.height);
    const numbersCtx = numbersCanvas.getContext('2d');
    
    // Белый фон
    numbersCtx.fillStyle = 'white';
    numbersCtx.fillRect(0, 0, image.width, image.height);
    
    numbersCtx.font = 'bold 14px Arial';
    numbersCtx.textAlign = 'center';
    numbersCtx.textBaseline = 'middle';

    // Обработка блоков изображения
    for (let y = 0; y < image.height; y += blockSize) {
      for (let x = 0; x < image.width; x += blockSize) {
        const blockColors = [];
        
        // Сбор цветов в блоке
        for (let by = 0; by < blockSize && y + by < image.height; by++) {
          for (let bx = 0; bx < blockSize && x + bx < image.width; bx++) {
            const pixelIndex = ((y + by) * image.width + (x + bx)) * 4;
            if (pixels[pixelIndex + 3] > 128) { // Проверка прозрачности
              blockColors.push([pixels[pixelIndex], pixels[pixelIndex + 1], pixels[pixelIndex + 2]]);
            }
          }
        }

        if (blockColors.length > 10) { // Минимум 10 пикселей для анализа
          try {
            const blockColorMap = quantize(blockColors, 1);
            const dominantColor = blockColorMap.palette()[0];
            const colorIndex = findClosestColor(dominantColor, palette);
            
            // Рисование номера
            numbersCtx.fillStyle = getContrastColor(palette[colorIndex]);
            numbersCtx.fillText(
              (colorIndex + 1).toString(),
              x + blockSize / 2,
              y + blockSize / 2
            );
          } catch (error) {
            console.warn('Error processing block:', error);
          }
        }
      }
    }

    // Конвертация в base64
    const processedImage = canvas.toDataURL('image/png');
    const numbersImage = numbersCanvas.toDataURL('image/png');

    return {
      processedImage,
      numbersImage,
      colorPalette,
      dimensions: { width: image.width, height: image.height }
    };

  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Вспомогательные функции
function findClosestColor(color: number[], palette: number[][]): number {
  let minDistance = Infinity;
  let closestIndex = 0;

  for (let i = 0; i < palette.length; i++) {
    const distance = colorDistance(color, palette[i]);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = i;
    }
  }

  return closestIndex;
}

function colorDistance(color1: number[], color2: number[]): number {
  return Math.sqrt(
    Math.pow(color1[0] - color2[0], 2) +
    Math.pow(color1[1] - color2[1], 2) +
    Math.pow(color1[2] - color2[2], 2)
  );
}

function getContrastColor(color: number[]): string {
  const brightness = (color[0] * 299 + color[1] * 587 + color[2] * 114) / 1000;
  return brightness > 128 ? 'black' : 'white';
}
