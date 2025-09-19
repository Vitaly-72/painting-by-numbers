import { NextRequest, NextResponse } from 'next/server';
import { createCanvas, loadImage } from 'canvas';
import quantize from 'quantize';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Конвертация File в buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const imageDataUrl = `data:${imageFile.type};base64,${buffer.toString('base64')}`;

    // Обработка изображения
    const result = await processImage(imageDataUrl);

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processImage(imageData: string): Promise<any> {
  const image = await loadImage(imageData);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);

  const imageDataObj = ctx.getImageData(0, 0, image.width, image.height);
  const pixels = imageDataObj.data;

  // Подготовка данных для квантования
  const pixelArray = [];
  for (let i = 0; i < pixels.length; i += 4) {
    pixelArray.push([pixels[i], pixels[i + 1], pixels[i + 2]]);
  }

  // Квантование цветов
  const colorMap = quantize(pixelArray, 12);
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

  const blockSize = 20;
  numbersCtx.font = '12px Arial';
  numbersCtx.textAlign = 'center';
  numbersCtx.textBaseline = 'middle';

  for (let y = 0; y < image.height; y += blockSize) {
    for (let x = 0; x < image.width; x += blockSize) {
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
        
        numbersCtx.fillStyle = getContrastColor(palette[colorIndex]);
        numbersCtx.fillText(
          (colorIndex + 1).toString(),
          x + blockSize / 2,
          y + blockSize / 2
        );
      }
    }
  }

  return {
    success: true,
    imageData: canvas.toDataURL('image/png'),
    numbersImage: numbersCanvas.toDataURL('image/png'),
    colorPalette
  };
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

export const config = {
  api: {
    bodyParser: false
  }
};
