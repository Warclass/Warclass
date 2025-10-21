'use client'

import React, { useState } from 'react';
import { PlayerNavigation } from '@/components/layout/Navigation';
import { Sidebar, SidebarItem, SidebarCollapse } from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';

interface PlayerLayoutProps {
  children: React.ReactNode;
  name?: string;
  token: string;
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
  history = []
}: PlayerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollContent = (
    <>
      <div className="bg-red-500 w-full flex justify-center border-b-2 border-black">
        <h1 className="text-center menu-title text-white text-3xl font-bold">
          Historial
        </h1>
      </div>
      {history.map((item, index) => (
        <div
          key={index}
          className="flex border-b-2 rounded-md border-neutral-400 p-2 items-center justify-center"
        >
          <p className="text-blue-700 border-r-2 flex border-neutral-300 w-full text-center">
            {item.character.name}
          </p>
          <p className="border-r-2 flex border-neutral-300 w-full justify-center">
            Quiz {item.quiz}
          </p>
          <p className="text-yellow-500 flex w-full justify-center">
            {item.score}%
          </p>
        </div>
      ))}
    </>
  );

  return (
    <div className="bg-base-100 flex flex-col h-screen w-screen overflow-hidden">
      <header className="shadow-md w-full">
        <PlayerNavigation
          name={name}
          token={token}
          scrollContent={scrollContent}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      </header>

      <main className="flex flex-row flex-grow relative h-full w-full max-h-full max-w-full">
        <Sidebar isOpen={sidebarOpen}>
          <div className='flex flex-col justify-between h-full'>
            <div>
              <SidebarItem
                href={`/player/${token}/character`}
                title="Personaje"
                icon="icon-[heroicons--user-solid]"
              />

              <SidebarCollapse
                title="Misiones"
                icon="icon-[mingcute--task-2-fill]"
              >
                <SidebarItem
                  href={`/player/${token}/tasks`}
                  title="Tareas"
                  icon="icon-[icomoon-free--books]"
                />
                <SidebarItem
                  href={`/player/${token}/quizzes`}
                  title="Exámenes"
                  icon="icon-[material-symbols--quiz]"
                />
              </SidebarCollapse>

              <SidebarCollapse
                title="Gremio"
                icon="icon-[material-symbols--home]"
              >
                <SidebarItem
                  href={`/player/${token}/members`}
                  title="Miembros"
                  icon="icon-[heroicons--users-solid]"
                />
                <SidebarItem
                  href={`/player/${token}/ranking`}
                  title="Ranking"
                  icon="icon-[material-symbols--leaderboard]"
                />
              </SidebarCollapse>
            </div>

            <div>
              <SidebarItem
                href="/dashboard"
                title="Salida"
                icon="icon-[material-symbols--exit-to-app]"
              />
            </div>
          </div>
        </Sidebar>

        <div className={cn(
          "flex-grow p-4 overflow-auto transition-all duration-500",
          sidebarOpen ? "ml-52" : "ml-0"
        )}>
          {children}
        </div>
      </main>
    </div>
  );
}