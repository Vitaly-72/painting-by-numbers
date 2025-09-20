import { Color } from '@/types'
import { rgbToHex } from './utils'

export function quantize(data: Uint8ClampedArray, colorCount: number): { palette: Color[]; quantizedData: number[] } {
  const pixels: number[][] = []
  
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 128) {
      pixels.push([data[i], data[i + 1], data[i + 2]])
    }
  }
  
  const palette = simpleColorQuantization(pixels, colorCount)
  const quantizedData: number[] = []
  
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 128) {
      const pixel = [data[i], data[i + 1], data[i + 2]]
      const closestColorIndex = findClosestColor(pixel, palette)
      quantizedData.push(closestColorIndex)
    } else {
      quantizedData.push(-1)
    }
  }
  
  return { 
    palette: palette.map(color => ({ 
      r: color[0], 
      g: color[1], 
      b: color[2], 
      hex: rgbToHex(color[0], color[1], color[2]) 
    })), 
    quantizedData 
  }
}

function simpleColorQuantization(pixels: number[][], colorCount: number): number[][] {
  if (pixels.length <= colorCount) {
    return [...pixels]
  }

  const palette: number[][] = []
  const step = Math.floor(pixels.length / colorCount)
  
  for (let i = 0; i < colorCount; i++) {
    const index = Math.min(i * step, pixels.length - 1)
    palette.push([...pixels[index]])
  }
  
  return palette
}

function findClosestColor(pixel: number[], palette: number[][]): number {
  let minDistance = Infinity
  let closestIndex = 0
  
  for (let i = 0; i < palette.length; i++) {
    const distance = colorDistance(pixel, palette[i])
    if (distance < minDistance) {
      minDistance = distance
      closestIndex = i
    }
  }
  
  return closestIndex
}

function colorDistance(color1: number[], color2: number[]): number {
  const dr = color1[0] - color2[0]
  const dg = color1[1] - color2[1]
  const db = color1[2] - color2[2]
  return Math.sqrt(dr * dr + dg * dg + db * db)
}
