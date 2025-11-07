import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/backend/config/prisma';

/**
 * Verificar que el usuario está autenticado
 * Extrae el user_id del header x-user-id
 */
export async function requireAuth(request: NextRequest): Promise<string | NextResponse> {
  const userId = request.headers.get('x-user-id');

  if (!userId) {
    return NextResponse.json(
      { error: 'No autenticado. Header x-user-id requerido' },
      { status: 401 }
    );
  }

  // Verificar que el usuario existe
  const user = await prisma.users.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return NextResponse.json(
      { error: 'Usuario no encontrado' },
      { status: 401 }
    );
  }

  return userId;
}

/**
 * Verificar que el usuario es un administrador
 * Por ahora, verificamos si el usuario es un teacher (profesor = admin)
 * TODO: Agregar campo 'role' en users para distinguir admin/teacher/student
 */
export async function requireAdmin(request: NextRequest): Promise<string | NextResponse> {
  const authResult = await requireAuth(request);

  // Si requireAuth retornó un NextResponse (error), devolverlo
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const userId = authResult;

  // Verificar que el usuario es un teacher (considerado admin)
  const teacher = await prisma.teachers.findUnique({
    where: { user_id: userId },
  });

  if (!teacher) {
    return NextResponse.json(
      { error: 'No autorizado. Solo administradores pueden realizar esta acción' },
      { status: 403 }
    );
  }

  return userId;
}

/**
 * Verificar que el usuario es un teacher
 */
export async function requireTeacher(request: NextRequest): Promise<string | NextResponse> {
  const authResult = await requireAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const userId = authResult;

  const teacher = await prisma.teachers.findUnique({
    where: { user_id: userId },
  });

  if (!teacher) {
    return NextResponse.json(
      { error: 'No autorizado. Solo profesores pueden realizar esta acción' },
      { status: 403 }
    );
  }

  return userId;
}

/**
 * Verificar que el usuario es el dueño del recurso o un admin
 */
export async function requireOwnerOrAdmin(
  request: NextRequest,
  resourceUserId: string
): Promise<string | NextResponse> {
  const authResult = await requireAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const userId = authResult;

  // Si es el dueño, permitir
  if (userId === resourceUserId) {
    return userId;
  }

  // Si no es el dueño, verificar si es admin
  const teacher = await prisma.teachers.findUnique({
    where: { user_id: userId },
  });

  if (!teacher) {
    return NextResponse.json(
      { error: 'No autorizado. Solo el dueño o un administrador pueden realizar esta acción' },
      { status: 403 }
    );
  }

  return userId;
}
