import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/backend/services/auth/auth.service';
import { getTokenFromRequest } from '@/backend/middleware/auth/auth.middleware';

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token no proporcionado',
          error: 'NO_TOKEN',
        },
        { status: 400 }
      );
    }

    const result = await AuthService.logout(token);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error en /api/auth/logout:', error);
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
