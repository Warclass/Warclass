import { NextRequest, NextResponse } from 'next/server';
import { QuizService } from '@/backend/services/quiz/quiz.service';
import { SubmitQuizAnswerSchema } from '@/backend/validators/quiz.validator';

/**
 * @swagger
 * /api/quizzes/submit:
 *   post:
 *     summary: Enviar respuesta de quiz
 *     description: Envía la respuesta de un quiz para calificación automática y actualización de stats del personaje
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
 *               - quizId
 *               - characterId
 *               - answerIndex
 *               - timeTaken
 *             properties:
 *               quizId:
 *                 type: string
 *                 description: ID del quiz (UUID)
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               characterId:
 *                 type: string
 *                 description: ID del personaje (UUID)
 *                 example: "660e8400-e29b-41d4-a716-446655440001"
 *               answerIndex:
 *                 type: integer
 *                 description: Índice de la respuesta seleccionada (0-based)
 *                 example: 2
 *               timeTaken:
 *                 type: integer
 *                 description: Tiempo tomado en segundos
 *                 example: 45
 *     responses:
 *       201:
 *         description: Quiz enviado y calificado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: object
 *                   properties:
 *                     isCorrect:
 *                       type: boolean
 *                     pointsEarned:
 *                       type: integer
 *                     history:
 *                       type: object
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Quiz o personaje no encontrado
 *       409:
 *         description: Quiz ya completado anteriormente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();

    // Validar datos
    const validation = SubmitQuizAnswerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const result = await QuizService.submitAnswer(validation.data);

    return NextResponse.json({ result }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/quizzes/submit:', error);

    if (error.message === 'Quiz no encontrado' || error.message === 'Personaje no encontrado') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error.message === 'Ya has respondido este quiz') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: error.message || 'Error al enviar respuesta' },
      { status: 500 }
    );
  }
}
