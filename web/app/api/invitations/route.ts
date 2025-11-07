import { NextRequest, NextResponse } from 'next/server';
import { InvitationService, getPendingInvitations } from '@/backend/services/invitation/invitation.service';
import { TeacherService } from '@/backend/services/teacher/teacher.service';

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
    const { courseId, name } = body;

    if (!courseId) {
      return NextResponse.json({ error: 'El ID del curso es requerido' }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: 'El nombre de la invitación es requerido' }, { status: 400 });
    }

    // Crear la invitación
    const invitation = await InvitationService.createInvitation({
      courseId,
      name,
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

