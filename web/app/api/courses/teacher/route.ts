import { NextRequest, NextResponse } from 'next/server';
import { TeacherService } from '@/backend/services/teacher/teacher.service';

/**
 * GET /api/courses/teacher
 * Obtener cursos del profesor autenticado
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener teacher por userId
    const teacherRes = await TeacherService.getTeacherByUserId(userId);

    if (!teacherRes.success || !teacherRes.teacher) {
      return NextResponse.json(
        { error: 'Usuario no es profesor' },
        { status: 403 }
      );
    }

    // Obtener cursos del teacher
    const courses = await TeacherService.getTeacherCourses(teacherRes.teacher.id);

    return NextResponse.json(
      {
        success: true,
        courses,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/courses/teacher:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener cursos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses/teacher
 * Crear un nuevo curso
 */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener teacher por userId
    const teacherRes = await TeacherService.getTeacherByUserId(userId);

    if (!teacherRes.success || !teacherRes.teacher) {
      return NextResponse.json(
        { error: 'Usuario no es profesor' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre del curso es requerido' },
        { status: 400 }
      );
    }

    const course = await TeacherService.createCourse(teacherRes.teacher.id, {
      name,
      description,
    });

    return NextResponse.json(
      {
        success: true,
        course,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/courses/teacher:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear curso' },
      { status: 500 }
    );
  }
}
