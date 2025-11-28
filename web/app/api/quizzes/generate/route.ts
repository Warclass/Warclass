import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/backend/services/ai/gemini.service';
import { authenticateToken } from '@/backend/middleware/auth/auth.middleware';

/**
 * @swagger
 * /api/quizzes/generate:
 *   post:
 *     summary: Generar preguntas de quiz con IA
 *     description: Genera preguntas de opción múltiple usando Gemini AI
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topic
 *               - difficulty
 *               - count
 *             properties:
 *               topic:
 *                 type: string
 *                 description: Tema del quiz
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *               count:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 20
 *     responses:
 *       200:
 *         description: Preguntas generadas exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
export async function POST(req: NextRequest) {
    try {
        const authError = await authenticateToken(req);
        if (authError) {
            return authError;
        }

        const body = await req.json();
        const { topic, difficulty, count } = body;

        if (!topic || !difficulty || !count) {
            return NextResponse.json(
                { error: 'Faltan campos requeridos' },
                { status: 400 }
            );
        }

        const questions = await GeminiService.generateQuizQuestions(topic, difficulty, count);

        return NextResponse.json({ questions });
    } catch (error) {
        console.error('Error in /api/quizzes/generate:', error);
        return NextResponse.json(
            { error: 'Error generando preguntas' },
            { status: 500 }
        );
    }
}
