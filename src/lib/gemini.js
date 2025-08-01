// src/lib/gemini.js - Utility functions for API calls
export class GeminiAPI {
  static async evaluateAnswer(question, answer) {
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, answer }),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate answer');
      }

      return await response.json();
    } catch (error) {
      console.error('Error evaluating answer:', error);
      throw error;
    }
  }

  static async generateQuestion(topic = null, difficulty = 'beginner') {
    try {
      const response = await fetch('/api/generate-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, difficulty }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate question');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating question:', error);
      throw error;
    }
  }

  static async translateText(text, targetLang = 'bengali') {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, targetLang }),
      });

      if (!response.ok) {
        throw new Error('Failed to translate text');
      }

      return await response.json();
    } catch (error) {
      console.error('Error translating text:', error);
      throw error;
    }
  }

  static async checkGrammar(text) {
    try {
      const response = await fetch('/api/grammar-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to check grammar');
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking grammar:', error);
      throw error;
    }
  }
}