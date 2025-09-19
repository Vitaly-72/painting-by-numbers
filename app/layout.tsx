import './globals.css'

export const metadata = {
  title: 'Painting by Numbers',
  description: 'Generate paint by numbers images',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
