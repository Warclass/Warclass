import { NextRequest, NextResponse } from 'next/server';
import { QuizService } from '@/backend/services/quiz/quiz.service';
import { CreateQuizSchema, GetQuizzesQuerySchema } from '@/backend/validators/quiz.validator';
import { authenticateToken } from '@/backend/middleware/auth/auth.middleware';

/**
 * @swagger
 * /api/quizzes:
 *   get:
 *     summary: Obtener quizzes de un curso
 *     description: |
 *       Retorna todos los quizzes de un curso. Los quizzes están ahora a nivel de curso,
 *       no de grupo, por lo que todos los estudiantes del curso ven los mismos quizzes.
 *       
 *       Nota: El parámetro `groupId` está deprecado pero se mantiene por compatibilidad.
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del curso (requerido)
 *       - in: query
 *         name: characterId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del personaje para incluir estado de completitud
 *       - in: query
 *         name: groupId
 *         deprecated: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: (DEPRECADO) Usar courseId en su lugar
 *     responses:
 *       200:
 *         description: Lista de quizzes del curso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       question:
 *                         type: string
 *                       answers:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             text:
 *                               type: string
 *                       difficulty:
 *                         type: string
 *                         enum: [easy, medium, hard]
 *                       points:
 *                         type: integer
 *                       timeLimit:
 *                         type: integer
 *                       courseId:
 *                         type: string
 *                         format: uuid
 *                       completed:
 *                         type: boolean
 *       400:
 *         description: Parámetros inválidos (falta courseId)
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

    if (courseId) {
      // Obtener quizzes de un curso específico
      quizzes = await QuizService.getQuizzesByCourse(courseId, characterId || undefined);
    } else if (groupId) {
      // Mantener compatibilidad con groupId (deprecado)
      quizzes = await QuizService.getQuizzesByGroup(groupId, characterId || undefined);
    } else {
      return NextResponse.json(
        { error: 'Debe proporcionar courseId' },
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
 *     summary: Crear quiz para un curso
 *     description: |
 *       Crea un nuevo cuestionario a nivel de curso. El quiz estará disponible
 *       para todos los estudiantes inscritos en el curso, independientemente de su grupo.
 *       
 *       Solo los profesores pueden crear quizzes.
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
 *               - courseId
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
 *               courseId:
 *                 type: string
 *                 format: uuid
 *                 description: ID del curso (requerido)
 *               questions:
 *                 type: array
 *                 description: Lista de preguntas del quiz
 *                 items:
 *                   type: object
 *                   required:
 *                     - question
 *                     - options
 *                     - correctAnswer
 *                   properties:
 *                     question:
 *                       type: string
 *                       example: ¿Cuánto es 2 + 2?
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["3", "4", "5", "6"]
 *                     correctAnswer:
 *                       type: string
 *                       example: "4"
 *     responses:
 *       201:
 *         description: Quiz creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     title:
 *                       type: string
 *                     courseId:
 *                       type: string
 *                       format: uuid
 *                     difficulty:
 *                       type: string
 *                       enum: [easy, medium, hard]
 *       400:
 *         description: Datos inválidos (courseId faltante o formato incorrecto)
 *       401:
 *         description: No autorizado o usuario no es profesor
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
