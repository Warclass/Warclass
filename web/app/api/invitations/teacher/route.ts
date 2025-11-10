import { NextRequest, NextResponse } from 'next/server';
import { TeacherService } from '@/backend/services/teacher/teacher.service';
import { InvitationService } from '@/backend/services/invitation/invitation.service';

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
