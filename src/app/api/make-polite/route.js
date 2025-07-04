// src/app/api/make-polite/route.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    // Parse the request body
    const { PRIMARY_TEXT, CONTEXT_TEXT } = await request.json();

    // Validate input
    if (!PRIMARY_TEXT || typeof PRIMARY_TEXT !== 'string' || PRIMARY_TEXT.trim() === '') {
      return Response.json(
        { error: 'PRIMARY_TEXT is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return Response.json(
        { error: 'AI service is not configured' },
        { status: 500 }
      );
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Create the prompt for making text more polite
    const prompt = `You are a professional communication assistant. Transform the following text into more polite, courteous, and respectful versions while maintaining the original meaning and intent.

TEXT TO MAKE POLITE: "${PRIMARY_TEXT}"
${CONTEXT_TEXT ? `CONTEXT: "${CONTEXT_TEXT}"` : ''}

Respond with ONLY a valid JSON object in this exact format:
{
  "options": [
    "First polite version - add courtesy and respect",
    "Second polite version - use more formal and considerate language",
    "Third polite version - make it extremely polite and diplomatic"
  ]
}

IMPORTANT RULES:
1. Provide exactly 3 different polite versions
2. Add appropriate politeness markers (please, thank you, would you mind, etc.)
3. Use respectful and considerate language
4. Maintain the original meaning and intent
5. Make each version progressively more polite and formal
6. Consider the context if provided to match the appropriate level of formality
7. Return ONLY the JSON object, no additional text, no markdown formatting
8. Each option should be a complete, standalone text
9. Use phrases like "I would appreciate", "if possible", "would you be so kind"
10. Transform direct commands into polite requests
11. Add appropriate greetings or closing phrases where suitable
12. Maintain professional tone throughout`;

    // Generate the response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the AI response
    let aiResponse;
    try {
      // Clean the response text more thoroughly
      let cleanedText = text.trim();
      
      // Remove markdown code blocks
      cleanedText = cleanedText.replace(/```json\n?/g, '');
      cleanedText = cleanedText.replace(/\n?```/g, '');
      
      // Remove any leading/trailing whitespace or newlines
      cleanedText = cleanedText.trim();
      
      // Try to extract JSON if there's additional text
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }
      
      aiResponse = JSON.parse(cleanedText);
      
      // Validate required fields
      if (!Array.isArray(aiResponse.options) || aiResponse.options.length === 0) {
        throw new Error('Invalid response structure - options array is required');
      }
      
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw AI response:', text);
      
      // Try to create a fallback response
      aiResponse = {
        options: [
          `Please ${PRIMARY_TEXT.toLowerCase()}`,
          `I would appreciate if you could ${PRIMARY_TEXT.toLowerCase()}`,
          `Would you be so kind as to ${PRIMARY_TEXT.toLowerCase()}? Thank you very much.`
        ]
      };
    }

    // Final validation and cleanup
    if (!Array.isArray(aiResponse.options)) {
      aiResponse.options = [];
    }
    
    // Ensure we have at least 3 options
    while (aiResponse.options.length < 3) {
      if (aiResponse.options.length === 0) {
        aiResponse.options.push(`Please ${PRIMARY_TEXT}`);
      } else if (aiResponse.options.length === 1) {
        aiResponse.options.push(`I would appreciate if you could ${PRIMARY_TEXT}`);
      } else {
        aiResponse.options.push(`Would you kindly ${PRIMARY_TEXT}? Thank you.`);
      }
    }
    
    // Ensure we don't have more than 3 options
    if (aiResponse.options.length > 3) {
      aiResponse.options = aiResponse.options.slice(0, 3);
    }
    
    // Clean up any empty options
    aiResponse.options = aiResponse.options.filter(option => 
      option && typeof option === 'string' && option.trim() !== ''
    );
    
    // If we lost options during cleanup, add fallbacks
    while (aiResponse.options.length < 3) {
      aiResponse.options.push(`Polite version ${aiResponse.options.length + 1}: ${PRIMARY_TEXT}`);
    }

    // Return the response in the expected format
    return Response.json({
      'make-polite': aiResponse
    });

  } catch (error) {
    console.error('Error in make-polite API:', error);
    
    // Return error response
    return Response.json(
      { error: 'Failed to process politeness enhancement request' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return Response.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}