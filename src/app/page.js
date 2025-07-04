// src/app/page.jsx - Updated with Clear All functionality and mobile auto-scroll
'use client'

import { useState, useRef, useEffect } from 'react'
import Header from './components/Header'
import InputForm from './components/InputForm'
import OutputDisplay from './components/OutputDisplay'
import ActionButtons from './components/ActionButtons'
import HistorySection from './components/HistorySection'

export default function Home() {
  const [inputText, setInputText] = useState('')
  const [contextText, setContextText] = useState('')
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)
  const [activeAction, setActiveAction] = useState('')
  const [lastAction, setLastAction] = useState('') // Track the last completed action
  const [history, setHistory] = useState([])
  
  // Ref for the output container
  const outputContainerRef = useRef(null)

  // Function to check if device is mobile
  const isMobileDevice = () => {
    return window.innerWidth <= 768 // Tailwind's md breakpoint
  }

  // Function to scroll to output container
  const scrollToOutput = () => {
    if (outputContainerRef.current && isMobileDevice()) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        outputContainerRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        })
      }, 100)
    }
  }

  // Effect to scroll when results are updated
  useEffect(() => {
    if (lastAction && results[lastAction]) {
      scrollToOutput()
    }
  }, [results, lastAction])

  const addToHistory = (action, input, result) => {
    const historyItem = {
      id: Date.now() + Math.random(), // Simple ID generation
      action,
      input,
      result: typeof result === 'object' ? JSON.stringify(result, null, 2) : result,
      timestamp: Date.now()
    }
    
    setHistory(prev => [historyItem, ...prev]) // Add to beginning of array
  }

  const handleAction = async (action) => {
    if (!inputText.trim()) return
    
    setLoading(true)
    setActiveAction(action)
    
    let result;
    
    if (action === 'fix-grammar') {
      // Handle grammar fixing with actual API call
      try {
        const response = await fetch('/api/fix-grammar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            PRIMARY_TEXT: inputText.trim()
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        result = data['fix-grammar'];
        
      } catch (error) {
        console.error('Error fixing grammar:', error);
        // Fallback to mock data if API fails
        result = {
          corrected: "Problem in api request fetching",
          errors: [
            "request is not fetching",
            "error, request is not fetching"
          ],
          tips: [
            "request is not fetching, system error",
            "request is not fetching, system fallback"
          ]
        };
      }
    } else if (action === 'reply-suggestion') {
      // Handle reply generation with actual API call
      try {
        const response = await fetch('/api/reply-generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputText: inputText.trim(),
            contextText: contextText?.trim() || ''
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        result = data['reply-suggestion'];
        
      } catch (error) {
        console.error('Error generating reply suggestions:', error);
        // Fallback to mock data if API fails
        result = {
          options: [
            "request is not fetching",
            "request is not fetching",
            "request is not fetching"
          ]
        };
      }
    } else if (action === 'simplify') {
      // Handle simplify with actual API call
      try {
        const response = await fetch('/api/simplify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            PRIMARY_TEXT: inputText.trim(),
            CONTEXT_TEXT: contextText?.trim() || ''
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        result = data['simplify'];
        
      } catch (error) {
        console.error('Error simplifying text:', error);
        // Fallback to mock data if API fails
        result = {
          options: [
            "Problem in api request fetching",
            "Error, request is not fetching",
            "System error, request is not fetching"
          ]
        };
      }
    } else if (action === 'make-polite') {
      // Handle make-polite with actual API call (you can implement this similarly)
      try {
        const response = await fetch('/api/make-polite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            PRIMARY_TEXT: inputText.trim(),
            CONTEXT_TEXT: contextText?.trim() || ''
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        result = data['make-polite'];
        
      } catch (error) {
        console.error('Error making text polite:', error);
        // Fallback to mock data if API fails
        result = {
          options: [
            "Problem in api request fetching",
            "Error, request is not fetching", 
            "System error, request is not fetching"
          ]
        };
      }
    } else {
      // Fallback for any other actions - simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockResults = {
        'other-action': {
          options: [
            "Mock result for other actions",
            "This is a placeholder",
            "Add your API integration here"
          ]
        }
      }
      
      result = mockResults[action] || { options: ["Unknown action"] }
    }
    
    setResults(prev => ({
      ...prev,
      [action]: result
    }))
    
    // Set the last completed action
    setLastAction(action)
    
    // Add to history
    addToHistory(action, inputText, result)
    
    setLoading(false)
    setActiveAction('')
  }

  const handleClearAll = () => {
    setInputText('')
    setContextText('')
    setResults({})
    setLastAction('')
    setActiveAction('')
    setLoading(false)
  }

  const handleClearHistory = () => {
    setHistory([])
  }

  const handleDeleteHistoryItem = (id) => {
    setHistory(prev => prev.filter(item => item.id !== id))
  }

  return (
    <div className="min-h-screen bg-terminal-bg">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Input */}
          <div className="space-y-6">
            <InputForm
              inputText={inputText}
              setInputText={setInputText}
              contextText={contextText}
              setContextText={setContextText}
            />
            
            <ActionButtons
              onAction={handleAction}
              loading={loading}
              activeAction={activeAction}
              disabled={!inputText.trim()}
              inputText={inputText}
              contextText={contextText}
              onClearAll={handleClearAll}
            />
          </div>
          
          {/* Right Panel - Output */}
          <div ref={outputContainerRef} className="scroll-mt-4">
            <OutputDisplay
              results={results}
              loading={loading}
              activeAction={activeAction}
              lastAction={lastAction}
            />
          </div>
        </div>
        
        {/* Full-width History Section */}
        <HistorySection
          history={history}
          onClearHistory={handleClearHistory}
          onDeleteItem={handleDeleteHistoryItem}
        />
      </main>
    </div>
  )
}