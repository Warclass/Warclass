import { NextRequest, NextResponse } from 'next/server';
import { QuizService } from '@/backend/services/quiz/quiz.service';
import { CreateQuizSchema, GetQuizzesQuerySchema } from '@/backend/validators/quiz.validator';
import { authenticateToken } from '@/backend/middleware/auth/auth.middleware';

/**
 * @swagger
 * /api/quizzes:
 *   get:
 *     summary: Obtener quizzes
 *     description: Retorna quizzes filtrados por grupo o curso
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: groupId
 *         schema:
 *           type: string
 *         description: ID del grupo para filtrar quizzes (UUID)
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: ID del curso para filtrar quizzes (UUID)
 *       - in: query
 *         name: characterId
 *         schema:
 *           type: string
 *         description: ID del personaje para obtener estado de completitud (UUID)
 *     responses:
 *       200:
 *         description: Lista de quizzes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Quiz'
 *       400:
 *         description: Parámetros inválidos o faltantes
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
export async function GET(req: NextRequest) {
  try {
    // Autenticar token
    const authError = await authenticateToken(req);
    if (authError) {
      return authError;
    }

    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');
    const courseId = searchParams.get('courseId');
    const characterId = searchParams.get('characterId');

    // Validar parámetros
    const queryValidation = GetQuizzesQuerySchema.safeParse({
      groupId: groupId || undefined,
      courseId: courseId || undefined,
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: 'Parámetros inválidos', details: queryValidation.error.issues },
        { status: 400 }
      );
    }

    let quizzes;

    if (groupId) {
      // Obtener quizzes de un grupo específico
      quizzes = await QuizService.getQuizzesByGroup(groupId, characterId || undefined);
    } else if (courseId) {
      // Obtener quizzes de un curso específico
      quizzes = await QuizService.getQuizzesByCourse(courseId, characterId || undefined);
    } else {
      return NextResponse.json(
        { error: 'Debe proporcionar groupId o courseId' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: quizzes }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/quizzes:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener quizzes' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/quizzes:
 *   post:
 *     summary: Crear quiz
 *     description: Crea un nuevo cuestionario para un grupo o curso
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - questions
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título del quiz
 *                 example: Quiz de Matemáticas - Capítulo 1
 *               description:
 *                 type: string
 *                 description: Descripción del quiz
 *               difficulty:
 *                 type: string
 *                 enum: [EASY, MEDIUM, HARD]
 *                 description: Dificultad del quiz
 *                 example: MEDIUM
 *               experienceReward:
 *                 type: integer
 *                 description: Recompensa de experiencia
 *                 example: 100
 *               groupId:
 *                 type: string
 *                 description: ID del grupo (opcional)
 *               courseId:
 *                 type: string
 *                 description: ID del curso (opcional)
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     question:
 *                       type: string
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                     correctAnswer:
 *                       type: string
 *     responses:
 *       201:
 *         description: Quiz creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 quiz:
 *                   $ref: '#/components/schemas/Quiz'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
export async function POST(req: NextRequest) {
  try {
    // Autenticar token
    const authError = await authenticateToken(req);
    if (authError) {
      return authError;
    }

    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();

    // Validar datos
    const validation = CreateQuizSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Obtener el teacher_id del usuario autenticado
    const { prisma } = await import('@/backend/config/prisma');
    const teacher = await prisma.teachers.findFirst({
      where: { user_id: userId },
    });

    // Crear el quiz (con teacher_id si el usuario es profesor)
    const quiz = await QuizService.createQuiz(
      validation.data,
      teacher?.id
    );

    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/quizzes:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear quiz' },
      { status: 500 }
    );
  }
}
