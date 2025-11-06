import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el usuario esté inscrito en el curso
    const inscription = await prisma.inscriptions.findUnique({
      where: {
        user_id_course_id: {
          user_id: userId,
          course_id: courseId
        }
      }
    });

    if (!inscription) {
      return NextResponse.json(
        { error: 'No estás inscrito en este curso' },
        { status: 403 }
      );
    }

    // Obtener todos los grupos del curso
    const groups = await prisma.groups.findMany({
      where: {
        course_id: courseId
      },
      include: {
        quizzes: {
          include: {
            quizzes_history: {
              include: {
                member: {
                  include: {
                    characters: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Obtener el character del usuario en este curso
    const userCharacter = await prisma.characters.findFirst({
      where: {
        member: {
          group: {
            course_id: courseId
          }
        }
      },
      include: {
        member: true
      }
    });

    // Recopilar todos los quizzes únicos
    const quizzesMap = new Map();
    
    groups.forEach(group => {
      group.quizzes.forEach(quiz => {
        if (!quizzesMap.has(quiz.id)) {
          // Verificar si el usuario ya hizo este quiz
          const userHistory = quiz.quizzes_history.find(
            history => history.member.id === userCharacter?.member.id
          );

          quizzesMap.set(quiz.id, {
            id: quiz.id,
            question: quiz.question,
            answers: quiz.answers,
            createdAt: quiz.created_at,
            completed: !!userHistory,
            isOnQuest: userHistory?.is_on_quest || false,
            group: {
              id: group.id,
              name: group.name
            }
          });
        }
      });
    });

    const quizzesData = Array.from(quizzesMap.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      data: quizzesData
    });
  } catch (error) {
    console.error('Error en GET /api/courses/quizzes:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener quizzes del curso' 
      },
      { status: 500 }
    );
  }
}
