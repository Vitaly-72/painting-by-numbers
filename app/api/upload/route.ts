import { NextRequest, NextResponse } from 'next/server';
import { processImage } from '@/lib/imageProcessor';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    console.log('API: Received upload request');
    
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const colorsCount = parseInt(formData.get('colorsCount') as string) || 12;
    const complexity = parseInt(formData.get('complexity') as string) || 20;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Проверяем тип файла
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File is not an image' },
        { status: 400 }
      );
    }

    // Конвертация File в buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Обработка изображения
    console.log('API: Processing image...');
    const result = await processImage(buffer, colorsCount, complexity);
    
    console.log('API: Image processed successfully');
    return NextResponse.json({
      success: true,
      processedImage: result.processedImage,
      numbersImage: result.numbersImage,
      colorPalette: result.colorPalette,
      dimensions: result.dimensions
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'OK',
    message: 'Upload API is working'
  });
}
