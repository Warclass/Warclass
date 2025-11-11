import { NextRequest, NextResponse } from 'next/server';
import { QuizService } from '@/backend/services/quiz/quiz.service';

/**
 * @swagger
 * /api/quizzes/leaderboard:
 *   get:
 *     summary: Obtener tabla de líderes
 *     description: Retorna el ranking de estudiantes por puntaje en quizzes de un grupo o curso
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: groupId
 *         schema:
 *           type: string
 *         description: ID del grupo para filtrar el leaderboard
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: ID del curso para filtrar el leaderboard
 *     responses:
 *       200:
 *         description: Leaderboard obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 leaderboard:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       rank:
 *                         type: integer
 *                         description: Posición en el ranking
 *                       characterName:
 *                         type: string
 *                         description: Nombre del personaje
 *                       totalScore:
 *                         type: integer
 *                         description: Puntaje total acumulado
 *                       quizzesCompleted:
 *                         type: integer
 *                         description: Número de quizzes completados
 *                       averageScore:
 *                         type: number
 *                         description: Promedio de puntaje
 *       400:
 *         description: groupId o courseId no proporcionados
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');
    const courseId = searchParams.get('courseId');

    if (!groupId && !courseId) {
      return NextResponse.json(
        { error: 'Debe proporcionar groupId o courseId' },
        { status: 400 }
      );
    }

    let leaderboard;

    if (groupId) {
      // Leaderboard de un grupo específico
      leaderboard = await QuizService.getGroupLeaderboard(groupId);
    } else if (courseId) {
      // Leaderboard de un curso específico
      leaderboard = await QuizService.getCourseLeaderboard(courseId);
    }

    return NextResponse.json({ leaderboard }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/quizzes/leaderboard:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener leaderboard' },
      { status: 500 }
    );
  }
}
