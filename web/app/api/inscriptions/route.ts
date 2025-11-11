import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/inscriptions:
 *   get:
 *     summary: Obtener inscripciones del usuario
 *     description: Retorna todas las inscripciones del usuario autenticado con información detallada de los cursos
 *     tags: [Inscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de inscripciones del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 courses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       teacher:
 *                         type: object
 *                       groups:
 *                         type: array
 *                       totalMembers:
 *                         type: integer
 *                       userCharacter:
 *                         type: object
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener inscripciones del usuario con datos del curso
    const inscriptions = await prisma.inscriptions.findMany({
      where: {
        user_id: userId
      },
      include: {
        course: {
          include: {
            teacher: true,
            groups: {
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
              }
            }
          }
        }
      }
    });

    // Formatear datos
    const formattedCourses = inscriptions.map((inscription: any) => {
      const course = inscription.course;
      const totalMembers = course.groups.reduce((acc: number, group: any) => acc + group.members.length, 0);
      
      // Buscar el personaje del usuario en los members
      let userCharacter = null;
      for (const group of course.groups) {
        for (const member of group.members) {
          if (member.characters) {
            userCharacter = member.characters;
            break;
          }
        }
        if (userCharacter) break;
      }

      return {
        id: course.id,
        name: course.name,
        description: course.description,
        code: course.id.substring(0, 8).toUpperCase(), // Generamos un código corto del ID
        teacher: course.teacher?.name || 'Sin profesor',
        membersCount: totalMembers,
        hasCharacter: !!userCharacter,
        character: userCharacter ? {
          id: userCharacter.id,
          name: userCharacter.name,
          experience: userCharacter.experience,
          gold: userCharacter.gold,
          energy: userCharacter.energy,
          className: userCharacter.class.name
        } : null
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedCourses
    });
  } catch (error) {
    console.error('Error en GET /api/inscriptions:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener inscripciones' 
      },
      { status: 500 }
    );
  }
}
