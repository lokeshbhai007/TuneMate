// src/app/api/simplify/route.js
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

    // Create the prompt for text simplification
    const prompt = `You are a professional text simplification assistant. Analyze the following text and provide simplified versions that are easier to understand while maintaining the original meaning.

TEXT TO SIMPLIFY: "${PRIMARY_TEXT}"
${CONTEXT_TEXT ? `CONTEXT: "${CONTEXT_TEXT}"` : ''}

Respond with ONLY a valid JSON object in this exact format:
{
  "options": [
    "First simplified version - make it clearer and easier to understand",
    "Second simplified version - use simpler words and shorter sentences",
    "Third simplified version - make it even more accessible for general audience"
  ]
}

IMPORTANT RULES:
1. Provide exactly 3 different simplified versions
2. Use simpler vocabulary and shorter sentences
3. Maintain the original meaning and key information
4. Make each version progressively simpler
5. Consider the context if provided to maintain relevance
6. Return ONLY the JSON object, no additional text, no markdown formatting
7. Each option should be a complete, standalone text
8. Use everyday language that anyone can understand
9. Break down complex ideas into simpler concepts
10. Keep the tone appropriate for the content type`;

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
          `Simple version: ${PRIMARY_TEXT.length > 100 ? PRIMARY_TEXT.substring(0, 100) + '...' : PRIMARY_TEXT}`,
          `Easy to read: ${PRIMARY_TEXT.split(' ').slice(0, 15).join(' ')}${PRIMARY_TEXT.split(' ').length > 15 ? '...' : ''}`,
          `Basic form: ${PRIMARY_TEXT.substring(0, 80)}${PRIMARY_TEXT.length > 80 ? '...' : ''}`
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
        aiResponse.options.push(`Simplified: ${PRIMARY_TEXT}`);
      } else if (aiResponse.options.length === 1) {
        aiResponse.options.push(`Easier version: ${PRIMARY_TEXT}`);
      } else {
        aiResponse.options.push(`Basic form: ${PRIMARY_TEXT}`);
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
      aiResponse.options.push(`Simplified version ${aiResponse.options.length + 1}: ${PRIMARY_TEXT}`);
    }

    // Return the response in the expected format
    return Response.json({
      'simplify': aiResponse
    });

  } catch (error) {
    console.error('Error in simplify API:', error);
    
    // Return error response
    return Response.json(
      { error: 'Failed to process text simplification request' },
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