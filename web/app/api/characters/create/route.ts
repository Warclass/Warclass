import { NextRequest, NextResponse } from 'next/server';
import { createCharacter } from '@/backend/services/character/character.service';

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, classId, memberId, appearance } = body;

    if (!name || !classId || !memberId) {
      return NextResponse.json(
        { error: 'Datos incompletos: se requiere name, classId y memberId' },
        { status: 400 }
      );
    }

    const character = await createCharacter({
      name,
      classId,
      memberId,
      appearance // Pasamos el appearance al servicio
    });

    return NextResponse.json({
      success: true,
      data: character,
      message: 'Personaje creado exitosamente'
    });
  } catch (error) {
    console.error('Error en POST /api/characters/create:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear personaje' 
      },
      { status: 500 }
    );
  }
}
