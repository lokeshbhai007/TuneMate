// src/app/api/reply-generate/route.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    // Parse the request body
    const { inputText, contextText } = await request.json();

    // Validate required fields
    if (!inputText || inputText.trim() === '') {
      return NextResponse.json(
        { error: 'Primary text is required' },
        { status: 400 }
      );
    }

    // Get the Gemini model (using gemini-2.0-flash-exp as requested)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Construct the prompt for reply generation
    const prompt = `You are an AI assistant that generates appropriate reply suggestions for messages. 

PRIMARY MESSAGE TO REPLY TO:
"${inputText}"

${contextText ? `CONTEXT INFORMATION:
"${contextText}"` : ''}

Please generate 3-4 different reply options that are shuold be in english:
1. Appropriate and contextually relevant
2. Varied in tone (professional, friendly, casual, etc.)
3. Clear and concise
4. Helpful and constructive

Format your response as a JSON array of strings:
[
  "Reply text here",
  "Another reply option here",
  "Third reply option here"
]

Only return the JSON array of strings, no additional text or formatting.`;

    // Generate content using Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response - remove markdown code blocks if present
    text = text.trim();
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Try to parse the JSON response
    let options;
    try {
      options = JSON.parse(text);
    } catch (parseError) {
      // If JSON parsing fails, create a fallback response
      console.error('Failed to parse Gemini response as JSON:', parseError);
      console.error('Raw response text:', text);
      options = [
        "Thank you for your message. I'll get back to you soon.",
        "Thanks for reaching out! I appreciate you sharing this with me.",
        "Got it, thanks for letting me know!"
      ];
    }

    // Validate the options array
    if (!Array.isArray(options) || options.length === 0) {
      return NextResponse.json(
        { error: 'Invalid response format from AI model' },
        { status: 500 }
      );
    }

    // Return the suggestions in the expected format
    return NextResponse.json({
      'reply-suggestion': {
        options: options
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating reply suggestions:', error);
    
    // Return appropriate error response
    if (error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'AI service configuration error' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate reply suggestions' },
      { status: 500 }
    );
  }
}

// Handle unsupported HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}