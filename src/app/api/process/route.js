// File: src/app/api/process/route.js
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import databaseService from '../../../../lib/database'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

let genAI = null

function getGeminiClient() {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
  }
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
}

// Enhanced prompts that align with TuneMate's supportive approach
const actionPrompts = {
  reply: (text, reference) => `
    You are TuneMate, a supportive English communication helper. Generate 3 different reply options to this message: "${text}". 
    ${reference ? `Context: ${reference}` : ''}
    
    Provide exactly 3 options in this format:
    1. **Friendly, Warm Reply:**
    **Reply:** [your reply here]
    **Note:** [when this tone works best]
    
    2. **Polite, Professional Reply:**
    **Reply:** [your reply here]
    **Note:** [when this tone works best]
    
    3. **Casual, Relaxed Reply:**
    **Reply:** [your reply here]
    **Note:** [when this tone works best]
  `,
  
  grammar: (text) => `
    You are TuneMate, a gentle English helper. Fix the grammar and spelling in this text: "${text}"
    
    Provide exactly 3 sections in this format:
    1. **Corrected Version:**
    [corrected text here]
    
    2. **Main Changes:**
    [brief explanation of changes]
    
    3. **Encouragement:**
    [supportive message]
  `,
  
  simplify: (text) => `
    You are TuneMate, helping make English clearer. Simplify this text: "${text}"
    
    Provide exactly 3 versions in this format:
    1. **Simplified Version:**
    [clearer version]
    
    2. **Beginner-Friendly Version:**
    [very simple version]
    
    3. **Meaning Summary:**
    [original meaning in simple words]
  `,
  
  polite: (text) => `
    You are TuneMate, helping with polite communication. Make this text more polite: "${text}"
    
    Provide exactly 3 versions in this format:
    1. **Polite & Respectful:**
    [polite version]
    
    2. **Very Formal & Courteous:**
    [formal version]
    
    3. **Friendly-Polite:**
    [friendly but polite version]
  `
}

// Enhanced response processing with structured data storage
async function processAIResponse(rawResponse, action) {
  const structuredResponse = {
    success: true,
    action: action,
    timestamp: new Date().toISOString(),
    rawResponse: rawResponse,
    processedData: {
      options: [],
      metadata: {
        totalOptions: 0,
        hasNotes: false,
        hasExplanations: false
      }
    }
  }

  try {
    // Split response into sections
    const sections = rawResponse.split(/\d+\.\s*\*\*/).filter(section => section.trim())
    
    sections.forEach((section, index) => {
      if (section.trim()) {
        const optionData = parseOptionSection(section.trim(), index)
        if (optionData) {
          structuredResponse.processedData.options.push(optionData)
        }
      }
    })

    // Update metadata
    structuredResponse.processedData.metadata.totalOptions = structuredResponse.processedData.options.length
    structuredResponse.processedData.metadata.hasNotes = structuredResponse.processedData.options.some(opt => opt.note)
    structuredResponse.processedData.metadata.hasExplanations = structuredResponse.processedData.options.some(opt => opt.explanation)

    // Add encouragement message
    structuredResponse.processedData.encouragement = getEncouragementMessage(action)

    return structuredResponse

  } catch (error) {
    console.error('Error processing AI response:', error)
    
    // Fallback to simple structure
    return {
      success: false,
      action: action,
      timestamp: new Date().toISOString(),
      rawResponse: rawResponse,
      processedData: {
        options: [{
          id: 'fallback',
          title: 'Response',
          content: rawResponse.trim(),
          type: 'fallback'
        }],
        metadata: {
          totalOptions: 1,
          hasNotes: false,
          hasExplanations: false,
          processingError: true
        }
      },
      error: 'Response processing failed, using fallback structure'
    }
  }
}

function parseOptionSection(section, index) {
  const optionData = {
    id: `option_${index + 1}`,
    title: '',
    content: '',
    note: '',
    explanation: '',
    type: 'standard'
  }

  try {
    // Extract title (everything before the first **)
    const titleMatch = section.match(/^([^*]+?)\*\*/)
    if (titleMatch) {
      optionData.title = titleMatch[1].trim().replace(/:\s*$/, '')
    }

    // Extract reply/content
    const replyMatch = section.match(/\*\*Reply:\*\*\s*([^*]+?)(?:\*\*|$)/s) ||
                     section.match(/\*\*([^:]+?):\*\*\s*([^*]+?)(?:\*\*|$)/s)
    
    if (replyMatch) {
      optionData.content = replyMatch[replyMatch.length - 1].trim()
    } else {
      // If no specific reply format, use everything after the title
      const contentMatch = section.match(/\*\*[^*]+?\*\*\s*(.+?)(?:\*\*|$)/s)
      if (contentMatch) {
        optionData.content = contentMatch[1].trim()
      }
    }

    // Extract note
    const noteMatch = section.match(/\*\*Note:\*\*\s*([^*]+?)(?:\*\*|$)/s)
    if (noteMatch) {
      optionData.note = noteMatch[1].trim()
    }

    // Extract explanation (for other action types)
    const explanationMatch = section.match(/\*\*(?:Changes|Explanation|Summary):\*\*\s*([^*]+?)(?:\*\*|$)/s)
    if (explanationMatch) {
      optionData.explanation = explanationMatch[1].trim()
    }

    return optionData

  } catch (error) {
    console.error('Error parsing option section:', error)
    return {
      id: `option_${index + 1}`,
      title: `Option ${index + 1}`,
      content: section.trim(),
      type: 'unparsed'
    }
  }
}

function getEncouragementMessage(action) {
  const messages = {
    reply: "Great! Pick the tone that feels right for your situation.",
    grammar: "You're improving! These corrections will help you communicate more clearly.",
    simplify: "Perfect! Simpler language often works better.",
    polite: "Nice work! Polite communication opens doors."
  }
  
  return messages[action] || "You're doing great! Keep practicing."
}

export async function POST(request) {
  try {
    const { text, reference, action } = await request.json()
    
    // Input validation
    if (!text || !action) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        message: 'Please provide both text and action type.' 
      }, { status: 400 })
    }
    
    if (!actionPrompts[action]) {
      return NextResponse.json({ 
        error: 'Invalid action',
        message: 'Please choose a valid action type.',
        availableActions: Object.keys(actionPrompts)
      }, { status: 400 })
    }
    
    // Generate AI response
    const model = getGeminiClient()
    const prompt = actionPrompts[action](text, reference)
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const rawText = response.text()

    console.log(rawText);
    
    
    // Process the response into structured format
    const structuredResponse = await processAIResponse(rawText, action)
    
    // Save to MongoDB using the database service
    await databaseService.connect()
    
    const historyEntry = {
      inputText: text,
      referenceText: reference,
      action: action,
      structuredResult: structuredResponse,
      timestamp: new Date(),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      sessionId: request.headers.get('x-session-id') || null,
      // Add searchable fields for easier querying
      searchableFields: {
        hasMultipleOptions: structuredResponse.processedData.options.length > 1,
        optionCount: structuredResponse.processedData.options.length,
        actionType: action,
        processingSuccess: structuredResponse.success
      }
    }
    
    const saveResult = await databaseService.saveHistoryEntry(historyEntry)
    
    if (!saveResult.success) {
      console.error('Failed to save history entry:', saveResult.error)
    }
    
    // Return structured response
    return NextResponse.json({
      success: true,
      action: action,
      timestamp: new Date().toISOString(),
      
      // Main structured data
      options: structuredResponse.processedData.options,
      metadata: structuredResponse.processedData.metadata,
      encouragement: structuredResponse.processedData.encouragement,
      
      // Backward compatibility
      result: structuredResponse.processedData.options[0]?.content || 'No result generated',
      
      // Additional info for debugging
      processingInfo: {
        optionsFound: structuredResponse.processedData.options.length,
        rawResponseLength: rawText.length,
        processingSuccess: structuredResponse.success,
        databaseSaved: saveResult.success
      }
    })
    
  } catch (error) {
    console.error('TuneMate API Error:', error)
    
    // Return user-friendly error messages
    const errorResponse = {
      success: false,
      error: 'Something went wrong',
      message: 'We\'re having trouble processing your request right now. Please try again in a moment.',
      timestamp: new Date().toISOString(),
      action: action || 'unknown'
    }
    
    // Add specific error details in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = error.message
      errorResponse.stack = error.stack
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// Health check endpoint
export async function GET() {
  try {
    // Check database connection
    await databaseService.connect()
    const dbHealth = await databaseService.healthCheck()
    
    return NextResponse.json({ 
      status: 'healthy',
      service: 'TuneMate API',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      features: {
        structuredResponses: true,
        multipleOptions: true,
        enhancedStorage: true
      },
      availableActions: Object.keys(actionPrompts),
      database: {
        connected: dbHealth.connected,
        status: dbHealth.success ? 'healthy' : 'unhealthy'
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      status: 'unhealthy',
      error: error.message,
      database: {
        connected: false,
        status: 'unhealthy'
      }
    }, { status: 500 })
  }
}