'use client'

import React, { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Sidebar, SidebarItem, SidebarCollapse } from '@/components/layout/Sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface MasterLayoutProps {
  children: React.ReactNode;
  name?: string;
}

export default function MasterLayout({ children, name = 'Master' }: MasterLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      <header className="shadow-md w-full border-b">
        <Navigation
          name={name}
          baseRoute="/master"
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      </header>

      <main className="flex flex-row flex-grow relative h-full w-full overflow-hidden">
        <Sidebar isOpen={sidebarOpen}>
          <div className="flex flex-col h-full justify-between">
            <div className="space-y-2">
              <SidebarItem
                href="/master/groups"
                title="Hogar"
                icon="icon-[material-symbols--home]"
              />

              <Separator className="my-2" />

              <SidebarCollapse
                title="Gremio"
                icon="icon-[material-symbols--home]"
              >
                <SidebarItem
                  href="/master/members"
                  title="Miembros"
                  icon="icon-[heroicons--users-solid]"
                />
                <SidebarItem
                  href="/master/groups"
                  title="Grupos"
                  icon="icon-[heroicons--user-group-solid]"
                />
              </SidebarCollapse>

              <SidebarCollapse
                title="Misiones"
                icon="icon-[mingcute--task-2-fill]"
              >
                <SidebarItem
                  href="/master/tasks"
                  title="Tareas"
                  icon="icon-[icomoon-free--books]"
                />
                <SidebarItem
                  href="/master/quizzes"
                  title="Exámenes"
                  icon="icon-[material-symbols--quiz]"
                />
              </SidebarCollapse>
            </div>

            <div className="mt-auto">
              <Separator className="my-2" />
              <SidebarItem
                href="/dashboard"
                title="Salida"
                icon="icon-[material-symbols--exit-to-app]"
              />
            </div>
          </div>
        </Sidebar>

        <ScrollArea className={cn(
          "flex-grow transition-all duration-500",
          sidebarOpen ? "ml-52" : "ml-0"
        )}>
          <div className="p-6">
            {children}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}