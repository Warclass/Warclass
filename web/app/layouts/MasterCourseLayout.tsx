'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/auth/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Menu, 
  BookOpen, 
  Users, 
  UsersRound, 
  FileText, 
  ClipboardList,
  LogOut,
  Home
} from 'lucide-react';

interface MasterLayoutProps {
  children: React.ReactNode;
  courseId: string;
  courseName?: string;
}

export default function MasterLayout({ 
  children, 
  courseId,
  courseName 
}: MasterLayoutProps) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Helper para construir URLs con courseId
  const buildUrl = (path: string) => {
    return `${path}?courseId=${courseId}`;
  };

  return (
    <div className="bg-[#0a0a0a] flex flex-col h-screen w-screen overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-[#0f0f0f]/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Menu Toggle + Course Info */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#D89216]" />
              <div>
                <h2 className="text-sm font-bold text-neutral-100">
                  {courseName || 'Cargando...'}
                </h2>
                <p className="text-xs text-neutral-500">Vista de Profesor</p>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Botón Volver */}
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Volver al Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-row flex-grow relative h-full w-full max-h-full max-w-full">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-[#0f0f0f] border-r border-neutral-800 transition-all duration-300 z-40",
            sidebarOpen ? "w-64" : "w-0"
          )}
        >
          <div className={cn(
            "h-full overflow-y-auto",
            !sidebarOpen && "hidden"
          )}>
            <div className='flex flex-col justify-between h-full p-4'>
              <div className="space-y-1">
                {/* Inicio */}
                <Link href={buildUrl('/main/dashboard/master')}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-neutral-800 hover:text-[#D89216]"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Inicio
                  </Button>
                </Link>

                <div className="pt-4 pb-2">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-3">
                    Gestión del Curso
                  </p>
                </div>

                {/* Grupos */}
                <Link href={buildUrl('/main/dashboard/master/groups')}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-neutral-800 hover:text-[#D89216]"
                  >
                    <UsersRound className="mr-2 h-4 w-4" />
                    Grupos
                  </Button>
                </Link>

                {/* Miembros */}
                <Link href={buildUrl('/main/dashboard/master/members')}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-neutral-800 hover:text-[#D89216]"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Miembros
                  </Button>
                </Link>

                <div className="pt-4 pb-2">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-3">
                    Misiones y Evaluaciones
                  </p>
                </div>

                {/* Tareas */}
                <Link href={buildUrl('/main/dashboard/master/tasks')}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-neutral-800 hover:text-[#D89216]"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Tareas
                  </Button>
                </Link>

                {/* Quizzes */}
                <Link href={buildUrl('/main/dashboard/master/quizzes')}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-neutral-800 hover:text-[#D89216]"
                  >
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Exámenes
                  </Button>
                </Link>
              </div>

              {/* Footer */}
              <div className="border-t border-neutral-800 pt-4">
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/20"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Salir del Curso
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className={cn(
          "flex-grow p-6 overflow-auto transition-all duration-300 bg-[#0a0a0a]",
          sidebarOpen ? "ml-64" : "ml-0"
        )}>
          {children}
        </div>
      </main>
    </div>
  );
}
