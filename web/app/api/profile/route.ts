import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/backend/middleware/auth/auth.middleware';
import { ProfileService } from '@/backend/services/profile/profile.service';

/**
 * GET /api/profile
 * Get user profile
 */
export async function GET(request: NextRequest) {
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

    const profile = await ProfileService.getProfile(userId);

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          message: 'Perfil no encontrado',
          error: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: profile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/profile:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al obtener perfil',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile
 * Update user profile
 */
export async function PUT(request: NextRequest) {
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
    const { name, email, username } = body;

    const result = await ProfileService.updateProfile(userId, {
      name,
      email,
      username,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in PUT /api/profile:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al actualizar perfil',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      },
      { status: 500 }
    );
  }
}
