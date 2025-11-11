import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Documentation | Warclass',
  description: 'Documentación interactiva de la API de Warclass - Sistema de gestión educativa gamificado',
};

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
