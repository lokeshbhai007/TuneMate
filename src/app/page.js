'use client'
import { useState } from 'react'
import { Copy, Check, MessageCircle, Sparkles, Info, Zap, FileText, Users, Briefcase, Hash, TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react'

export default function Home() {
  const [inputText, setInputText] = useState('')
  const [referenceText, setReferenceText] = useState('')
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState({})
  const [history, setHistory] = useState([])
  const [copiedOption, setCopiedOption] = useState(null)
  const [expandedOptions, setExpandedOptions] = useState({})
  const [error, setError] = useState('')

  const processText = async (action) => {
    if (!inputText.trim()) return

    setLoading(prev => ({ ...prev, [action]: true }))
    setError('')
    
    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText.trim(),
          reference: referenceText.trim() || null,
          action: action
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to process text')
      }

      // Process the real API response
      const processedResult = {
        result: data.result,
        options: data.options?.map(option => option.content) || [data.result],
        optionData: data.options || [], // Full option data with notes
        explanation: getExplanationForAction(action, data.options?.length || 1),
        encouragement: data.encouragement || 'Great work!',
        action: action,
        metadata: data.metadata || {}
      }
      
      setResults(prev => ({ ...prev, [action]: processedResult }))
      
      // Add to history
      const historyItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        input: inputText,
        reference: referenceText,
        action: action,
        result: data.result,
        optionCount: data.options?.length || 1
      }
      setHistory(prev => [historyItem, ...prev.slice(0, 9)])
      
    } catch (error) {
      console.error('Error processing text:', error)
      setError(error.message || 'Failed to process text. Please try again.')
      
      setResults(prev => ({ ...prev, [action]: {
        result: 'Error: Failed to process text',
        options: ['Error: Failed to process text'],
        optionData: [],
        explanation: 'There was an error processing your request.',
        encouragement: 'Please try again.',
        action: action,
        error: true
      }}))
    } finally {
      setLoading(prev => ({ ...prev, [action]: false }))
    }
  }

  const getExplanationForAction = (action, optionCount) => {
    const explanations = {
      reply: `Generated ${optionCount} different reply options with varying tones.`,
      grammar: `Grammar and spelling have been corrected with ${optionCount} variations.`,
      simplify: `Text simplified into ${optionCount} clearer versions.`,
      polite: `Made more polite with ${optionCount} different approaches.`,
      formal: `Formalized with ${optionCount} professional variations.`,
      casual: `Made more casual with ${optionCount} friendly versions.`,
      expand: `Expanded with ${optionCount} detailed variations.`,
      summarize: `Summarized into ${optionCount} concise versions.`
    }
    return explanations[action] || `Processed successfully with ${optionCount} options.`
  }

  const handleCopy = async (text, optionIndex = null) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedOption(optionIndex !== null ? optionIndex : 'main')
      setTimeout(() => setCopiedOption(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const toggleOptionDetails = (action, optionIndex) => {
    const key = `${action}-${optionIndex}`
    setExpandedOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const clearAll = () => {
    setInputText('')
    setReferenceText('')
    setResults({})
    setHistory([])
    setError('')
  }

  const getActionIcon = (action) => {
    const icons = {
      reply: MessageCircle,
      grammar: Check,
      simplify: Zap,
      polite: Users,
      formal: Briefcase,
      casual: Hash,
      expand: TrendingUp,
      summarize: TrendingDown
    }
    const IconComponent = icons[action] || Sparkles
    return <IconComponent className="w-4 h-4" />
  }

  const getActionColor = (action) => {
    const colors = {
      reply: 'from-blue-500 to-purple-600',
      grammar: 'from-green-500 to-teal-600',
      polite: 'from-pink-500 to-rose-600',
      formal: 'from-indigo-500 to-blue-600',
      casual: 'from-orange-500 to-amber-600',
      simplify: 'from-cyan-500 to-blue-600',
      expand: 'from-violet-500 to-purple-600',
      summarize: 'from-slate-500 to-gray-600'
    }
    return colors[action] || 'from-green-500 to-teal-600'
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* Header */}
      <div className="border-b border-green-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-green-400">
                <span className="text-green-500">[</span>
                TUNEMATE
                <span className="text-green-500">]</span>
              </div>
              <div className="text-sm text-green-600">
                v2.4.1 | SECURE_MODE: ACTIVE
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600">ONLINE</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-700 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-400">
              <Info className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900 border border-green-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
                <span className="text-green-500 mr-2">{'>'}</span>
                INPUT_TERMINAL
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-green-600 mb-2">
                    PRIMARY_TEXT:
                  </label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="w-full h-32 bg-black border border-green-800 rounded px-4 py-3 text-green-400 placeholder-green-700 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none"
                    placeholder="Enter your message here..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-green-600 mb-2">
                    REFERENCE_CONTEXT [OPTIONAL]:
                  </label>
                  <textarea
                    value={referenceText}
                    onChange={(e) => setReferenceText(e.target.value)}
                    className="w-full h-24 bg-black border border-green-800 rounded px-4 py-3 text-green-400 placeholder-green-700 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none"
                    placeholder="Enter reference context..."
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-900 border border-green-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
                <span className="text-green-500 mr-2">{'>'}</span>
                PROCESSING_MODULES
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'reply', label: 'GENERATE_REPLY', icon: '↩' },
                  { key: 'grammar', label: 'FIX_GRAMMAR', icon: '✓' },
                  { key: 'simplify', label: 'SIMPLIFY', icon: '⚡' },
                  { key: 'polite', label: 'MAKE_POLITE', icon: '♦' },
                  { key: 'formal', label: 'FORMALIZE', icon: '⚑' },
                  { key: 'casual', label: 'CASUALIZE', icon: '~' },
                  { key: 'expand', label: 'EXPAND', icon: '▲' },
                  { key: 'summarize', label: 'SUMMARIZE', icon: '▼' }
                ].map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => processText(key)}
                    disabled={loading[key] || !inputText.trim()}
                    className="bg-black border border-green-800 hover:border-green-500 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-green-400 px-4 py-3 rounded font-mono text-sm transition-all duration-200 flex items-center justify-center space-x-2 group"
                  >
                    <span className="text-green-500 group-hover:text-green-400">{icon}</span>
                    <span>{loading[key] ? 'PROCESSING...' : label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4 flex justify-between">
                <button
                  onClick={clearAll}
                  className="bg-red-900 border border-red-700 hover:bg-red-800 text-red-400 px-4 py-2 rounded font-mono text-sm transition-all duration-200"
                >
                  CLEAR_ALL
                </button>
                <div className="text-xs text-green-700">
                  {inputText.length} CHARS | {inputText.split(' ').length} WORDS
                </div>
              </div>
            </div>

            {/* Real Results Display */}
            {Object.keys(results).length > 0 && (
              <div className="space-y-6">
                {Object.entries(results).map(([action, data]) => (
                  <div key={action} className="bg-gray-900 border border-green-800 rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="border-b border-green-800 bg-black px-4 py-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-green-400 flex items-center">
                          <span className="text-green-500 mr-2">{'>'}</span>
                          {action.toUpperCase()}_OUTPUT
                        </h2>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded bg-gradient-to-r ${getActionColor(action)} text-white text-sm`}>
                          {getActionIcon(action)}
                          <span className="font-medium">
                            {data.error ? 'Error' : 'Results Ready'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Results Display */}
                    <div className="p-4 bg-gray-800">
                      {/* Explanation */}
                      <div className="text-green-300 mb-4 font-medium">
                        {data.explanation}
                      </div>

                      {/* Options List */}
                      <div className="space-y-3">
                        {data.options.map((option, index) => (
                          <div key={index} className="bg-black border border-green-800 rounded-lg p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-green-400 font-medium text-sm">
                                    {index + 1}. {data.optionData[index]?.title || `Option ${index + 1}`}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {data.optionData[index]?.note && (
                                      <button
                                        onClick={() => toggleOptionDetails(action, index)}
                                        className="text-green-500 hover:text-green-400 transition-colors"
                                      >
                                        {expandedOptions[`${action}-${index}`] ? 
                                          <EyeOff className="w-4 h-4" /> : 
                                          <Eye className="w-4 h-4" />
                                        }
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleCopy(option, index)}
                                      className="text-green-500 hover:text-green-400 transition-colors"
                                    >
                                      {copiedOption === index ? 
                                        <Check className="w-4 h-4" /> : 
                                        <Copy className="w-4 h-4" />
                                      }
                                    </button>
                                  </div>
                                </div>
                                <div className="text-green-300 bg-gray-900 rounded px-3 py-2 font-mono text-sm">
                                  "{option}"
                                </div>
                                {expandedOptions[`${action}-${index}`] && data.optionData[index]?.note && (
                                  <div className="mt-3 text-xs text-green-400/80 bg-gray-900 rounded p-3 border border-green-800/50">
                                    <div className="font-medium text-green-300 mb-1">Note:</div>
                                    {data.optionData[index].note}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Encouragement */}
                      {data.encouragement && !data.error && (
                        <div className="mt-4 bg-green-900/20 rounded-lg p-3 border border-green-700/50">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-green-400" />
                            <span className="text-green-300 text-sm font-medium">
                              {data.encouragement}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* History Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-900 border border-green-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
                <span className="text-green-500 mr-2">{'>'}</span>
                SYSTEM_INFO
              </h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-600">STATUS:</span>
                  <span className="text-green-400">OPERATIONAL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">ENGINE:</span>
                  <span className="text-green-400">GEMINI_AI</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">DB:</span>
                  <span className="text-green-400">MONGODB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">UPTIME:</span>
                  <span className="text-green-400">99.9%</span>
                </div>
              </div>
            </div>

            {history.length > 0 && (
              <div className="bg-gray-900 border border-green-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
                  <span className="text-green-500 mr-2">{'>'}</span>
                  HISTORY_LOG
                </h2>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {history.map((item) => (
                    <div key={item.id} className="border border-green-900 rounded p-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-green-500 font-semibold uppercase">
                          {item.action}
                        </span>
                        <span className="text-green-700">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-green-600 mb-1 truncate">
                        INPUT: {item.input}
                      </div>
                      <div className="text-green-400 truncate">
                        OUTPUT: {item.result}
                      </div>
                      {item.optionCount > 1 && (
                        <div className="text-green-500 text-xs mt-1">
                          {item.optionCount} options generated
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Copy Success Toast */}
      {copiedOption !== null && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-black px-4 py-2 rounded-lg shadow-lg border border-green-500 font-mono text-sm">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>COPIED TO CLIPBOARD</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-green-800 bg-gray-900 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-xs text-green-700">
            <div>
              © 2024 TUNEMATE | SECURE_CONNECTION | ALL_RIGHTS_RESERVED
            </div>
            <div className="flex items-center space-x-4">
              <span>CPU: 12%</span>
              <span>MEM: 34%</span>
              <span>NET: 892ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}