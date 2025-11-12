import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/backend/services/task/task.service';
import { UpdateTaskSchema } from '@/backend/validators/task.validator';
import { authenticateToken } from '@/backend/middleware/auth/auth.middleware';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Obtener tarea por ID
 *     description: Retorna los detalles de una tarea específica
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la tarea
 *     responses:
 *       200:
 *         description: Tarea encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       404:
 *         description: Tarea no encontrada
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
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

    const task = await TaskService.getTaskById(params.id);

    return NextResponse.json({ task }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/tasks/[id]:', error);

    if (error.message === 'Tarea no encontrada') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Error al obtener tarea' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Actualizar tarea
 *     description: Actualiza la información de una tarea existente
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la tarea (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título de la tarea
 *               description:
 *                 type: string
 *                 description: Descripción de la tarea
 *               experience:
 *                 type: integer
 *                 description: Experiencia que otorga
 *               gold:
 *                 type: integer
 *                 description: Oro que otorga
 *               energy:
 *                 type: integer
 *                 description: Energía que consume
 *     responses:
 *       200:
 *         description: Tarea actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Tarea no encontrada
 *       500:
 *         description: Error interno del servidor
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
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

    const validation = UpdateTaskSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const task = await TaskService.updateTask(params.id, validation.data);

    return NextResponse.json({ task }, { status: 200 });
  } catch (error: any) {
    console.error('Error in PUT /api/tasks/[id]:', error);

    if (error.message === 'Tarea no encontrada') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Error al actualizar tarea' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Eliminar tarea
 *     description: Elimina una tarea existente del sistema
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la tarea (UUID)
 *     responses:
 *       200:
 *         description: Tarea eliminada exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Tarea no encontrada
 *       500:
 *         description: Error interno del servidor
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
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

    await TaskService.deleteTask(params.id);

    return NextResponse.json({ message: 'Tarea eliminada correctamente' }, { status: 200 });
  } catch (error: any) {
    console.error('Error in DELETE /api/tasks/[id]:', error);

    if (error.message === 'Tarea no encontrada') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Error al eliminar tarea' },
      { status: 500 }
    );
  }
}
