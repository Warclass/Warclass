import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/backend/middleware/auth/auth.middleware';
import { DashboardService } from '@/backend/services/dashboard/dashboard.service';

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Obtener estadísticas del dashboard
 *     description: Retorna estadísticas resumidas del usuario (experiencia, tareas completadas, quizzes, etc.)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalExperience:
 *                       type: integer
 *                       description: Experiencia total acumulada
 *                     completedTasks:
 *                       type: integer
 *                       description: Número de tareas completadas
 *                     completedQuizzes:
 *                       type: integer
 *                       description: Número de quizzes completados
 *                     averageScore:
 *                       type: number
 *                       description: Promedio de puntaje en quizzes
 *                     coursesEnrolled:
 *                       type: integer
 *                       description: Cursos inscritos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
export async function GET(request: NextRequest) {
  try {
    const authError = await authenticateToken(request);
    if (authError) {
      return authError;
    }

    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    const stats = await DashboardService.getDashboardStats(userId);

    return NextResponse.json(
      {
        success: true,
        data: stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/dashboard/stats:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al obtener estadísticas',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      },
      { status: 500 }
    );
  }
}
