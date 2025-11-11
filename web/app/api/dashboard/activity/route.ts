import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/backend/middleware/auth/auth.middleware';
import { DashboardService } from '@/backend/services/dashboard/dashboard.service';

/**
 * @swagger
 * /api/dashboard/activity:
 *   get:
 *     summary: Obtener actividad reciente
 *     description: Retorna la actividad reciente del usuario (tareas completadas, quizzes realizados, eventos, etc.)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Actividad obtenida exitosamente
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
 *                       type:
 *                         type: string
 *                         description: Tipo de actividad
 *                         example: TASK_COMPLETED
 *                       description:
 *                         type: string
 *                         description: Descripción de la actividad
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         description: Fecha y hora de la actividad
 *                       experienceGained:
 *                         type: integer
 *                         description: Experiencia ganada (si aplica)
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

    const activity = await DashboardService.getRecentActivity(userId);

    return NextResponse.json(
      {
        success: true,
        data: activity,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/dashboard/activity:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al obtener actividad reciente',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      },
      { status: 500 }
    );
  }
}
