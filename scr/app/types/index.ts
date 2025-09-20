export interface Color {
  r: number
  g: number
  b: number
  hex: string
}

export interface ProcessedImage {
  original: string
  processed: string
  palette: Color[]
  numbers: number[][]
  width: number
  height: number
}