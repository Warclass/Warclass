import { NextRequest, NextResponse } from 'next/server';
import { getPendingInvitationsCount } from '@/backend/services/invitation/invitation.service';

/**
 * @swagger
 * /api/invitations/count:
 *   get:
 *     summary: Contar invitaciones pendientes
 *     description: Retorna el número de invitaciones pendientes del usuario autenticado
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conteo de invitaciones pendientes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                   description: Número de invitaciones pendientes
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const count = await getPendingInvitationsCount(userId);

    return NextResponse.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error en GET /api/invitations/count:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al contar invitaciones' 
      },
      { status: 500 }
    );
  }
}
