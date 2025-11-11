import { NextRequest, NextResponse } from 'next/server';
import { QuizService } from '@/backend/services/quiz/quiz.service';
import { SubmitQuizAnswerSchema } from '@/backend/validators/quiz.validator';

/**
 * @swagger
 * /api/quizzes/submit:
 *   post:
 *     summary: Enviar respuestas de quiz
 *     description: Envía las respuestas de un quiz para calificación automática
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
 *               - memberId
 *               - answers
 *             properties:
 *               quizId:
 *                 type: string
 *                 description: ID del quiz
 *                 example: "15"
 *               memberId:
 *                 type: string
 *                 description: ID del miembro/personaje
 *                 example: "25"
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     answer:
 *                       type: string
 *                 description: Respuestas del quiz
 *                 example:
 *                   - questionId: "1"
 *                     answer: "B"
 *                   - questionId: "2"
 *                     answer: "A"
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
 *                     score:
 *                       type: integer
 *                       description: Puntaje obtenido
 *                     experienceGained:
 *                       type: integer
 *                       description: Experiencia ganada
 *                     correct:
 *                       type: integer
 *                       description: Respuestas correctas
 *                     total:
 *                       type: integer
 *                       description: Total de preguntas
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Quiz o miembro no encontrado
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

    // TODO: Verificar que el memberId pertenece al usuario

    const result = await QuizService.submitAnswer(validation.data);

    return NextResponse.json({ result }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/quizzes/submit:', error);

    if (error.message === 'Quiz no encontrado' || error.message === 'Miembro no encontrado') {
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
