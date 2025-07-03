// File: src/app/layout.jsx
import './globals.css'

export const metadata = {
  title: 'TuneMate',
  description: 'Advanced AI-powered text processing tool with dark hacking theme',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}