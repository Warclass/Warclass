import { NextRequest, NextResponse } from 'next/server';
import { TeacherService } from '@/backend/services/teacher/teacher.service';
import { authenticateToken } from '@/backend/middleware/auth/auth.middleware';

/**
 * @swagger
 * /api/courses/teacher:
 *   get:
 *     summary: Obtener cursos del profesor
 *     description: Retorna todos los cursos donde el usuario autenticado es profesor. Si el usuario aún no es profesor, retorna lista vacía.
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cursos del profesor (puede estar vacía si aún no es profesor)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 courses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *                 message:
 *                   type: string
 *                   description: Mensaje informativo cuando aún no es profesor
 *                   example: El usuario aún no es profesor. Crea tu primer curso para comenzar.
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

    // Obtener teacher por userId
    const teacherRes = await TeacherService.getTeacherByUserId(userId);

    // Si no es profesor, retornar lista vacía (aún no ha creado cursos)
    if (!teacherRes.success || !teacherRes.teacher) {
      return NextResponse.json(
        {
          success: true,
          courses: [],
          message: 'El usuario aún no es profesor. Crea tu primer curso para comenzar.',
        },
        { status: 200 }
      );
    }

    // Obtener cursos del teacher
    const courses = await TeacherService.getTeacherCourses(teacherRes.teacher.id);

    return NextResponse.json(
      {
        success: true,
        courses,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/courses/teacher:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener cursos' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/courses/teacher:
 *   post:
 *     summary: Crear un nuevo curso
 *     description: Crea un curso y lo asocia automáticamente al profesor. Si el usuario no es profesor, se crea el registro automáticamente.
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del curso
 *                 example: Programación Web
 *               description:
 *                 type: string
 *                 description: Descripción del curso
 *                 example: Curso de desarrollo web con HTML, CSS y JavaScript
 *     responses:
 *       201:
 *         description: Curso creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 course:
 *                   type: object
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

    // Obtener o crear teacher por userId
    let teacherRes = await TeacherService.getTeacherByUserId(userId);

    // Si no es profesor, crearlo automáticamente
    if (!teacherRes.success || !teacherRes.teacher) {
      console.log('Usuario no es profesor, creando registro de profesor...');
      
      const createTeacherRes = await TeacherService.createTeacher({
        userId: userId,
        // institutionId se puede agregar después si es necesario
      });

      if (!createTeacherRes.success || !createTeacherRes.teacher) {
        return NextResponse.json(
          { error: 'Error al crear el registro de profesor' },
          { status: 500 }
        );
      }

      teacherRes = {
        success: true,
        teacher: createTeacherRes.teacher,
      };
    }

    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre del curso es requerido' },
        { status: 400 }
      );
    }

    const course = await TeacherService.createCourse(teacherRes.teacher!.id, {
      name,
      description,
    });

    return NextResponse.json(
      {
        success: true,
        course,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/courses/teacher:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear curso' },
      { status: 500 }
    );
  }
}
