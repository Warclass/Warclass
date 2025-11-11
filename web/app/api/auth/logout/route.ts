import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/backend/services/auth/auth.service';
import { getTokenFromRequest } from '@/backend/middleware/auth/auth.middleware';

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     description: Invalida el token JWT del usuario y cierra la sesión
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Sesión cerrada exitosamente
 *       400:
 *         description: Token no proporcionado
 *       500:
 *         description: Error interno del servidor
 */
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
