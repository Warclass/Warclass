import { NextRequest, NextResponse } from 'next/server';
import { 
  getCharacterClasses,
  getUserCharacterForCourse,
  userHasCharacter
} from '@/backend/services/character/character.service';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const action = searchParams.get('action');

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Endpoint para obtener clases de personaje
    if (action === 'classes') {
      const classes = await getCharacterClasses();
      return NextResponse.json({
        success: true,
        data: classes
      });
    }

    // Endpoint para verificar si tiene personaje
    if (action === 'check') {
      const hasCharacter = await userHasCharacter(userId);
      return NextResponse.json({
        success: true,
        hasCharacter
      });
    }

    // Endpoint para obtener personaje de un curso
    if (courseId) {
      const character = await getUserCharacterForCourse(userId, courseId);
      
      if (!character) {
        return NextResponse.json({
          success: false,
          error: 'No se encontró personaje para este curso'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: character
      });
    }

    return NextResponse.json(
      { error: 'Parámetros inválidos' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error en GET /api/characters:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener datos del personaje' 
      },
      { status: 500 }
    );
  }
}
