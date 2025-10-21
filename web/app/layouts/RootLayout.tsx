import { Metadata } from 'next';

interface RootLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const metadata: Metadata = {
  title: 'Warclass',
  description: 'Sistema de gamificación educativa',
};

export default function RootLayout({ children, title }: RootLayoutProps) {
  return (
    <html lang="es" className="scrollbar scrollbar-thumb-primary scrollbar-w-2">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title || 'Warclass'}</title>
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link 
          href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="flex flex-col min-h-screen h-full">
        <div className="min-h-screen flex flex-col text-base-content antialiased h-full">
          {children}
        </div>
      </body>
    </html>
  );
}