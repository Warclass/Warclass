import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/courses/quizzes:
 *   get:
 *     summary: Obtener quizzes de un curso
 *     description: |
 *       Retorna todos los quizzes de un curso con su historial de respuestas.
 *       Los quizzes ahora están asignados a nivel de curso, no por grupo,
 *       por lo que todos los estudiantes del curso ven los mismos quizzes.
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del curso
 *     responses:
 *       200:
 *         description: Lista de quizzes del curso con estadísticas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 quizzes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       question:
 *                         type: string
 *                       difficulty:
 *                         type: string
 *                         enum: [easy, medium, hard]
 *                       points:
 *                         type: integer
 *                       courseId:
 *                         type: string
 *                         format: uuid
 *                       history:
 *                         type: array
 *                         description: Historial de respuestas de todos los estudiantes
 *                         items:
 *                           type: object
 *                           properties:
 *                             characterId:
 *                               type: string
 *                             isCorrect:
 *                               type: boolean
 *                             timeTaken:
 *                               type: integer
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

    // Obtener el character del usuario en este curso
    const userCharacter = await prisma.characters.findFirst({
      where: {
        user_id: userId,
        course_id: courseId
      },
      include: {
        class: true
      }
    });

    // Obtener todos los quizzes del curso
    const quizzes = await prisma.quizzes.findMany({
      where: {
        course_id: courseId
      },
      include: {
        quizzes_history: {
          where: userCharacter ? {
            character_id: userCharacter.id
          } : undefined
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Formatear respuesta
    const formattedQuizzes = quizzes.map((quiz: any) => {
      const userHistory = quiz.quizzes_history[0];

      return {
        id: quiz.id,
        question: quiz.question,
        answers: quiz.answers,
        createdAt: quiz.created_at,
        completed: !!userHistory,
        isOnQuest: userHistory?.is_on_quest || false,
        course: {
          id: courseId,
          name: '' // Se puede agregar si es necesario
        }
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedQuizzes
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
