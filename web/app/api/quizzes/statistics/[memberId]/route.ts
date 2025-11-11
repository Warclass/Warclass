import { NextRequest, NextResponse } from 'next/server';
import { QuizService } from '@/backend/services/quiz/quiz.service';

interface RouteParams {
  params: {
    characterId: string;
  };
}

/**
 * @swagger
 * /api/quizzes/statistics/{characterId}:
 *   get:
 *     summary: Obtener estadísticas de quizzes de un personaje
 *     description: Retorna las estadísticas de desempeño en quizzes de un personaje específico
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: characterId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del personaje (UUID)
 *     responses:
 *       200:
 *         description: Estadísticas del personaje en quizzes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statistics:
 *                   type: object
 *                   properties:
 *                     totalQuizzes:
 *                       type: integer
 *                     completedQuizzes:
 *                       type: integer
 *                     correctAnswers:
 *                       type: integer
 *                     incorrectAnswers:
 *                       type: integer
 *                     totalPoints:
 *                       type: integer
 *                     averageTimeTaken:
 *                       type: number
 *                     accuracy:
 *                       type: number
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const statistics = await QuizService.getCharacterStatistics(params.characterId);

    return NextResponse.json({ statistics }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/quizzes/statistics/[characterId]:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
