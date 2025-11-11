import { NextRequest, NextResponse } from 'next/server';
import { InstitutionService } from '@/backend/services/institution/institution.service';
import { UpdateInstitutionSchema } from '@/backend/validators/institution.validator';
import { requireAdmin, requireAuth } from '@/backend/middleware/auth.middleware';

/**
 * @swagger
 * /api/institutions/{id}:
 *   get:
 *     summary: Obtener institución por ID
 *     description: Retorna la información de una institución específica con sus profesores
 *     tags: [Institutions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la institución
 *     responses:
 *       200:
 *         description: Información de la institución
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 institution:
 *                   $ref: '#/components/schemas/Institution'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Institución no encontrada
 *       500:
 *         description: Error interno del servidor
 *   patch:
 *     summary: Actualizar institución
 *     description: Actualiza la información de una institución (solo administradores)
 *     tags: [Institutions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la institución
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Institución actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 institution:
 *                   $ref: '#/components/schemas/Institution'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere permisos de administrador
 *       404:
 *         description: Institución no encontrada
 *       500:
 *         description: Error interno del servidor
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
