import { Color } from '@/types'
import { rgbToHex } from '@/lib/utils'

export function quantize(data: Uint8ClampedArray, colorCount: number): { palette: Color[]; quantizedData: number[] } {
  const pixels: number[][] = []
  
  // Собираем все непрозрачные пиксели
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 128) { // Only consider non-transparent pixels
      pixels.push([data[i], data[i + 1], data[i + 2]])
    }
  }
  
  // Упрощенная реализация k-means
  const palette = kMeans(pixels, colorCount)
  const quantizedData: number[] = []
  
  // Квантуем каждый пиксель
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 128) {
      const pixel = [data[i], data[i + 1], data[i + 2]]
      const closestColorIndex = findClosestColor(pixel, palette)
      quantizedData.push(closestColorIndex)
    } else {
      quantizedData.push(-1) // Прозрачный пиксель
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

function kMeans(pixels: number[][], k: number, maxIterations: number = 10): number[][] {
  // Инициализируем центроиды случайными пикселями
  let centroids: number[][] = []
  const usedIndices = new Set<number>()
  
  for (let i = 0; i < k; i++) {
    let randomIndex: number
    do {
      randomIndex = Math.floor(Math.random() * pixels.length)
    } while (usedIndices.has(randomIndex) && pixels.length > k)
    
    usedIndices.add(randomIndex)
    centroids.push([...pixels[randomIndex]])
  }
  
  // Выполняем итерации k-means
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // Распределяем пиксели по кластерам
    const clusters: number[][][] = Array(k).fill(null).map(() => [])
    
    for (const pixel of pixels) {
      let minDistance = Infinity
      let closestCluster = 0
      
      for (let i = 0; i < k; i++) {
        const distance = colorDistance(pixel, centroids[i])
        if (distance < minDistance) {
          minDistance = distance
          closestCluster = i
        }
      }
      
      clusters[closestCluster].push(pixel)
    }
    
    // Обновляем центроиды
    let changed = false
    for (let i = 0; i < k; i++) {
      if (clusters[i].length > 0) {
        const newCentroid = [
          Math.round(clusters[i].reduce((sum, p) => sum + p[0], 0) / clusters[i].length),
          Math.round(clusters[i].reduce((sum, p) => sum + p[1], 0) / clusters[i].length),
          Math.round(clusters[i].reduce((sum, p) => sum + p[2], 0) / clusters[i].length)
        ]
        
        if (colorDistance(newCentroid, centroids[i]) > 1) {
          changed = true
          centroids[i] = newCentroid
        }
      } else {
        // Если кластер пустой, инициализируем заново
        const randomPixel = pixels[Math.floor(Math.random() * pixels.length)]
        centroids[i] = [...randomPixel]
        changed = true
      }
    }
    
    // Если центроиды не изменились, выходим раньше
    if (!changed) break
  }
  
  return centroids
}

function findClosestColor(pixel: number[], palette: number[][]): number {
  let minDistance = Infinity
  let closestIndex = 0
  
  for (let i = 0; i < palette.length; i++) {
    const color = palette[i]
    const distance = colorDistance(pixel, color)
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