// src/app/api/evaluate/route.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { question, answer } = await request.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
You are an expert English tutor evaluating a teenager's spoken English answer. 

Question: "${question}"
Student's Answer: "${answer}"

Please evaluate the answer and provide feedback in the following JSON format:

{
  "score": [number from 0-10],
  "feedback": "[A encouraging paragraph explaining the overall quality]",
  "mistakes": ["[specific grammar/pronunciation issues]", "[another mistake if any]"],
  "improved": "[A more fluent, natural version of their answer - keep it teen-friendly]",
  "strengths": ["[what they did well]", "[another strength]"]
}

Evaluation Criteria:
- Grammar accuracy (30%)
- Vocabulary usage (25%) 
- Fluency and naturalness (25%)
- Content relevance (20%)

Be encouraging and constructive. Focus on helping them improve while acknowledging their efforts.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    let evaluation;
    try {
      // Clean up the response to extract JSON
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonString = text.slice(jsonStart, jsonEnd);
      evaluation = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback response
      evaluation = {
        score: 7,
        feedback: "Good effort! Keep practicing to improve your fluency.",
        mistakes: ["Consider reviewing grammar rules for better accuracy."],
        improved: answer,
        strengths: ["You expressed your thoughts clearly.", "Good attempt at answering the question."]
      };
    }

    return NextResponse.json(evaluation);

  } catch (error) {
    console.error('Error evaluating answer:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate answer. Please try again.' },
      { status: 500 }
    );
  }
}