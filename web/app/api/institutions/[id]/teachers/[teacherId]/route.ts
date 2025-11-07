import { NextRequest, NextResponse } from 'next/server';
import { InstitutionService } from '@/backend/services/institution/institution.service';
import { requireAdmin } from '@/backend/middleware/auth.middleware';

/**
 * DELETE /api/institutions/:id/teachers/:teacherId
 * Remover un teacher de una institución (lo hace independiente)
 * 🔒 Requiere: Autenticación + Admin
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; teacherId: string } }
) {
  try {
    // Verificar que es admin
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const institutionId = params.id;
    const teacherId = params.teacherId;

    const result = await InstitutionService.removeTeacher(institutionId, teacherId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/institutions/:id/teachers/:teacherId:', error);
    return NextResponse.json(
      { error: 'Error al remover el profesor' },
      { status: 500 }
    );
  }
}
