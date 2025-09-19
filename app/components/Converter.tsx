'use client'

import { useState, useRef } from 'react'
import { convertImageToPaintByNumbers } from '@/utils/imageUtils'
import { Download, Upload, Palette } from 'lucide-react'

export default function Converter() {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [numbersImage, setNumbersImage] = useState<string | null>(null)
  const [colorPalette, setColorPalette] = useState<Array<{color: string, number: number}> | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string)
        setProcessedImage(null)
        setNumbersImage(null)
        setColorPalette(null)
      }
      reader.readAsDataURL(file)
    }
  }

 const handleConvert = async () => {
  if (!originalImage) return
  
  setIsProcessing(true);
  try {
    // Конвертация base64 в File
    const response = await fetch(originalImage);
    const blob = await response.blob();
    const file = new File([blob], 'image.png', { type: 'image/png' });

    const formData = new FormData();
    formData.append('image', file);

    const apiResponse = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!apiResponse.ok) {
      throw new Error('Server error');
    }

    const result = await apiResponse.json();
    
    if (result.success) {
      setProcessedImage(result.imageData);
      setNumbersImage(result.numbersImage);
      setColorPalette(result.colorPalette);
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Conversion error:', error);
    alert('Error processing image. Please try another image.');
  } finally {
    setIsProcessing(false);
  }
};

  const downloadImage = (imageData: string, filename: string) => {
    const link = document.createElement('a')
    link.href = imageData
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Painting by Numbers Generator
        </h1>
        <p className="text-gray-600">
          Upload an image to convert it into a paint-by-numbers template
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-center mb-4">
          <Upload className="w-6 h-6 text-blue-500 mr-2" />
          <h2 className="text-xl font-semibold">Upload Image</h2>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Choose Image
          </button>
          
          {originalImage && (
            <div className="mt-4">
              <img
                src={originalImage}
                alt="Original"
                className="max-w-full h-48 object-contain rounded-lg shadow-md"
              />
            </div>
          )}
        </div>
      </div>

      {/* Convert Button */}
      {originalImage && !isProcessing && (
        <div className="text-center mb-6">
          <button
            onClick={handleConvert}
            disabled={isProcessing}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center mx-auto"
          >
            <Palette className="w-5 h-5 mr-2" />
            Generate Painting by Numbers
          </button>
        </div>
      )}

      {isProcessing && (
        <div className="text-center mb-6">
          <div className="animate-pulse bg-blue-100 text-blue-800 px-6 py-4 rounded-lg">
            Processing image... This may take a few seconds.
          </div>
        </div>
      )}

      {/* Results */}
      {processedImage && numbersImage && colorPalette && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-center">Results</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Processed Image</h3>
              <img
                src={processedImage}
                alt="Processed"
                className="w-full h-64 object-contain rounded-lg shadow-md"
              />
              <button
                onClick={() => downloadImage(processedImage, 'painting-by-numbers.png')}
                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg w-full flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Image
              </button>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Numbers Template</h3>
              <img
                src={numbersImage}
                alt="Numbers Template"
                className="w-full h-64 object-contain rounded-lg shadow-md bg-white"
              />
              <button
                onClick={() => downloadImage(numbersImage, 'numbers-template.png')}
                className="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg w-full flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </button>
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <h3 className="font-semibold mb-3">Color Palette</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {colorPalette.map((item) => (
                <div
                  key={item.number}
                  className="flex flex-col items-center p-2 rounded-lg border"
                >
                  <div
                    className="w-12 h-12 rounded-full mb-2 border"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-semibold">#{item.number}</span>
                  <span className="text-xs text-gray-600">
                    {item.color.replace('rgb(', '').replace(')', '')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
