import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export interface PendingInvitation {
  id: string;
  code: string;
  courseName: string;
  courseDescription: string | null;
  createdAt: Date;
  used: boolean;
}

/**
 * Obtiene todas las invitaciones pendientes (no usadas) para un usuario
 */
export async function getPendingInvitations(userId: string): Promise<PendingInvitation[]> {
  try {
    const invitations = await prisma.invitations.findMany({
      where: {
        user_id: userId,
        used: false
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return invitations.map(inv => ({
      id: inv.id,
      code: inv.code,
      courseName: inv.course.name,
      courseDescription: inv.course.description,
      createdAt: inv.created_at,
      used: inv.used
    }));
  } catch (error) {
    console.error('Error al obtener invitaciones pendientes:', error);
    throw new Error('No se pudieron obtener las invitaciones');
  }
}

/**
 * Acepta una invitación creando una inscripción al curso
 */
export async function acceptInvitation(userId: string, invitationId: string): Promise<boolean> {
  try {
    // Verificar que la invitación existe y pertenece al usuario
    const invitation = await prisma.invitations.findUnique({
      where: { id: invitationId },
      include: { course: true }
    });

    if (!invitation) {
      throw new Error('Invitación no encontrada');
    }

    if (invitation.user_id !== userId) {
      throw new Error('Esta invitación no te pertenece');
    }

    if (invitation.used) {
      throw new Error('Esta invitación ya ha sido utilizada');
    }

    // Verificar si ya existe una inscripción
    const existingInscription = await prisma.inscriptions.findUnique({
      where: {
        user_id_course_id: {
          user_id: userId,
          course_id: invitation.course_id
        }
      }
    });

    if (existingInscription) {
      // Marcar como usada aunque ya exista inscripción
      await prisma.invitations.update({
        where: { id: invitationId },
        data: { used: true }
      });
      return true;
    }

    // Crear inscripción y marcar invitación como usada en una transacción
    await prisma.$transaction([
      prisma.inscriptions.create({
        data: {
          user_id: userId,
          course_id: invitation.course_id
        }
      }),
      prisma.invitations.update({
        where: { id: invitationId },
        data: { used: true }
      })
    ]);

    return true;
  } catch (error) {
    console.error('Error al aceptar invitación:', error);
    throw error;
  }
}

/**
 * Rechaza una invitación marcándola como usada sin crear inscripción
 */
export async function rejectInvitation(userId: string, invitationId: string): Promise<boolean> {
  try {
    const invitation = await prisma.invitations.findUnique({
      where: { id: invitationId }
    });

    if (!invitation) {
      throw new Error('Invitación no encontrada');
    }

    if (invitation.user_id !== userId) {
      throw new Error('Esta invitación no te pertenece');
    }

    await prisma.invitations.update({
      where: { id: invitationId },
      data: { used: true }
    });

    return true;
  } catch (error) {
    console.error('Error al rechazar invitación:', error);
    throw error;
  }
}

/**
 * Verifica si un usuario tiene invitaciones pendientes
 */
export async function hasPendingInvitations(userId: string): Promise<boolean> {
  try {
    const count = await prisma.invitations.count({
      where: {
        user_id: userId,
        used: false
      }
    });

    return count > 0;
  } catch (error) {
    console.error('Error al verificar invitaciones pendientes:', error);
    return false;
  }
}

/**
 * Obtiene el conteo de invitaciones pendientes
 */
export async function getPendingInvitationsCount(userId: string): Promise<number> {
  try {
    return await prisma.invitations.count({
      where: {
        user_id: userId,
        used: false
      }
    });
  } catch (error) {
    console.error('Error al contar invitaciones pendientes:', error);
    return 0;
  }
}
