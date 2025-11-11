import { NextRequest, NextResponse } from 'next/server';
import { QuizService } from '@/backend/services/quiz/quiz.service';
import { UpdateQuizSchema } from '@/backend/validators/quiz.validator';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * @swagger
 * /api/quizzes/{id}:
 *   get:
 *     summary: Obtener quiz por ID
 *     description: Retorna la información de un quiz específico, incluyendo preguntas y respuestas si aplica
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del quiz (UUID)
 *       - in: query
 *         name: characterId
 *         schema:
 *           type: string
 *         description: ID del personaje para obtener su respuesta (UUID)
 *     responses:
 *       200:
 *         description: Información del quiz
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 quiz:
 *                   $ref: '#/components/schemas/Quiz'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Quiz no encontrado
 *       500:
 *         description: Error interno del servidor
 *   put:
 *     summary: Actualizar quiz
 *     description: Actualiza la información de un quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del quiz (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Quiz actualizado exitosamente
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
 *       404:
 *         description: Quiz no encontrado
 *       500:
 *         description: Error interno del servidor
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const characterId = searchParams.get('characterId');

    const quiz = await QuizService.getQuizById(params.id, characterId || undefined);

    return NextResponse.json({ quiz }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/quizzes/[id]:', error);
    
    if (error.message === 'Quiz no encontrado') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Error al obtener quiz' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/quizzes/[id]
 * Actualizar un quiz
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();

    // Validar datos
    const validation = UpdateQuizSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    // TODO: Verificar que el usuario es profesor del curso/grupo

    const quiz = await QuizService.updateQuiz(params.id, validation.data);

    return NextResponse.json({ quiz }, { status: 200 });
  } catch (error: any) {
    console.error('Error in PUT /api/quizzes/[id]:', error);
    
    if (error.message === 'Quiz no encontrado') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Error al actualizar quiz' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/quizzes/[id]
 * Eliminar un quiz
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // TODO: Verificar que el usuario es profesor del curso/grupo

    await QuizService.deleteQuiz(params.id);

    return NextResponse.json({ message: 'Quiz eliminado correctamente' }, { status: 200 });
  } catch (error: any) {
    console.error('Error in DELETE /api/quizzes/[id]:', error);
    
    if (error.message === 'Quiz no encontrado') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Error al eliminar quiz' },
      { status: 500 }
    );
  }
}
