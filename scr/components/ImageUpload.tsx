'use client'

import { useRef } from 'react'
import { ProcessedImage } from '@/types'

interface ImageUploadProps {
  onProcess: (image: ProcessedImage) => void
  loading: boolean
  setLoading: (loading: boolean) => void
}

export default function ImageUpload({ onProcess, loading, setLoading }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (!file) return

  // Проверка размера файла (макс. 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Файл слишком большой. Максимальный размер: 5MB')
    return
  }

  // Проверка типа файла
  if (!file.type.startsWith('image/')) {
    alert('Пожалуйста, выберите изображение')
    return
  }

    setLoading(true)
    
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('/api/process-image', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        onProcess(result)
      } else {
        console.error('Failed to process image')
      }
    } catch (error) {
      console.error('Error processing image:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        disabled={loading}
      />
      
      <div className="space-y-4">
        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        
        <div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
          >
            Upload Image
          </button>
        </div>
        
        <p className="text-sm text-gray-500">
          PNG, JPG, GIF up to 10MB
        </p>
      </div>
    </div>
  )
}