import { NextRequest, NextResponse } from 'next/server';
import { InstitutionService } from '@/backend/services/institution/institution.service';
import { AssignTeacherSchema } from '@/backend/validators/institution.validator';
import { requireAdmin } from '@/backend/middleware/auth.middleware';

/**
 * POST /api/institutions/:id/teachers
 * Asignar un teacher a una institución
 * 🔒 Requiere: Autenticación + Admin
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar que es admin
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const institutionId = params.id;
    const body = await request.json();

    // Validar datos de entrada
    const validatedData = AssignTeacherSchema.parse(body);

    const result = await InstitutionService.assignTeacher(institutionId, validatedData);

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

    console.error('Error in POST /api/institutions/:id/teachers:', error);
    return NextResponse.json(
      { error: 'Error al asignar el profesor' },
      { status: 500 }
    );
  }
}
