import React from 'react';

interface GuestLayoutProps {
  children: React.ReactNode;
}

export default function GuestLayout({ children }: GuestLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
      {children}
    </div>
  );
}