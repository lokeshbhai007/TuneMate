// src/app/layout.jsx
import './globals.css'
import { ThemeProvider } from './components/Theme-provider'

export const metadata = {
  title: 'TuneMate',
  description: 'Advanced AI-powered English learning and correction tool',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}