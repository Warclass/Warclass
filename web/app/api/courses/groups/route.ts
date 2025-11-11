import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/courses/groups:
 *   get:
 *     summary: Obtener grupos de un curso
 *     description: Retorna todos los grupos de un curso específico con sus miembros y personajes
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
 *                     $ref: '#/components/schemas/Group'
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

    // Obtener todos los grupos del curso con sus members y characters
    const groups = await prisma.groups.findMany({
      where: {
        course_id: courseId
      },
      include: {
        members: {
          include: {
            characters: {
              include: {
                class: true
              }
            }
          }
        },
        _count: {
          select: {
            members: true
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
      const totalExperience = group.members.reduce((sum, m) => sum + m.experience, 0);
      const totalGold = group.members.reduce((sum, m) => sum + m.gold, 0);
      const avgEnergy = group.members.length > 0 
        ? Math.round(group.members.reduce((sum, m) => sum + m.energy, 0) / group.members.length)
        : 0;

      return {
        id: group.id,
        name: group.name,
        memberCount: group._count.members,
        statistics: {
          totalExperience,
          totalGold,
          averageEnergy: avgEnergy
        },
        members: group.members.map(member => ({
          id: member.id,
          name: member.name,
          experience: member.experience,
          gold: member.gold,
          energy: member.energy,
          character: member.characters ? {
            id: member.characters.id,
            name: member.characters.name,
            experience: member.characters.experience,
            gold: member.characters.gold,
            energy: member.characters.energy,
            class: {
              id: member.characters.class.id,
              name: member.characters.class.name,
              speed: member.characters.class.speed
            },
            level: Math.floor(member.characters.experience / 100) + 1
          } : null
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
