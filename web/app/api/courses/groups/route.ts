import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/courses/groups:
 *   get:
 *     summary: Obtener grupos de un curso
 *     description: Retorna todos los grupos de un curso específico con sus personajes
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del curso (UUID)
 *     responses:
 *       200:
 *         description: Lista de grupos del curso
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       characterCount:
 *                         type: integer
 *                       statistics:
 *                         type: object
 *                       characters:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Character'
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

    // Obtener todos los grupos del curso con sus characters
    const groups = await prisma.groups.findMany({
      where: {
        course_id: courseId
      },
      include: {
        characters: {
          include: {
            class: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            characters: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Formatear respuesta
    const groupsData = groups.map(group => {
      // Calcular estadísticas del grupo
      const totalExperience = group.characters.reduce((sum, c) => sum + c.experience, 0);
      const totalGold = group.characters.reduce((sum, c) => sum + c.gold, 0);
      const avgEnergy = group.characters.length > 0 
        ? Math.round(group.characters.reduce((sum, c) => sum + c.energy, 0) / group.characters.length)
        : 0;

      return {
        id: group.id,
        name: group.name,
        characterCount: group._count.characters,
        statistics: {
          totalExperience,
          totalGold,
          averageEnergy: avgEnergy
        },
        characters: group.characters.map(character => ({
          id: character.id,
          name: character.name,
          experience: character.experience,
          gold: character.gold,
          energy: character.energy,
          health: character.health,
          user: {
            id: character.user.id,
            name: character.user.name,
            email: character.user.email
          },
          class: {
            id: character.class.id,
            name: character.class.name,
            speed: character.class.speed
          },
          level: Math.floor(character.experience / 100) + 1
        }))
      };
    });

    return NextResponse.json({
      success: true,
      data: groupsData
    });
  } catch (error) {
    console.error('Error en GET /api/courses/groups:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener groups del curso' 
      },
      { status: 500 }
    );
  }
}
