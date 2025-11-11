import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/backend/config/prisma';

/**
 * @swagger
 * /api/quizzes/history:
 *   get:
 *     summary: Obtener historial de quizzes
 *     description: Retorna el historial de quizzes completados por un personaje o curso
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: characterId
 *         schema:
 *           type: string
 *         description: ID del personaje para obtener su historial (UUID)
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: ID del curso para obtener historial de todos los personajes (UUID)
 *     responses:
 *       200:
 *         description: Historial de quizzes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       character:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                       quiz:
 *                         type: string
 *                       score:
 *                         type: number
 *                       pointsEarned:
 *                         type: integer
 *                       timeTaken:
 *                         type: integer
 *                       answeredAt:
 *                         type: string
 *                         format: date-time
 *                       isCorrect:
 *                         type: boolean
 *       400:
 *         description: Se requiere characterId o courseId
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
    const characterId = searchParams.get('characterId');
    const courseId = searchParams.get('courseId');

    if (!characterId && !courseId) {
      return NextResponse.json(
        { error: 'Se requiere characterId o courseId' },
        { status: 400 }
      );
    }

    let history;

    if (characterId) {
      // Obtener historial de un personaje específico
      history = await prisma.quizzes_history.findMany({
        where: {
          character_id: characterId,
        },
        include: {
          quiz: {
            include: {
              group: true,
            },
          },
          character: true,
        },
        orderBy: {
          answered_at: 'desc',
        },
        take: 10, // Últimos 10 registros
      });
    } else if (courseId) {
      // Obtener historial de todos los personajes de un curso
      history = await prisma.quizzes_history.findMany({
        where: {
          quiz: {
            group: {
              course_id: courseId,
            },
          },
        },
        include: {
          quiz: {
            include: {
              group: true,
            },
          },
          character: true,
        },
        orderBy: {
          answered_at: 'desc',
        },
        take: 10,
      });
    }

    // Formatear respuesta
    const formattedHistory = history?.map((item) => ({
      id: item.id,
      character: {
        name: item.character.name,
      },
      quiz: item.quiz.question.substring(0, 30) + '...',
      score: item.is_correct ? 100 : 0,
      pointsEarned: item.points_earned,
      timeTaken: item.time_taken,
      answeredAt: item.answered_at,
      isCorrect: item.is_correct,
    })) || [];

    return NextResponse.json({ 
      success: true, 
      data: formattedHistory 
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/quizzes/history:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener historial' },
      { status: 500 }
    );
  }
}
