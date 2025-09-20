import { ProcessedImage } from '@/types'

interface DownloadButtonsProps {
  processedImage: ProcessedImage
  className?: string
}

export default function DownloadButtons({ processedImage, className = '' }: DownloadButtonsProps) {
  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadInstructions = () => {
    const instructions = `Painting by Numbers Instructions:\n\n` +
      `Colors:\n` +
      processedImage.palette.map((color, index) => 
        `${index + 1}: RGB(${color.r}, ${color.g}, ${color.b}) - ${color.hex}`
      ).join('\n')
    
    const blob = new Blob([instructions], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    downloadImage(url, 'painting-instructions.txt')
  }

  return (
    <div className={`flex gap-4 ${className}`}>
      <button
        onClick={() => downloadImage(processedImage.processed, 'painting-by-numbers.png')}
        className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded"
      >
        Download Image
      </button>
      
      <button
        onClick={downloadInstructions}
        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
      >
        Download Instructions
      </button>
      
      <button
        onClick={() => window.print()}
        className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded"
      >
        Print
      </button>
    </div>
  )
}