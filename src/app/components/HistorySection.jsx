// src/components/HistorySection.jsx
import { History, Trash2, RotateCcw, Copy, Check, ChevronDown, ChevronUp, CheckCircle, Lightbulb, Heart, MessageCircle } from 'lucide-react'
import { useState } from 'react'

export default function HistorySection({ history, onClearHistory, onDeleteItem }) {
  const [copiedId, setCopiedId] = useState(null)
  const [expandedItems, setExpandedItems] = useState(new Set())

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const getCopyId = (type, index, itemId) => {
    return `${type}-${index}-${itemId}`
  }

  const toggleExpanded = (id) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActionConfig = (action) => {
    const configs = {
      'fix-grammar': {
        label: 'Fix Grammar',
        icon: CheckCircle,
        color: 'green'
      },
      'simplify': {
        label: 'Simplify',
        icon: Lightbulb,
        color: 'blue'
      },
      'make-polite': {
        label: 'Make Polite',
        icon: Heart,
        color: 'purple'
      },
      'reply-suggestion': {
        label: 'Reply Ideas',
        icon: MessageCircle,
        color: 'yellow'
      }
    }
    return configs[action] || { label: action, icon: History, color: 'blue' }
  }

  const formatResult = (result) => {
    if (typeof result === 'string') {
      try {
        return JSON.parse(result)
      } catch {
        return result
      }
    }
    return result
  }

  const renderResultContent = (result, itemId) => {
    const formattedResult = formatResult(result)
    
    if (typeof formattedResult === 'object') {
      return (
        <div className="space-y-4">
          {formattedResult.corrected && (
            <div>
              <h4 className="text-sm font-medium text-terminal-green mb-2">Corrected Text:</h4>
              <div className="bg-terminal-card/50 rounded p-3 border border-terminal-border/50 group">
                <div className="flex items-start justify-between">
                  <p className="text-terminal-text flex-1 pr-2">{formattedResult.corrected}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      const copyId = getCopyId('corrected', 0, itemId)
                      copyToClipboard(formattedResult.corrected, copyId)
                    }}
                    className="text-terminal-muted hover:text-terminal-text transition-colors opacity-0 group-hover:opacity-100"
                  >
                    {copiedId === getCopyId('corrected', 0, itemId) ? (
                      <Check className="h-4 w-4 text-terminal-green" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {formattedResult.options && (
            <div>
              <h4 className="text-sm font-medium text-terminal-blue mb-2">Options:</h4>
              <div className="space-y-2">
                {formattedResult.options.map((option, index) => (
                  <div key={index} className="bg-terminal-card/50 rounded p-3 border border-terminal-border/50 group">
                    <div className="flex items-start justify-between">
                      <p className="text-terminal-text flex-1 pr-2">{option}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const copyId = getCopyId('option', index, itemId)
                          copyToClipboard(option, copyId)
                        }}
                        className="text-terminal-muted hover:text-terminal-text transition-colors opacity-0 group-hover:opacity-100"
                      >
                        {copiedId === getCopyId('option', index, itemId) ? (
                          <Check className="h-4 w-4 text-terminal-green" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {formattedResult.errors && (
            <div>
              <h4 className="text-sm font-medium text-terminal-red mb-2">Errors Found:</h4>
              <div className="space-y-2">
                {formattedResult.errors.map((error, index) => (
                  <div key={index} className="bg-terminal-card/50 rounded p-3 border border-terminal-border/50 group">
                    <div className="flex items-start justify-between">
                      <p className="text-terminal-text flex-1 pr-2">{error}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const copyId = getCopyId('error', index, itemId)
                          copyToClipboard(error, copyId)
                        }}
                        className="text-terminal-muted hover:text-terminal-text transition-colors opacity-0 group-hover:opacity-100"
                      >
                        {copiedId === getCopyId('error', index, itemId) ? (
                          <Check className="h-4 w-4 text-terminal-green" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {formattedResult.tips && (
            <div>
              <h4 className="text-sm font-medium text-terminal-yellow mb-2">Tips:</h4>
              <div className="space-y-2">
                {formattedResult.tips.map((tip, index) => (
                  <div key={index} className="bg-terminal-card/50 rounded p-3 border border-terminal-border/50 group">
                    <div className="flex items-start justify-between">
                      <p className="text-terminal-text flex-1 pr-2">{tip}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const copyId = getCopyId('tip', index, itemId)
                          copyToClipboard(tip, copyId)
                        }}
                        className="text-terminal-muted hover:text-terminal-text transition-colors opacity-0 group-hover:opacity-100"
                      >
                        {copiedId === getCopyId('tip', index, itemId) ? (
                          <Check className="h-4 w-4 text-terminal-green" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }
    
    return (
      <div className="bg-terminal-card/50 rounded p-3 border border-terminal-border/50 group">
        <div className="flex items-start justify-between">
          <p className="text-terminal-text flex-1 pr-2">{formattedResult}</p>
          <button
            onClick={(e) => {
              e.stopPropagation()
              const copyId = getCopyId('single', 0, itemId)
              copyToClipboard(formattedResult, copyId)
            }}
            className="text-terminal-muted hover:text-terminal-text transition-colors opacity-0 group-hover:opacity-100"
          >
            {copiedId === getCopyId('single', 0, itemId) ? (
              <Check className="h-4 w-4 text-terminal-green" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="w-full mt-8 pt-8 border-t border-terminal-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-terminal-green">{'>'}</span>
            <span className="text-terminal-green font-mono text-sm lg:text-base">HISTORY:</span>
          </div>
        </div>
        
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-8 text-center">
          <div className="flex flex-col items-center space-y-4 text-terminal-muted">
            <History className="h-12 w-12" />
            <div>
              <div className="font-medium text-base">No history yet</div>
              <div className="text-sm">Your past queries will appear here</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full mt-8 pt-8 border-t border-terminal-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-terminal-green">{'>'}</span>
          <span className="text-terminal-green font-mono text-sm lg:text-base">HISTORY:</span>
        </div>
        
        <button
          onClick={onClearHistory}
          className="flex items-center space-x-2 text-terminal-red hover:text-terminal-red/80 transition-colors "
        >
          <RotateCcw className="h-4 w-4" />
          <span className="text-sm">Clear All</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {history.map((item) => {
          const actionConfig = getActionConfig(item.action)
          const Icon = actionConfig.icon
          const isExpanded = expandedItems.has(item.id)
          
          return (
            <div key={item.id} className="bg-terminal-card border border-terminal-border rounded-lg hover-glow">
              {/* Header - Always visible */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-terminal-${actionConfig.color}/20`}>
                      <Icon className={`h-4 w-4 text-terminal-${actionConfig.color}`} />
                    </div>
                    <div>
                      <div className="font-medium text-terminal-text text-sm">
                        {actionConfig.label}
                      </div>
                      <div className="text-xs text-terminal-muted">
                        {formatDate(item.timestamp)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleExpanded(item.id)
                      }}
                      className="text-terminal-muted hover:text-terminal-text transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteItem(item.id)
                      }}
                      className="text-terminal-red hover:text-terminal-red/80 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Input - Always visible - Clickable to expand */}
                <div 
                  className="bg-black/30 rounded p-3 border border-terminal-border/50 cursor-pointer hover:bg-black/40 transition-colors"
                  onClick={() => toggleExpanded(item.id)}
                >
                  <div className="text-xs text-terminal-muted mb-1">Input:</div>
                  <div className="text-sm text-terminal-text line-clamp-2">
                    {item.input}
                  </div>
                </div>
              </div>
              
              {/* Expanded content - Only visible when expanded */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-terminal-border/50">
                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-terminal-muted">Result:</div>
                      <button
                        onClick={() => copyToClipboard(item.result, item.id)}
                        className="text-terminal-muted hover:text-terminal-text transition-colors"
                      >
                        {copiedId === item.id ? (
                          <Check className="h-4 w-4 text-terminal-green" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    
                    {renderResultContent(item.result, item.id)}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}