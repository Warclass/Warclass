import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { TeacherService } from '@/backend/services/teacher/teacher.service';
import { authenticateToken } from '@/backend/middleware/auth/auth.middleware';

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
    // Autenticar token
    const authError = await authenticateToken(req);
    if (authError) {
      return authError;
    }

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

    // Obtener todas las tareas que pertenecen al curso a través de teachers_courses_tasks
    // O si no hay relación directa, obtener todas las tareas del sistema
    // (Por ahora vamos a obtener todas las tareas ya que no hay relación directa curso-tarea)
    
    // OPCIÓN 1: Si quieres mostrar TODAS las tareas del sistema
    const allTasks = await prisma.tasks.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });

    // Obtener información de asignación por grupo del curso
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

    // Crear mapa de contadores de asignación
    const assignmentMap = new Map();

    groups.forEach(group => {
      group.characters.forEach(character => {
        character.tasks.forEach(ct => {
          if (!assignmentMap.has(ct.task.id)) {
            assignmentMap.set(ct.task.id, {
              assignedCount: 0,
              completedCount: 0
            });
          }
          
          const counts = assignmentMap.get(ct.task.id);
          counts.assignedCount++;
        });
      });
    });

    // Combinar tareas con información de asignación
    const tasks = allTasks.map(task => ({
      id: task.id,
      name: task.name,
      description: task.description,
      experience: task.experience,
      gold: task.gold,
      health: task.health,
      energy: task.energy,
      created_at: task.created_at,
      updated_at: task.updated_at,
      assignedCount: assignmentMap.get(task.id)?.assignedCount || 0,
      completedCount: assignmentMap.get(task.id)?.completedCount || 0
    }));

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
