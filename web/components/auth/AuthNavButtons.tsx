'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

/**
 * AuthNavButtons
 * Game-inspired fixed navigation controls:
 * - Left side: three buttons to switch between auth views (Login, Register, Forgot Password)
 * - Right side: Exit button that returns to home
 * Highlights the current page.
 */
export function AuthNavButtons() {
  const pathname = usePathname()

  const items = [
    { href: '/auth/login', label: 'Login' },
    { href: '/auth/register', label: 'Register' },
    { href: '/auth/forgot-password', label: 'Forgot password' },
  ]

  return (
    <>
      {/* Left group */}
      <div
        className={[
          'fixed z-40 flex flex-col gap-2',
          // Móvil: pequeño offset para evitar el CTA
          'left-2 bottom-24',
          // Web (sm+): subir un poco, sin exagerar
          'sm:left-4 sm:bottom-8',
          // Desktop (md+): un pelín más
          'md:left-6 md:bottom-10',
        ].join(' ')}
      >
        {items.map(({ href, label }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} aria-label={`Ir a ${label}`} aria-current={active ? 'page' : undefined}>
              <Button
                variant="outline"
                className={[
                  'min-w-[140px] justify-start text-xs sm:text-sm',
                  'border-neutral-700/60 bg-black/40 text-neutral-200',
                  'hover:bg-black/60 hover:text-white backdrop-blur-sm',
                  'ring-1 ring-black/30 shadow-sm transition-colors',
                  active && 'border-amber-500/70 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.25)]',
                ].filter(Boolean).join(' ')}
              >
                {label}
              </Button>
            </Link>
          )
        })}
      </div>

      {/* Right single button */}
      <div
        className={[
          'fixed z-40',
          // Móvil: arriba-derecha
          'right-3 top-3',
          // Web (sm+): abajo-derecha con ligero padding
          'sm:top-auto sm:bottom-8 sm:right-4',
          'md:bottom-10',
        ].join(' ')}
      >
        <Link href="/" aria-label="Salir y volver al inicio" className="block">
          {/* Exit como botón con logo e identidad visual acorde */}
          <Button
            variant="outline"
            className="h-10 min-w-[120px] px-4 bg-black/40 hover:bg-red-700/80 text-neutral-200 border-red-900/40 ring-1 ring-black/30 shadow-sm backdrop-blur-sm transition-colors"
          >
            Exit
          </Button>
        </Link>
      </div>
    </>
  )
}

export default AuthNavButtons
