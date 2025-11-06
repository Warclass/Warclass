import { NextRequest, NextResponse } from 'next/server';
import { getPendingInvitationsCount } from '@/backend/services/invitation/invitation.service';

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
