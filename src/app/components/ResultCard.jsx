// src/components/ResultCard.jsx
import { Copy, CheckCircle, Lightbulb, Heart, MessageCircle, Check } from 'lucide-react'
import { useState } from 'react'

export default function ResultCard({ action, data }) {
  const [copiedIndex, setCopiedIndex] = useState(null)

  const actionConfig = {
    'fix-grammar': {
      title: 'Grammar Correction',
      icon: CheckCircle,
      color: 'green'
    },
    'simplify': {
      title: 'Simplified Options',
      icon: Lightbulb,
      color: 'blue'
    },
    'make-polite': {
      title: 'Polite Versions',
      icon: Heart,
      color: 'purple'
    },
    'reply-suggestion': {
      title: 'Reply Suggestions',
      icon: MessageCircle,
      color: 'yellow'
    }
  }

  const config = actionConfig[action]
  const Icon = config.icon

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  return (
    <div className="bg-black/30 border border-terminal-border rounded-lg p-3 lg:p-4 hover-glow">
      <div className="flex items-center space-x-2 mb-3 lg:mb-4">
        <Icon className={`h-4 w-4 lg:h-5 lg:w-5 text-terminal-${config.color}`} />
        <h3 className="font-medium text-terminal-text text-sm lg:text-base">{config.title}</h3>
      </div>

      {action === 'fix-grammar' && (
        <div className="space-y-3 lg:space-y-4">
          {/* Corrected Text */}
          <div className="bg-terminal-card border border-terminal-border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm font-medium text-terminal-green">Corrected:</span>
              <button
                onClick={() => copyToClipboard(data.corrected, 'corrected')}
                className="p-1 rounded hover:bg-white/10 transition-colors"
              >
                {copiedIndex === 'corrected' ? (
                  <Check className="h-3 w-3 lg:h-4 lg:w-4 text-terminal-green" />
                ) : (
                  <Copy className="h-3 w-3 lg:h-4 lg:w-4 text-terminal-muted" />
                )}
              </button>
            </div>
            <p className="text-terminal-text text-sm lg:text-base">{data.corrected}</p>
          </div>

          {/* Errors */}
          <div className="bg-terminal-red/20 border border-terminal-red/50 rounded-lg p-3">
            <h4 className="text-xs lg:text-sm font-medium text-terminal-red mb-2">What Was Wrong:</h4>
            <ul className="space-y-1">
              {data.errors.map((error, index) => (
                <li key={index} className="text-xs lg:text-sm text-terminal-green/60">• {error}</li>
              ))}
            </ul>
          </div>

          {/* Learning Tips */}
          <div className="bg-terminal-blue/20 border border-terminal-blue/50 rounded-lg p-3">
            <h4 className="text-xs lg:text-sm font-medium text-terminal-blue mb-2">Learn This:</h4>
            <ul className="space-y-1">
              {data.tips.map((tip, index) => (
                <li key={index} className="text-xs lg:text-sm text-terminal-green/60 pb-1">• {tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {(action === 'simplify' || action === 'make-polite' || action === 'reply-suggestion') && (
        <div className="space-y-3">
          {data.options.map((option, index) => (
            <div key={index} className="bg-terminal-card border border-terminal-border rounded-lg p-3 hover:border-terminal-blue/50 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs lg:text-sm font-medium text-terminal-muted">Option {index + 1}:</span>
                <button
                  onClick={() => copyToClipboard(option, index)}
                  className="p-1 rounded hover:bg-white/10 transition-colors"
                >
                  {copiedIndex === index ? (
                    <Check className="h-3 w-3 lg:h-4 lg:w-4 text-terminal-green" />
                  ) : (
                    <Copy className="h-3 w-3 lg:h-4 lg:w-4 text-terminal-muted" />
                  )}
                </button>
              </div>
              <p className="text-terminal-text text-sm lg:text-base">{option}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}