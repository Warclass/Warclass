import { NextRequest, NextResponse } from 'next/server';
import { TeacherService } from '@/backend/services/teacher/teacher.service';
import { UpdateTeacherSchema } from '@/backend/validators/teacher.validator';
import { requireAdmin, requireAuth } from '@/backend/middleware/auth.middleware';

/**
 * @swagger
 * /api/teachers/{id}:
 *   get:
 *     summary: Obtener profesor por ID
 *     description: Retorna la información de un profesor específico
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del profesor (UUID)
 *     responses:
 *       200:
 *         description: Profesor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 teacher:
 *                   type: object
 *       404:
 *         description: Profesor no encontrado
 *       401:
 *         description: No autorizado
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
 * @swagger
 * /api/teachers/{id}:
 *   patch:
 *     summary: Actualizar profesor
 *     description: Actualiza el internal_id o institution_id de un profesor (solo admin)
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del profesor (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               internalId:
 *                 type: string
 *                 description: ID interno del profesor en la institución
 *               institutionId:
 *                 type: string
 *                 description: ID de la institución
 *     responses:
 *       200:
 *         description: Profesor actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere permisos de administrador
 *       500:
 *         description: Error interno del servidor
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
 * @swagger
 * /api/teachers/{id}:
 *   delete:
 *     summary: Eliminar profesor
 *     description: Remueve el rol de profesor de un usuario (solo admin)
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del profesor (UUID)
 *     responses:
 *       200:
 *         description: Profesor eliminado exitosamente
 *       400:
 *         description: Error al eliminar
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere permisos de administrador
 *       500:
 *         description: Error interno del servidor
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
