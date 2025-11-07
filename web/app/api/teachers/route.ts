import { NextRequest, NextResponse } from 'next/server';
import { TeacherService } from '@/backend/services/teacher/teacher.service';
import { CreateTeacherSchema } from '@/backend/validators/teacher.validator';
import { requireAdmin, requireAuth } from '@/backend/middleware/auth.middleware';

/**
 * POST /api/teachers
 * Convertir un user en teacher
 * 🔒 Requiere: Autenticación + Admin
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar que es admin
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();

    // Validar datos de entrada
    const validatedData = CreateTeacherSchema.parse(body);

    const result = await TeacherService.createTeacher(validatedData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/teachers:', error);
    return NextResponse.json(
      { error: 'Error al crear el profesor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/teachers
 * Obtener todos los teachers
 * 🔒 Requiere: Autenticación
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const result = await TeacherService.getAllTeachers();

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/teachers:', error);
    return NextResponse.json(
      { error: 'Error al obtener los profesores' },
      { status: 500 }
    );
  }
}
