import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/backend/config/prisma';

/**
 * GET /api/quizzes/history
 * Obtener historial de quizzes de un miembro
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId');
    const courseId = searchParams.get('courseId');

    if (!memberId && !courseId) {
      return NextResponse.json(
        { error: 'Se requiere memberId o courseId' },
        { status: 400 }
      );
    }

    let history;

    if (memberId) {
      // Obtener historial de un miembro específico
      history = await prisma.quizzes_history.findMany({
        where: {
          member_id: memberId,
        },
        include: {
          quiz: {
            include: {
              group: true,
            },
          },
          member: true,
        },
        orderBy: {
          answered_at: 'desc',
        },
        take: 10, // Últimos 10 registros
      });
    } else if (courseId) {
      // Obtener historial de todos los miembros de un curso
      history = await prisma.quizzes_history.findMany({
        where: {
          quiz: {
            group: {
              course_id: courseId,
            },
          },
        },
        include: {
          quiz: {
            include: {
              group: true,
            },
          },
          member: true,
        },
        orderBy: {
          answered_at: 'desc',
        },
        take: 10,
      });
    }

    // Formatear respuesta
    const formattedHistory = history?.map((item) => ({
      id: item.id,
      character: {
        name: item.member.name,
      },
      quiz: item.quiz.question.substring(0, 30) + '...',
      score: item.is_correct ? 100 : 0,
      pointsEarned: item.points_earned,
      timeTaken: item.time_taken,
      answeredAt: item.answered_at,
      isCorrect: item.is_correct,
    })) || [];

    return NextResponse.json({ 
      success: true, 
      data: formattedHistory 
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/quizzes/history:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener historial' },
      { status: 500 }
    );
  }
}
