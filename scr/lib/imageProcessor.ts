import { createCanvas, loadImage } from 'canvas'
import { quantize } from './colorQuantizer'
import { Color } from '@/types'
import { rgbToHex } from '@/lib/utils'

export async function processImage(imageBuffer: Buffer, colorCount: number = 8) {
  const image = await loadImage(imageBuffer)
  
  const canvas = createCanvas(image.width, image.height)
  const ctx = canvas.getContext('2d')
  
  // Draw original image
  ctx.drawImage(image, 0, 0)
  
  // Get image data for processing
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  
  // Quantize colors
  const { palette, quantizedData } = quantize(data, colorCount)
  
  // Create processed image
  const processedData = new Uint8ClampedArray(data.length)
  for (let i = 0; i < data.length; i += 4) {
    const colorIndex = quantizedData[i / 4]
    const color = palette[colorIndex]
    
    processedData[i] = color.r
    processedData[i + 1] = color.g
    processedData[i + 2] = color.b
    processedData[i + 3] = 255
  }
  
  const processedImageData = new ImageData(processedData, canvas.width, canvas.height)
  ctx.putImageData(processedImageData, 0, 0)
  
  // Generate numbers grid (simplified)
  const numbers = generateNumbersGrid(quantizedData, canvas.width, canvas.height, palette.length)
  
  return {
    processed: canvas.toDataURL(),
    palette: palette.map((color, index) => ({
      r: color.r,
      g: color.g,
      b: color.b,
      hex: rgbToHex(color.r, color.g, color.b), // Используем из utils
    })),
    numbers,
    width: canvas.width,
    height: canvas.height
  }
}

function generateNumbersGrid(quantizedData: number[], width: number, height: number, colorCount: number): number[][] {
  const grid: number[][] = []
  const cellSize = 20 // pixels per cell
  
  const gridWidth = Math.ceil(width / cellSize)
  const gridHeight = Math.ceil(height / cellSize)
  
  for (let y = 0; y < gridHeight; y++) {
    const row: number[] = []
    for (let x = 0; x < gridWidth; x++) {
      // Sample the center of each cell
      const pixelX = Math.min(x * cellSize + cellSize / 2, width - 1)
      const pixelY = Math.min(y * cellSize + cellSize / 2, height - 1)
      const index = Math.floor(pixelY) * width + Math.floor(pixelX)
      
      if (index < quantizedData.length) {
        row.push(quantizedData[index] + 1) // Convert to 1-based indexing
      } else {
        row.push(0)
      }
    }
    grid.push(row)
  }
  
  return grid
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}