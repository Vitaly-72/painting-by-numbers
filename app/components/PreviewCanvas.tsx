'use client'

import { useEffect, useRef } from 'react'
import { ProcessedImage } from '../types'

interface PreviewCanvasProps {
  processedImage: ProcessedImage
  className?: string
}

export default function PreviewCanvas({ processedImage, className = '' }: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw processed image
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      // Draw numbers (simplified version)
      ctx.fillStyle = 'black'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const cellSize = Math.max(canvas.width / processedImage.numbers[0].length, canvas.height / processedImage.numbers.length)
      
      for (let y = 0; y < processedImage.numbers.length; y++) {
        for (let x = 0; x < processedImage.numbers[y].length; x++) {
          const number = processedImage.numbers[y][x]
          if (number > 0) {
            ctx.fillText(
              number.toString(),
              x * cellSize + cellSize / 2,
              y * cellSize + cellSize / 2
            )
          }
        }
      }
    }
    img.src = processedImage.processed
  }, [processedImage])

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-3">Preview</h3>
      <div className="flex gap-8">
        <div>
          <h4 className="text-sm font-medium mb-2">Original</h4>
          <img
            src={processedImage.original}
            alt="Original"
            className="max-w-xs border rounded"
          />
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2">Processed</h4>
          <canvas
            ref={canvasRef}
            width={processedImage.width}
            height={processedImage.height}
            className="max-w-xs border rounded"
          />
        </div>
      </div>
    </div>
  )
}
