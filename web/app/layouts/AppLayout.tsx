import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <Navigation name={title} />
      
      <ScrollArea className="flex-grow">
        <main className="flex justify-center items-center min-h-full p-4">
          {children}
        </main>
      </ScrollArea>
    </div>
  );
}