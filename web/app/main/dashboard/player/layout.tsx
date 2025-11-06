'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';

export default function PlayerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [hasCharacter, setHasCharacter] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkCharacter = async () => {
      // Si no está autenticado, redirigir a login
      if (!authLoading && !isAuthenticated) {
        router.push('/auth/login');
        return;
      }

      // Si no tiene user ID aún, esperar
      if (!user?.id) {
        return;
      }

      try {
        setIsChecking(true);

        // Verificar si tiene personaje creado
        const response = await fetch('/api/characters?action=check', {
          headers: {
            'x-user-id': user.id
          }
        });

        if (response.ok) {
          const data = await response.json();
          setHasCharacter(data.hasCharacter);

          // Si no tiene personaje, redirigir a crear personaje
          if (!data.hasCharacter) {
            router.push('/main/dashboard/player/create-character');
          }
        }
      } catch (error) {
        console.error('Error al verificar personaje:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkCharacter();
  }, [user?.id, isAuthenticated, authLoading, router]);

  // Mostrar loading mientras se verifica
  if (authLoading || isChecking || hasCharacter === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-neutral-400">Verificando tu personaje...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado o no tiene personaje, no mostrar nada (ya está redirigiendo)
  if (!isAuthenticated || !hasCharacter) {
    return null;
  }

  // Si todo está bien, mostrar el contenido
  return <>{children}</>;
}
