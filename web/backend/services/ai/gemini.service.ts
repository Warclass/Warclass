import { GoogleGenerativeAI } from '@google/generative-ai';

// Validar que la API key esté configurada
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export class GeminiService {
  static async generateQuizQuestions(topic: string, difficulty: string, count: number) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `
        Genera ${count} preguntas de opción múltiple para un quiz sobre "${topic}" con dificultad "${difficulty}".
        
        El formato de respuesta DEBE ser un JSON válido con la siguiente estructura:
        [
          {
            "question": "Texto de la pregunta",
            "answers": [
              { "text": "Opción 1", "isCorrect": true },
              { "text": "Opción 2", "isCorrect": false },
              { "text": "Opción 3", "isCorrect": false },
              { "text": "Opción 4", "isCorrect": false }
            ],
            "points": 10,
            "timeLimit": 30
          }
        ]

        Reglas:
        1. Genera EXACTAMENTE ${count} preguntas.
        2. Cada pregunta debe tener EXACTAMENTE 4 opciones.
        3. Solo una opción debe ser correcta (isCorrect: true).
        4. El JSON debe ser puro, sin markdown (sin \`\`\`json).
        5. El idioma debe ser Español.
        6. Los puntos deben ser 10, 15 o 20 según la dificultad.
        7. El tiempo límite debe ser 30, 45 o 60 segundos según la dificultad.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Limpiar el texto si viene con markdown
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

      const questions = JSON.parse(cleanText);

      // 🎲 Mezclar las respuestas de cada pregunta aleatoriamente
      // para que la respuesta correcta no siempre esté en la primera posición
      const shuffledQuestions = questions.map((question: any) => {
        // Función para mezclar un array (Fisher-Yates shuffle)
        const shuffleArray = (array: any[]) => {
          const shuffled = [...array];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          return shuffled;
        };

        return {
          ...question,
          answers: shuffleArray(question.answers)
        };
      });

      return shuffledQuestions;
    } catch (error: any) {
      console.error('Error generating quiz with Gemini:', error);

      if (!process.env.GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY is missing in environment variables');
        throw new Error('GEMINI_API_KEY is not configured. Please add it to your .env file.');
      }

      throw new Error(`Failed to generate quiz questions: ${error.message}`);
    }
  }
}
