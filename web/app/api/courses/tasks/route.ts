import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el usuario esté inscrito en el curso
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

    // Obtener todos los eventos (tareas) disponibles
    // Por ahora, obtenemos todos los eventos ya que no hay relación directa con course
    const events = await prisma.events.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });

    // Mapear a formato de tasks con deadline ficticio (7 días desde creación)
    const tasks = events.map(event => {
      const createdDate = new Date(event.created_at);
      const deadlineDate = new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      return {
        id: event.id,
        name: event.name,
        description: event.description,
        deadline: deadlineDate.toISOString(),
        created_at: event.created_at.toISOString()
      };
    });

    return NextResponse.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Error en GET /api/courses/tasks:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener tareas del curso' 
      },
      { status: 500 }
    );
  }
}
