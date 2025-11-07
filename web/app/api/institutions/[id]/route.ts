import { NextRequest, NextResponse } from 'next/server';
import { InstitutionService } from '@/backend/services/institution/institution.service';
import { UpdateInstitutionSchema } from '@/backend/validators/institution.validator';
import { requireAdmin, requireAuth } from '@/backend/middleware/auth.middleware';

/**
 * GET /api/institutions/:id
 * Obtener una institución por ID con sus teachers
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

    const institutionId = params.id;

    const result = await InstitutionService.getInstitutionById(institutionId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 404 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/institutions/:id:', error);
    return NextResponse.json(
      { error: 'Error al obtener la institución' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/institutions/:id
 * Actualizar una institución
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

    const institutionId = params.id;
    const body = await request.json();

    // Validar datos de entrada
    const validatedData = UpdateInstitutionSchema.parse(body);

    const result = await InstitutionService.updateInstitution(institutionId, validatedData);

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

    console.error('Error in PATCH /api/institutions/:id:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la institución' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/institutions/:id
 * Eliminar una institución
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

    const institutionId = params.id;

    const result = await InstitutionService.deleteInstitution(institutionId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/institutions/:id:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la institución' },
      { status: 500 }
    );
  }
}
