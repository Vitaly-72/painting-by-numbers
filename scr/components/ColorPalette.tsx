import { Color } from '../types'

interface ColorPaletteProps {
  colors: Color[]
}

export default function ColorPalette({ colors }: ColorPaletteProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-3">Color Palette</h3>
      <div className="flex flex-wrap gap-2">
        {colors.map((color, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className="w-8 h-8 rounded border"
              style={{ backgroundColor: color.hex }}
              title={`RGB: ${color.r}, ${color.g}, ${color.b}`}
            />
            <span className="text-xs mt-1">{index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
