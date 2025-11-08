import { prisma } from '@/backend/config/prisma';
import type {
  Institution,
  InstitutionWithTeachers,
  CreateInstitutionDTO,
  UpdateInstitutionDTO,
  AssignTeacherDTO,
  InstitutionResponse,
  InstitutionsListResponse,
} from '@/backend/types/institution.types';

/**
 * Institution Service
 * Gestión de instituciones educativas
 */
export class InstitutionService {
  /**
   * Crear una nueva institución
   */
  static async createInstitution(data: CreateInstitutionDTO): Promise<InstitutionResponse> {
    try {
      const institution = await prisma.institutions.create({
        data: {
          name: data.name,
          phone_number: data.phoneNumber || null,
        },
        include: {
          teachers: true,
        },
      });

      const institutionResponse: Institution = {
        id: institution.id,
        name: institution.name,
        phoneNumber: institution.phone_number,
        teachersCount: institution.teachers.length,
        createdAt: institution.created_at,
        updatedAt: institution.updated_at,
      };

      return {
        success: true,
        institution: institutionResponse,
        message: 'Institución creada exitosamente',
      };
    } catch (error) {
      console.error('Error creating institution:', error);
      return {
        success: false,
        message: 'Error al crear la institución',
      };
    }
  }

  /**
   * Obtener todas las instituciones
   */
  static async getAllInstitutions(): Promise<InstitutionsListResponse> {
    try {
      const institutions = await prisma.institutions.findMany({
        include: {
          teachers: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      const institutionsList: Institution[] = institutions.map((institution) => ({
        id: institution.id,
        name: institution.name,
        phoneNumber: institution.phone_number,
        teachersCount: institution.teachers.length,
        createdAt: institution.created_at,
        updatedAt: institution.updated_at,
      }));

      return {
        success: true,
        institutions: institutionsList,
        total: institutionsList.length,
      };
    } catch (error) {
      console.error('Error getting institutions:', error);
      return {
        success: true,
        institutions: [],
        total: 0,
      };
    }
  }

  /**
   * Obtener una institución por ID con sus teachers
   */
  static async getInstitutionById(institutionId: string): Promise<InstitutionResponse> {
    try {
      const institution = await prisma.institutions.findUnique({
        where: { id: institutionId },
        include: {
          teachers: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!institution) {
        return {
          success: false,
          message: 'Institución no encontrada',
        };
      }

      const institutionResponse: InstitutionWithTeachers = {
        id: institution.id,
        name: institution.name,
        phoneNumber: institution.phone_number,
        teachersCount: institution.teachers.length,
        teachers: institution.teachers.map((teacher) => ({
          id: teacher.id,
          userName: teacher.user.name,
          userEmail: teacher.user.email,
          internalId: teacher.internal_id,
        })),
        createdAt: institution.created_at,
        updatedAt: institution.updated_at,
      };

      return {
        success: true,
        institution: institutionResponse,
      };
    } catch (error) {
      console.error('Error getting institution:', error);
      return {
        success: false,
        message: 'Error al obtener la institución',
      };
    }
  }

  /**
   * Actualizar una institución
   */
  static async updateInstitution(
    institutionId: string,
    data: UpdateInstitutionDTO
  ): Promise<InstitutionResponse> {
    try {
      const institution = await prisma.institutions.update({
        where: { id: institutionId },
        data: {
          name: data.name,
          phone_number: data.phoneNumber !== undefined ? data.phoneNumber : undefined,
        },
        include: {
          teachers: true,
        },
      });

      const institutionResponse: Institution = {
        id: institution.id,
        name: institution.name,
        phoneNumber: institution.phone_number,
        teachersCount: institution.teachers.length,
        createdAt: institution.created_at,
        updatedAt: institution.updated_at,
      };

      return {
        success: true,
        institution: institutionResponse,
        message: 'Institución actualizada exitosamente',
      };
    } catch (error) {
      console.error('Error updating institution:', error);
      return {
        success: false,
        message: 'Error al actualizar la institución',
      };
    }
  }

  /**
   * Eliminar una institución
   */
  static async deleteInstitution(institutionId: string): Promise<InstitutionResponse> {
    try {
      const institution = await prisma.institutions.findUnique({
        where: { id: institutionId },
        include: {
          teachers: true,
        },
      });

      if (!institution) {
        return {
          success: false,
          message: 'Institución no encontrada',
        };
      }

      if (institution.teachers.length > 0) {
        return {
          success: false,
          message: `No se puede eliminar la institución porque tiene ${institution.teachers.length} profesor(es) asignado(s)`,
        };
      }

      await prisma.institutions.delete({
        where: { id: institutionId },
      });

      return {
        success: true,
        message: 'Institución eliminada exitosamente',
      };
    } catch (error) {
      console.error('Error deleting institution:', error);
      return {
        success: false,
        message: 'Error al eliminar la institución',
      };
    }
  }

  /**
   * Asignar un teacher a una institución
   */
  static async assignTeacher(
    institutionId: string,
    data: AssignTeacherDTO
  ): Promise<InstitutionResponse> {
    try {
      // Verificar que la institución existe
      const institution = await prisma.institutions.findUnique({
        where: { id: institutionId },
      });

      if (!institution) {
        return {
          success: false,
          message: 'Institución no encontrada',
        };
      }

      // Verificar que el teacher existe
      const teacher = await prisma.teachers.findUnique({
        where: { id: data.teacherId },
      });

      if (!teacher) {
        return {
          success: false,
          message: 'Profesor no encontrado',
        };
      }

      // Asignar teacher a institución
      await prisma.teachers.update({
        where: { id: data.teacherId },
        data: {
          institution_id: institutionId,
          internal_id: data.internalId !== undefined ? data.internalId : teacher.internal_id,
        },
      });

      // Obtener institución actualizada
      const updatedInstitution = await prisma.institutions.findUnique({
        where: { id: institutionId },
        include: {
          teachers: {
            include: {
              user: true,
            },
          },
        },
      });

      const institutionResponse: InstitutionWithTeachers = {
        id: updatedInstitution!.id,
        name: updatedInstitution!.name,
        phoneNumber: updatedInstitution!.phone_number,
        teachersCount: updatedInstitution!.teachers.length,
        teachers: updatedInstitution!.teachers.map((t) => ({
          id: t.id,
          userName: t.user.name,
          userEmail: t.user.email,
          internalId: t.internal_id,
        })),
        createdAt: updatedInstitution!.created_at,
        updatedAt: updatedInstitution!.updated_at,
      };

      return {
        success: true,
        institution: institutionResponse,
        message: 'Profesor asignado exitosamente',
      };
    } catch (error) {
      console.error('Error assigning teacher:', error);
      return {
        success: false,
        message: 'Error al asignar el profesor',
      };
    }
  }

  /**
   * Remover un teacher de una institución (lo hace independiente)
   */
  static async removeTeacher(
    institutionId: string,
    teacherId: string
  ): Promise<InstitutionResponse> {
    try {
      // Verificar que la institución existe
      const institution = await prisma.institutions.findUnique({
        where: { id: institutionId },
      });

      if (!institution) {
        return {
          success: false,
          message: 'Institución no encontrada',
        };
      }

      // Verificar que el teacher existe y pertenece a la institución
      const teacher = await prisma.teachers.findUnique({
        where: { id: teacherId },
      });

      if (!teacher) {
        return {
          success: false,
          message: 'Profesor no encontrado',
        };
      }

      if (teacher.institution_id !== institutionId) {
        return {
          success: false,
          message: 'El profesor no pertenece a esta institución',
        };
      }

      // Remover teacher de institución (hacerlo independiente)
      await prisma.teachers.update({
        where: { id: teacherId },
        data: {
          institution_id: null,
          internal_id: null, // También removemos el código interno
        },
      });

      // Obtener institución actualizada
      const updatedInstitution = await prisma.institutions.findUnique({
        where: { id: institutionId },
        include: {
          teachers: {
            include: {
              user: true,
            },
          },
        },
      });

      const institutionResponse: InstitutionWithTeachers = {
        id: updatedInstitution!.id,
        name: updatedInstitution!.name,
        phoneNumber: updatedInstitution!.phone_number,
        teachersCount: updatedInstitution!.teachers.length,
        teachers: updatedInstitution!.teachers.map((t) => ({
          id: t.id,
          userName: t.user.name,
          userEmail: t.user.email,
          internalId: t.internal_id,
        })),
        createdAt: updatedInstitution!.created_at,
        updatedAt: updatedInstitution!.updated_at,
      };

      return {
        success: true,
        institution: institutionResponse,
        message: 'Profesor removido de la institución exitosamente',
      };
    } catch (error) {
      console.error('Error removing teacher:', error);
      return {
        success: false,
        message: 'Error al remover el profesor',
      };
    }
  }
}
