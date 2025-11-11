import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/backend/services/task/task.service';
import { CreateTaskSchema } from '@/backend/validators/task.validator';

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Obtener tareas
 *     description: Obtiene las tareas según los parámetros proporcionados (todas, por grupo, o por grupo y miembro)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: groupId
 *         schema:
 *           type: string
 *         description: ID del grupo para filtrar tareas
 *       - in: query
 *         name: memberId
 *         schema:
 *           type: string
 *         description: ID del miembro para obtener estado de completitud (requiere groupId)
 *     responses:
 *       200:
 *         description: Lista de tareas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
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
    const memberId = searchParams.get('memberId');

    if (groupId && memberId) {
      // Obtener tasks del grupo con estado de completitud por member
      const tasks = await TaskService.getTasksByGroupForMember(groupId, memberId);
      return NextResponse.json({ tasks }, { status: 200 });
    } else if (groupId) {
      // Obtener todas las tasks del grupo sin estado específico
      const tasks = await TaskService.getTasksByGroup(groupId);
      return NextResponse.json({ tasks }, { status: 200 });
    }

    const tasks = await TaskService.getAllTasks();
    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/tasks:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener tareas' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Crear nueva tarea
 *     description: Crea una nueva tarea en el sistema con recompensas de experiencia
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
 *               - title
 *               - description
 *               - courseId
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título de la tarea
 *                 example: Trabajo de Investigación
 *               description:
 *                 type: string
 *                 description: Descripción detallada de la tarea
 *                 example: Realizar una investigación sobre la historia de...
 *               courseId:
 *                 type: integer
 *                 description: ID del curso al que pertenece la tarea
 *                 example: 5
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha límite de entrega
 *                 example: 2024-12-31T23:59:59Z
 *               experienceReward:
 *                 type: integer
 *                 description: Puntos de experiencia otorgados al completar
 *                 example: 100
 *               difficulty:
 *                 type: string
 *                 enum: [EASY, MEDIUM, HARD]
 *                 description: Nivel de dificultad de la tarea
 *                 example: MEDIUM
 *     responses:
 *       201:
 *         description: Tarea creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Datos inválidos
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

    const validation = CreateTaskSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const task = await TaskService.createTask(validation.data);

    return NextResponse.json({ task }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/tasks:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear tarea' },
      { status: 500 }
    );
  }
}
