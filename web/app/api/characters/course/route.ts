import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/characters/course:
 *   get:
 *     summary: Obtener personaje por curso
 *     description: Retorna el personaje del usuario para un curso específico
 *     tags: [Characters]
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
 *         description: Personaje encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Character'
 *       400:
 *         description: courseId no proporcionado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Personaje no encontrado
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

    // Buscar la inscripción del usuario al curso
    const inscription = await prisma.inscriptions.findUnique({
      where: {
        user_id_course_id: {
          user_id: userId,
          course_id: courseId
        }
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
                        class: true,
                        abilities: {
                          include: {
                            ability: true
                          }
                        }
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

    if (!inscription) {
      return NextResponse.json(
        { error: 'No estás inscrito en este curso' },
        { status: 404 }
      );
    }

    // Buscar el personaje del usuario en los members del curso
    let userCharacter = null;
    let userMember = null;

    for (const group of inscription.course.groups) {
      for (const member of group.members) {
        // TODO: Agregar relación user_id en members para identificar correctamente
        // Por ahora, asumimos que hay un character por usuario
        if (member.characters) {
          userCharacter = member.characters;
          userMember = member;
          break;
        }
      }
      if (userCharacter) break;
    }

    if (!userCharacter || !userMember) {
      return NextResponse.json(
        { 
          success: false,
          hasCharacter: false,
          message: 'No tienes personaje en este curso' 
        },
        { status: 404 }
      );
    }

    // Type assertion ya que validamos arriba que no son null
    const character = userCharacter;
    const member = userMember;

    // Formatear respuesta
    const characterData = {
      id: character.id,
      name: character.name,
      experience: character.experience,
      gold: character.gold,
      energy: character.energy,
      class: {
        id: character.class.id,
        name: character.class.name,
        speed: character.class.speed
      },
      abilities: character.abilities.map((ca: any) => ({
        id: ca.ability.id,
        name: ca.ability.name,
        description: ca.ability.description,
        gold: ca.ability.gold
      })),
      member: {
        id: member.id,
        name: member.name,
        experience: member.experience,
        gold: member.gold,
        energy: member.energy
      },
      course: {
        id: inscription.course.id,
        name: inscription.course.name,
        description: inscription.course.description,
        teacher: inscription.course.teacher
      }
    };

    return NextResponse.json({
      success: true,
      hasCharacter: true,
      data: characterData
    });
  } catch (error) {
    console.error('Error en GET /api/characters/course:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener personaje del curso' 
      },
      { status: 500 }
    );
  }
}
