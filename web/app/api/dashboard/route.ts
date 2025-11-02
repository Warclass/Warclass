import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/backend/middleware/auth/auth.middleware';
import { DashboardService } from '@/backend/services/dashboard/dashboard.service';

/**
 * GET /api/dashboard
 * Get complete dashboard data for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authError = await authenticateToken(request);
    if (authError) {
      return authError;
    }

    // Get user from request (set by authenticateToken middleware)
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

    // Get dashboard data
    const result = await DashboardService.getDashboardData(userId);

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in /api/dashboard:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al obtener datos del dashboard',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      },
      { status: 500 }
    );
  }
}
