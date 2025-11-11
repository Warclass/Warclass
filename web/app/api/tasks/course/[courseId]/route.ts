import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { TeacherService } from '@/backend/services/teacher/teacher.service';

const prisma = new PrismaClient();

type RouteParams = {
  params: {
    courseId: string;
  };
};

/**
 * @swagger
 * /api/tasks/course/{courseId}:
 *   get:
 *     summary: Obtener tareas de un curso
 *     description: Retorna todas las tareas de un curso específico. Requiere ser profesor del curso o estar inscrito
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del curso
 *     responses:
 *       200:
 *         description: Lista de tareas del curso
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
 *                     $ref: '#/components/schemas/Task'
 *       400:
 *         description: courseId no proporcionado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes acceso a este curso
 *       500:
 *         description: Error interno del servidor
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { courseId } = await params;

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el usuario sea profesor del curso o esté inscrito
    const isTeacher = await TeacherService.isTeacher(userId);
    
    if (isTeacher) {
      // Si es profesor, verificar que tenga acceso al curso
      const teacherCourse = await prisma.teachers_courses.findFirst({
        where: {
          course_id: courseId,
          teacher: {
            user_id: userId
          }
        }
      });

      if (!teacherCourse) {
        return NextResponse.json(
          { error: 'No tienes acceso a este curso' },
          { status: 403 }
        );
      }
    } else {
      // Si no es profesor, verificar que esté inscrito
      const inscription = await prisma.inscriptions.findUnique({
        where: {
          user_id_course_id: {
            user_id: userId,
            course_id: courseId
          }
        }
      });

      if (!inscription) {
        return NextResponse.json(
          { error: 'No estás inscrito en este curso' },
          { status: 403 }
        );
      }
    }

    // Obtener todos los grupos del curso con sus personajes
    const groups = await prisma.groups.findMany({
      where: {
        course_id: courseId
      },
      select: {
        id: true,
        name: true,
        characters: {
          select: {
            id: true,
            name: true,
            tasks: {
              include: {
                task: true
              }
            }
          }
        }
      }
    });

    // Extraer todas las tareas únicas del curso
    const tasksMap = new Map();

    groups.forEach(group => {
      group.characters.forEach(character => {
        character.tasks.forEach(ct => {
          if (!tasksMap.has(ct.task.id)) {
            tasksMap.set(ct.task.id, {
              id: ct.task.id,
              name: ct.task.name,
              description: ct.task.description,
              experience: ct.task.experience,
              gold: ct.task.gold,
              health: ct.task.health,
              energy: ct.task.energy,
              created_at: ct.task.created_at,
              updated_at: ct.task.updated_at,
              assignedCount: 0,
              completedCount: 0
            });
          }
          
          // Incrementar contador de asignaciones
          const task = tasksMap.get(ct.task.id);
          task.assignedCount++;
        });
      });
    });

    const tasks = Array.from(tasksMap.values());

    return NextResponse.json({
      success: true,
      tasks
    });

  } catch (error) {
    console.error('Error en GET /api/tasks/course/[courseId]:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener tareas del curso' 
      },
      { status: 500 }
    );
  }
}
