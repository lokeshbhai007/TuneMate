// src/components/MobileNav.jsx
import { Home, History } from 'lucide-react'

export default function MobileNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'history', label: 'History', icon: History }
  ]

  return (
    <nav className="bg-terminal-card border-b border-terminal-border">
      <div className="container mx-auto px-4">
        <div className="flex">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'text-terminal-green border-b-2 border-terminal-green'
                  : 'text-terminal-muted hover:text-terminal-text'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
