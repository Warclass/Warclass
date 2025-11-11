import { NextRequest, NextResponse } from 'next/server';
import { InvitationService, getPendingInvitations } from '@/backend/services/invitation/invitation.service';
import { TeacherService } from '@/backend/services/teacher/teacher.service';

/**
 * @swagger
 * /api/invitations:
 *   get:
 *     summary: Obtener invitaciones pendientes
 *     description: Retorna todas las invitaciones pendientes del usuario autenticado
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de invitaciones pendientes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       courseId:
 *                         type: string
 *                       courseName:
 *                         type: string
 *                       name:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
export async function GET(req: NextRequest) {
  try {
    // TODO: Obtener userId del token de sesión
    // Por ahora usamos un placeholder
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const invitations = await getPendingInvitations(userId);

    return NextResponse.json({
      success: true,
      data: invitations
    });
  } catch (error) {
    console.error('Error en GET /api/invitations:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener invitaciones' 
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/invitations:
 *   post:
 *     summary: Crear nueva invitación
 *     description: Permite a un profesor crear una invitación para un curso
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - name
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: ID del curso
 *               name:
 *                 type: string
 *                 description: Nombre de la invitación
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email opcional del invitado
 *     responses:
 *       201:
 *         description: Invitación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     courseId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permisos (requiere ser profesor)
 *       500:
 *         description: Error interno del servidor
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    // Verificar que el usuario sea profesor
    const isTeacher = await TeacherService.isTeacher(userId);
    if (!isTeacher) {
      return NextResponse.json({ error: 'No tienes permisos para crear invitaciones' }, { status: 403 });
    }

  const body = await request.json();
  const { courseId, name, email } = body;

    if (!courseId) {
      return NextResponse.json({ error: 'El ID del curso es requerido' }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: 'El nombre de la invitación es requerido' }, { status: 400 });
    }

    // Crear la invitación (opcionalmente dirigida a un email existente)
    const invitation = await InvitationService.createInvitation({
      courseId,
      name,
      email: typeof email === 'string' && email.includes('@') ? email : undefined,
    });

    return NextResponse.json({
      success: true,
      data: invitation
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear la invitación' 
      },
      { status: 500 }
    );
  }
}

