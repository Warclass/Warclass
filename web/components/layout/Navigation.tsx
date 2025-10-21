'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { Menu } from 'lucide-react';

export interface NavigationProps {
  name?: string;
  baseRoute?: string;
  baseRouteName?: string;
  showMenu?: boolean;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  onMenuToggle?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  name = 'Undefined',
  baseRoute = '/',
  baseRouteName = '2024-BDA-AB',
  showMenu = true,
  actions,
  onMenuToggle
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="flex w-full bg-primary text-primary-foreground py-3 items-center gap-2 justify-between px-4 shadow-md">
      <div className="flex flex-row items-center gap-4">
        {showMenu && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setMenuOpen(!menuOpen);
              if (onMenuToggle) onMenuToggle();
            }}
            className="text-primary-foreground hover:bg-primary/90"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <div className={`transition-opacity duration-300 ${menuOpen ? 'opacity-100' : 'opacity-0'}`}>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink 
                  href={baseRoute}
                  className="text-primary-foreground hover:text-primary-foreground/80"
                >
                  {baseRouteName}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-primary-foreground/60" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-primary-foreground font-medium">
                  {name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {actions && (
        <section className="flex flex-row items-center justify-center gap-4">
          {actions}
        </section>
      )}
    </nav>
  );
};

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollText, Heart } from 'lucide-react';

export interface PlayerNavigationProps extends NavigationProps {
  token?: string;
  scrollContent?: React.ReactNode;
  onMenuToggle?: () => void;
}

export const PlayerNavigation: React.FC<PlayerNavigationProps> = ({
  token,
  scrollContent,
  onMenuToggle,
  ...props
}) => {
  const actions = (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="secondary" 
            size="sm"
            className="transition-transform hover:scale-110 duration-200"
          >
            <ScrollText className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-80 max-h-96 overflow-y-auto"
          align="end"
        >
          <div className="p-4">
            {scrollContent}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="secondary" 
            size="sm"
            className="transition-transform hover:scale-110 duration-200"
          >
            <Heart className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-60"
          align="end"
        >
          <div className="flex justify-center items-center p-4">
            <h1 className="text-xl font-semibold">Daño inferido</h1>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <Navigation
      {...props}
      baseRoute={token ? `/player/${token}` : '/player'}
      actions={actions}
      onMenuToggle={onMenuToggle}
    />
  );
};