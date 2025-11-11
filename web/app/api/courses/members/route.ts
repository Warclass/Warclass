import { NextRequest, NextResponse } from 'next/server';

/**
 * @deprecated Este endpoint usa el concepto legacy de "members".
 * Usar en su lugar:
 * - `/api/characters/course?courseId={id}` para obtener el personaje del usuario en un curso
 * - `/api/groups?courseId={id}` para obtener los grupos con sus personajes
 * 
 * @swagger
 * /api/courses/members:
 *   get:
 *     deprecated: true
 *     summary: "[DEPRECADO] Obtener miembros de un curso"
 *     description: |
 *       ⚠️ DEPRECADO: Este endpoint usa el concepto legacy de "members" que ya no existe.
 *       
 *       Usar en su lugar:
 *       - `/api/characters/course?courseId={id}` para obtener el personaje del usuario en un curso
 *       - `/api/groups?courseId={id}` para obtener los grupos con sus personajes
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del curso
 *     responses:
 *       410:
 *         description: Endpoint deprecado
 */
export async function GET(req: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'Este endpoint está deprecado',
      message: 'La tabla "members" ya no existe en la nueva arquitectura.',
      alternatives: {
        'Para obtener el personaje del usuario en un curso': '/api/characters/course?courseId={id}',
        'Para obtener grupos con personajes': '/api/groups?courseId={id}'
      }
    },
    { 
      status: 410, // 410 Gone - recurso ya no disponible permanentemente
      headers: {
        'Deprecation': 'true',
        'Sunset': new Date('2025-01-01').toUTCString()
      }
    }
  );
}
