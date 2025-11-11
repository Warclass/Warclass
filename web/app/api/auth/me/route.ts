import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/backend/middleware/auth/auth.middleware';
import { AuthService } from '@/backend/services/auth/auth.service';
import { getTokenFromRequest } from '@/backend/middleware/auth/auth.middleware';

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener información del usuario autenticado
 *     description: Retorna los datos del usuario actual basado en el token JWT
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: No autenticado o token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
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
