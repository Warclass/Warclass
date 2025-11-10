import { prisma } from '@/backend/config/prisma';
import {
  CreateInvitationDTO,
  CreateBulkInvitationsDTO,
  ValidateInvitationDTO,
  InvitationWithCourse,
  InvitationResponse,
} from '@/backend/types/invitation.types';

export interface PendingInvitation {
  id: string;
  code: string;
  courseName: string;
  courseDescription: string | null;
  createdAt: Date;
  used: boolean;
}

export class InvitationService {
  static generateInvitationCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }

  static async createInvitation(data: CreateInvitationDTO): Promise<InvitationResponse> {
    try {
      const course = await prisma.courses.findUnique({
        where: { id: data.courseId },
      });

      if (!course) {
        throw new Error('Curso no encontrado');
      }

      let code = this.generateInvitationCode();
      let codeExists = await prisma.invitations.findUnique({
        where: { code },
      });

      while (codeExists) {
        code = this.generateInvitationCode();
        codeExists = await prisma.invitations.findUnique({
          where: { code },
        });
      }

      // If email provided, try to resolve to an existing user to attach the invitation
      let targetUserId: string | null = null;
      if (data.email) {
        const recipient = await prisma.users.findUnique({
          where: { email: data.email },
          select: { id: true },
        });

        if (!recipient) {
          throw new Error('No existe un usuario registrado con ese email');
        }
        targetUserId = recipient.id;
      }

      const invitation = await prisma.invitations.create({
        data: {
          name: data.name,
          code,
          course_id: data.courseId,
          used: false,
          user_id: targetUserId,
        },
      });

      return {
        id: invitation.id,
        name: invitation.name,
        code: invitation.code,
        courseId: invitation.course_id,
        courseName: course.name,
        used: invitation.used,
      };
    } catch (error) {
      console.error('Error creating invitation:', error);
      throw error;
    }
  }

  static async createBulkInvitations(
    data: CreateBulkInvitationsDTO
  ): Promise<InvitationResponse[]> {
    try {
      const course = await prisma.courses.findUnique({
        where: { id: data.courseId },
      });

      if (!course) {
        throw new Error('Curso no encontrado');
      }

      const invitations = [];

      for (const email of data.emails) {
        let code = this.generateInvitationCode();
        let codeExists = await prisma.invitations.findUnique({
          where: { code },
        });

        while (codeExists) {
          code = this.generateInvitationCode();
          codeExists = await prisma.invitations.findUnique({
            where: { code },
          });
        }

        const invitation = await prisma.invitations.create({
          data: {
            name: `Invitación para ${email}`,
            code,
            course_id: data.courseId,
            used: false,
          },
        });

        invitations.push({
          id: invitation.id,
          name: invitation.name,
          code: invitation.code,
          courseId: invitation.course_id,
          courseName: course.name,
          used: invitation.used,
        });
      }

      return invitations;
    } catch (error) {
      console.error('Error creating bulk invitations:', error);
      throw error;
    }
  }

  static async getInvitationByCode(code: string): Promise<InvitationWithCourse> {
    try {
      const invitation = await prisma.invitations.findUnique({
        where: { code },
        include: {
          course: true,
          user: true,
        },
      });

      if (!invitation) {
        throw new Error('Código de invitación inválido');
      }

      return {
        id: invitation.id,
        name: invitation.name,
        code: invitation.code,
        used: invitation.used,
        userId: invitation.user_id,
        courseId: invitation.course_id,
        createdAt: invitation.created_at,
        updatedAt: invitation.updated_at,
        course: {
          id: invitation.course.id,
          name: invitation.course.name,
          description: invitation.course.description,
        },
        user: invitation.user
          ? {
              id: invitation.user.id,
              name: invitation.user.name,
              email: invitation.user.email,
            }
          : undefined,
      };
    } catch (error) {
      console.error('Error getting invitation by code:', error);
      throw error;
    }
  }

  static async validateAndUseInvitation(data: ValidateInvitationDTO): Promise<void> {
    try {
      const invitation = await prisma.invitations.findUnique({
        where: { code: data.code },
      });

      if (!invitation) {
        throw new Error('Código de invitación inválido');
      }

      if (invitation.used) {
        throw new Error('Este código de invitación ya ha sido usado');
      }

      const existingInscription = await prisma.inscriptions.findUnique({
        where: {
          user_id_course_id: {
            user_id: data.userId,
            course_id: invitation.course_id,
          },
        },
      });

      if (existingInscription) {
        throw new Error('Ya estás inscrito en este curso');
      }

      await prisma.$transaction([
        prisma.invitations.update({
          where: { code: data.code },
          data: {
            used: true,
            user_id: data.userId,
          },
        }),
        prisma.inscriptions.create({
          data: {
            user_id: data.userId,
            course_id: invitation.course_id,
          },
        }),
      ]);
    } catch (error) {
      console.error('Error validating invitation:', error);
      throw error;
    }
  }

  static async getInvitationsByCourse(courseId: string): Promise<InvitationResponse[]> {
    try {
      const invitations = await prisma.invitations.findMany({
        where: { course_id: courseId },
        include: {
          course: true,
        },
        orderBy: { created_at: 'desc' },
      });

      return invitations.map((inv) => ({
        id: inv.id,
        name: inv.name,
        code: inv.code,
        courseId: inv.course_id,
        courseName: inv.course.name,
        used: inv.used,
      }));
    } catch (error) {
      console.error('Error getting invitations by course:', error);
      throw error;
    }
  }

  static async deleteInvitation(invitationId: string): Promise<void> {
    try {
      await prisma.invitations.delete({
        where: { id: invitationId },
      });
    } catch (error) {
      console.error('Error deleting invitation:', error);
      throw error;
    }
  }

  static async regenerateInvitationCode(invitationId: string): Promise<string> {
    try {
      let code = this.generateInvitationCode();
      let codeExists = await prisma.invitations.findUnique({
        where: { code },
      });

      while (codeExists) {
        code = this.generateInvitationCode();
        codeExists = await prisma.invitations.findUnique({
          where: { code },
        });
      }

      await prisma.invitations.update({
        where: { id: invitationId },
        data: {
          code,
          used: false,
        },
      });

      return code;
    } catch (error) {
      console.error('Error regenerating invitation code:', error);
      throw error;
    }
  }

  static async getPendingInvitations(userId: string): Promise<PendingInvitation[]> {
    try {
      const invitations = await prisma.invitations.findMany({
        where: {
          user_id: userId,
        },
        include: {
          course: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
        orderBy: [{ used: 'asc' }, { created_at: 'desc' }],
      });

      return invitations.map((inv) => ({
        id: inv.id,
        code: inv.code,
        courseName: inv.course.name,
        courseDescription: inv.course.description,
        createdAt: inv.created_at,
        used: inv.used,
      }));
    } catch (error) {
      console.error('Error al obtener invitaciones pendientes:', error);
      throw new Error('No se pudieron obtener las invitaciones');
    }
  }

  static async acceptInvitation(code: string, userId: string): Promise<void> {
    try {
      const invitation = await prisma.invitations.findUnique({
        where: { code },
        include: { course: true },
      });

      if (!invitation) {
        throw new Error('Código de invitación inválido');
      }

      if (invitation.used) {
        throw new Error('Esta invitación ya ha sido utilizada');
      }

      const existingInscription = await prisma.inscriptions.findUnique({
        where: {
          user_id_course_id: {
            user_id: userId,
            course_id: invitation.course_id,
          },
        },
      });

      if (existingInscription) {
        throw new Error('Ya estás inscrito en este curso');
      }

      await prisma.$transaction([
        prisma.invitations.update({
          where: { id: invitation.id },
          data: {
            used: true,
            user_id: userId,
          },
        }),
        prisma.inscriptions.create({
          data: {
            user_id: userId,
            course_id: invitation.course_id,
          },
        }),
      ]);
    } catch (error) {
      console.error('Error al aceptar invitación:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las invitaciones de los cursos impartidos por un profesor.
   * Incluye información del curso y (si existe) el usuario destinatario.
   */
  static async getInvitationsByTeacher(teacherId: string): Promise<
    Array<{
      id: string;
      name: string;
      code: string;
      used: boolean;
      createdAt: Date;
      courseId: string;
      courseName: string;
      courseDescription: string | null;
      userId?: string | null;
      userName?: string | null;
      userEmail?: string | null;
    }>
  > {
    try {
      const invitations = await prisma.invitations.findMany({
        where: {
          course: {
            teacher_id: teacherId,
          },
        },
        include: {
          course: true,
          user: true,
        },
        orderBy: { created_at: 'desc' },
      });

      return invitations.map((inv) => ({
        id: inv.id,
        name: inv.name,
        code: inv.code,
        used: inv.used,
        createdAt: inv.created_at,
        courseId: inv.course_id,
        courseName: inv.course.name,
        courseDescription: inv.course.description,
        userId: inv.user_id,
        userName: inv.user ? inv.user.name : null,
        userEmail: inv.user ? inv.user.email : null,
      }));
    } catch (error) {
      console.error('Error obteniendo invitaciones de profesor:', error);
      throw new Error('No se pudieron obtener las invitaciones del profesor');
    }
  }
}

export async function acceptInvitation(userId: string, invitationId: string): Promise<void> {
  try {
    const invitation = await prisma.invitations.findUnique({
      where: { id: invitationId },
      include: { course: true },
    });

    if (!invitation) {
      throw new Error('Invitación no encontrada');
    }

    if (invitation.used) {
      throw new Error('Esta invitación ya ha sido utilizada');
    }

    const existingInscription = await prisma.inscriptions.findUnique({
      where: {
        user_id_course_id: {
          user_id: userId,
          course_id: invitation.course_id,
        },
      },
    });

    if (existingInscription) {
      throw new Error('Ya estás inscrito en este curso');
    }

    await prisma.$transaction([
      prisma.invitations.update({
        where: { id: invitationId },
        data: {
          used: true,
          user_id: userId,
        },
      }),
      prisma.inscriptions.create({
        data: {
          user_id: userId,
          course_id: invitation.course_id,
        },
      }),
    ]);
  } catch (error) {
    console.error('Error al aceptar invitación:', error);
    throw error;
  }
}

export async function getPendingInvitations(userId: string): Promise<PendingInvitation[]> {
  return InvitationService.getPendingInvitations(userId);
}

export async function rejectInvitation(userId: string, invitationId: string): Promise<boolean> {
  try {
    const invitation = await prisma.invitations.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new Error('Invitación no encontrada');
    }

    if (invitation.user_id !== userId) {
      throw new Error('Esta invitación no te pertenece');
    }

    await prisma.invitations.update({
      where: { id: invitationId },
      data: { used: true },
    });

    return true;
  } catch (error) {
    console.error('Error al rechazar invitación:', error);
    throw error;
  }
}

export async function hasPendingInvitations(userId: string): Promise<boolean> {
  try {
    const count = await prisma.invitations.count({
      where: {
        user_id: userId,
        used: false,
      },
    });

    return count > 0;
  } catch (error) {
    console.error('Error al verificar invitaciones pendientes:', error);
    return false;
  }
}

export async function getPendingInvitationsCount(userId: string): Promise<number> {
  try {
    return await prisma.invitations.count({
      where: {
        user_id: userId,
        used: false,
      },
    });
  } catch (error) {
    console.error('Error al contar invitaciones pendientes:', error);
    return 0;
  }
}
