// src/app/api/fix-grammer/route.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    // Parse the request body
    const { PRIMARY_TEXT } = await request.json();

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

    // Create the prompt for grammar correction
    const prompt = `You are a professional grammar correction assistant. Analyze the following text and provide a comprehensive grammar correction.

TEXT TO ANALYZE: "${PRIMARY_TEXT}"

Respond with ONLY a valid JSON object in this exact format:
{
  "corrected": "The grammatically corrected version of the text",
  "errors": [
    "Description of error 1 with explanation",
    "Description of error 2 with explanation"
  ],
  "tips": [
    "Grammar tip 1 to help improve writing",
    "Grammar tip 2 to help improve writing"
  ]
}

IMPORTANT RULES:
1. If the text is already grammatically correct, return the original text in "corrected" field
2. If no errors are found, return: 'The sentence is perfectly fine.'
3. Always provide at least 1-2 helpful tips for better writing
4. Be specific about what was wrong and how it was fixed
5. Return ONLY the JSON object, no additional text, no markdown formatting
6. Ensure the corrected text maintains the original meaning and tone
7. Do not include any explanatory text outside the JSON object`;

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
      if (!aiResponse.corrected || !Array.isArray(aiResponse.errors) || !Array.isArray(aiResponse.tips)) {
        throw new Error('Invalid response structure');
      }
      
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw AI response:', text);
      
      // Try to create a fallback response
      aiResponse = {
        corrected: PRIMARY_TEXT,
        errors: [],
        tips: [
          "Consider reviewing sentence structure and punctuation",
          "Check for proper subject-verb agreement"
        ]
      };
    }

    // Final validation and cleanup
    if (!aiResponse.corrected || typeof aiResponse.corrected !== 'string') {
      aiResponse.corrected = PRIMARY_TEXT;
    }
    
    if (!Array.isArray(aiResponse.errors)) {
      aiResponse.errors = [];
    }
    
    if (!Array.isArray(aiResponse.tips)) {
      aiResponse.tips = ["Consider reviewing grammar and punctuation"];
    }
    
    // Ensure tips array is not empty
    if (aiResponse.tips.length === 0) {
      aiResponse.tips = [
        "Great job! Your text appears to be grammatically correct",
        "Consider varying sentence length for better readability"
      ];
    }

    // Return the response in the expected format
    return Response.json({
      'fix-grammar': aiResponse
    });

  } catch (error) {
    console.error('Error in fix-grammer API:', error);
    
    // Return error response
    return Response.json(
      { error: 'Failed to process grammar correction request' },
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