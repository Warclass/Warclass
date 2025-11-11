'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { PlayerNavigation } from '@/components/layout/Navigation';
import { Sidebar, SidebarItem, SidebarCollapse } from '@/components/layout/Sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Menu, BookOpen, Mail, User, Users, Trophy, Home, Layers, LogOut, ScrollText, Heart, FileText } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PlayerLayoutProps {
  children: React.ReactNode;
  name?: string;
  token: string;
  courseId?: string;
  courseName?: string;
  history?: Array<{
    character: { name: string };
    quiz: string;
    score: number;
  }>;
}

export default function PlayerLayout({
  children,
  name = 'Player',
  token,
  courseId,
  courseName,
  history = []
}: PlayerLayoutProps) {
  const { user, token: authToken } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [invitationsCount, setInvitationsCount] = useState(0);
  const [quizHistory, setQuizHistory] = useState<Array<{
    character: { name: string };
    quiz: string;
    score: number;
  }>>([]);
  const [memberId, setMemberId] = useState<string | null>(null);

  // Helper para construir URLs con courseId
  const buildUrl = (path: string) => {
    if (courseId) {
      return `${path}?courseId=${courseId}`;
    }
    return path;
  };

  // Obtener memberId del usuario
  useEffect(() => {
    const fetchMemberId = async () => {
      if (!courseId || !user?.id) return;

      try {
        const response = await fetch(
          `/api/characters/member?userId=${user.id}&courseId=${courseId}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setMemberId(data.memberId);
        } else {
          console.error('Error al obtener memberId:', response.status);
        }
      } catch (error) {
        console.error('Error al obtener memberId:', error);
      }
    };

    fetchMemberId();
  }, [courseId, user?.id]);

  // Cargar historial de quizzes
  useEffect(() => {
    const fetchQuizHistory = async () => {
      if (!memberId || !user?.id) return;

      try {
        const response = await fetch(
          `/api/quizzes/history?memberId=${memberId}`,
          {
            headers: {
              'x-user-id': user.id
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setQuizHistory(data.data);
          }
        }
      } catch (error) {
        console.error('Error al cargar historial de quizzes:', error);
      }
    };

    fetchQuizHistory();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchQuizHistory, 30000);
    
    return () => clearInterval(interval);
  }, [memberId, user?.id]);

  // Eliminado: fetchCourseData - ahora usamos courseName prop directamente
  // El endpoint /api/courses/members está deprecado (410)

  useEffect(() => {
    // Cargar el conteo de invitaciones pendientes
    const fetchInvitationsCount = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch('/api/invitations/count', {
          headers: {
            'x-user-id': user.id
          }
        });

        if (response.ok) {
          const data = await response.json();
          setInvitationsCount(data.count || 0);
        } else {
          console.error('Error al cargar conteo de invitaciones:', response.status);
        }
      } catch (error) {
        console.error('Error al cargar conteo de invitaciones:', error);
      }
    };

    fetchInvitationsCount();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchInvitationsCount, 30000);
    
    return () => clearInterval(interval);
  }, [user?.id]);

  const scrollContent = (
    <>
      <div className="bg-[#D89216] w-full flex justify-center border-b-2 border-neutral-800 rounded-t-md">
        <h1 className="text-center text-[#0a0a0a] text-xl font-bold py-2">
          Historial de Quizzes
        </h1>
      </div>
      {quizHistory.length === 0 ? (
        <div className="flex justify-center items-center p-8 text-neutral-400">
          <p>No hay historial disponible</p>
        </div>
      ) : (
        quizHistory.map((item, index) => (
          <div
            key={index}
            className="flex border-b border-neutral-800 p-3 items-center justify-between hover:bg-neutral-800/30 transition-colors"
          >
            <p className="text-[#D89216] border-r border-neutral-700 flex-1 text-center font-medium">
              {item.character.name}
            </p>
            <p className="border-r border-neutral-700 flex-1 text-center text-neutral-300">
              {item.quiz}
            </p>
            <p className="text-[#D89216] flex-1 text-center font-bold">
              {item.score}%
            </p>
          </div>
        ))
      )}
    </>
  );

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
                  {courseName || 'Curso'}
                </h2>
                <p className="text-xs text-neutral-500">Vista de Jugador</p>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Historial de Quizzes */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost"
                  size="icon"
                  className="text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-transform hover:scale-110 duration-200"
                >
                  <ScrollText className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-80 max-h-96 overflow-y-auto bg-[#1a1a1a] border-neutral-800"
                align="end"
              >
                <div className="p-4">
                  {scrollContent}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Daño Diferido */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost"
                  size="icon"
                  className="text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-transform hover:scale-110 duration-200"
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-60 bg-[#1a1a1a] border-neutral-800"
                align="end"
              >
                <div className="flex justify-center items-center p-4">
                  <h1 className="text-xl font-semibold text-neutral-100">Daño Diferido</h1>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Invitaciones Badge */}
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 relative"
              onClick={() => window.location.href = '/dashboard/invitations'}
            >
              <Mail className="h-5 w-5" />
              {invitationsCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center text-xs px-1"
                >
                  {invitationsCount}
                </Badge>
              )}
            </Button>

            {/* Botón Volver */}
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Volver</span>
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
                {/* Personaje */}
                <Link href={buildUrl('/main/dashboard/player/character')}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-neutral-400 hover:text-[#D89216] hover:bg-neutral-800/50 transition-colors"
                  >
                    <User className="h-4 w-4 mr-3" />
                    Personaje
                  </Button>
                </Link>

                {/* Exámenes */}
                <Link href={buildUrl('/main/dashboard/player/quizzes')}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-neutral-400 hover:text-[#D89216] hover:bg-neutral-800/50 transition-colors"
                  >
                    <BookOpen className="h-4 w-4 mr-3" />
                    Exámenes
                  </Button>
                </Link>

                {/* Tareas */}
                <Link href={buildUrl('/main/dashboard/player/tasks')}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-neutral-400 hover:text-[#D89216] hover:bg-neutral-800/50 transition-colors"
                  >
                    <FileText className="h-4 w-4 mr-3" />
                    Tareas
                  </Button>
                </Link>

                {/* Gremio Section */}
                <div className="pt-4 pb-2">
                  <p className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Gremio
                  </p>
                </div>

                <Link href={buildUrl('/main/dashboard/player/groups')}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-neutral-400 hover:text-[#D89216] hover:bg-neutral-800/50 transition-colors"
                  >
                    <Layers className="h-4 w-4 mr-3" />
                    Grupos
                  </Button>
                </Link>

                <Link href={buildUrl('/main/dashboard/player/members')}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-neutral-400 hover:text-[#D89216] hover:bg-neutral-800/50 transition-colors"
                  >
                    <Users className="h-4 w-4 mr-3" />
                    Miembros
                  </Button>
                </Link>

                <Link href={buildUrl('/main/dashboard/player/score')}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-neutral-400 hover:text-[#D89216] hover:bg-neutral-800/50 transition-colors"
                  >
                    <Trophy className="h-4 w-4 mr-3" />
                    Ranking
                  </Button>
                </Link>
              </div>

              {/* Bottom Action */}
              <div className="border-t border-neutral-800 pt-4">
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-neutral-400 hover:text-red-400 hover:bg-neutral-800/50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
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