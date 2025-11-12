import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/backend/services/task/task.service';
import { AssignTaskSchema } from '@/backend/validators/task.validator';
import { authenticateToken } from '@/backend/middleware/auth/auth.middleware';

/**
 * @swagger
 * /api/tasks/assign:
 *   post:
 *     summary: Asignar tarea a grupos
 *     description: Asigna una tarea a uno o varios grupos
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
 *               - groupIds
 *             properties:
 *               taskId:
 *                 type: string
 *                 description: ID de la tarea a asignar
 *                 example: "15"
 *               groupIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs de los grupos a los que se asigna la tarea
 *                 example: ["5", "7", "10"]
 *     responses:
 *       200:
 *         description: Tarea asignada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tarea asignada correctamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Tarea o grupo no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
export async function POST(req: NextRequest) {
  try {
    // Autenticar token
    const authError = await authenticateToken(req);
    if (authError) {
      return authError;
    }

    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();

    const validation = AssignTaskSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    await TaskService.assignTaskToGroups(validation.data);

    return NextResponse.json({ message: 'Tarea asignada correctamente' }, { status: 200 });
  } catch (error: any) {
    console.error('Error in POST /api/tasks/assign:', error);

    if (error.message === 'Tarea no encontrada' || error.message.includes('Grupo')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Error al asignar tarea' },
      { status: 500 }
    );
  }
}
