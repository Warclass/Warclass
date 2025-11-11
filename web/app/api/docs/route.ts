import { NextResponse } from 'next/server';
import { swaggerSpec } from '@/backend/config/swagger';

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: Obtiene la especificación OpenAPI en formato JSON
 *     description: Retorna la documentación completa de la API en formato OpenAPI 3.0
 *     tags: [Documentation]
 *     responses:
 *       200:
 *         description: Especificación OpenAPI
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
export async function GET() {
  return NextResponse.json(swaggerSpec);
}
