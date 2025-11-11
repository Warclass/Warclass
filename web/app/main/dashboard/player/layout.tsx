'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';

export default function PlayerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si no está autenticado, redirigir a login
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Mostrar loading mientras se verifica autenticación
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-neutral-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (ya está redirigiendo)
  if (!isAuthenticated) {
    return null;
  }

  // Mostrar el contenido
  return <>{children}</>;
}
