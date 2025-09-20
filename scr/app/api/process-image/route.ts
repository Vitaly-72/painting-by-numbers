import { NextRequest, NextResponse } from 'next/server'
import { processImage } from '@/lib/imageProcessor'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    
    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }
    
    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const result = await processImage(buffer, 12)
    
    return NextResponse.json({
      original: `data:${imageFile.type};base64,${buffer.toString('base64')}`,
      processed: result.processed,
      palette: result.palette,
      numbers: result.numbers,
      width: result.width,
      height: result.height
    })
    
  } catch (error) {
    console.error('Error processing image:', error)
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}