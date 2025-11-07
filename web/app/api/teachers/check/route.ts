import { NextRequest, NextResponse } from 'next/server';
import { TeacherService } from '@/backend/services/teacher/teacher.service';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const teacherData = await TeacherService.getTeacherByUserId(userId);

    if (!teacherData) {
      return NextResponse.json(
        { 
          isTeacher: false,
          message: 'Usuario no es profesor'
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        isTeacher: true,
        teacher: teacherData,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/teachers/check:', error);
    return NextResponse.json(
      { error: error.message || 'Error al verificar profesor' },
      { status: 500 }
    );
  }
}
