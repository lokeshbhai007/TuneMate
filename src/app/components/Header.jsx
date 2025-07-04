// src/components/Header.jsx
import { Brain, Zap } from 'lucide-react'
import ThemeToggle from '../components/Theme-toggle'

// Custom SVG Logo Component
const TuneMateLogo = ({ className }) => (
  <svg 
    className={className} 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer growth ring */}
    <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
    
    {/* Human figure/connection symbol */}
    <circle cx="16" cy="10" r="3" fill="currentColor" opacity="0.8"/>
    
    {/* Body/communication flow */}
    <path 
      d="M16 13v6c0 1 0 2 0 2" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    
    {/* Arms reaching out - representing expression and connection */}
    <path 
      d="M13 16c-2 0-4 1-4 1M19 16c2 0 4 1 4 1" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      opacity="0.8"
    />
    
    {/* Heart/kindness symbol */}
    <path 
      d="M12 19.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5z" 
      fill="currentColor" 
      opacity="0.6"
    />
    <path 
      d="M16.5 19.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5z" 
      fill="currentColor" 
      opacity="0.6"
    />
    
    {/* Communication waves/clarity */}
    <path 
      d="M22 12c1 0 2 1 2 2s-1 2-2 2M26 10c1.5 0 3 1.5 3 3s-1.5 3-3 3" 
      stroke="currentColor" 
      strokeWidth="1" 
      strokeLinecap="round" 
      opacity="0.5"
    />
    
    {/* Confidence/growth indicator */}
    <path 
      d="M8 24l2-2 2 2 2-2" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      opacity="0.7"
    />
  </svg>
)

export default function Header() {
  return (
    <header className="bg-terminal-card border-b border-terminal-border">
      <div className="container mx-auto px-4 py-4 lg:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 lg:space-x-4">
            <div className="flex items-center space-x-2">
              <TuneMateLogo className="h-6 w-6 lg:h-8 lg:w-8 text-terminal-green" />
              <h1 className="text-lg lg:text-2xl font-bold text-terminal-green">
                TuneMate
              </h1>
            </div>
            <div className="hidden sm:flex items-center space-x-1 text-terminal-muted">
              <span>{'>'}</span>
              <span className="text-terminal-blue text-sm lg:text-base">ACTIVE</span>
            </div>
          </div>
                     
          <div className="flex items-center space-x-2 lg:space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-terminal-muted">
              <Brain className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="text-xs lg:text-sm">AI-Powered</span>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-terminal-muted">
              <Zap className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="text-xs lg:text-sm">Real-time</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}