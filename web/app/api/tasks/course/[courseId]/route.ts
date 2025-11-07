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
 * GET /api/tasks/course/[courseId]
 * Obtiene todas las tareas de un curso específico
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
      // Si es profesor, verificar que el curso le pertenezca
      const course = await prisma.courses.findFirst({
        where: {
          id: courseId,
          teacher_id: userId
        }
      });

      if (!course) {
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

    // Obtener todos los grupos del curso
    const groups = await prisma.groups.findMany({
      where: {
        course_id: courseId
      },
      select: {
        id: true,
        name: true,
        members: {
          select: {
            id: true,
            name: true,
            teachers_courses_tasks: {
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
      group.members.forEach(member => {
        member.teachers_courses_tasks.forEach(tct => {
          if (!tasksMap.has(tct.task.id)) {
            tasksMap.set(tct.task.id, {
              id: tct.task.id,
              name: tct.task.name,
              description: tct.task.description,
              experience: tct.task.experience,
              gold: tct.task.gold,
              health: tct.task.health,
              energy: tct.task.energy,
              created_at: tct.task.created_at,
              updated_at: tct.task.updated_at,
              assignedCount: 0,
              completedCount: 0
            });
          }
          
          // Incrementar contador de asignaciones
          const task = tasksMap.get(tct.task.id);
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
