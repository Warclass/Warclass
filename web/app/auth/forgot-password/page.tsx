'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import GuestLayout from '@/app/layouts/GuestLayout';
import AuthNavButtons from '@/components/auth/AuthNavButtons';
import GameVignette from '@/components/layout/GameVignette';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [errors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrar con API de recuperación de contraseña
    console.log('Forgot password attempt:', email);
    setStatus('Te hemos enviado un enlace de restablecimiento de contraseña por email.');
  };

  return (
    <GuestLayout>
      <main className="grid min-h-screen place-items-center px-4 py-8">
        <Card className="w-full max-w-md rounded-xl border border-amber-400/20 bg-black/40 backdrop-blur-[2px] shadow-[0_0_40px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/20">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight text-neutral-100">
              Restablecer Contraseña
            </CardTitle>
            <CardDescription className="text-neutral-400">
              Ingresa tu email para recibir el enlace de recuperación
            </CardDescription>
          </CardHeader>

          <CardContent>
            {status && (
              <Alert className="mb-4 bg-green-50 dark:bg-green-900/20 border-green-500">
                <AlertDescription className="text-green-700 dark:text-green-400">
                  {status}
                </AlertDescription>
              </Alert>
            )}

            {Object.keys(errors).length > 0 && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {Object.values(errors).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-neutral-700 dark:text-neutral-300">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="email"
                  className="border-neutral-700 bg-neutral-900 text-neutral-100 placeholder:text-neutral-500 focus-visible:ring-amber-500"
                />
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Te enviaremos un enlace para restablecer tu contraseña
                </p>
                {errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-6 text-lg shadow-[0_0_30px_rgba(245,158,11,0.25)]"
              >
                Enviar Enlace de Recuperación
              </Button>

              <div className="text-center pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <Link
                  href="/auth/login"
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 underline transition-colors"
                >
                  Volver al login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* Fixed nav buttons (left: 3 auth links, right: exit) */}
      <AuthNavButtons />
      {/* Atmospheric overlay */}
      <GameVignette />
    </GuestLayout>
  );
}