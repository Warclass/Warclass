import { NextRequest, NextResponse } from 'next/server';
import { InstitutionService } from '@/backend/services/institution/institution.service';
import { requireAdmin } from '@/backend/middleware/auth.middleware';

/**
 * @swagger
 * /api/institutions/{id}/teachers/{teacherId}:
 *   delete:
 *     summary: Remover profesor de institución
 *     description: Remueve un profesor de una institución haciéndolo independiente (requiere admin)
 *     tags: [Institutions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la institución (UUID)
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del profesor (UUID)
 *     responses:
 *       200:
 *         description: Profesor removido exitosamente de la institución
 *       400:
 *         description: Error al remover profesor
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos de administrador
 *       500:
 *         description: Error interno del servidor
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
