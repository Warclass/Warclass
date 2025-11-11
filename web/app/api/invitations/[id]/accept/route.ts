import { NextRequest, NextResponse } from 'next/server';
import { acceptInvitation } from '@/backend/services/invitation/invitation.service';

/**
 * @swagger
 * /api/invitations/{id}/accept:
 *   post:
 *     summary: Aceptar invitación
 *     description: Acepta una invitación pendiente por su ID
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la invitación
 *     responses:
 *       200:
 *         description: Invitación aceptada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Invitación no encontrada
 *       500:
 *         description: Error interno del servidor
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id: invitationId } = await params;

    await acceptInvitation(userId, invitationId);

    return NextResponse.json({
      success: true,
      message: 'Invitación aceptada exitosamente'
    });
  } catch (error) {
    console.error('Error en POST /api/invitations/[id]/accept:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error al aceptar invitación' 
      },
      { status: 500 }
    );
  }
}
