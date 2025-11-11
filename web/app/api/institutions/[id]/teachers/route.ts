import { NextRequest, NextResponse } from 'next/server';
import { InstitutionService } from '@/backend/services/institution/institution.service';
import { AssignTeacherSchema } from '@/backend/validators/institution.validator';
import { requireAdmin } from '@/backend/middleware/auth.middleware';

/**
 * @swagger
 * /api/institutions/{id}/teachers:
 *   post:
 *     summary: Asignar profesor a institución
 *     description: Asigna un profesor a una institución específica (solo administradores)
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
 *             required:
 *               - teacherId
 *             properties:
 *               teacherId:
 *                 type: string
 *                 description: ID del profesor a asignar
 *     responses:
 *       200:
 *         description: Profesor asignado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere permisos de administrador
 *       500:
 *         description: Error interno del servidor
 *   delete:
 *     summary: Remover profesor de institución
 *     description: Remueve un profesor de una institución específica (solo administradores)
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
 *             required:
 *               - teacherId
 *             properties:
 *               teacherId:
 *                 type: string
 *                 description: ID del profesor a remover
 *     responses:
 *       200:
 *         description: Profesor removido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere permisos de administrador
 *       500:
 *         description: Error interno del servidor
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
