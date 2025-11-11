import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/courses/members:
 *   get:
 *     summary: Obtener miembros de un curso
 *     description: Retorna todos los miembros de un curso agrupados por grupo, con sus personajes
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
 *         description: Lista de miembros del curso organizados por grupo
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
 *                       members:
 *                         type: array
 *                         items:
 *                           type: object
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
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Formatear respuesta
    const membersData = groups.flatMap(group => 
      group.members.map(member => ({
        id: member.id,
        name: member.name,
        experience: member.experience,
        gold: member.gold,
        energy: member.energy,
        group: {
          id: group.id,
          name: group.name
        },
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
          }
        } : null
      }))
    );

    return NextResponse.json({
      success: true,
      data: membersData
    });
  } catch (error) {
    console.error('Error en GET /api/courses/members:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener members del curso' 
      },
      { status: 500 }
    );
  }
}
