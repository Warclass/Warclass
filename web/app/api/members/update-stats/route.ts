import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { TeacherService } from '@/backend/services/teacher/teacher.service';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/members/update-stats:
 *   post:
 *     summary: Actualizar estadísticas de un miembro
 *     description: Actualiza experiencia y/u oro de un miembro (requiere ser profesor del curso)
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - member_id
 *             properties:
 *               member_id:
 *                 type: string
 *                 description: ID del miembro
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
 *                 member:
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
    const { member_id, experience_delta, gold_delta, reason } = body;

    if (!member_id) {
      return NextResponse.json(
        { error: 'member_id es requerido' },
        { status: 400 }
      );
    }

    if (experience_delta === undefined && gold_delta === undefined) {
      return NextResponse.json(
        { error: 'Debe proporcionar experience_delta o gold_delta' },
        { status: 400 }
      );
    }

    // Obtener el miembro actual
    const member = await prisma.members.findUnique({
      where: { id: member_id },
      include: {
        group: {
          include: {
            course: true
          }
        }
      }
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Miembro no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el usuario sea profesor del curso
    const isTeacher = await TeacherService.isTeacher(userId);
    
    if (!isTeacher) {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      );
    }

    // Verificar que el usuario esté inscrito en el curso
    const inscription = await prisma.inscriptions.findUnique({
      where: {
        user_id_course_id: {
          user_id: userId,
          course_id: member.group.course_id
        }
      }
    });

    if (!inscription) {
      return NextResponse.json(
        { error: 'No estás inscrito en este curso' },
        { status: 403 }
      );
    }

    // Calcular nuevos valores (no permitir valores negativos)
    const updateData: any = {};
    
    if (experience_delta !== undefined) {
      const newExperience = Math.max(0, member.experience + experience_delta);
      updateData.experience = newExperience;
    }

    if (gold_delta !== undefined) {
      const newGold = Math.max(0, member.gold + gold_delta);
      updateData.gold = newGold;
    }

    // Actualizar el miembro
    const updatedMember = await prisma.members.update({
      where: { id: member_id },
      data: updateData
    });

    console.log(`Stats updated for member ${member_id}. Reason: ${reason || 'No reason provided'}`);

    return NextResponse.json({
      success: true,
      member: {
        id: updatedMember.id,
        name: updatedMember.name,
        experience: updatedMember.experience,
        gold: updatedMember.gold,
        energy: updatedMember.energy
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

    // Verificar que todos los miembros existan y obtener courseId
    const memberIds = updates.map(u => u.member_id);
    const members = await prisma.members.findMany({
      where: {
        id: { in: memberIds }
      },
      include: {
        group: true
      }
    });

    if (members.length !== memberIds.length) {
      return NextResponse.json(
        { error: 'Uno o más miembros no existen' },
        { status: 404 }
      );
    }

    // Verificar permisos (todos deben ser del mismo curso)
    const courseIds = [...new Set(members.map(m => m.group.course_id))];
    
    if (courseIds.length > 1) {
      return NextResponse.json(
        { error: 'Los miembros deben pertenecer al mismo curso' },
        { status: 400 }
      );
    }

    const courseId = courseIds[0];

    // Verificar que el usuario sea profesor
    const isTeacher = await TeacherService.isTeacher(userId);
    
    if (!isTeacher) {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
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

    // Actualizar todos los miembros
    const updatedMembers = await Promise.all(
      updates.map(async (update) => {
        const member = members.find(m => m.id === update.member_id);
        if (!member) return null;

        const updateData: any = {};

        if (update.experience_delta !== undefined) {
          updateData.experience = Math.max(0, member.experience + update.experience_delta);
        }

        if (update.gold_delta !== undefined) {
          updateData.gold = Math.max(0, member.gold + update.gold_delta);
        }

        if (Object.keys(updateData).length === 0) {
          return member;
        }

        return await prisma.members.update({
          where: { id: member.id },
          data: updateData
        });
      })
    );

    return NextResponse.json({
      success: true,
      updated: updatedMembers.filter(m => m !== null).length
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
