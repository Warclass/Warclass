import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ApiDocsLinkProps {
  variant?: 'default' | 'ghost' | 'outline';
  className?: string;
}

/**
 * Componente que muestra un link a la documentación de la API
 * Usar en el navbar o en áreas donde los desarrolladores/profesores necesiten acceso a la API
 */
export function ApiDocsLink({ variant = 'ghost', className }: ApiDocsLinkProps) {
  return (
    <Button
      variant={variant}
      size="sm"
      asChild
      className={className}
    >
      <Link href="/api-docs" target="_blank" rel="noopener noreferrer">
        <BookOpen className="h-4 w-4 mr-2" />
        API Docs
      </Link>
    </Button>
  );
}
