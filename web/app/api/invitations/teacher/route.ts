import { NextRequest, NextResponse } from 'next/server';
import { TeacherService } from '@/backend/services/teacher/teacher.service';
import { InvitationService } from '@/backend/services/invitation/invitation.service';

/**
 * @swagger
 * /api/invitations/teacher:
 *   get:
 *     summary: Obtener invitaciones creadas por el profesor
 *     description: Retorna todas las invitaciones creadas por el profesor autenticado
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de invitaciones del profesor
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
 *                       name:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Usuario no es profesor
 *       500:
 *         description: Error interno del servidor
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const teacherRes = await TeacherService.getTeacherByUserId(userId);
    if (!teacherRes.success || !teacherRes.teacher) {
      return NextResponse.json({ success: false, error: teacherRes.message || 'Usuario no es profesor' }, { status: 403 });
    }

    const invitations = await InvitationService.getInvitationsByTeacher(teacherRes.teacher.id);

    return NextResponse.json({ success: true, data: invitations });
  } catch (error: any) {
    console.error('Error en GET /api/invitations/teacher:', error);
    return NextResponse.json({ error: error?.message ?? 'Error interno del servidor' }, { status: 500 });
  }
}
