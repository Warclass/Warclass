import { NextRequest, NextResponse } from 'next/server';
import { TeacherService } from '@/backend/services/teacher/teacher.service';
import { UpdateTeacherSchema } from '@/backend/validators/teacher.validator';
import { requireAdmin, requireAuth } from '@/backend/middleware/auth.middleware';

/**
 * GET /api/teachers/:id
 * Obtener un teacher por ID
 * 🔒 Requiere: Autenticación
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const teacherId = params.id;

    const result = await TeacherService.getTeacherById(teacherId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 404 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/teachers/:id:', error);
    return NextResponse.json(
      { error: 'Error al obtener el profesor' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/teachers/:id
 * Actualizar internal_id o institution_id de un teacher
 * 🔒 Requiere: Autenticación + Admin
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar que es admin
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const teacherId = params.id;
    const body = await request.json();

    // Validar datos de entrada
    const validatedData = UpdateTeacherSchema.parse(body);

    const result = await TeacherService.updateTeacher(teacherId, validatedData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in PATCH /api/teachers/:id:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el profesor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/teachers/:id
 * Remover rol de teacher de un usuario
 * 🔒 Requiere: Autenticación + Admin
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar que es admin
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const teacherId = params.id;

    const result = await TeacherService.deleteTeacher(teacherId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/teachers/:id:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el profesor' },
      { status: 500 }
    );
  }
}
