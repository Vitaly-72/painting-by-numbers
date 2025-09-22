'use client'

import { useState } from 'react'
// ИСПРАВЛЕННЫЕ ИМПОРТЫ:
import ImageUpload from './components/ImageUpload'
import ColorPalette from './components/ColorPalette'
import PreviewCanvas from './components/PreviewCanvas'
import DownloadButtons from './components/DownloadButtons'
import { ProcessedImage } from '../src/types'

export default function Home() {
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Painting by Numbers Generator
      </h1>
      
      <ImageUpload 
        onProcess={setProcessedImage}
        loading={loading}
        setLoading={setLoading}
      />
      
      {loading && (
        <div className="text-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Processing image...</p>
        </div>
      )}
      
      {processedImage && !loading && (
        <div className="mt-8">
          <ColorPalette colors={processedImage.palette} />
          <PreviewCanvas 
            processedImage={processedImage}
            className="mt-6"
          />
          <DownloadButtons 
            processedImage={processedImage}
            className="mt-6"
          />
        </div>
      )}
    </div>
  )
}
