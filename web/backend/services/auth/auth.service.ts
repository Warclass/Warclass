import bcrypt from 'bcrypt';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { prisma } from '@/backend/config/prisma';
import { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_ROUNDS } from '@/backend/config/auth';
import { RegisterDTO, LoginDTO, AuthResponse, UserResponse, JWTPayload } from '@/backend/types/auth.types';

export class AuthService {
  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  /**
   * Verify a password against a hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT token
   */
  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as any,
    } as SignOptions);
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Register a new user
   */
  static async register(data: RegisterDTO): Promise<AuthResponse> {
    try {
      const existingUser = await prisma.users.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return {
          success: false,
          message: 'El usuario ya existe',
          error: 'EMAIL_ALREADY_EXISTS',
        };
      }

      const hashedPassword = await this.hashPassword(data.password);

      const user = await prisma.users.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          username: data.username,
        },
      });

      const token = this.generateToken({
        userId: user.id,
        email: user.email,
        username: user.username,
      });

      await prisma.sessions.create({
        data: {
          user_id: user.id,
          token,
        },
      });

      const userResponse: UserResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        created_at: user.created_at,
      };

      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: userResponse,
          token,
        },
      };
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        message: 'Error al registrar usuario',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Login user
   */
  static async login(data: LoginDTO): Promise<AuthResponse> {
    try {
      const user = await prisma.users.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        return {
          success: false,
          message: 'Credenciales inválidas',
          error: 'INVALID_CREDENTIALS',
        };
      }

      const isValidPassword = await this.verifyPassword(data.password, user.password);

      if (!isValidPassword) {
        return {
          success: false,
          message: 'Credenciales inválidas',
          error: 'INVALID_CREDENTIALS',
        };
      }

      const token = this.generateToken({
        userId: user.id,
        email: user.email,
        username: user.username,
      });

      await prisma.sessions.create({
        data: {
          user_id: user.id,
          token,
        },
      });

      const userResponse: UserResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        created_at: user.created_at,
      };

      return {
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          user: userResponse,
          token,
        },
      };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: 'Error al iniciar sesión',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Logout user
   */
  static async logout(token: string): Promise<{ success: boolean; message: string }> {
    try {
      await prisma.sessions.deleteMany({
        where: { token },
      });

      return {
        success: true,
        message: 'Sesión cerrada exitosamente',
      };
    } catch (error) {
      console.error('Error en logout:', error);
      return {
        success: false,
        message: 'Error al cerrar sesión',
      };
    }
  }

  /**
   * Get user by token
   */
  static async getUserByToken(token: string): Promise<UserResponse | null> {
    try {
      const payload = this.verifyToken(token);
      if (!payload) return null;

      const user = await prisma.users.findUnique({
        where: { id: payload.userId },
      });

      if (!user) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        created_at: user.created_at,
      };
    } catch (error) {
      console.error('Error getting user by token:', error);
      return null;
    }
  }

  /**
   * Validate session
   */
  static async validateSession(token: string): Promise<boolean> {
    try {
      const session = await prisma.sessions.findFirst({
        where: { token },
      });

      return !!session;
    } catch (error) {
      return false;
    }
  }
}
