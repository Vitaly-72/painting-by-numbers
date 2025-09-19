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
  // Заглушка для теста
  return {
    processedImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    numbersImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    colorPalette: [
      { color: 'rgb(255, 0, 0)', number: 1 },
      { color: 'rgb(0, 255, 0)', number: 2 },
      { color: 'rgb(0, 0, 255)', number: 3 }
    ],
    dimensions: { width: 100, height: 100 }
  };
}
