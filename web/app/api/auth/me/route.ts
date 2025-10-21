import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/backend/middleware/auth/auth.middleware';
import { AuthService } from '@/backend/services/auth/auth.service';
import { getTokenFromRequest } from '@/backend/middleware/auth/auth.middleware';

export async function GET(request: NextRequest) {
  try {
    const authError = await authenticateToken(request);
    if (authError) {
      return authError;
    }

    const token = getTokenFromRequest(request);
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

    const user = await AuthService.getUserByToken(token);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Usuario no encontrado',
          error: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Usuario obtenido exitosamente',
        data: { user },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en /api/auth/me:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
