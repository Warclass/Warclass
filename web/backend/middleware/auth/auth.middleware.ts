import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/backend/services/auth/auth.service';
import { JWTPayload } from '@/backend/types/auth.types';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Middleware to authenticate requests with JWT
 */
export async function authenticateToken(request: NextRequest): Promise<NextResponse | null> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token no proporcionado',
          error: 'NO_TOKEN',
        },
        { status: 401 }
      );
    }

    const payload = AuthService.verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token inválido o expirado',
          error: 'INVALID_TOKEN',
        },
        { status: 401 }
      );
    }

    const isValidSession = await AuthService.validateSession(token);

    if (!isValidSession) {
      return NextResponse.json(
        {
          success: false,
          message: 'Sesión inválida',
          error: 'INVALID_SESSION',
        },
        { status: 401 }
      );
    }

    (request as AuthenticatedRequest).user = payload;

    return null;
  } catch (error) {
    console.error('Error en authenticateToken:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error de autenticación',
        error: 'AUTH_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to extract token from request
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  return token || null;
}

/**
 * Helper function to get user from request
 */
export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  return (request as AuthenticatedRequest).user || null;
}
