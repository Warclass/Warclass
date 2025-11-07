import { NextRequest, NextResponse } from 'next/server';
import { getUserMemberForCourse } from '@/backend/services/character/character.service';

/**
 * GET /api/characters/member
 * Obtener el member ID de un usuario para un curso específico
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'userId y courseId son requeridos' },
        { status: 400 }
      );
    }

    const memberId = await getUserMemberForCourse(userId, courseId);

    if (!memberId) {
      return NextResponse.json(
        { error: 'No se encontró membresía para este usuario y curso' },
        { status: 404 }
      );
    }

    return NextResponse.json({ memberId }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/characters/member:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener member ID' },
      { status: 500 }
    );
  }
}
