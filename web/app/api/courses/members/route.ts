import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/courses/members:
 *   get:
 *     summary: Obtener jugadores del mismo grupo
 *     description: |
 *       Devuelve los personajes que están en el mismo grupo que el usuario actual.
 *       Si el usuario no tiene grupo asignado, devuelve una lista vacía.
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
 *         description: Lista de miembros del grupo
 *       400:
 *         description: Falta el courseId
 *       404:
 *         description: Usuario o personaje no encontrado
 */
export async function GET(req: NextRequest) {
  try {
    // Obtener courseId del query string
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'Falta el parámetro courseId' },
        { status: 400 }
      );
    }

    // Obtener userId del header (autenticación)
    const userId = req.headers.get('x-user-id');
    const authHeader = req.headers.get('authorization');
    
    let authenticatedUserId = userId;
    
    // Si no hay x-user-id, intentar obtener del token
    if (!authenticatedUserId && authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const session = await prisma.sessions.findFirst({
        where: { token },
        select: { user_id: true }
      });
      authenticatedUserId = session?.user_id || null;
    }

    if (!authenticatedUserId) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Buscar el personaje del usuario en este curso
    const userCharacter = await prisma.characters.findUnique({
      where: {
        user_id_course_id: {
          user_id: authenticatedUserId,
          course_id: courseId
        }
      },
      select: {
        id: true,
        group_id: true
      }
    });

    if (!userCharacter) {
      return NextResponse.json(
        { success: false, error: 'No tienes un personaje en este curso' },
        { status: 404 }
      );
    }

    // Si el usuario no tiene grupo asignado, devolver lista vacía
    if (!userCharacter.group_id) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Aún no tienes un grupo asignado'
      });
    }

    // Obtener todos los personajes del mismo grupo
    const groupMembers = await prisma.characters.findMany({
      where: {
        group_id: userCharacter.group_id,
        course_id: courseId
      },
      select: {
        id: true,
        name: true,
        experience: true,
        gold: true,
        energy: true,
        health: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            speed: true
          }
        },
        group: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        experience: 'desc'
      }
    });

    // Formatear la respuesta para mantener compatibilidad
    const formattedMembers = groupMembers.map((member) => ({
      id: member.id,
      name: member.user.name,
      experience: member.experience,
      gold: member.gold,
      energy: member.energy,
      health: member.health,
      group: member.group || { id: '', name: '' },
      character: {
        id: member.id,
        name: member.name,
        experience: member.experience,
        gold: member.gold,
        energy: member.energy,
        health: member.health,
        class: member.class
      }
    }));

    return NextResponse.json({
      success: true,
      data: formattedMembers,
      groupId: userCharacter.group_id
    });

  } catch (error) {
    console.error('Error al obtener miembros del grupo:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener miembros del grupo',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
