import { prisma } from '@/backend/config/prisma';
import * as bcrypt from 'bcrypt';

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  username: string;
  created_at: Date;
}

export interface UpdateProfileDTO {
  name?: string;
  email?: string;
  username?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export class ProfileService {
  /**
   * Get user profile by ID
   */
  static async getProfile(userId: string): Promise<ProfileData | null> {
    try {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          created_at: true,
        },
      });

      return user;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    data: UpdateProfileDTO
  ): Promise<{ success: boolean; message: string; data?: ProfileData }> {
    try {
      // Verificar si el email ya existe (si se está cambiando)
      if (data.email) {
        const existingUser = await prisma.users.findFirst({
          where: {
            email: data.email,
            NOT: { id: userId },
          },
        });

        if (existingUser) {
          return {
            success: false,
            message: 'El email ya está en uso',
          };
        }
      }

      // Verificar si el username ya existe (si se está cambiando)
      if (data.username) {
        const existingUser = await prisma.users.findFirst({
          where: {
            username: data.username,
            NOT: { id: userId },
          },
        });

        if (existingUser) {
          return {
            success: false,
            message: 'El nombre de usuario ya está en uso',
          };
        }
      }

      // Actualizar usuario
      const updatedUser = await prisma.users.update({
        where: { id: userId },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.email && { email: data.email }),
          ...(data.username && { username: data.username }),
          updated_at: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          created_at: true,
        },
      });

      return {
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: updatedUser,
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        message: 'Error al actualizar perfil',
      };
    }
  }

  /**
   * Change user password
   */
  static async changePassword(
    userId: string,
    data: ChangePasswordDTO
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Validar que las contraseñas coincidan
      if (data.newPassword !== data.confirmPassword) {
        return {
          success: false,
          message: 'Las contraseñas no coinciden',
        };
      }

      // Validar longitud de contraseña
      if (data.newPassword.length < 6) {
        return {
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres',
        };
      }

      // Obtener usuario actual
      const user = await prisma.users.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado',
        };
      }

      // Verificar contraseña actual
      const isValidPassword = await bcrypt.compare(
        data.currentPassword,
        user.password
      );

      if (!isValidPassword) {
        return {
          success: false,
          message: 'La contraseña actual es incorrecta',
        };
      }

      // Hashear nueva contraseña
      const hashedPassword = await bcrypt.hash(data.newPassword, 10);

      // Actualizar contraseña
      await prisma.users.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          updated_at: new Date(),
        },
      });

      return {
        success: true,
        message: 'Contraseña actualizada exitosamente',
      };
    } catch (error) {
      console.error('Error changing password:', error);
      return {
        success: false,
        message: 'Error al cambiar contraseña',
      };
    }
  }

  /**
   * Delete user account (soft delete)
   */
  static async deleteAccount(
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // En lugar de borrar, podríamos desactivar la cuenta
      // Por ahora, borraremos las sesiones
      await prisma.sessions.deleteMany({
        where: { user_id: userId },
      });

      // Aquí podrías agregar un campo "active" o "deleted_at" en el schema
      // Por ahora solo cerramos las sesiones

      return {
        success: true,
        message: 'Sesiones cerradas exitosamente',
      };
    } catch (error) {
      console.error('Error deleting account:', error);
      return {
        success: false,
        message: 'Error al eliminar cuenta',
      };
    }
  }
}
