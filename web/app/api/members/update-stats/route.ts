import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { TeacherService } from '@/backend/services/teacher/teacher.service';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/members/update-stats:
 *   post:
 *     summary: Actualizar estadísticas de un personaje
 *     description: Actualiza experiencia y/u oro de un personaje (requiere ser profesor del curso)
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - character_id
 *             properties:
 *               character_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del personaje
 *               experience_delta:
 *                 type: integer
 *                 description: Cambio en puntos de experiencia (puede ser negativo)
 *               gold_delta:
 *                 type: integer
 *                 description: Cambio en oro (puede ser negativo)
 *               reason:
 *                 type: string
 *                 description: Razón del cambio de estadísticas
 *     responses:
 *       200:
 *         description: Estadísticas actualizadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 character:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     experience:
 *                       type: integer
 *                     gold:
 *                       type: integer
 *                     level:
 *                       type: integer
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere ser profesor del curso
 *       404:
 *         description: Miembro no encontrado
 *       500:
 *         description: Error interno del servidor
 */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { character_id, experience_delta, gold_delta, reason } = body;

    if (!character_id) {
      return NextResponse.json(
        { error: 'character_id es requerido' },
        { status: 400 }
      );
    }

    if (experience_delta === undefined && gold_delta === undefined) {
      return NextResponse.json(
        { error: 'Debe proporcionar experience_delta o gold_delta' },
        { status: 400 }
      );
    }

    // Obtener el personaje actual
    const character = await prisma.characters.findUnique({
      where: { id: character_id },
      include: {
        group: {
          include: {
            course: true
          }
        }
      }
    });

    if (!character) {
      return NextResponse.json(
        { error: 'Personaje no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos: debe ser profesor y estar asignado al curso (via teachers_courses)
    const isTeacher = await TeacherService.isTeacher(userId);
    if (!isTeacher) {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      );
    }

    const teacherForCourse = await prisma.teachers.findFirst({
      where: {
        user_id: userId,
        teachers_courses: {
          some: { course_id: character.course_id }
        }
      }
    });

    if (!teacherForCourse) {
      return NextResponse.json(
        { error: 'No estás asignado como profesor de este curso' },
        { status: 403 }
      );
    }

    // Calcular nuevos valores (no permitir valores negativos)
    const updateData: any = {};
    
    if (experience_delta !== undefined) {
      const newExperience = Math.max(0, character.experience + experience_delta);
      updateData.experience = newExperience;
    }

    if (gold_delta !== undefined) {
      const newGold = Math.max(0, character.gold + gold_delta);
      updateData.gold = newGold;
    }

    // Actualizar el personaje
    const updatedCharacter = await prisma.characters.update({
      where: { id: character_id },
      data: updateData
    });

    console.log(`Stats updated for character ${character_id}. Reason: ${reason || 'No reason provided'}`);

    return NextResponse.json({
      success: true,
      character: {
        id: updatedCharacter.id,
        name: updatedCharacter.name,
        experience: updatedCharacter.experience,
        gold: updatedCharacter.gold,
        energy: updatedCharacter.energy
      }
    });

  } catch (error) {
    console.error('Error en POST /api/members/update-stats:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar stats' 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/members/update-stats
 * Actualiza stats de múltiples miembros (bulk update)
 */
export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { updates } = body; // Array de { member_id, experience_delta?, gold_delta? }

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'updates debe ser un array con al menos un elemento' },
        { status: 400 }
      );
    }

    // Verificar que todos los personajes existan y obtener courseId
    const characterIds = updates.map(u => u.character_id);
    const characters = await prisma.characters.findMany({
      where: {
        id: { in: characterIds }
      },
      include: {
        group: true
      }
    });

    if (characters.length !== characterIds.length) {
      return NextResponse.json(
        { error: 'Uno o más personajes no existen' },
        { status: 404 }
      );
    }

  // Verificar permisos (todos deben ser del mismo curso)
    const courseIds = [...new Set(characters.map(c => c.course_id))]; // Ahora usamos course_id directamente
    
    if (courseIds.length > 1) {
      return NextResponse.json(
        { error: 'Los personajes deben pertenecer al mismo curso' },
        { status: 400 }
      );
    }

    const courseId = courseIds[0] as string;

    // Verificar permisos del profesor
    const isTeacher2 = await TeacherService.isTeacher(userId);
    if (!isTeacher2) {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      );
    }
    const teacherForCourse2 = await prisma.teachers.findFirst({
      where: {
        user_id: userId,
        teachers_courses: { some: { course_id: courseId } }
      }
    });
    if (!teacherForCourse2) {
      return NextResponse.json(
        { error: 'No estás asignado como profesor de este curso' },
        { status: 403 }
      );
    }

    // Actualizar todos los personajes
    const updatedCharacters = await Promise.all(
      updates.map(async (update) => {
        const character = characters.find(c => c.id === update.character_id);
        if (!character) return null;

        const updateData: any = {};

        if (update.experience_delta !== undefined) {
          updateData.experience = Math.max(0, character.experience + update.experience_delta);
        }

        if (update.gold_delta !== undefined) {
          updateData.gold = Math.max(0, character.gold + update.gold_delta);
        }

        if (Object.keys(updateData).length === 0) {
          return character;
        }

        return await prisma.characters.update({
          where: { id: character.id },
          data: updateData
        });
      })
    );

    return NextResponse.json({
      success: true,
      updated: updatedCharacters.filter((c) => c !== null).length
    });

  } catch (error) {
    console.error('Error en PUT /api/members/update-stats:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar stats' 
      },
      { status: 500 }
    );
  }
}
