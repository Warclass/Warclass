import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/backend/middleware/auth/auth.middleware';
import { ProfileService } from '@/backend/services/profile/profile.service';

/**
 * POST /api/profile/change-password
 * Change user password
 */
export async function POST(request: NextRequest) {
  try {
    const authError = await authenticateToken(request);
    if (authError) {
      return authError;
    }

    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'Todos los campos son requeridos',
          error: 'MISSING_FIELDS',
        },
        { status: 400 }
      );
    }

    const result = await ProfileService.changePassword(userId, {
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in /api/profile/change-password:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al cambiar contraseña',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      },
      { status: 500 }
    );
  }
}
