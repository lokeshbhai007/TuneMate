// src/app/api/generate-question/route.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { topic, difficulty = 'beginner', questionType = 'random' } = await request.json();
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Determine question type randomly if not specified
    const questionTypes = ['conversation', 'dsa', 'tech', 'aptitude'];
    const selectedType = questionType === 'random' 
      ? questionTypes[Math.floor(Math.random() * questionTypes.length)]
      : questionType;
    
    let prompt = '';
    
    switch (selectedType) {
      case 'conversation':
        prompt = `
Generate a simple English conversation question for teenagers to practice speaking.

Topic: ${topic || 'general'}
Difficulty: ${difficulty}

Requirements:
- Question should be engaging for teenagers (13-18 years)
- Encourage 2-3 sentence answers
- Should be about everyday life, interests, or simple opinions
- Avoid complex or sensitive topics

Return the response in this JSON format:
{
  "english": "[The English question]",
  "topic": "[Topic category like 'Hobbies', 'Food', 'Friends', etc.]",
  "expectedLength": "[Short/Medium - how long the answer should be]",
  "type": "conversation"
}

Examples:
- "What is your favorite way to spend weekends?"
- "Describe a movie you watched recently."
- "What makes you happy on a bad day?"
        `;
        break;
        
      case 'dsa':
        prompt = `
Generate a Data Structures & Algorithms question suitable for learning.

Difficulty: ${difficulty}
Topic: ${topic || 'arrays, strings, or basic algorithms'}

Requirements:
- Question should be educational and clear
- Appropriate for ${difficulty} level
- Include a brief explanation or hint if needed
- Should encourage problem-solving thinking

Return the response in this JSON format:
{
  "english": "[The DSA question/problem]",
  "topic": "[DSA topic like 'Arrays', 'Strings', 'Sorting', 'Recursion', etc.]",
  "expectedLength": "[Short/Medium/Long - complexity of expected answer]",
  "type": "dsa",
  "hint": "[Optional hint or approach]"
}

Examples for different levels:
- Beginner: "How would you find the largest number in an array?"
- Intermediate: "Explain how binary search works and its time complexity."
- Advanced: "Design an algorithm to find the longest palindromic substring."
        `;
        break;
        
      case 'tech':
        prompt = `
Generate a technology/development question for learning and discussion.

Difficulty: ${difficulty}
Topic: ${topic || 'web development, programming concepts, or technology trends'}

Requirements:
- Question should be relevant to current technology
- Appropriate for ${difficulty} level developers/learners
- Encourage understanding of concepts, not just memorization
- Can cover web dev, mobile dev, frameworks, tools, or general programming

Return the response in this JSON format:
{
  "english": "[The tech/development question]",
  "topic": "[Tech area like 'Web Development(MERN stack)', 'JavaScript', 'React', 'APIs', etc.]",
  "expectedLength": "[Short/Medium/Long - expected answer depth]",
  "type": "tech"
}

Examples:
- Beginner: "What is the difference between HTML and CSS?"
- Intermediate: "Explain the concept of state management in React."
- Advanced: "How would you optimize a web application's performance?"
        `;
        break;
        
      case 'aptitude':
        prompt = `
Generate an aptitude question to test logical thinking and problem-solving.

Difficulty: ${difficulty}
Topic: ${topic || 'logical reasoning, quantitative, or analytical thinking'}

Requirements:
- Question should test analytical or logical thinking
- at the time of generating question if you are used any name ensure that the name of the person is indian tone
- Appropriate for ${difficulty} level
- Can include puzzles, logical reasoning, basic math, or pattern recognition
- Should have a clear answer approach

Return the response in this JSON format:
{
  "english": "[The aptitude question]",
  "topic": "[Aptitude area like 'Logical Reasoning', 'Quantitative', 'Patterns', etc.]",
  "expectedLength": "[Short/Medium - expected solution explanation length]",
  "type": "aptitude",
  "solution": "[Brief solution approach or answer]"
}

Examples:
- "If you arrange the numbers 1-9 in a 3x3 grid, what's the minimum sum possible for any row?"
- "A clock shows 3:15. What is the angle between the hour and minute hands?"
- "Complete the pattern: 2, 6, 12, 20, 30, ?"
        `;
        break;
        
      default:
        selectedType = 'conversation';
        prompt = `
Generate a simple English conversation question for teenagers to practice speaking.

Topic: ${topic || 'general'}
Difficulty: ${difficulty}

Requirements:
- Question should be engaging for teenagers (13-18 years)
- Encourage 2-3 sentence answers
- Should be about everyday life, interests, or simple opinions
- Avoid complex or sensitive topics

Return the response in this JSON format:
{
  "english": "[The English question]",
  "topic": "[Topic category like 'Hobbies', 'Food', 'Friends', etc.]",
  "expectedLength": "[Short/Medium - how long the answer should be]",
  "type": "conversation"
}
        `;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    let questionData;
    try {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonString = text.slice(jsonStart, jsonEnd);
      questionData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      
      // Fallback questions based on selected type
      const fallbackQuestions = {
        conversation: [
          {
            english: "What is your favorite hobby and why do you enjoy it?",
            topic: "Hobbies",
            expectedLength: "Medium",
            type: "conversation"
          },
          {
            english: "Describe your best friend to me.",
            topic: "Relationships", 
            expectedLength: "Medium",
            type: "conversation"
          }
        ],
        dsa: [
          {
            english: "How would you reverse a string without using built-in functions?",
            topic: "Strings",
            expectedLength: "Medium",
            type: "dsa",
            hint: "Think about swapping characters from both ends"
          },
          {
            english: "Explain what Big O notation means and give an example.",
            topic: "Complexity Analysis",
            expectedLength: "Medium", 
            type: "dsa"
          }
        ],
        tech: [
          {
            english: "What is the difference between frontend and backend development?",
            topic: "Web Development",
            expectedLength: "Medium",
            type: "tech"
          },
          {
            english: "Why is version control (like Git) important in software development?",
            topic: "Development Tools",
            expectedLength: "Medium",
            type: "tech"
          }
        ],
        aptitude: [
          {
            english: "If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?",
            topic: "Logical Reasoning",
            expectedLength: "Short",
            type: "aptitude",
            solution: "5 minutes - each machine makes 1 widget in 5 minutes"
          },
          {
            english: "Find the next number in the sequence: 1, 4, 9, 16, 25, ?",
            topic: "Patterns",
            expectedLength: "Short",
            type: "aptitude",
            solution: "36 - these are perfect squares (1², 2², 3², 4², 5², 6²)"
          }
        ]
      };
      
      const fallbacks = fallbackQuestions[selectedType] || fallbackQuestions.conversation;
      questionData = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    return NextResponse.json(questionData);
    
  } catch (error) {
    console.error('Error generating question:', error);
    return NextResponse.json(
      { error: 'Failed to generate question. Please try again.' },
      { status: 500 }
    );
  }
}