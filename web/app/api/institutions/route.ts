import { NextRequest, NextResponse } from 'next/server';
import { InstitutionService } from '@/backend/services/institution/institution.service';
import { CreateInstitutionSchema } from '@/backend/validators/institution.validator';
import { requireAdmin, requireAuth } from '@/backend/middleware/auth.middleware';

/**
 * POST /api/institutions
 * Crear una nueva institución
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
    const validatedData = CreateInstitutionSchema.parse(body);

    const result = await InstitutionService.createInstitution(validatedData);

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

    console.error('Error in POST /api/institutions:', error);
    return NextResponse.json(
      { error: 'Error al crear la institución' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/institutions
 * Obtener todas las instituciones
 * 🔒 Requiere: Autenticación
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const result = await InstitutionService.getAllInstitutions();

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/institutions:', error);
    return NextResponse.json(
      { error: 'Error al obtener las instituciones' },
      { status: 500 }
    );
  }
}
