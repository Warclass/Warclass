import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/backend/services/task/task.service';

/**
 * @swagger
 * /api/tasks/complete:
 *   post:
 *     summary: Completar tarea
 *     description: Marca una tarea como completada por un personaje y otorga recompensas
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *               - characterId
 *             properties:
 *               taskId:
 *                 type: string
 *                 description: ID de la tarea (UUID)
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               characterId:
 *                 type: string
 *                 description: ID del personaje que completa la tarea (UUID)
 *                 example: "660e8400-e29b-41d4-a716-446655440001"
 *     responses:
 *       200:
 *         description: Tarea completada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Tarea completada exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Tarea o personaje no encontrado
 *       409:
 *         description: Tarea ya completada previamente
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
    const { taskId, characterId } = body;

    if (!taskId || !characterId) {
      return NextResponse.json(
        { error: 'taskId y characterId son requeridos' },
        { status: 400 }
      );
    }

    await TaskService.completeTask({ taskId, characterId });

    return NextResponse.json(
      { 
        success: true,
        message: 'Tarea completada exitosamente' 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/tasks/complete:', error);

    if (error.message === 'Tarea no encontrada' || error.message === 'Personaje no encontrado') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error.message === 'Esta tarea ya fue completada por este personaje') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: error.message || 'Error al completar tarea' },
      { status: 500 }
    );
  }
}
