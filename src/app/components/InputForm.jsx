// src/components/InputForm.jsx
import { MessageSquare, FileText } from 'lucide-react'

export default function InputForm({ inputText, setInputText, contextText, setContextText }) {
  return (
    <div className="space-y-4">
      {/* Primary Input */}
      <div className="bg-terminal-card border border-terminal-border rounded-lg p-3 lg:p-4 terminal-glow">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-terminal-green">{'>'}</span>
          <span className="text-terminal-green font-mono text-sm lg:text-base">PRIMARY_TEXT:</span>
        </div>
        
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 h-4 w-4 lg:h-5 lg:w-5 text-terminal-muted" />
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter your message here..."
            className="w-full bg-black/30 border border-terminal-border rounded-md pl-10 lg:pl-12 pr-4 py-3 text-sm lg:text-base text-terminal-text placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-terminal-green/50 focus:border-terminal-green resize-none"
            rows="3"
          />
        </div>
      </div>

      {/* Context Input */}
      <div className="bg-terminal-card border border-terminal-border rounded-lg p-3 lg:p-4">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-terminal-blue">{'>'}</span>
          <span className="text-terminal-blue font-mono text-sm lg:text-base">CONTEXT:</span>
          <span className="text-terminal-muted text-xs lg:text-sm">(optional)</span>
        </div>
        
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-4 w-4 lg:h-5 lg:w-5 text-terminal-muted" />
          <textarea
            value={contextText}
            onChange={(e) => setContextText(e.target.value)}
            placeholder="Add context or background information..."
            className="w-full bg-black/30 border border-terminal-border rounded-md pl-10 lg:pl-12 pr-4 py-3 text-sm lg:text-base text-terminal-text placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-terminal-blue/50 focus:border-terminal-blue resize-none"
            rows="2"
          />
        </div>
      </div>
    </div>
  )
}
