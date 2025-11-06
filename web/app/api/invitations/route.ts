import { NextRequest, NextResponse } from 'next/server';
import { getPendingInvitations } from '@/backend/services/invitation/invitation.service';

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
