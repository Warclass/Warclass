import { NextRequest, NextResponse } from 'next/server';
import { QuizService } from '@/backend/services/quiz/quiz.service';

interface RouteParams {
  params: {
    memberId: string;
  };
}

/**
 * @swagger
 * /api/quizzes/statistics/{memberId}:
 *   get:
 *     summary: Obtener estadísticas de quizzes de un miembro
 *     description: Retorna las estadísticas de desempeño en quizzes de un miembro específico
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del miembro
 *     responses:
 *       200:
 *         description: Estadísticas del miembro en quizzes
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
 *                     averageScore:
 *                       type: number
 *                     bestScore:
 *                       type: number
 *                     completedQuizzes:
 *                       type: integer
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

    // TODO: Verificar que el usuario tiene acceso a este miembro

    const statistics = await QuizService.getMemberStatistics(params.memberId);

    return NextResponse.json({ statistics }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/quizzes/statistics/[memberId]:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
