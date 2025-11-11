import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/backend/services/auth/auth.service';
import { registerSchema } from '@/backend/validators/auth.validator';
import { ZodError } from 'zod';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     description: Crea una nueva cuenta de usuario en el sistema
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - passwordConfirmation
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre completo del usuario
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario
 *                 example: juan@ejemplo.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña (mínimo 8 caracteres)
 *                 example: Password123!
 *               passwordConfirmation:
 *                 type: string
 *                 format: password
 *                 description: Confirmación de contraseña
 *                 example: Password123!
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
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
 *                   example: Usuario registrado exitosamente
 *                 token:
 *                   type: string
 *                   description: JWT token de autenticación
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos inválidos o usuario ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *     security: []
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = registerSchema.parse(body);

    const result = await AuthService.register(validatedData);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos de entrada inválidos',
          error: 'VALIDATION_ERROR',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error('Error en /api/auth/register:', error);
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
