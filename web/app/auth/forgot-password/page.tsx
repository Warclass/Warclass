'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import GuestLayout from '@/app/layouts/GuestLayout';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [errors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement forgot password logic
    console.log('Forgot password attempt:', email);
    setStatus('Te hemos enviado un enlace de restablecimiento de contraseña por email.');
  };

  return (
    <GuestLayout>
      <div className="bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-900 text-white py-12 px-6 text-center border-b-4 border-neutral-600">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-neutral-200 to-neutral-400 bg-clip-text text-transparent">
            Recuperar Contraseña
          </h1>
          <p className="text-lg text-neutral-300">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>
      </div>

      <div className="flex justify-center items-center flex-grow p-6 bg-neutral-50 dark:bg-neutral-950">
        <Card className="w-full max-w-md shadow-2xl border-neutral-200 dark:border-neutral-800">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-neutral-700 to-neutral-900 dark:from-neutral-200 dark:to-neutral-400 bg-clip-text text-transparent">
              Restablecer Contraseña
            </CardTitle>
            <CardDescription className="text-neutral-600 dark:text-neutral-400">
              Te ayudaremos a recuperar el acceso a tu cuenta
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

s            {Object.keys(errors).length > 0 && (
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
                  className="border-neutral-300 dark:border-neutral-700 focus:ring-neutral-500"
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
                className="w-full bg-neutral-700 hover:bg-neutral-800 dark:bg-neutral-600 dark:hover:bg-neutral-700 text-white font-semibold py-6 text-lg"
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
      </div>
    </GuestLayout>
  );
}