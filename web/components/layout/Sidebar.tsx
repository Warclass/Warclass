'use client'

import React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface SidebarProps {
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  children,
  isOpen = true
}) => {
  return (
    <aside
      className={cn(
        'z-20 absolute bottom-0 left-0 duration-500 w-52 h-full',
        'bg-secondary text-secondary-foreground shadow-lg transition-transform',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <ScrollArea className="h-full">
        <nav className="flex flex-col gap-2 p-4 h-full justify-between">
          {children}
        </nav>
      </ScrollArea>
    </aside>
  );
};

export interface SidebarItemProps {
  icon?: string;
  title: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  children?: React.ReactNode;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  title,
  href,
  onClick,
  active = false,
  children
}) => {
  const itemClasses = cn(
    'flex items-center gap-3 p-3 rounded-lg transition-colors duration-200',
    'hover:bg-accent hover:text-accent-foreground cursor-pointer w-full justify-start',
    active ? 'bg-accent text-accent-foreground font-semibold' : ''
  );

  const content = (
    <>
      {icon && (
        <span className={`${icon} text-xl`} />
      )}
      <span className="flex-1 text-left">{title}</span>
      {children}
    </>
  );

  if (href) {
    return (
      <a href={href} className={itemClasses}>
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={itemClasses}>
      {content}
    </button>
  );
};

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

export interface SidebarCollapseProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const SidebarCollapse: React.FC<SidebarCollapseProps> = ({
  title,
  icon,
  children,
  defaultOpen = false
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className={cn(
        'flex items-center justify-between w-full p-3 rounded-lg',
        'transition-colors duration-200 hover:bg-accent hover:text-accent-foreground',
        'cursor-pointer'
      )}>
        <div className="flex items-center gap-3">
          {icon && (
            <span className={`${icon} text-xl`} />
          )}
          <span className="font-medium">{title}</span>
        </div>
        <ChevronDown 
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )} 
        />
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="mt-2 space-y-1 ml-4 border-l-2 border-border pl-4">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};