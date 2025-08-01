// src/app/api/translate/route.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { text, targetLang = 'bengali' } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text to translate is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
Translate the following English text to ${targetLang === 'bengali' ? 'Bengali' : targetLang}:

"${text}"

Requirements:
- Provide accurate, natural translation
- Keep the same tone and meaning
- Use common, everyday language that teenagers would understand

Return only the translated text, no additional formatting or explanation.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text().trim();

    return NextResponse.json({ 
      original: text,
      translated: translatedText,
      targetLang 
    });

  } catch (error) {
    console.error('Error translating text:', error);
    return NextResponse.json(
      { error: 'Failed to translate text. Please try again.' },
      { status: 500 }
    );
  }
}
