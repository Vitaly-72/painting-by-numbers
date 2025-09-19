import quantize from 'quantize';
import { createCanvas, loadImage } from 'canvas';

export interface PaintingResult {
  imageData: string;
  colorPalette: Array<{ color: string; number: number }>;
  numbersImage: string;
}

export const convertImageToPaintByNumbers = async (
  imageUrl: string, 
  colorsCount: number = 12
): Promise<PaintingResult> => {
  try {
    // Загрузка изображения
    const image = await loadImage(imageUrl);
    
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
      pixelArray.push([pixels[i], pixels[i + 1], pixels[i + 2]]);
    }
    
    // Квантование цветов
    const colorMap = quantize(pixelArray, colorsCount);
    const palette = colorMap.palette();
    
    // Создание палитры с номерами
    const colorPalette = palette.map((color: number[], index: number) => ({
      color: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
      number: index + 1
    }));
    
    // Создание изображения с номерами
    const numbersCanvas = createCanvas(image.width, image.height);
    const numbersCtx = numbersCanvas.getContext('2d');
    numbersCtx.fillStyle = 'white';
    numbersCtx.fillRect(0, 0, image.width, image.height);
    
    // Определение доминирующих цветов для областей
    const blockSize = 20; // Размер блока для номеров
    numbersCtx.font = '12px Arial';
    numbersCtx.textAlign = 'center';
    numbersCtx.textBaseline = 'middle';
    
    for (let y = 0; y < image.height; y += blockSize) {
      for (let x = 0; x < image.width; x += blockSize) {
        // Получение среднего цвета в блоке
        const blockColors = [];
        for (let by = 0; by < blockSize && y + by < image.height; by++) {
          for (let bx = 0; bx < blockSize && x + bx < image.width; bx++) {
            const pixelIndex = ((y + by) * image.width + (x + bx)) * 4;
            blockColors.push([pixels[pixelIndex], pixels[pixelIndex + 1], pixels[pixelIndex + 2]]);
          }
        }
        
        if (blockColors.length > 0) {
          const dominantColor = quantize(blockColors, 1).palette()[0];
          const colorIndex = findClosestColor(dominantColor, palette);
          
          // Рисование номера
          numbersCtx.fillStyle = getContrastColor(palette[colorIndex]);
          numbersCtx.fillText(
            (colorIndex + 1).toString(),
            x + blockSize / 2,
            y + blockSize / 2
          );
        }
      }
    }
    
    // Конвертация в base64
    const resultImage = canvas.toDataURL('image/png');
    const numbersImage = numbersCanvas.toDataURL('image/png');
    
    return {
      imageData: resultImage,
      colorPalette,
      numbersImage
    };
    
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
};

// Вспомогательные функции
const findClosestColor = (color: number[], palette: number[][]): number => {
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
};

const colorDistance = (color1: number[], color2: number[]): number => {
  return Math.sqrt(
    Math.pow(color1[0] - color2[0], 2) +
    Math.pow(color1[1] - color2[1], 2) +
    Math.pow(color1[2] - color2[2], 2)
  );
};

const getContrastColor = (color: number[]): string => {
  // Яркость по формуле YIQ
  const brightness = (color[0] * 299 + color[1] * 587 + color[2] * 114) / 1000;
  return brightness > 128 ? 'black' : 'white';
};
