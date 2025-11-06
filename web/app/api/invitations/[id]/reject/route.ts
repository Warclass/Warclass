import { NextRequest, NextResponse } from 'next/server';
import { rejectInvitation } from '@/backend/services/invitation/invitation.service';

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

    const invitationId = params.id;

    await rejectInvitation(userId, invitationId);

    return NextResponse.json({
      success: true,
      message: 'Invitación rechazada exitosamente'
    });
  } catch (error) {
    console.error('Error en POST /api/invitations/[id]/reject:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error al rechazar invitación' 
      },
      { status: 500 }
    );
  }
}
