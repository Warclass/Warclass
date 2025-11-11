import { NextRequest, NextResponse } from 'next/server';
import { GroupService } from '@/backend/services/group/group.service';
import { CreateGroupSchema } from '@/backend/validators/group.validator';

/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: Obtener grupos
 *     description: Retorna la lista de grupos de un curso específico
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del curso para filtrar grupos
 *     responses:
 *       200:
 *         description: Lista de grupos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 groups:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Group'
 *       400:
 *         description: courseId no proporcionado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'courseId es requerido' }, { status: 400 });
    }

    const groups = await GroupService.getGroupsByCourse(courseId);

    return NextResponse.json({ groups }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/groups:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener grupos' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/groups:
 *   post:
 *     summary: Crear grupo
 *     description: Crea un nuevo grupo en un curso
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - courseId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del grupo
 *                 example: Equipo Alpha
 *               description:
 *                 type: string
 *                 description: Descripción del grupo
 *                 example: Grupo de estudiantes destacados
 *               courseId:
 *                 type: string
 *                 description: ID del curso
 *                 example: "5"
 *               maxMembers:
 *                 type: integer
 *                 description: Número máximo de miembros
 *                 example: 4
 *     responses:
 *       201:
 *         description: Grupo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 group:
 *                   $ref: '#/components/schemas/Group'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();

    const validation = CreateGroupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const group = await GroupService.createGroup(validation.data);

    return NextResponse.json({ group }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/groups:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear grupo' },
      { status: 500 }
    );
  }
}
