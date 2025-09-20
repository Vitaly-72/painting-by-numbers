import { Color } from '@/types'
import { quantize } from './colorQuantizer'
import { rgbToHex } from './utils'

export async function processImageClient(
  imageDataUrl: string, 
  colorCount: number = 8
): Promise<{
  imageData: string;
  palette: Color[];
  numbers: number[][];
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = async () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Could not get canvas context')

        canvas.width = img.width
        canvas.height = img.height

        // Рисуем изображение на canvas
        ctx.drawImage(img, 0, 0)

        // Получаем данные изображения
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Квантуем цвета
        const { palette, quantizedData } = quantize(data, colorCount)

        // Создаем обработанное изображение
        const processedData = new Uint8ClampedArray(data.length)
        for (let i = 0; i < data.length; i += 4) {
          if (quantizedData[i / 4] !== -1) {
            const colorIndex = quantizedData[i / 4]
            const color = palette[colorIndex]
            
            processedData[i] = color.r
            processedData[i + 1] = color.g
            processedData[i + 2] = color.b
            processedData[i + 3] = 255
          } else {
            // Прозрачные пиксели
            processedData[i] = 255
            processedData[i + 1] = 255
            processedData[i + 2] = 255
            processedData[i + 3] = 0
          }
        }

        const processedImageData = new ImageData(processedData, canvas.width, canvas.height)
        ctx.putImageData(processedImageData, 0, 0)

        // Генерируем сетку номеров
        const numbers = generateNumbersGrid(quantizedData, canvas.width, canvas.height, palette.length)

        resolve({
          imageData: canvas.toDataURL(),
          palette,
          numbers,
          width: canvas.width,
          height: canvas.height
        })

      } catch (error) {
        reject(error)
      }
    }

    img.onerror = reject
    img.src = imageDataUrl
  })
}

function generateNumbersGrid(
  quantizedData: number[], 
  width: number, 
  height: number, 
  colorCount: number
): number[][] {
  const grid: number[][] = []
  const cellSize = Math.max(20, Math.min(width, height) / 30)
  
  const gridWidth = Math.ceil(width / cellSize)
  const gridHeight = Math.ceil(height / cellSize)
  
  for (let y = 0; y < gridHeight; y++) {
    const row: number[] = []
    for (let x = 0; x < gridWidth; x++) {
      const pixelX = Math.min(x * cellSize + cellSize / 2, width - 1)
      const pixelY = Math.min(y * cellSize + cellSize / 2, height - 1)
      const index = Math.floor(pixelY) * width + Math.floor(pixelX)
      
      if (index < quantizedData.length && quantizedData[index] !== -1) {
        row.push(quantizedData[index] + 1)
      } else {
        row.push(0)
      }
    }
    grid.push(row)
  }
  
  return grid
}
