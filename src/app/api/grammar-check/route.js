// src/app/api/grammar-check/route.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text to check is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
Please check the following text for grammar, spelling, and basic writing errors:

"${text}"

Provide the response in this JSON format:
{
  "corrected": "[The corrected version of the text]",
  "errors": ["[List of specific errors found]"],
  "tips": ["[Learning tips to avoid these errors in the future]"],
  "isCorrect": [true/false - whether the original text had any errors]
}

Focus on:
- Grammar mistakes
- Spelling errors
- Punctuation issues
- Basic sentence structure
- Word choice improvements

Be helpful and educational in your feedback.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text_response = response.text();

    // Parse the JSON response
    let grammarCheck;
    try {
      const jsonStart = text_response.indexOf('{');
      const jsonEnd = text_response.lastIndexOf('}') + 1;
      const jsonString = text_response.slice(jsonStart, jsonEnd);
      grammarCheck = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      grammarCheck = {
        corrected: text,
        errors: ["Unable to process the text at this time."],
        tips: ["Please try again later."],
        isCorrect: false
      };
    }

    return NextResponse.json(grammarCheck);

  } catch (error) {
    console.error('Error checking grammar:', error);
    return NextResponse.json(
      { error: 'Failed to check grammar. Please try again.' },
      { status: 500 }
    );
  }
}