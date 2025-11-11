import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/courses/quizzes:
 *   get:
 *     summary: Obtener quizzes de un curso
 *     description: Retorna todos los quizzes de un curso organizados por grupo, con historial de respuestas
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del curso
 *     responses:
 *       200:
 *         description: Lista de quizzes del curso organizados por grupo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 groups:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       quizzes:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Quiz'
 *       400:
 *         description: courseId no proporcionado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No estás inscrito en este curso
 *       500:
 *         description: Error interno del servidor
 */
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
                character: {
                  include: {
                    class: true
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
        user_id: userId,
        group: {
          course_id: courseId
        }
      },
      include: {
        class: true
      }
    });

    // Recopilar todos los quizzes únicos
    const quizzesMap = new Map();
    
    groups.forEach(group => {
      group.quizzes.forEach(quiz => {
        if (!quizzesMap.has(quiz.id)) {
          // Verificar si el usuario ya hizo este quiz
          const userHistory = quiz.quizzes_history.find(
            history => history.character.id === userCharacter?.id
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
